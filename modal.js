function isMobile() {
  return /Mobi|Android|iPhone/i.test(navigator.userAgent);
}

function openModal(pdfPath) {
  if (isMobile()) {
    window.open(pdfPath, '_blank'); // 새 창에서 열기
  } else {
    document.getElementById('pdfFrame').src = pdfPath;
    document.getElementById('pdfModal').style.display = 'flex';
  }
}

function closeModal() {
  document.getElementById('pdfModal').style.display = 'none';
  document.getElementById('pdfFrame').src = '';
}
