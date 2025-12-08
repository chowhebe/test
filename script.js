// ====== 零元旅人 Web App 腳本 v2.0 (即時天氣更新) ======

// ⚠️ 替換這裡為您自己的 OpenWeatherMap API Key ⚠️
const API_KEY = "b848d0b11fbff83a27b0a9d9b08d9592";
// 大阪的緯度 (lat) 和經度 (lon)
const OSAKA_LAT = 34.6937;
const OSAKA_LON = 135.5023;
const WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${OSAKA_LAT}&lon=${OSAKA_LON}&appid=${API_KEY}&units=metric&lang=zh_tw`;


// 函數：取得天氣並更新介面
async function fetchWeather() {
    const weatherContainer = document.getElementById('live-weather');

    try {
        const response = await fetch(WEATHER_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // 提取關鍵數據
        const temp = Math.round(data.main.temp);
        const description = data.weather[0].description;
        const iconCode = data.weather[0].icon;
        
        // 轉換天氣圖標為 Font Awesome 符號 (簡化版)
        let faIcon = 'fa-sun'; // 預設太陽
        if (iconCode.includes('09') || iconCode.includes('10')) faIcon = 'fa-cloud-rain'; // 雨
        else if (iconCode.includes('13')) faIcon = 'fa-snowflake'; // 雪
        else if (iconCode.includes('04')) faIcon = 'fa-cloud'; // 多雲
        else if (iconCode.includes('01')) faIcon = 'fa-sun'; // 晴朗
        else faIcon = 'fa-cloud-sun'; // 晴時多雲

        // 動態生成 HTML 內容
        weatherContainer.innerHTML = `
            <div class="weather-icon"><i class="fas ${faIcon}"></i></div>
            <div class="weather-info">
                <h3>大阪現時天氣</h3>
                <p>溫度：<strong>${temp}°C</strong> | ${description}</p>
                <small>數據來源：OpenWeatherMap | 每小時更新</small>
            </div>
        `;

    } catch (error) {
        console.error("無法取得天氣數據:", error);
        weatherContainer.innerHTML = `
            <div class="weather-icon"><i class="fas fa-exclamation-triangle"></i></div>
            <div class="weather-info">
                <h3>天氣載入失敗</h3>
                <p>請檢查 API Key 或網路連線。</p>
            </div>
        `;
    }
}


// 函數：處理分頁切換邏輯 (與舊版相同)
function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab-btn");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}


// 程式啟動點：在頁面載入完成時執行
document.addEventListener("DOMContentLoaded", function() {
    // 預設開啟第一天
    document.getElementById("day1").style.display = "block";
    
    // 呼叫天氣 API
    fetchWeather();
});

// 將 openTab 函數暴露給 HTML 中的 onclick 屬性
window.openTab = openTab;
