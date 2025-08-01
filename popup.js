const popup = document.getElementById('popup');
const hideTodayCheckbox = document.getElementById('hide-today');
const closeButton = document.getElementById('popup-close');

const videoPopup = document.getElementById('video-popup');
const videoCheckbox = document.getElementById('video-hide-today');
const videoClose = document.getElementById('video-popup-close');

const today = new Date().toISOString().slice(0, 10);
const imagePopupKey = 'popup_hidden_' + today;
const videoPopupKey = 'video_popup_hidden_' + today;

function showImagePopup() {
  if (!localStorage.getItem(imagePopupKey)) {
    popup.style.display = 'block';
  }
}

function showVideoPopup() {
  const videoHidden = localStorage.getItem(videoPopupKey);

  if (!videoHidden) {
    videoPopup.style.display = 'block';
  } else {
    // ⚠ 영상이 이미 숨겨져 있는 경우에만 이미지 팝업 띄움
    showImagePopup();
  }
}

// 영상 팝업 닫기
videoClose.addEventListener('click', function () {
  if (videoCheckbox.checked) {
    localStorage.setItem(videoPopupKey, 'true');
  }
  videoPopup.style.display = 'none';

  // ✅ 닫은 이후에만 이미지 팝업 보이게
  setTimeout(() => {
    showImagePopup();
  }, 300); // 살짝 지연을 주면 시각적으로 더 자연스럽게 전환됨
});

// 이미지 팝업 닫기
closeButton.addEventListener('click', function () {
  if (hideTodayCheckbox.checked) {
    localStorage.setItem(imagePopupKey, 'true');
  }
  popup.style.display = 'none';
});

// ✅ 페이지 로드 시: 영상부터 판단
window.addEventListener('load', function () {
  // ✅ 영상이 숨김 조건이 아니면 이미지 팝업은 여기서 절대 실행되지 않음!
  showVideoPopup();
});

// // 이미지크기에 따라 팝업 크기 조절
// window.addEventListener('load', function () {
//   const popup = document.getElementById('popup');
//   const img = popup.querySelector('img');

//   img.onload = function () {
//     popup.style.width = img.naturalWidth + 'px';
//   };
// });
