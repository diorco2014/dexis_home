import {
	getKey,
	getCookie,
	ensureClientId,
	apiLogin,
	apiLogout,
	apiGetPosts,
	apiGetPostDetail,
	passwordCheck,
	tryReissueToken,
	apiCreatePost,
	apiUpdatePost,
	apiDeletePost,
	apiCreateComment,
	apiUpdateComment,
	apiDeleteComment,
} from "./api.js";

import { getAccessToken, setAccessToken } from "./token.js";

/*************************************************
 * 공통 유틸
 *************************************************/

// 관리자 여부는 "토큰 유무"로만 판단
function isAdmin() {
	return !!getAccessToken();
}

// 비밀번호 유효성 검사 (게시글용)
function validatePostPassword(password) {
	const pw = (password || "").trim();

	if (!pw) {
		return "비밀번호를 입력해주세요";
	}
	if (pw.length < 4) {
		return "비밀번호는 최소 4자리 이상이어야 합니다";
	}

	// 필요하면 여기서 추가 규칙(숫자/영문 조합 등)도 확장 가능
	return null; // ✅ 통과
}

// post 객체의 id 통일
const getPostId = (post) => post?.postId ?? post?.id;

// comment 객체의 id 통일
const getCommentId = (c) => c?.commentId ?? c?.id;

// DOM 선택 헬퍼
const $ = (sel, root = document) => root.querySelector(sel);

/*************************************************
 * STATE
 *************************************************/
let posts = [];
let currentPage = Number(new URLSearchParams(location.search).get("page")) || 1;
const windowSize = 5;

let selectedPost = null;
let editingPostId = null;
let editingCommentId = null;
let postCaptcha = null;
let pendingPasswordPost = null; // { post, id, action }
let lastVerifiedPassword = null; // { postId, password }

// 길게 누르면 관리자 로그인 유도
let writeHoldTimer = null;
let writeHoldTriggered = false;

/*************************************************
 * DOM 요소
 *************************************************/
const qbBtnWrite = $("#qbBtnWrite");
const qbPostList = $("#qbPostList");
const qbPagination = $("#qbPagination");
const qbToast = $("#qbToast");
const qbAdminStatus = $("#qbAdminStatus");

// 글 작성/수정 모달
const qbPostModal = $("#qbPostModal");
const qbPostForm = $("#qbPostForm");
const qbPostTitle = $("#qbPostTitle");
const qbTitle = $("#qbTitle");
const qbContent = $("#qbContent");
const qbPrivate = $("#qbPrivate");
const qbPostSubmit = $("#qbPostSubmit");
const qbWriterNameInput = $("#qbWriterName");
const qbWriterPasswordInput = $("#qbWriterPassword");
const qbWriterPasswordRow =
	$("#qbWriterPasswordRow") || $("#qbWriterPassword")?.closest(".qb-field");

// 상세 모달
const qbDetailModal = $("#qbDetailModal");
const qbDetailHeader = $("#qbDetailHeader");
const qbDetailContent = $("#qbDetailContent");

// 댓글
const qbCommentList = $("#qbCommentList");
const qbCommentCount = $("#qbCommentCount");
const qbCommentForm = $("#qbCommentForm");
const qbCommentText = $("#qbCommentText");
const qbSubmitComment = $("#qbSubmitComment");
const qbCxlComment = $("#qbCxlComment");
const qbCommentSigned = $("#qbCommentSigned");

// 관리자 로그인 모달
const qbAdminModal = $("#qbAdminModal");
const qbAdminForm = $("#qbAdminForm");
const qbAdminId = $("#qbAdminId");
const qbAdminPw = $("#qbAdminPw");

// 비밀번호 확인 모달
const qbPasswordModal = $("#qbPasswordModal");
const qbPasswordForm = $("#qbPasswordForm");
const qbPasswordInput = $("#qbPasswordInput");

// 캡차
const postCaptchaCanvas = $("#postCaptcha");
const postCaptchaInput = $("#postCaptchaInput");
const postCaptchaRefresh = $("#postCaptchaRefresh");

