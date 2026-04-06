function getTodayString() {
  const today = new Date();
  return today.toISOString().slice(0, 10); // YYYY-MM-DD
}

function shouldShowPopup() {
  const hiddenDate = localStorage.getItem("popupHiddenDate");
  return hiddenDate !== getTodayString();
}

function shouldShowPopup2() {
  const hiddenDate = localStorage.getItem("popupHiddenDate2");
  return hiddenDate !== getTodayString();
}

function updateContainerVisibility() {
  const p1 = document.getElementById("popup");
  const p2 = document.getElementById("popup2");
  const scroll = document.querySelector(".popup-scroll");

  const p1Hidden = p1.style.display === "none" || p1.style.display === "";
  const p2Hidden = p2.style.display === "none" || p2.style.display === "";

  scroll.style.display = (p1Hidden && p2Hidden) ? "none" : "";
}

function closePopup() {
  const dontShow = document.getElementById("dont-show-today").checked;
  if (dontShow) {
    localStorage.setItem("popupHiddenDate", getTodayString());
  }
  document.getElementById("popup").style.display = "none";
  updateContainerVisibility();
}

function closePopup2() {
  const dontShow = document.getElementById("dont-show-today2").checked;
  if (dontShow) {
    localStorage.setItem("popupHiddenDate2", getTodayString());
  }
  document.getElementById("popup2").style.display = "none";
  updateContainerVisibility();
}

window.onload = function () {
  if (shouldShowPopup()) {
    // 예원: 팝업 안보이게 처리 (2026-03-12) show : "block", hide: "none"
    document.getElementById("popup").style.display = "block";
  }

  if (shouldShowPopup2()) {
    // 예원: 팝업 안보이게 처리 (2026-03-12) show : "block", hide: "none"
    document.getElementById("popup2").style.display = "block";
  }

  updateContainerVisibility();
};
