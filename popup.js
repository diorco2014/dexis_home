function getTodayKey() {
  const today = new Date();
  return `popup-hidden-${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

function openPopup(file, title = '공지') {
  fetch(file)
    .then(res => res.text())
    .then(html => {
      document.getElementById('popup-title').textContent = title;
      document.getElementById('popup-body').innerHTML = html;
      document.getElementById('popup').classList.add('show');
    });
}

document.getElementById('close-popup').addEventListener('click', () => {
  if (document.getElementById('no-popup-today').checked) {
    localStorage.setItem(getTodayKey(), 'true');
  }
  document.getElementById('popup').classList.remove('show');
});

window.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem(getTodayKey())) {
    // openPopup('popup.html', '신규 서비스 안내');
  }
});
