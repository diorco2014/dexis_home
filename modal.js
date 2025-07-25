function openModal(pdfPath) {
  document.getElementById('pdfFrame').src = pdfPath;
  document.getElementById('pdfModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('pdfModal').style.display = 'none';
  document.getElementById('pdfFrame').src = '';
}
