document.addEventListener('DOMContentLoaded', (event) => {
    // 預設開啟第一個 Tab
    const defaultTab = 'day1';
    openTab(null, defaultTab);
    
    // 註冊 PWA Service Worker
    registerServiceWorker();
    
    // 載入天氣數據
    fetchWeather();
});

/**
 * 1. PWA Service Worker 註冊
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
 * 2. Tab 切換功能
 * @param {Event} evt - 點擊事件
 * @param {string} tabName - 要開啟的 Tab ID (如 'day1', 'info')
 */
function openTab(evt, tabName) {
    // 隱藏所有 Tab 內容
    const tabContents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].style.display = "none";
        tabContents[i].classList.remove("active");
    }

    // 移除所有按鈕的 active 狀態
    const tabButtons = document.getElementsByClassName("tab-btn");
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove("active");
    }

    // 顯示當前選定的 Tab 內容
    const activeTab = document.getElementById(tabName);
    if (activeTab) {
        activeTab.style.display = "block";
        activeTab.classList.add("active");
    }

    // 將點擊的按鈕設為 active
    if (evt && evt.currentTarget) {
        evt.currentTarget.classList.add("active");
    } else {
        // 如果是透過 DOMContentLoaded 載入，手動設定第一個 Tab 的 active 狀態
        const defaultButton = document.querySelector(`.tab-btn[onclick*="${tabName}"]`);
        if (defaultButton) {
            defaultButton.classList.add("active");
        }
    }
}


/**
 * 3. 模擬獲取天氣數據並更新 HTML
 * 這裡沒有真正的 API 呼叫，只是模擬數據，並修正了 TypeError 的問題。
 */
function fetchWeather() {
    // 模擬從 API 獲取的天氣數據
    const mockWeatherData = {
        city: "大阪/和歌山",
        icon: "fas fa-cloud-sun",
        temp_min: 5,
        temp_max: 12,
        suggestion: "建議：洋蔥式穿搭，海邊(白濱)風大需防風外套。",
        description: "冬季晴朗，早晚溫差大"
    };

    // 🌟 核心修正：嘗試獲取 ID 為 'weather-info' 的元素
    const weatherInfoElement = document.getElementById('weather-info');

    if (weatherInfoElement) {
        // 如果元素存在，則更新內容
        const weatherHTML = `
            <h3>${mockWeatherData.city} 12月天氣預報</h3>
            <p>${mockWeatherData.description}：<strong>${mockWeatherData.temp_min}°C - ${mockWeatherData.temp_max}°C</strong></p>
            <small>${mockWeatherData.suggestion}</small>
        `;
        
        weatherInfoElement.innerHTML = weatherHTML;

        // 如果您為圖標單獨設定了 ID，可以在這裡更新
        const weatherIconElement = document.getElementById('weather-icon');
        if (weatherIconElement) {
             weatherIconElement.innerHTML = `<i class="${mockWeatherData.icon}"></i>`;
        }

    } else {
        // 拋出錯誤，讓開發者知道找不到元素 (但不會造成程式崩潰)
        console.error("無法取得天氣數據: 找不到 ID 為 'weather-info' 或 'weather-icon' 的 HTML 元素。請檢查 index.html。");
    }
}
