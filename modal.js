function openModal(file, title) {
  fetch(file)
    .then(res => res.text())
    .then(html => {
      document.getElementById('modal-title').textContent = title;
      document.getElementById('modal-body').innerHTML = html;
      document.getElementById('modal').style.display = 'block';
    });
}

document.getElementById('close-modal').addEventListener('click', () => {
  document.getElementById('modal').style.display = 'none';
});

document.querySelectorAll('.footer-link').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    openModal(this.dataset.file, this.textContent);
  });
});
