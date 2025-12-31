// ✅ 유튜브 API 설정
const API_KEY = "AIzaSyCpahg1OCNGy2HxWk-7vRycl2eG2oYhhKc"; // 🔸 여기에 본인 YouTube Data API 키 입력
const CHANNEL_ID = "UCFvGpr3E8EGyWKshvmw6x4Q"; // DEXIS Korea 채널 ID
const PLAYLIST_ID = "PLlLjeRr6NyNT5wKHpkbA7zyWQjAu77p3h"; // 재생목록 ID

const videoGrid = document.getElementById("videoGrid");
const modal = document.getElementById("videoModal");
// const closeVideoModal = document.getElementById("closeVideoModal"); // ⚠️ 이름 충돌 방지
const videoPlayer = document.getElementById("videoPlayer");

// ✅ 전체 영상 저장용 배열
const allVideos = [];

// ✅ 영상 카드 렌더링 함수
function renderVideoCard(item) {
	const snippet = item.snippet;

	// 비공개/삭제 영상 제외
	if (
		!snippet ||
		!snippet.resourceId?.videoId ||
		snippet.title === "Deleted video" ||
		snippet.title === "Private video" ||
		!snippet.thumbnails?.medium
	) {
		return;
	}

	// 첫 렌더링 시 '영상 불러오는 중...' 제거
	const loadingText = videoGrid.querySelector("p");
	if (loadingText) loadingText.remove();

	const videoId = snippet.resourceId.videoId;
	const title = snippet.title || "제목 없음";
	const thumbnail = snippet.thumbnails.medium.url;
	const publishedAt = new Date(snippet.publishedAt).toLocaleDateString("ko-KR");

	const card = document.createElement("div");
	card.className = "video-card";
	card.innerHTML = `
    <div class="thumbnail">
      <img src="${thumbnail}" alt="${title}">
      <div class="overlay">
        <div class="play-btn">
          <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>
    </div>
    <h3 class="video-title">${title}</h3>
    <div class="video-meta"><span>${publishedAt}</span></div>
  `;

	card.addEventListener("click", () => {
		modal.style.display = "flex";
		videoPlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
	});

	videoGrid.appendChild(card);
}

// ✅ 재생목록 불러오기 (50개 단위)
async function fetchAllVideos(playlistId, pageToken = "") {
	const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
	url.search = new URLSearchParams({
		part: "snippet",
		maxResults: "50",
		playlistId: playlistId,
		key: API_KEY,
		pageToken: pageToken,
	});

	const res = await fetch(url);
	const data = await res.json();

	if (!data.items) throw new Error("유효하지 않은 API 응답입니다.");

	allVideos.push(...data.items);

	if (data.nextPageToken) {
		await fetchAllVideos(playlistId, data.nextPageToken);
	}
}

// ✅ 메인 실행 함수
async function fetchDexisVideos() {
	try {
		videoGrid.innerHTML = `<p style="text-align:center;color:#666;">영상 불러오는 중...</p>`;
		await fetchAllVideos(PLAYLIST_ID);

		allVideos
			.sort(
				(a, b) =>
					new Date(a.snippet.publishedAt) - new Date(b.snippet.publishedAt)
			)
			.forEach(renderVideoCard);
	} catch (error) {
		console.error("❌ YouTube API 오류:", error);
		videoGrid.innerHTML = `<p style="text-align:center;color:red;">영상을 불러오지 못했습니다.</p>`;
	}
}

modal.addEventListener("click", (e) => {
	if (e.target === modal) {
		modal.style.display = "none";
		videoPlayer.src = "";
	}
});

fetchDexisVideos();
