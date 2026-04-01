function insertCommonHead(options = {}) {
  const head = document.head;

  const defaults = {
    title: "",
    keywords: "dexis, korea, is3800, is-3800",
    description:
      "dexis korea - is 3800 편리한 DEXIS IS 3800 실시간 보정, 빛반사가 있는 메탈 보철도 OK",
    extraCss: [],
  };

  const meta = { ...defaults, ...options };

  const headHTML = `
    <meta http-equiv="Cache-Control" content="no-store, no-cache, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />

    <meta name="keywords" content="${meta.keywords}" />
    <meta name="description" content="${meta.description}" />

    <link rel="icon" href="/images/favicon.ico" type="image/x-icon" />
    <link href="/nanum-gothic.css?v?1.0.0" rel="stylesheet" />

    <!-- 기본 공통 스타일 -->
    <link rel="stylesheet" href="/style.css?ver=1.8.4" />
    <link rel="stylesheet" href="/modal.css?ver=1.7.9" />
    <link rel="stylesheet" href="/popup.css?ver=1.7.9" />
    <link rel="stylesheet" href="/carepopup.css?ver=1.7.9" />
  `;

  head.insertAdjacentHTML("beforeend", headHTML);

  // ✅ 페이지별 extra CSS 추가
  if (Array.isArray(meta.extraCss)) {
    meta.extraCss.forEach((cssPath) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = cssPath.startsWith("/") ? cssPath : `/${cssPath}`;
      head.appendChild(link);
    });
  }

  // ✅ 브라우저 탭 제목만 변경 (OG와 완전 분리)
  if (meta.title) {
    document.title = meta.title;
  }
}
