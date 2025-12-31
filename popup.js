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
		document.getElementById("popup").style.display = "block";
	}
};
