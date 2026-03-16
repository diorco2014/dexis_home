function getTodayString() {
  const today = new Date();
  return today.toISOString().slice(0, 10); // YYYY-MM-DD
}

function shouldShowPopup() {
  const hiddenDate = localStorage.getItem("popupHiddenDate");
  return hiddenDate !== getTodayString();
}

function closePopup() {
  const dontShow = document.getElementById("dont-show-today").checked;
  if (dontShow) {
    localStorage.setItem("popupHiddenDate", getTodayString());
  }
  document.getElementById("popup").style.display = "none";
}

window.onload = function () {
  if (shouldShowPopup()) {
    // 예원: 팝업 안보이게 처리 (2026-03-12) show : "block", hide: "none"
    document.getElementById("popup").style.display = "block";
  }
};
