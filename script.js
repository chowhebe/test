document.addEventListener("DOMContentLoaded", function() {
    // 預設開啟第一天
    document.getElementById("day1").style.display = "block";
});

function openTab(evt, tabName) {
    var i, tabcontent, tablinks;

    // 1. 隱藏所有內容
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // 2. 移除所有按鈕的 active 狀態
    tablinks = document.getElementsByClassName("tab-btn");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // 3. 顯示目標內容並啟用按鈕
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
    
    // 4. 自動滾動到頂部 (優化手機體驗)
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}