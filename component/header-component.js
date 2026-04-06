class AppHeader extends HTMLElement {
  static get observedAttributes() {
    return ["active"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    const isIndex =
      location.pathname === "/" || location.pathname.endsWith("index.html");

    this.shadowRoot.innerHTML = `
    <style>
      :host {
        display: block;
      }

      /* Header 영역 */
      .header {
        background-color: #eee;
      }

      .header-top {
        height: 32px;
        background-color: #ff5f30;
      }

      .header-main {
        height: 80px;
        background-color: #fff;
        display: flex;
        align-items: center;
      }

      .header-main .left {
        width: 190px;
      }

      .header-main .logo {
        display: flex;
        align-items: center;
        height: 80px;
        margin: 0 18px;
        max-width: 140px;
        width: auto;
      }

      /* 1차 메뉴 */
      .header-main .right .main-menu ul {
        margin: 0;
        padding: 0;
        list-style: none;
        display: flex;
      }

      .header-main .right .main-menu ul li {
        height: 76px;
        width: 100px;
        padding: 0 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        font-weight: 700;
        text-transform: uppercase;
        border-top: 4px solid #fff;
        cursor: pointer;
      }

      .header-main .right .main-menu ul li.open {
        background-color: #ccc;
        border-top-color: #009383;
      }

      /* Navigation bar */
      .header-nav {
        position: relative;
        height: 60px;
        background-color: #ccc;
        border-bottom: 2px solid #ff5f30;
        display: flex;
        align-items: center;
        padding-left: 50px;
      }

      .header-nav.fixed {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        z-index: 999;
        background: white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }

      .nav-menu ul {
        margin: 0;
        padding: 0;
        list-style: none;
        display: flex;
      }

      .nav-menu li {
        height: 60px;
        padding: 0 15px;
        display: flex;
        align-items: center;
      }

      .nav-menu a {
        text-decoration: none;
        color: inherit;
      }

      .nav-menu li:hover {
        color: #ff5f30;
      }

      .nav-menu li.is-active {
        color: #ff5f30;
      }

      /* 햄버거 메뉴 */
      .hamburger {
        display: none; /* PC에서는 안 보임 */
        font-size: 24px;
        background: none;
        border: none;
        cursor: pointer;
      }

      /* 모바일 메뉴 */
      @media (max-width: 768px) {
        .hamburger {
          display: block;
          margin-left: 10px;
        }
        .header-nav {
          padding-left: 0;
        }
        #mainMenu {
          display: none;
          position: absolute;
          top: 60px;
          right: 0;
          width: 100%;
          z-index:1000;
          background: #fff;
          border: 1px solid #ddd;
          flex-direction: column;
        }
        #mainMenu.open {
          display: block;
        }
        #mainMenu ul {
          display: block;
        }
        #mainMenu li {
          height: 50px;
          padding: 14px 18px;
          border-bottom: 1px solid #eee;
        }
      }

    </style>

    <div class="header">
      <div class="header-top"></div>
      <div class="header-main">
        <div class="left">
          <a href="/"><img src="/images/logo.svg" alt="Home" class="logo"></a>
        </div>
        <div class="right">
          <div class="main-menu">
            <ul>
              <li class="open">IS 3800</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="header-nav">
        <div class="left"></div>
        <div class="right">
          <button class="hamburger">&#9776;</button>
          <nav class="main-menu nav-menu" id="mainMenu">
            <ul>
              <li data-key="overview"><a href="${isIndex ? "#overview" : "index.html#overview"}">개요</a></li>
              <li data-key="features"><a href="${isIndex ? "#features" : "index.html#features"}">특징</a></li>
              <li data-key="specs"><a href="${isIndex ? "#specifications" : "index.html#specifications"}">사양</a></li>
              <li data-key="downloads"><a href="${isIndex ? "#downloads" : "index.html#downloads"}">다운로드</a></li>
              <li data-key="contact"><a href="contact.html">문의하기</a></li>
              <li data-key="premiumcare"><a href="${isIndex ? "#premiumcare" : "index.html#premiumcare"}">프리미엄케어</a></li>
              <li data-key="care"><a href="care.html">케어 요청</a></li>
              <li data-key="util"><a href="utilizations.html">활용방</a></li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
    `;
  }

  connectedCallback() {
    this._setActive(); // 기본 active 처리
    this._initHamburger();
    this._initScrollFixed();
    this._initSmoothScroll();

    // 초기 로딩 시 hash 반영 ⭐
    if (window.location.hash) {
      this._setActiveByHash();
    }

    // hash 변경 시 동작
    window.addEventListener("hashchange", () => {
      this._setActiveByHash();
    });
  }

  attributeChangedCallback() {
    this._setActive();
  }

  /** 현재 페이지에 따라 active 메뉴 자동 적용 */
  _setActive() {
    const activeKey = this.getAttribute("active");
    const items = this.shadowRoot.querySelectorAll(".nav-menu li");

    items.forEach((li) => li.classList.remove("is-active"));

    // 1) attribute 기반
    if (activeKey) {
      const target = this.shadowRoot.querySelector(
        `li[data-key="${activeKey}"]`,
      );
      if (target) target.classList.add("is-active");
    }

    // 2) URL 기반 자동 판별
    const path = location.pathname.toLowerCase();

    // ⭐ 현재 값과 같으면 재설정 금지 (무한루프 방지)
    const safeSet = (key) => {
      if (this.getAttribute("active") !== key) {
        this.setAttribute("active", key);
      }
    };

    if (path.includes("utilizations")) safeSet("util");
    if (path.includes("board")) safeSet("util");
    if (path.includes("care")) safeSet("care");
    if (path.includes("contact")) safeSet("contact");
  }

  _setActiveByHash() {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;

    const items = this.shadowRoot.querySelectorAll(".nav-menu li");

    items.forEach((li) => li.classList.remove("is-active"));

    // hash → data-key 매핑
    const map = {
      overview: "overview",
      features: "features",
      specifications: "specs",
      downloads: "downloads",
      premiumcare: "premiumcare",
    };

    const key = map[hash];
    if (!key) return;

    const target = this.shadowRoot.querySelector(`li[data-key="${key}"]`);
    if (target) target.classList.add("is-active");
  }

  _initSmoothScroll() {
    const links = this.shadowRoot.querySelectorAll('.nav-menu a[href^="#"]');

    links.forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const hash = anchor.getAttribute("href");
        const target = document.querySelector(hash);

        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth" });

          // ⭐ 클릭 즉시 active 업데이트
          this._setActiveByHash();
          history.pushState(null, "", hash);
        }
      });
    });
  }

  /** 모바일 햄버거 기능 */
  _initHamburger() {
    const hamburger = this.shadowRoot.querySelector(".hamburger");
    const menu = this.shadowRoot.querySelector("#mainMenu");

    hamburger.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.toggle("open");
    });

    // 메뉴 안의 링크 클릭 시 닫기 (⭐ hash 이동 포함)
    menu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        menu.classList.remove("open");
      });
    });

    // 메뉴 바깥 클릭하면 닫히기
    document.addEventListener("click", (e) => {
      if (!this.contains(e.target)) menu.classList.remove("open");
    });
  }

  /** 스크롤 시 상단 고정 */
  _initScrollFixed() {
    const nav = this.shadowRoot.querySelector(".header-nav");
    window.addEventListener("scroll", () => {
      if (window.scrollY > 100) nav.classList.add("fixed");
      else nav.classList.remove("fixed");
    });
  }
}

customElements.define("app-header", AppHeader);