/*************************************************
 * MODAL 공통
 *************************************************/
function openModal(el) {
	if (!el) return;
	el.classList.add("qb-open");
	document.body.style.overflow = "hidden";
}

function closeModal(el) {
	if (!el) return;
	el.classList.remove("qb-open");
	document.body.style.overflow = "";
}

function closeAllModals() {
	[qbDetailModal, qbPostModal, qbAdminModal, qbPasswordModal]
		.filter(Boolean)
		.forEach((modal) => closeModal(modal));
}

function resetForms() {
	qbPostForm?.reset();
	qbCommentForm?.reset();
	qbAdminForm?.reset();
	qbPasswordForm?.reset();
	pendingPasswordPost = null;
	lastVerifiedPassword = null;
}

// 모달 닫기 버튼 / 바깥 클릭
document.addEventListener("click", (e) => {
	if (e.target.matches("[data-qb-close]")) {
		const modal = e.target.closest(".qb-modal");
		if (modal) {
			closeModal(modal);
			resetForms();
		}
	}

	if (e.target.classList.contains("qb-modal")) {
		closeModal(e.target);
		resetForms();
	}
});

/*************************************************
 * TOAST
 *************************************************/
function toastMessage(msg, type = "info") {
	if (!qbToast) return;

	qbToast.textContent = msg;

	if (type === "error") {
		qbToast.style.backgroundColor = "rgba(255, 235, 235, 0.95)";
		qbToast.style.color = "#a40000";
	} else {
		qbToast.style.backgroundColor = "#e1f5eb";
		qbToast.style.color = "#000";
	}

	qbToast.classList.add("qb-show");

	clearTimeout(toastMessage._t);
	toastMessage._t = setTimeout(() => qbToast.classList.remove("qb-show"), 3000);
}

/*************************************************
 * 문자열/날짜 유틸
 *************************************************/
