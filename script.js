document.addEventListener('DOMContentLoaded', (event) => {
    const defaultTab = 'day1';
    openTab(null, defaultTab);

    registerServiceWorker();
    initializeWeatherDisplay();
    loadLocalNotes();
    renderShoppingList();

    // 匯率初始化
    loadFXRate();
    renderHistory();
});

// ⚠️ 請確認您的 API Key 已填入 ⚠️
const API_KEY = 'b848d0b11fbff83a27b0a9d9b08d9592'; 

/**
 * 跨日期的地點資訊 (包含座標 latitude/longitude)
 */
const dailyWeatherLocations = {
    'day1': { city: "難波 (12/16)", lat: 34.6641, lon: 135.5000, elementId: 'weather-info-day1' },
    'day2': { city: "梅田 (12/17)", lat: 34.7052, lon: 135.4952, elementId: 'weather-info-day2' },
    'day3': { city: "京都 (12/18)", lat: 35.0116, lon: 135.7681, elementId: 'weather-info-day3' },
    'day4': { city: "和歌山 (12/19)", lat: 34.2259, lon: 135.1675, elementId: 'weather-info-day4' },
    'day5': { city: "白濱 (12/20)", lat: 33.6823, lon: 135.3582, elementId: 'weather-info-day5' },
    'day6': { city: "難波 (12/21)", lat: 34.6641, lon: 135.5000, elementId: 'weather-info-day6' },
    'day7': { city: "難波 (12/22)", lat: 34.6641, lon: 135.5000, elementId: 'weather-info-day7' }
};

/**
 * 將 OpenWeatherMap 圖標代碼轉換為 Font Awesome 圖標
 */
function getWeatherIcon(iconCode) {
    if (iconCode.includes('01')) return 'fas fa-sun';
    if (iconCode.includes('02')) return 'fas fa-cloud-sun';
    if (iconCode.includes('03') || iconCode.includes('04')) return 'fas fa-cloud';
    if (iconCode.includes('09') || iconCode.includes('10')) return 'fas fa-cloud-showers-heavy';
    if (iconCode.includes('11')) return 'fas fa-bolt';
    if (iconCode.includes('13')) return 'fas fa-snowflake';
    if (iconCode.includes('50')) return 'fas fa-smog';
    return 'fas fa-thermometer-half';
}

/**
 * 天氣顯示
 */
async function initializeWeatherDisplay() {
    for (const tabId in dailyWeatherLocations) {
        const locationData = dailyWeatherLocations[tabId];
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${locationData.lat}&lon=${locationData.lon}&units=metric&lang=zh_tw&appid=${API_KEY}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();

            if (!data || !data.list || data.list.length === 0) continue;
            
            const forecast = data.list[0]; 
            const temp_current = Math.round(forecast.main.temp);
            const description = forecast.weather[0].description;
            const iconCode = forecast.weather[0].icon;
            
            const weatherInfoElement = document.getElementById(locationData.elementId);
            const weatherIconElement = document.getElementById(locationData.elementId.replace('info', 'icon')); 

            if (weatherInfoElement) {
                const weatherHTML = `
                    <h3>${locationData.city}</h3>
                    <p>目前氣溫：<strong>${temp_current}°C</strong>, ${description}</p>
                    <small>數據來源：OpenWeatherMap</small>
                `;
                weatherInfoElement.innerHTML = weatherHTML;
                if (weatherIconElement) {
                    weatherIconElement.innerHTML = `<i class="${getWeatherIcon(iconCode)}"></i>`;
                }
            }
        } catch (error) {
            console.error(`無法連接到 ${locationData.city} 的 API:`, error);
        }
    }
}

/**
 * PWA Service Worker 註冊
 */
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('ServiceWorker 註冊成功:', registration.scope);
                })
                .catch(error => {
                    console.error('ServiceWorker 註冊失敗:', error);
                });
        });
    }
}

/**
 * Tab 切換功能
 */
function openTab(evt, tabName) {
    const tabContents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].style.display = "none";
        tabContents[i].classList.remove("active");
    }

    const tabButtons = document.getElementsByClassName("tab-btn");
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove("active");
    }

    const activeTab = document.getElementById(tabName);
    if (activeTab) {
        activeTab.style.display = "block";
        activeTab.classList.add("active");
    }

    if (evt && evt.currentTarget) {
        evt.currentTarget.classList.add("active");
    } else {
        const defaultButton = document.querySelector(`.tab-btn[onclick*="${tabName}"]`);
        if (defaultButton) {
            defaultButton.classList.add("active");
        }
    }
}

/**
 * 本地筆記儲存與載入
 */
function saveShareNote() {
    const text = document.getElementById('share-text').value;
    const imageInput = document.getElementById('share-image');
    let imageData = null;

    const previewImg = document.querySelector('#image-preview img');
    if (previewImg && previewImg.src.startsWith('data:image')) {
        imageData = previewImg.src;
    }

    if (!text && !imageData) {
        alert("請輸入文字或選擇圖片！");
        return;
    }

    const note = {
        id: Date.now(),
        text: text,
        image: imageData,
        timestamp: new Date().toLocaleString('zh-TW', { dateStyle: 'short', timeStyle: 'short' })
    };

    const notes = JSON.parse(localStorage.getItem('travelNotes')) || [];
    notes.push(note);
    localStorage.setItem('travelNotes', JSON.stringify(notes));

    alert("筆記儲存成功！");
    document.getElementById('share-text').value = '';
    document.getElementById('image-preview').innerHTML = '<p>圖片預覽將顯示於此</p>';
    if (imageInput) imageInput.value = null;
    loadLocalNotes();
}

function loadLocalNotes() {
    const notesListContainer = document.getElementById('local-notes-list');
    if (!notesListContainer) return;

    const notes = JSON.parse(localStorage.getItem('travelNotes')) || [];
    let html = `<h3><i class="fas fa-list-alt"></i> 已儲存的本地筆記</h3>`;
    
    if (notes.length === 0) {
        html += `<p>您尚未儲存任何筆記。</p>`;
    } else {
        html += notes.reverse().map(note => {
            const imageHtml = note.image 
                ? `<div class="saved-image-preview"><img src="${note.image}" alt="Note Image" style="max-width: 100%; border-radius: 4px; margin-top: 10px;"></div>`
                : '';
            return `
                <div class="saved-note-item">
                    <p class="note-time">${note.timestamp}</p>
                    <p class="note-text">${note.text.replace(/\n/g, '<br>')}</p>
                    ${imageHtml}
                </div>
            `;
        }).join('');
    }
    notesListContainer.innerHTML = html;
}

/**
 * 購物清單
 */
function getShoppingData() {
  return JSON.parse(localStorage.getItem('shoppingList')) || { todo: [], done: [] };
}

function saveShoppingData(data) {
  localStorage.setItem('shoppingList', JSON.stringify(data));
}

function renderShoppingList() {
  const data = getShoppingData();
  const todoList = document.getElementById('todo-list');
  const doneList = document.getElementById('done-list');
  if (!todoList || !doneList) return;

  todoList.innerHTML = '';
  doneList.innerHTML = '';

  data.todo.forEach((item, index) => {
    todoList.innerHTML += `
      <li>
        <span>${escapeHtml(item)}</span>
        <div class="list-actions
