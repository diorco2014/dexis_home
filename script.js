document.addEventListener("DOMContentLoaded", () => {
	// 사양 부분 accordion-button
	const buttons = document.querySelectorAll(".accordion-button");

	buttons.forEach((button) => {
		button.addEventListener("click", () => {
			const targetId = button.getAttribute("data-target");
			const content = document.getElementById(targetId);
			const icon = button.querySelector(".icon");

			const isOpen = content.style.display === "block";

			if (isOpen) {
				content.style.display = "none";
				icon.textContent = "＋";
			} else {
				content.style.display = "block";
				icon.textContent = "✕";
			}
		});
	});

	// 플로팅 메시지 표시 함수
	function showToast(message, isSuccess = true) {
		const toast = document.getElementById("form-toast");
		if (!toast) return;

		toast.textContent = message;
		toast.style.backgroundColor = isSuccess
			? "rgba(40, 167, 69, 0.95)"
			: "rgba(220, 53, 69, 0.95)";
		toast.style.display = "block";

		setTimeout(() => {
			toast.style.display = "none";
		}, 3000);
	}

	// 폼 메일 보내기
	const form = document.querySelector("#form-mail form");
	if (form) {
		const submitBtn = form.querySelector("button[type='submit']");

		// 폼 제출 이벤트 처리
		form.addEventListener("submit", function (event) {
			event.preventDefault();

			// 버튼 상태 업데이트
			submitBtn.disabled = true;
			submitBtn.textContent = "전송 중...";

			const formData = new FormData(form);
			const data = Object.fromEntries(formData.entries());

			// API 호출
			fetch("https://api.motiv-ai.com/api/dexiskorea/formmail", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			})
				.then((response) => {
					if (!response.ok) throw new Error("서버 오류");
					return response.json();
				})
				.then((result) => {
					form.reset();
					showToast("문의가 성공적으로 접수되었습니다.", true);
				})
				.catch((error) => {
					console.error(error);
					showToast("오류가 발생했습니다. 다시 시도해주세요.", false);
				})
				.finally(() => {
					// 버튼 원상복구
					submitBtn.disabled = false;
					submitBtn.textContent = "문의하기";
				});
		});
	}
});
