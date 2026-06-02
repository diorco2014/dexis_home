const POPUPS = [
  {
    popupId: "popup",
    checkboxId: "dont-show-today",
    storageKey: "popupHiddenDate",
  },
  {
    popupId: "popup2",
    checkboxId: "dont-show-today2",
    storageKey: "popupHiddenDate2",
  },
  {
    popupId: "popup3",
    checkboxId: "dont-show-today3",
    storageKey: "popupHiddenDate3",
  },
];

function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const date = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${date}`;
}

function shouldShowPopup(storageKey) {
  const hiddenDate = localStorage.getItem(storageKey);
  return hiddenDate !== getTodayString();
}

function isHidden(element) {
  if (!element) return true;

  return window.getComputedStyle(element).display === "none";
}

function updateContainerVisibility() {
  const scroll = document.querySelector(".popup-scroll");

  if (!scroll) return;

  const allHidden = POPUPS.every(({ popupId }) => {
    const popup = document.getElementById(popupId);
    return isHidden(popup);
  });

  scroll.style.display = allHidden ? "none" : "";
}

function closePopupByIndex(index) {
  const popupInfo = POPUPS[index];

  if (!popupInfo) return;

  const popup = document.getElementById(popupInfo.popupId);
  const checkbox = document.getElementById(popupInfo.checkboxId);

  if (!popup) return;

  if (checkbox?.checked) {
    localStorage.setItem(popupInfo.storageKey, getTodayString());
  }

  popup.style.display = "none";
  updateContainerVisibility();
}

window.addEventListener("load", function () {
  const isIndex = location.pathname === "/";

  if (!isIndex) {
    updateContainerVisibility();
    return;
  }

  POPUPS.forEach(({ popupId, storageKey }) => {
    const popup = document.getElementById(popupId);

    if (!popup) return;

    popup.style.display = shouldShowPopup(storageKey) ? "block" : "none";
  });

  updateContainerVisibility();
});
