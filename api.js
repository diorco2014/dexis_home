// api.js

import {
	getAccessToken,
	setAccessToken,
	getApiKey,
	setApiKey,
} from "./token.js";

const API_BASE = "https://api.dexiskorea.co.kr";

export async function getKey() {
	try {
		const res = await fetch(`${API_BASE}/api/key`, {
			method: "GET",
		});
		const data = await res.json();
		if (!data.success) {
			throw new Error(data.message || "API Key 불러오기 실패");
		}
		setApiKey(data.apiKey);
	} catch (e) {
		console.log(e);
	}
}

function resetClientId() {
	const newId = crypto.randomUUID().replace(/-/g, "");
	const isLocal = location.hostname === "localhost";
	const domain = isLocal ? "localhost" : ".dexiskorea.com";
	const secure = isLocal ? "" : "; Secure";

	document.cookie =
		`clientId=${newId}` +
		`; Max-Age=${365 * 24 * 60 * 60}` +
		`; Path=/` +
		`; Domain=${domain}` +
		`; SameSite=Lax` +
		secure;

	return newId;
}

export function ensureClientId() {
	const exists = document.cookie
		.split("; ")
		.find((row) => row.startsWith("clientId="));

	if (exists) {
		return exists.split("=")[1];
	}

	const clientId = resetClientId();

	return clientId;
}

export function getCookie(name) {
	const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
	return match ? match[2] : null;
}

export function setCookie(name, value, options = {}) {
	let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
	const isLocal = location.hostname === "localhost";
	const domain = isLocal ? "localhost" : ".dexiskorea.com";

	// 기본 옵션
	const defaults = {
		path: "/",
		// "max-age": 60 * 60 * 24 * 7, // 7일
		"max-age": 60 * 5,
		samesite: "Lax",
		Domain: domain,
		secure: isLocal ? false : true,
	};

	const opts = { ...defaults, ...options };

	for (const key in opts) {
		if (opts[key] === false) continue;
		cookie += `; ${key}${opts[key] === true ? "" : "=" + opts[key]}`;
	}
	document.cookie = cookie;
}

function fullLogout() {
	setAccessToken(null);
	setCookie("R_TOKEN", "", { "max-age": 0 });
	resetClientId();
	window.dispatchEvent(new CustomEvent("qb-logout"));
}

async function apiRequest(url, options = {}) {
	const token = getAccessToken();
	const hadLoginBefore = localStorage.getItem("hadAdminLogin") === "true";

	const defaultHeaders = {
		"Content-Type": "application/json",
		...options.headers,
	};

	if (token) {
		defaultHeaders.Authorization = `Bearer ${token}`;
	}

	let res = await fetch(API_BASE + url, {
		...options,
		headers: defaultHeaders,
	});

	// ✅ 403: 권한 만료 → 로그인 했던 사람만 로그아웃
	if (res.status === 403 && hadLoginBefore) {
		fullLogout();
		throw new Error("세션이 만료되었습니다. 다시 로그인 해주세요.");
	}

	// ✅ 401 + 로그인 이력이 있는 사람만 재발급 시도
	if (res.status === 401 && hadLoginBefore) {
		const newAccessToken = await tryReissueToken();

		// ❌ ✅ 재발급 실패 → 즉시 로그아웃 + 바로 에러 종료
		if (!newAccessToken) {
			fullLogout();
			throw new Error("세션이 만료되었습니다. 다시 로그인 해주세요.");
		}

		// ✅ 재발급 성공 → 토큰 교체 후 재요청
		setAccessToken(newAccessToken);

		res = await fetch(API_BASE + url, {
			...options,
			headers: {
				...defaultHeaders,
				Authorization: `Bearer ${newAccessToken}`,
			},
		});
	}

	const data = await res.json().catch(() => ({}));

	if (data.success) return data.data;

	throw new Error(data.message || "API Error");
}

// Refresh Token으로 accessToken 재발급
export async function tryReissueToken() {
	try {
		const refreshToken = getCookie("R_TOKEN");
		const clientId = getCookie("clientId");
		const key = getApiKey();

		if (!refreshToken || !clientId || !key) {
			return null;
		}
		const res = await fetch(`${API_BASE}/auth/token`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${key}`,
			},
			body: JSON.stringify({
				refreshToken: refreshToken,
				client_id: clientId,
			}),
		});

		if (!res.ok) return null;

		const result = await res.json();

		const newAccessToken = result?.data.accessToken || null;

		if (!newAccessToken) return null;

		return newAccessToken;
	} catch (e) {
		console.error("토큰 재발급 실패:", e);
		return null;
	}
}

// ✅ 관리자 로그인
export async function apiLogin(body) {
	const key = getApiKey();

	const res = await fetch(`${API_BASE}/auth/login`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${key}`,
		},
		body: JSON.stringify(body),
	});

	if (!res.ok) throw new Error("로그인 실패");

	const response = await res.json();

	setAccessToken(response.data.accessToken);
	setCookie("R_TOKEN", response.data.refreshToken);
	return response.data;
}

// ✅ 관리자 로그아웃
export async function apiLogout() {
	const token = getAccessToken();

	const res = await apiRequest("/auth/logout", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
	});

	// res === { logout: true | false }
	if (!res?.logout) {
		throw new Error("로그아웃에 실패했습니다");
	}
	setCookie("R_TOKEN", "", { "max-age": 0 });
	resetClientId();

	return res;
}

// ✅ 리스트 조회
export async function apiGetPosts(page = 1, limit = 10) {
	const res = await fetch(`${API_BASE}/posts?page=${page}&limit=${limit}`);

	if (!res.ok) throw new Error(`HTTP ${res.status}`);

	const result = await res.json();

	if (!result.success) {
		throw new Error(result.message || "API Error");
	}

	return {
		posts: result.data.posts,
		pagination: result.data.pagination,
	};
}

// ✅ 상세 조회
export async function apiGetPostDetail(postId) {
	const res = await fetch(`${API_BASE}/posts/${postId}`);
	if (!res.ok) throw new Error("게시글 불러오기 실패");

	const json = await res.json();
	if (!json.success) throw new Error(json.message || "게시글 불러오기 실패");

	const { post, comments } = json.data;

	return { post, comments };
}

// ✅ 게시글 비밀번호 검증
export async function passwordCheck(postId, body) {
	return apiRequest(`/posts/${postId}/password`, {
		method: "POST",
		body: JSON.stringify(body),
	});
}

// ✅ 글 작성
export async function apiCreatePost(body) {
	return apiRequest("/posts", {
		method: "POST",
		body: JSON.stringify(body),
	});
}

// ✅ 글 수정
export async function apiUpdatePost(postId, body) {
	const token = getAccessToken();
	return apiRequest(`/posts/${postId}`, {
		method: "PUT",
		body: JSON.stringify(body),
	});
}

// ✅ 글 삭제
export async function apiDeletePost(postId, body) {
	return apiRequest(`/posts/${postId}`, {
		method: "POST",
		body: body ? JSON.stringify(body) : null,
	});
}

// ✅ 댓글 작성
export async function apiCreateComment(postId, body) {
	return apiRequest(`/posts/${postId}/comments`, {
		method: "POST",
		body: JSON.stringify(body),
	});
}

// ✅ 댓글 수정
export async function apiUpdateComment(commentId, body) {
	return apiRequest(`/comments/${commentId}`, {
		method: "PUT",
		body: JSON.stringify(body),
	});
}

// ✅ 댓글 삭제
export async function apiDeleteComment(commentId) {
	return apiRequest(`/comments/${commentId}`, {
		method: "POST",
	});
}