function escapeHTML(s = "") {
	return s.replace(
		/[&<>"']/g,
		(m) =>
			({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
				m
			])
	);
}

function formatKST(dateInput) {
	const d = new Date(dateInput);
	const kst = new Date(d.getTime() + 9 * 3600 * 1000);
	return kst.toISOString().slice(0, 10);
}

/*************************************************
 * 관리자 UI 상태
 *************************************************/
function renderAdminStatus() {
	if (!qbAdminStatus) return;

	if (isAdmin()) {
		qbAdminStatus.innerHTML = `
      <span>관리자 모드</span>
      <button id="qbAdminLogout" class="qb-btn qb-ghost qb-sm" style="padding:4px 8px;">로그아웃</button>
    `;
		$("#qbAdminLogout")?.addEventListener("click", handleAdminLogout);
	} else {
		qbAdminStatus.textContent = "";
	}
}

async function handleAdminLogout() {
	try {
		const result = await apiLogout();

		// if (!result.isLogout) {
		// 	return toastMessage("로그아웃에 실패했습니다", "error");
		// }
	} catch (err) {
		console.error(err);
	} finally {
		localStorage.removeItem("hadAdminLogin");
		setAccessToken(null);
		renderAdminStatus();
		toastMessage("로그아웃 되었습니다");
		closeAllModals();
	}
}

// 토큰 만료 시 api.js 에서 window.dispatchEvent(new CustomEvent("qb-logout"))를 호출한다고 가정
window.addEventListener("qb-logout", () => {
	toastMessage("세션이 만료되었습니다. 다시 로그인 해주세요.", "error");
	setAccessToken(null);
	renderAdminStatus();
	closeAllModals();
	localStorage.removeItem("hadAdminLogin");
});

/*************************************************
 * 캡차
 *************************************************/
function initPostCaptcha() {
	if (!postCaptchaCanvas) return;
	if (window.CustomCaptcha) {
		postCaptcha = window.CustomCaptcha;
		postCaptcha.draw(postCaptchaCanvas.id);
	}
}

postCaptchaRefresh?.addEventListener("click", () => {
	initPostCaptcha();
});

/*************************************************
 * 관리자 로그인 모달
 *************************************************/
function openAdminLoginModal() {
	if (!qbAdminModal) return;
	qbAdminForm?.reset();
	openModal(qbAdminModal);
	qbAdminId.focus();
}

// 관리자 로그인 submit
qbAdminForm?.addEventListener("submit", async (e) => {
	e.preventDefault();

	const id = qbAdminId?.value.trim();
	const pw = qbAdminPw?.value.trim();

	if (!id) return toastMessage("아이디를 입력해주세요", "error");
	if (!pw) return toastMessage("비밀번호를 입력해주세요", "error");

	try {
		const clientId = getCookie("clientId");
		await apiLogin({ id, password: pw, client_id: clientId });

		localStorage.setItem("hadAdminLogin", "true");
		renderAdminStatus();
		toastMessage("관리자 모드로 전환되었습니다");
		closeModal(qbAdminModal);
	} catch (err) {
		console.error(err);
		toastMessage("아이디 또는 비밀번호가 올바르지 않습니다", "error");
	}
});

/*************************************************
 * 길게 누르면 관리자 로그인 유도
 *************************************************/
function startWriteHold() {
	writeHoldTriggered = false;
	clearTimeout(writeHoldTimer);
	writeHoldTimer = setTimeout(() => {
		writeHoldTriggered = true;
		openAdminLoginModal();
	}, 5000);
}

function cancelWriteHold() {
	clearTimeout(writeHoldTimer);
	writeHoldTimer = null;
}

/*************************************************
 * 게시글 리스트 불러오기
 *************************************************/
async function loadPosts(page = currentPage) {
	try {
		const { posts: apiPosts, pagination } = await apiGetPosts(page);

		posts = apiPosts;
		renderList();
		renderPagination(pagination.total, pagination.page, pagination.limit);
		currentPage = pagination.page;
	} catch (e) {
		console.error(e);
		toastMessage("게시글을 불러오지 못했습니다", "error");
	}
}

/*************************************************
 * 리스트 렌더링
 *************************************************/
function renderList() {
	qbPostList.innerHTML = "";

	if (!posts.length) {
		qbPostList.innerHTML = `
			<div class="qb-empty">
				<p class="qb-help">등록된 게시물이 없습니다</p>
				<p class="qb-help">첫 게시물을 남겨보세요</p>
			</div>
		`;
		return;
	}

	posts.forEach((post) => {
		const el = document.createElement("div");
		el.className = "qb-card";

		const showAuthor = post.isPrivate ? "*****" : post.authorName;

		el.innerHTML = `
      <div class="qb-row">
        <div class="qb-grow qb-click">          
          <div class="qb-title-row">
            <div class="qb-left">
              ${
								post.isPrivate
									? `<div class="qb-badge-cat qb-badge-secret">비밀</div>`
									: ""
							}
              ${
								post.isAdmin === true
									? `<div class="qb-badge">관리자</div>`
									: ""
							}
              <h3 class="qb-title-text">${escapeHTML(post.title)}</h3>
            </div>
            <div class="qb-meta">
              <span>${showAuthor}</span>
              <span>•</span>
              <span>${formatKST(post.date)}</span>
              <span>💬 ${post.commentCount}</span>
            </div>
          </div>
        </div>
      </div>
    `;

		el.querySelector(".qb-click").addEventListener("click", () =>
			handlePostClick(post)
		);

		qbPostList.append(el);
	});
}

/*************************************************
 * 게시글 클릭 시 접근 제어
 *************************************************/
function handlePostClick(post) {
	const postId = getPostId(post);

	// ✅ 1. 관리자면 모든 글 바로 접근 가능
	if (isAdmin()) {
		return openDetail(postId);
	}

	// ✅ 2. 일반 유저인 경우
	// 2-1. 관리자 글 + 비밀글 → 접근 불가 (토스트만)
	if (post.isAdmin === true && post.isPrivate) {
		toastMessage("관리자만 확인 가능합니다.", "error");
		return;
	}
	// 2-2. 일반 유저 글 + 비밀글 → 비밀번호 확인 후 열람
	if (post.isPrivate) {
		return requestPostPassword(post, "view");
	}
	// 2-3. 공개글 (관리자 글이든 일반 글이든) → 모두 상세 바로 보기
	return openDetail(postId);
}

/*************************************************
 * 비밀번호 확인 모달 요청
 *************************************************/
function requestPostPassword(post, action = "view") {
	if (!qbPasswordModal || !qbPasswordForm) {
		if (action === "view") return openDetail(getPostId(post));
		if (action === "edit") return editPost(post);
		if (action === "delete") return deletePost(getPostId(post));
		return;
	}

	const postId = getPostId(post);
	pendingPasswordPost = { post, id: postId, action };

	if (qbPasswordInput) qbPasswordInput.value = "";
	openModal(qbPasswordModal);
	qbPasswordInput?.focus();
}

// 비밀번호 확인 submit
qbPasswordForm?.addEventListener("submit", async (e) => {
	e.preventDefault();

	if (!pendingPasswordPost) {
		closeModal(qbPasswordModal);
		return;
	}

	const password = qbPasswordInput?.value.trim();
	const pwError = validatePostPassword(password);
	if (pwError) {
		return toastMessage(pwError, "error");
	}

	const { action, post, id } = pendingPasswordPost;

	try {
		// ✅ 서버 비밀번호 검증 요청
		const result = await passwordCheck(id, { password });

		if (!result?.password) {
			return toastMessage("비밀번호가 일치하지 않습니다", "error");
		}

		// ✅ 여기까지 왔으면 비밀번호 일치
		pendingPasswordPost = null;
		closeModal(qbPasswordModal);
		handlePasswordSuccess(action, post, id, password);
	} catch (err) {
		console.error(err);
		toastMessage(
			err.message || "비밀번호 검증 중 오류가 발생했습니다",
			"error"
		);
	}
});

// 비밀번호 검증 성공 후 동작
function handlePasswordSuccess(action, post, id, password) {
	// ✅ 비밀번호 검증에 성공한 글/비밀번호 기억
	lastVerifiedPassword = { postId: id, password };

	switch (action) {
		case "edit":
			return editPost(post);
		case "delete":
			return deletePost(id, { password });
		case "view":
		default:
			return openDetail(id);
	}
}

/*************************************************
 * 페이지네이션
 *************************************************/
function renderPagination(total, page, limit) {
	qbPagination.innerHTML = "";
	if (total === 0) return;

	const totalPages = Math.ceil(total / limit);

	let half = Math.floor(windowSize / 2);
	let start = page - half;
	let end = page + half;

	if (start < 1) {
		start = 1;
		end = Math.min(windowSize, totalPages);
	}
	if (end > totalPages) {
		end = totalPages;
		start = Math.max(1, totalPages - windowSize + 1);
	}

	const makeBtn = (label, p, disabled = false, active = false) => {
		const b = document.createElement("button");
		b.textContent = label;
		b.className = "qb-page-btn";
		if (disabled) b.classList.add("disabled");
		if (active) b.classList.add("active");
		b.addEventListener("click", () => !disabled && goToPage(p));
		return b;
	};

	qbPagination.append(makeBtn("◀", page - 1, page === 1));

	for (let p = start; p <= end; p++) {
		qbPagination.append(makeBtn(p, p, false, p === page));
	}

	qbPagination.append(makeBtn("▶", page + 1, page === totalPages));
}

function goToPage(page) {
	const params = new URLSearchParams(location.search);
	params.set("page", page);

	history.replaceState({}, "", `${location.pathname}?${params}`);

	loadPosts(page);

	const board = document.querySelector(".qb-section");
	if (board) {
		board.scrollIntoView({ behavior: "smooth", block: "start" });
	}
}

/*************************************************
 * 작성하기 버튼
 *************************************************/
["mousedown", "touchstart"].forEach((evt) =>
	qbBtnWrite?.addEventListener(evt, (e) => {
		if (isAdmin()) return;
		startWriteHold(e);
	})
);

["mouseup", "mouseleave", "touchend", "touchcancel"].forEach((evt) =>
	qbBtnWrite?.addEventListener(evt, (e) => {
		if (isAdmin()) return;
		cancelWriteHold(e);
	})
);

qbBtnWrite?.addEventListener("click", () => {
	if (writeHoldTriggered) {
		writeHoldTriggered = false;
		return;
	}

	editingPostId = null;
	qbPostTitle.textContent = "게시글 작성";
	qbPostForm.reset();
	qbPostSubmit.textContent = "저장";

	// ✅ 관리자일 때: 이름 = "관리자" 고정, 비밀번호 필드 숨김
	if (isAdmin()) {
		if (qbWriterNameInput) {
			qbWriterNameInput.value = "관리자";
			qbWriterNameInput.setAttribute("disabled", "true");
		}
		if (qbWriterPasswordRow) qbWriterPasswordRow.style.display = "none";
	} else {
		if (qbWriterNameInput) {
			qbWriterNameInput.value = "";
			qbWriterNameInput.removeAttribute("disabled");
		}
		if (qbWriterPasswordRow) qbWriterPasswordRow.style.display = "flex";
	}

	openModal(qbPostModal);
	initPostCaptcha();
});

qbBtnWrite?.addEventListener("click", () => {
	if (writeHoldTriggered) {
		writeHoldTriggered = false;
		return;
	}

	editingPostId = null;
	qbPostTitle.textContent = "게시글 작성";
	qbPostForm.reset();
	qbPostSubmit.textContent = "저장";

	// ✅ 관리자일 때: 이름 = "관리자" 고정, 비밀번호 필드 숨김
	if (isAdmin()) {
		if (qbWriterNameInput) {
			qbWriterNameInput.value = "관리자";
			qbWriterNameInput.setAttribute("disabled", "true");
		}
		if (qbWriterPasswordRow) qbWriterPasswordRow.style.display = "none";
	} else {
		if (qbWriterNameInput) {
			qbWriterNameInput.value = "";
			qbWriterNameInput.removeAttribute("disabled");
		}
		if (qbWriterPasswordRow) qbWriterPasswordRow.style.display = "flex";
	}

	openModal(qbPostModal);
	initPostCaptcha();
});

/*************************************************
 * 글 작성 / 수정 submit
 *************************************************/
qbPostForm?.addEventListener("submit", async (e) => {
	e.preventDefault();

	// 캡차 검증
	const captchaInput = (postCaptchaInput?.value || "").trim().toLowerCase();
	const captchaCode = postCaptcha?.code || "";
	if (!captchaInput || !captchaCode || captchaInput !== captchaCode) {
		toastMessage("자동입력방지 문자가 올바르지 않습니다", "error");
		if (postCaptchaInput) postCaptchaInput.value = "";
		initPostCaptcha();

		return;
	}

	const title = qbTitle.value.trim();
	const content = qbContent.value.trim();
	const isPrivate = qbPrivate.checked;

	if (!title) {
		return toastMessage("제목을 입력해주세요", "error");
	}
	if (!content) {
		return toastMessage("내용을 입력해주세요", "error");
	}

	let body;

	if (isAdmin()) {
		let authorName = qbWriterNameInput?.value.trim();
		if (!authorName) authorName = "관리자";

		body = {
			title,
			content,
			authorName,
			isPrivate,
		};
	} else {
		const authorName = qbWriterNameInput?.value.trim();
		const password = qbWriterPasswordInput?.value.trim();

		if (!authorName) {
			return toastMessage("이름을 입력해주세요", "error");
		}

		const pwError = validatePostPassword(password);
		if (pwError) {
			return toastMessage(pwError, "error");
		}

		body = {
			title,
			content,
			authorName,
			password,
			isPrivate,
		};
	}
	try {
		if (editingPostId) {
			const result = await apiUpdatePost(editingPostId, body);
			if (!result.updated) {
				toastMessage("게시글 수정이 실패되었습니다.");
				return;
			}
			toastMessage("게시글이 수정되었습니다");
			lastVerifiedPassword = null;
		} else {
			const result = await apiCreatePost(body);
			if (!result.created) {
				toastMessage("게시글 등록이 실패되었습니다.");
				return;
			}
			toastMessage("게시글이 등록되었습니다");
		}

		closeModal(qbPostModal);
		await loadPosts();
	} catch (e2) {
		console.error(e2);
		toastMessage(e2.message || "게시글 저장 중 오류가 발생했습니다", "error");
	}
});

/*************************************************
 * 글 수정
 *************************************************/
async function editPost(post) {
	// 관리자 외에는 여기까지 바로 오지 않고, 비밀번호 검증 후에만 호출됨
	const postId = getPostId(post);

	try {
		const { post: detail } = await apiGetPostDetail(postId);

		editingPostId = getPostId(detail);

		qbPostTitle.textContent = "게시글 수정";
		qbTitle.value = detail.title;
		qbContent.value = detail.content || "";
		qbPrivate.checked = detail.isPrivate;

		if (isAdmin()) {
			// 관리자: 이름 고정, 비밀번호 입력 불필요
			if (qbWriterNameInput) {
				qbWriterNameInput.value = detail.authorName || "관리자";
				qbWriterNameInput.setAttribute("disabled", "true");
			}
			if (qbWriterPasswordRow) qbWriterPasswordRow.style.display = "none";
		} else {
			// 일반 유저: 이름은 수정 가능, 비밀번호는 새로 입력받음
			if (qbWriterNameInput) {
				qbWriterNameInput.value = detail.authorName || "";
				qbWriterNameInput.removeAttribute("disabled");
			}
			if (qbWriterPasswordRow) qbWriterPasswordRow.style.display = "flex";
			if (qbWriterPasswordInput) qbWriterPasswordInput.value = "";
		}

		if (qbDetailModal.classList.contains("qb-open")) {
			closeModal(qbDetailModal);
		}

		if (postCaptchaInput) {
			postCaptchaInput.value = "";
		}
		openModal(qbPostModal);
		initPostCaptcha();
	} catch (e) {
		console.error(e);
		toastMessage(e.message || "게시글 정보를 불러오지 못했습니다", "error");
	}
}

/*************************************************
 * 글 삭제
 *************************************************/
async function deletePost(id, opts = {}) {
	const { password = null } = opts;

	if (!confirm("정말 삭제하시겠습니까?")) return;

	try {
		const result = await apiDeletePost(id, password ? { password } : null);
		if (!result.deleted) {
			return toastMessage("삭제 실패", "error");
		}

		toastMessage("삭제되었습니다");
		closeModal(qbDetailModal);
		lastVerifiedPassword = null;
		await loadPosts(currentPage);
	} catch (e) {
		console.error(e);
		toastMessage(e.message || "삭제 중 오류가 발생했습니다", "error");
	}
}

/*************************************************
 * 상세 열기
 *************************************************/
async function openDetail(id) {
	try {
		const { post, comments } = await apiGetPostDetail(id);
		const postId = getPostId(post);

		selectedPost = { ...post, postId, comments: comments || [] };
		editingCommentId = null;

		// ✅ 수정/삭제 버튼 노출 여부 결정
		const canShowActions = isAdmin() || post.isAdmin !== true;

		const actionButtons = canShowActions
			? `
				<div class="qb-actions">
					<button class="qb-btn qb-ghost" id="dEdit">✏️ 수정</button>
					<button class="qb-btn qb-ghost" id="dDel">🗑 삭제</button>
				</div>
			`
			: "";

		qbDetailHeader.innerHTML = `
      ${
				post.isPrivate
					? `<div class="qb-badge-cat qb-badge-secret">비밀</div>`
					: ""
			}
      <h3 class="qb-detail-title">${escapeHTML(post.title)}</h3>
			<div style="display: flex; justify-content: space-between">
				<div class="qb-meta">
					<span>${post.authorName}</span>
					<span>•</span>
					<span>${formatKST(post.date)}</span>
				</div>
				${actionButtons}
      </div>
    `;

		// ✅ 버튼이 실제로 존재할 때만 이벤트 바인딩
		const editBtn = $("#dEdit");
		const delBtn = $("#dDel");

		if (editBtn && delBtn) {
			if (isAdmin()) {
				// ✅ 관리자는 비밀번호 없이 바로 실행
				editBtn.addEventListener("click", () => editPost(post));
				delBtn.addEventListener("click", () =>
					deletePost(postId, { password: null })
				);
			} else {
				if (post.isPrivate) {
					// ✅ 비밀글은 이미 비번 통과한 상태로만 들어올 수 있음
					// → lastVerifiedPassword에서 이 글의 비밀번호를 찾아 사용
					const verifiedPw =
						lastVerifiedPassword && lastVerifiedPassword.postId === postId
							? lastVerifiedPassword.password
							: null;

					// 혹시라도 뭔가 꼬여서 비밀번호가 없다면 안전하게 한 번 더 물어봄
					if (!verifiedPw) {
						editBtn.addEventListener("click", () =>
							requestPostPassword(post, "edit")
						);
						delBtn.addEventListener("click", () =>
							requestPostPassword(post, "delete")
						);
					} else {
						// ✅ 이미 검증된 비밀번호를 그대로 사용
						editBtn.addEventListener("click", () => editPost(post));
						delBtn.addEventListener("click", () =>
							deletePost(postId, { password: verifiedPw })
						);
					}
				} else {
					// ✅ 공개글은 수정/삭제 시 비밀번호 입력 필요
					editBtn.addEventListener("click", () =>
						requestPostPassword(post, "edit")
					);
					delBtn.addEventListener("click", () =>
						requestPostPassword(post, "delete")
					);
				}
			}
		}

		qbDetailContent.textContent = post.content;

		// ✅ 댓글 영역: 관리자만 작성 가능
		qbCommentSigned?.classList.toggle("qb-hidden", !isAdmin());
		if (qbCommentText) qbCommentText.disabled = !isAdmin();
		if (qbSubmitComment) qbSubmitComment.disabled = !isAdmin();

		renderComments();
		openModal(qbDetailModal);
	} catch (e) {
		console.error(e);
		toastMessage(e.message || "게시글을 불러오지 못했습니다", "error");
	}
}

/*************************************************
 * 댓글 렌더링
 *************************************************/
function renderComments() {
	const list = selectedPost?.comments || [];

	qbCommentCount.textContent = list.length;
	qbCommentList.innerHTML = "";

	if (!list.length) {
		qbCommentList.innerHTML = `<p class="qb-help">댓글이 없습니다</p>`;
		return;
	}

	list.forEach((c) => {
		const commentId = getCommentId(c);
		const el = document.createElement("div");
		el.className = "qb-comment";

		const controls = isAdmin()
			? `
        <button class="qb-btn qb-ghost qb-sm" data-ce="${commentId}">✏️</button>
        <button class="qb-btn qb-ghost qb-sm" data-cd="${commentId}">🗑</button>
      `
			: "";

		el.innerHTML = `
      <div class="qb-row">
        <div class="qb-author">
          ${c.authorName} 
        </div>
        <div class="qb-date">${formatKST(c.date)}</div>
        ${controls}
      </div>
      <div>${escapeHTML(c.content)}</div>
    `;

		el.querySelector(`[data-ce="${commentId}"]`)?.addEventListener(
			"click",
			() => editComment(c)
		);
		el.querySelector(`[data-cd="${commentId}"]`)?.addEventListener(
			"click",
			() => deleteComment(commentId)
		);

		qbCommentList.append(el);
	});
}

/*************************************************
 * 댓글 작성/수정
 *************************************************/
qbCommentForm?.addEventListener("submit", async (e) => {
	e.preventDefault();

	if (!isAdmin()) {
		return toastMessage("관리자만 댓글을 작성할 수 있습니다", "error");
	}

	const content = qbCommentText.value.trim();
	if (!content) return toastMessage("댓글 내용을 입력해주세요", "error");

	try {
		if (editingCommentId) {
			const result = await apiUpdateComment(editingCommentId, { content });
			console.log(result);
			if (!result.updated) {
				toastMessage("댓글 수정이 실패되었습니다.");
				return;
			}
			toastMessage("댓글이 수정되었습니다");
		} else {
			const result = await apiCreateComment(selectedPost.postId, { content });
			if (!result.created) {
				toastMessage("댓글 등록이 실패되었습니다.");
				return;
			}
			toastMessage("댓글이 등록되었습니다");
		}

		editingCommentId = null;
		qbCommentText.value = "";
		qbCxlComment.classList.add("qb-hidden");
		qbSubmitComment.textContent = "댓글 작성";

		await refreshComments();
		await loadPosts(currentPage);
	} catch (e2) {
		console.error(e2);
		toastMessage(e2.message || "댓글 처리 중 오류가 발생했습니다", "error");
	}
});

function editComment(c) {
	if (!isAdmin()) return toastMessage("관리자만 수정할 수 있습니다", "error");

	editingCommentId = getCommentId(c);
	qbCommentText.value = c.content;
	qbSubmitComment.textContent = "댓글 수정";
	qbCxlComment.classList.remove("qb-hidden");
}

qbCxlComment?.addEventListener("click", () => {
	editingCommentId = null;
	qbSubmitComment.textContent = "댓글 작성";
	qbCxlComment.classList.add("qb-hidden");
	qbCommentText.value = "";
});

/*************************************************
 * 댓글 삭제
 *************************************************/
async function deleteComment(id) {
	if (!isAdmin()) return toastMessage("관리자만 삭제할 수 있습니다", "error");

	if (!confirm("정말 삭제하시겠습니까?")) return;

	try {
		const result = await apiDeleteComment(id);
		if (!result.deleted) return toastMessage("삭제 실패", "error");

		toastMessage("댓글이 삭제되었습니다");
		await refreshComments();
		await loadPosts(currentPage);
	} catch (e) {
		console.error(e);
		toastMessage(e.message || "댓글 삭제 중 오류가 발생했습니다", "error");
	}
}

/*************************************************
 * 댓글 새로고침
 *************************************************/
async function refreshComments() {
	const { post, comments } = await apiGetPostDetail(selectedPost.postId);
	const postId = getPostId(post);
	selectedPost = { ...post, postId, comments };
	renderComments();
}

/*************************************************
 * INIT
 *************************************************/
(async function init() {
	ensureClientId();
	await getKey();

	// ✅ "과거에 관리자 로그인을 한 적이 있는지" 여부
	const hadLoginBefore = localStorage.getItem("hadAdminLogin") === "true";

	try {
		const newToken = await tryReissueToken();

		if (newToken) {
			// ✅ 정상 재발급 → 관리자 유지
			setAccessToken(newToken);
		} else {
			// ✅ 재발급 실패 → 토큰 제거
			setAccessToken(null);

			// 🔥 "과거 로그인 이력이 있는 경우에만" 세션 만료 처리
			if (hadLoginBefore) {
				window.dispatchEvent(new CustomEvent("qb-logout"));
			}
		}
	} catch (err) {
		console.error(err);
		setAccessToken(null);

		// ✅ 예외가 터져도 과거 로그인 이력이 있으면 로그아웃 처리
		if (hadLoginBefore) {
			window.dispatchEvent(new CustomEvent("qb-logout"));
		}
	}

	renderAdminStatus();
	await loadPosts(currentPage);
})();
