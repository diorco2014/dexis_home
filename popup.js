const popup = document.getElementById('popup');
const hideTodayCheckbox = document.getElementById('hide-today');
const closeButton = document.getElementById('popup-close');

const videoPopup = document.getElementById('video-popup');
const videoCheckbox = document.getElementById('video-hide-today');
const videoClose = document.getElementById('video-popup-close');

const today = new Date().toISOString().slice(0, 10);
const imagePopupKey = 'popup_hidden_' + today;
const videoPopupKey = 'video_popup_hidden_' + today;

// ✅ 영상 팝업 표시
function showVideoPopup() {
  if (!localStorage.getItem(videoPopupKey)) {
    videoPopup.style.display = 'block';
  }
}

// ✅ 이미지 팝업 표시
function showImagePopup() {
  if (!localStorage.getItem(imagePopupKey)) {
    popup.style.display = 'block';
  } else {
    // 이미지가 숨겨졌다면 바로 영상 보여줌
    showVideoPopup();
  }
}

// ✅ 이미지 팝업 닫기 → 영상 팝업 열기
closeButton.addEventListener('click', function () {
  if (hideTodayCheckbox.checked) {
    localStorage.setItem(imagePopupKey, 'true');
  }
  popup.style.display = 'none';

  setTimeout(() => {
    showVideoPopup();
  }, 300);
});

// ✅ 영상 팝업 닫기
videoClose.addEventListener('click', function () {
  if (videoCheckbox.checked) {
    localStorage.setItem(videoPopupKey, 'true');
  }
  videoPopup.style.display = 'none';
});

// ✅ 페이지 로드 시: 이미지부터 보여주기
window.addEventListener('load', function () {
  showImagePopup();
});
