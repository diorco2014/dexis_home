const popup = document.getElementById('popup');
const hideTodayCheckbox = document.getElementById('hide-today');
const closeButton = document.getElementById('popup-close');

const todayKey = 'popup_hidden_' + new Date().toISOString().slice(0, 10);

if (!localStorage.getItem(todayKey)) {
  popup.style.display = 'block';
}

closeButton.addEventListener('click', function () {
  if (hideTodayCheckbox.checked) {
    localStorage.setItem(todayKey, 'true');
  }
  popup.style.display = 'none';
});
window.addEventListener('load', function () {
  const popup = document.getElementById('popup');
  const img = popup.querySelector('img');

  img.onload = function () {
    popup.style.width = img.naturalWidth + 'px';
  };
});
