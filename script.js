document.addEventListener('DOMContentLoaded', (event) => {
    const defaultTab = 'day1';
    openTab(null, defaultTab);
    
    registerServiceWorker();
    
    // 🌟 呼叫新的函式來獲取和載入天氣數據 🌟
    initializeWeatherDisplay();
});

// ⚠️ 將這裡的 YOUR_API_KEY 替換成您從 OpenWeatherMap 取得的真實 Key
const API_KEY = 'b848d0b11fbff83a27b0a9d9b08d9592'; 

/**
 * 跨日期的地點資訊 (包含座標 latitude/longitude)
 * OpenWeatherMap 建議使用座標查詢預報。
 */
const dailyWeatherLocations = {
    'day1': { 
        city: "難波 (12/16)", 
        lat: 34.6641, 
        lon: 135.5000, 
        elementId: 'weather-info-day1',
        dayIndex: 0 // API 預報中的第幾天 (0=今天)
    },
    'day2': { 
        city: "梅田 (12/17)", 
        lat: 34.7052, 
        lon: 135.4952, 
        elementId: 'weather-info-day2',
        dayIndex: 1
    },
    'day3': { 
        city: "京都 (12/18)", 
        lat: 35.0116, 
        lon: 135.7681, 
        elementId: 'weather-info-day3',
        dayIndex: 2
    },
    'day4': { 
        city: "和歌山 (12/19)", 
        lat: 34.2259, 
        lon: 135.1675, 
        elementId: 'weather-info-day4',
        dayIndex: 3
    },
    'day5': { 
        city: "白濱 (12/20)", 
        lat: 33.6823, 
        lon: 135.3582, 
        elementId: 'weather-info-day5',
        dayIndex: 4
    },
    'day6': { 
        city: "難波 (12/21)", 
        lat: 34.6641, 
        lon: 135.5000, 
        elementId: 'weather-info-day6',
        dayIndex: 5
    },
    'day7': { 
        city: "難波 (12/22)", 
        lat: 34.6641, 
        lon: 135.5000, 
        elementId: 'weather-info-day7',
        dayIndex: 6
    }
};

/**
 * 將 OpenWeatherMap 圖標代碼轉換為 Font Awesome 圖標
 * @param {string} iconCode - OpenWeatherMap 的圖標代碼
 * @returns {string} - Font Awesome 的類別名稱
 */
function getWeatherIcon(iconCode) {
    if (iconCode.includes('01')) return 'fas fa-sun'; // Clear sky
    if (iconCode.includes('02')) return 'fas fa-cloud-sun'; // Few clouds
    if (iconCode.includes('03') || iconCode.includes('04')) return 'fas fa-cloud'; // Scattered/Broken clouds
    if (iconCode.includes('09') || iconCode.includes('10')) return 'fas fa-cloud-showers-heavy'; // Shower/Rain
    if (iconCode.includes('11')) return 'fas fa-bolt'; // Thunderstorm
    if (iconCode.includes('13')) return 'fas fa-snowflake'; // Snow
    if (iconCode.includes('50')) return 'fas fa-smog'; // Mist
    return 'fas fa-thermometer-half'; // Default
}

/**
 * 🌟 核心函數：發送 API 請求並更新所有日期的天氣 🌟
 */
async function initializeWeatherDisplay() {
    if (API_KEY === 'YOUR_API_KEY' || !API_KEY) {
        console.error("請先替換 OpenWeatherMap API KEY。");
        // 顯示一個錯誤訊息在頁面頂部
        const header = document.querySelector('.header-content h1');
        if(header) header.innerHTML += ' 🔴 (請設定 API Key)';
        return;
    }

    // 由於大阪是行程中心，我們以難波的座標作為主要的 API 查詢點
    const centralLocation = dailyWeatherLocations.day1;
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${centralLocation.lat}&lon=${centralLocation.lon}&exclude=current,minutely,hourly,alerts&units=metric&lang=zh_tw&appid=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        // 檢查 API 是否回傳了 daily 預報數據
        if (!data || !data.daily) {
            console.error("API 回傳數據錯誤或預報不可用。", data);
            return;
        }

        for (const tabId in dailyWeatherLocations) {
            const locationData = dailyWeatherLocations[tabId];
            const dayIndex = locationData.dayIndex;

            // 抓取對應日期的預報數據
            const forecast = data.daily[dayIndex];
            
            // 由於 API 只給了一個預報列表，我們需要特別處理不同地點的邏輯
            // 這裡我們假設同一天的不同地點，氣溫相差不大，只用API預報的數據
            if (forecast) {
                // 將 K 轉為 C，API 已經設定 units=metric，所以直接使用 temp.day
                const temp_min = Math.round(forecast.temp.min);
                const temp_max = Math.round(forecast.temp.max);
                const description = forecast.weather[0].description;
                const iconCode = forecast.weather[0].icon;

                const weatherInfoElement = document.getElementById(locationData.elementId);
                const weatherIconElement = document.getElementById(locationData.elementId.replace('info', 'icon')); 

                if (weatherInfoElement) {
                    const weatherHTML = `
                        <h3>${locationData.city} 天氣預報</h3>
                        <p>${description}：<strong>${temp_min}°C - ${temp_max}°C</strong></p>
                        <small>數據來源：OpenWeatherMap</small>
                    `;
                    
                    weatherInfoElement.innerHTML = weatherHTML;
                    
                    if (weatherIconElement) {
                         weatherIconElement.innerHTML = `<i class="${getWeatherIcon(iconCode)}"></i>`;
                    }
                }
            } else {
                console.warn(`找不到 ${locationData.city} (Day ${dayIndex + 1}) 的預報數據。`);
            }
        }

    } catch (error) {
        console.error("無法連接到 OpenWeatherMap API:", error);
    }
}


// --- PWA 和 Tab 相關功能保持不變 ---

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
