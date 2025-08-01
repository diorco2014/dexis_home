// 날짜 형식: YYYY-MM-DD
function getTodayKey() {
  const today = new Date();
  return `popupHidden-${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

function shouldShowPopup() {
  return !localStorage.getItem(getTodayKey());
}

function closePopup() {
  const dontShow = document.getElementById('dont-show-today').checked;
  if (dontShow) {
    localStorage.setItem(getTodayKey(), 'true');
  }
  document.getElementById('popup').style.display = 'none';
  document.getElementById('popup-bg').style.display = 'none';
}

window.onload = function () {
  if (shouldShowPopup()) {
    document.getElementById('popup').style.display = 'block';
    document.getElementById('popup-bg').style.display = 'block';
  }
};
