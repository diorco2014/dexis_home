// ---- 모달 HTML 자동 생성 ----
(function () {
	const modalHTML = `
    <div class="modal-overlay" id="pdfModal" style="display:none;">
      <div class="modal-content">
        <button class="modal-close" id="modalCloseBtn">✕</button>
        <iframe id="pdfFrame" class="modal-pdf" src=""></iframe>
      </div>
    </div>
  `;

	document.body.insertAdjacentHTML("beforeend", modalHTML);

	// 닫기 버튼 이벤트
	document.getElementById("modalCloseBtn").addEventListener("click", () => {
		closeModal();
	});

	// 오버레이 클릭 시 닫기
	document.getElementById("pdfModal").addEventListener("click", (e) => {
		if (e.target.id === "pdfModal") {
			closeModal();
		}
	});
})();

// ---- 기존 함수 그대로 유지 ----
function isMobile() {
	return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
}

function openModal(pdfPath) {
	if (isMobile()) {
		window.open(pdfPath, "_blank"); // 모바일 → 새 창
	} else {
		document.getElementById("pdfFrame").src = pdfPath;
		document.getElementById("pdfModal").style.display = "flex";
	}
}

function closeModal() {
	document.getElementById("pdfModal").style.display = "none";
	document.getElementById("pdfFrame").src = "";
}
