// 여러 링크가 같은 팝업을 열도록
const triggers = document.querySelectorAll('.carepopup-link');
const overlay = document.getElementById('carepopup-overlay');
const closeBtn = document.getElementById('carepopup-close');

// 열기
triggers.forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    overlay.style.display = 'block';
    document.body.style.overflow = 'hidden'; // 배경 스크롤 잠금
    overlay.setAttribute('aria-hidden', 'false');
  });
});

// 닫기
function careClosePopup() {
  overlay.style.display = 'none';
  document.body.style.overflow = '';
  overlay.setAttribute('aria-hidden', 'true');
}
closeBtn.addEventListener('click', careClosePopup);

// 바깥 클릭 닫기
overlay.addEventListener('click', e => {
  if (e.target === overlay) careClosePopup();
});

// ESC 닫기
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && overlay.style.display === 'block') careClosePopup();
});
