document.addEventListener('DOMContentLoaded', (event) => {
    const defaultTab = 'day1';
    openTab(null, defaultTab);
    
    registerServiceWorker();
    
    // 🌟 呼叫新的函式來獲取和載入天氣數據 🌟
    initializeWeatherDisplay();
});

// ⚠️ 請確認您的 API Key 已填入 ⚠️
const API_KEY = 'b848d0b11fbff83a27b0a9d9b08d9592'; 

/**
 * 跨日期的地點資訊 (包含座標 latitude/longitude)
 * 注意: 已移除 dayIndex
 */
const dailyWeatherLocations = {
    // 雖然是 16日，但我們用最新的當天預報
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
 * (此函數保持不變)
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
 * 🌟 核心函數：為每個地點單獨發送 API 請求並更新天氣 🌟
 */
async function initializeWeatherDisplay() {
    if (API_KEY === 'b848d0b11fbff83a27b0a9d9b08d9592' || !API_KEY) {
        console.error("請先替換 OpenWeatherMap API KEY。");
        const header = document.querySelector('.header-content h1');
        if(header) header.innerHTML += ' 🔴 (請設定 API Key)';
        return;
    }

    for (const tabId in dailyWeatherLocations) {
        const locationData = dailyWeatherLocations[tabId];

        // 使用 5 day / 3 hour forecast API (最遠可預測 5 天)
        // One Call API 不適合用於查詢多個地點
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${locationData.lat}&lon=${locationData.lon}&units=metric&lang=zh_tw&appid=${API_KEY}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();

            if (!data || !data.list || data.list.length === 0) {
                console.error(`API 回傳 ${locationData.city} 數據錯誤或預報不可用。`, data);
                continue; // 跳過此地點，繼續下一個
            }
            
            // 由於 API 提供 3 小時預報，我們取當前或第一個預報點作為當日天氣概況
            const forecast = data.list[0]; 
            
            // 由於 forecast API 不直接提供 min/max temp，我們使用主溫度作為參考
            const temp_current = Math.round(forecast.main.temp);
            const description = forecast.weather[0].description;
            const iconCode = forecast.weather[0].icon;
            
            const weatherInfoElement = document.getElementById(locationData.elementId);
            const weatherIconElement = document.getElementById(locationData.elementId.replace('info', 'icon')); 

            if (weatherInfoElement) {
                const weatherHTML = `
                    <h3>${locationData.city} 天氣 (即時/當日預報)</h3>
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
