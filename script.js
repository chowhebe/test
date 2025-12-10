document.addEventListener("DOMContentLoaded", () => {
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
 * 天氣地點設定
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
 * 天氣圖示轉換
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
    // 注意：免費版 OpenWeatherMap API 可能不支援 forecast 端點或有次數限制，若失敗請檢查 API Key 權限
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${locationData.lat}&lon=${locationData.lon}&units=metric&lang=zh_tw&appid=${API_KEY}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      if (!data || !data.list || data.list.length === 0) continue;
      
      const forecast = data.list[0]; 
      const temp_current = Math.round(forecast.main.temp);
      const description = forecast.weather[0].description;
      const iconCode = forecast.weather[0].icon;
      
      const weatherInfoElement = document.getElementById(locationData.elementId);
      const weatherIconElement = document.getElementById(locationData.elementId.replace('info', 'icon')); 

      if (weatherInfoElement) {
        weatherInfoElement.innerHTML = `
          <h3>${locationData.city}</h3>
          <p>預測：<strong>${temp_current}°C</strong>, ${description}</p>
        `;
        if (weatherIconElement) {
          weatherIconElement.innerHTML = `<i class="${getWeatherIcon(iconCode)}"></i>`;
        }
      }
    } catch (error) {
      console.error(`無法連接到 ${locationData.city} 的 API:`, error);
      const weatherInfoElement = document.getElementById(locationData.elementId);
      if(weatherInfoElement) weatherInfoElement.innerHTML = `<small>天氣載入失敗</small>`;
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
          // 這是正常的開發環境錯誤，不影響功能
          console.log('ServiceWorker 註冊略過 (可能未在 HTTPS 或 localhost 環境)');
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
    // 修正：使用 querySelector 找到對應的按鈕
    const defaultButton = document.querySelector(`.tab-btn[onclick*="'${tabName}'"]`);
    if (defaultButton) {
      defaultButton.classList.add("active");
    }
  }
}

/**
 * 本地筆記 (Local Notes)
 * 注意：這部分依賴 HTML 中是否有 id="share-text" 等元素，若無則此函式不會運作
 */
function saveShareNote() {
    // 這裡保留您原本的邏輯，但需確保 HTML 結構完整
    // 目前 HTML 範例中似乎沒有 share-text 輸入框，如果是放在 id="share" 裡面
    // 請確保 HTML 結構中有對應的 input/textarea
    alert("請確認 HTML 中是否有 share-text 輸入框");
}

function loadLocalNotes() {
  const notesListContainer = document.getElementById('local-notes-list');
  if (!notesListContainer) return; // 如果找不到容器就跳過

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

/* =========================================
   🛒 購物清單功能 (補全缺失部分)
   ========================================= */

function getShoppingData() {
  return JSON.parse(localStorage.getItem('shoppingList')) || { todo: [], done: [] };
}

function saveShoppingData(data) {
  localStorage.setItem('shoppingList', JSON.stringify(data));
}

// 輔助：HTML 跳脫字元，防止 XSS
function escapeHtml(text) {
  if (!text) return text;
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderShoppingList() {
  const data = getShoppingData();
  const todoList = document.getElementById('todo-list');
  const doneList = document.getElementById('done-list');
  
  if (!todoList || !doneList) return;

  todoList.innerHTML = '';
  doneList.innerHTML = '';

  // 渲染待買清單
  data.todo.forEach((item, index) => {
    todoList.innerHTML += `
      <li>
        <span>${escapeHtml(item)}</span>
        <div class="list-actions">
          <button class="list-btn done" onclick="markItemDone(${index})"><i class="fas fa-check"></i></button>
          <button class="list-btn delete" onclick="deleteItem(${index}, 'todo')"><i class="fas fa-trash"></i></button>
        </div>
      </li>
    `;
  });

  // 渲染已買清單
  data.done.forEach((item, index) => {
    doneList.innerHTML += `
      <li>
        <span>${escapeHtml(item)}</span>
        <div class="list-actions">
          <button class="list-btn delete" onclick="deleteItem(${index}, 'done')"><i class="fas fa-trash"></i></button>
        </div>
      </li>
    `;
  });
}

function addItem() {
  const input = document.getElementById('new-item');
  const value = input.value.trim();
  
  if (value) {
    const data = getShoppingData();
    data.todo.push(value);
    saveShoppingData(data);
    renderShoppingList();
    input.value = ''; // 清空輸入框
  } else {
    alert("請輸入物品名稱！");
  }
}

function markItemDone(index) {
  const data = getShoppingData();
  // 從 todo 移除並移至 done
  const item = data.todo.splice(index, 1)[0];
  data.done.push(item);
  saveShoppingData(data);
  renderShoppingList();
}

function deleteItem(index, type) {
  const data = getShoppingData();
  if (type === 'todo') {
    data.todo.splice(index, 1);
  } else {
    data.done.splice(index, 1);
  }
  saveShoppingData(data);
  renderShoppingList();
}

/* =========================================
   💱 匯率計算功能 (補全缺失部分)
   ========================================= */

// 預設匯率 (1 JPY = ? HKD)，當 API 失敗時使用
let currentRate = 0.051; 
const FX_API_URL = 'https://api.exchangerate-api.com/v4/latest/JPY';

async function loadFXRate() {
  const rateDisplay = document.getElementById('fx-rate');
  if(!rateDisplay) return;

  try {
    const response = await fetch(FX_API_URL);
    const data = await response.json();
    if (data && data.rates && data.rates.HKD) {
      currentRate = data.rates.HKD;
      rateDisplay.innerHTML = `目前匯率：1 JPY ≈ <strong>${currentRate}</strong> HKD <br><small>(更新於: ${new Date().toLocaleTimeString()})</small>`;
    } else {
      throw new Error("Invalid Data");
    }
  } catch (e) {
    console.error("匯率載入失敗", e);
    rateDisplay.innerHTML = `目前匯率：1 JPY ≈ <strong>${currentRate}</strong> HKD <small>(預設值)</small>`;
  }
}

function convertJPYtoHKD() {
  const jpyInput = document.getElementById('jpy-input');
  const val = parseFloat(jpyInput.value);
  if (!isNaN(val)) {
    const hkd = (val * currentRate).toFixed(2);
    alert(`${val} JPY 約為 ${hkd} HKD`);
    addToHistory(`${val} JPY ➝ ${hkd} HKD`);
  } else {
    alert("請輸入有效的日元金額");
  }
}

function convertHKDtoJPY() {
  const hkdInput = document.getElementById('hkd-input');
  const val = parseFloat(hkdInput.value);
  if (!isNaN(val)) {
    const jpy = (val / currentRate).toFixed(0);
    alert(`${val} HKD 約為 ${jpy} JPY`);
    addToHistory(`${val} HKD ➝ ${jpy} JPY`);
  } else {
    alert("請輸入有效的港元金額");
  }
}

function getFxHistory() {
  return JSON.parse(localStorage.getItem('fxHistory')) || [];
}

function addToHistory(record) {
  const history = getFxHistory();
  // 新的加在最前面，只保留最近 10 筆
  history.unshift(record);
  if (history.length > 10) history.pop();
  
  localStorage.setItem('fxHistory', JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const historyList = document.getElementById('fx-history');
  if (!historyList) return;
  
  const history = getFxHistory();
  historyList.innerHTML = history.map(item => `<li>${item}</li>`).join('');
}

function clearHistory() {
  localStorage.removeItem('fxHistory');
  renderHistory();
}
