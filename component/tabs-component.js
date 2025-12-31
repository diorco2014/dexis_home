class AppTabs extends HTMLElement {
	static get observedAttributes() {
		return ["active", "videos-href", "qna-href"];
	}

	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = `
      <style>
        :host {
          --tabs-bg: rgba(255, 255, 255, 1);
          --tab-color: #555;
          --tab-active-color: rgba(255, 255, 255, 1);
          --tab-active-bg: #ff5f30;
          --radius: 50px;
          --gap: 10px;
          --maxw: 300px;
        }

        .tabs {
          margin: 0 auto;
          display: flex;
          max-width: var(--maxw);
          background-color: var(--tabs-bg);
          border-radius: var(--radius);
          margin-bottom: 30px;
          overflow: hidden;
        }

        .tab {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: var(--gap);
          padding-bottom: 8px;
          padding-top: 9px;
          font-size: 16px;
          font-weight: 500;
          color: var(--tab-color);
          text-decoration: none;
          border-bottom: 3px solid transparent;
          transition: all 0.2s ease;
          border-radius: var(--radius);
          white-space: nowrap;
        }

        .tab.active {
          color: var(--tab-active-color);
          background-color: var(--tab-active-bg);
        }

        .icon {
          width: 16px;
          height: 16px;
        }

        /* ✅ 반응형 (모바일용) */
        @media (max-width: 768px) {
          :host {
            padding: 20px 10px; /* 모바일에서 양 옆 여백 추가 */
          }

          .tabs {
            max-width: 250px;
            border-radius: 30px;
            margin-bottom: 0px;
          }

          .tab {
            font-size: 14px;
            gap: 6px;
            padding: 5px 0;
          }

          .icon {
            width: 14px;
            height: 14px;
          }
        }

        /* ✅ 아주 작은 화면 대응 (예: 400px 이하) */
        @media (max-width: 400px) {
          .tab span {
            font-size: 13px;
          }
          .tabs {
            flex-direction: column; /* 너무 좁을 경우 세로 정렬 */
          }
          .tab {
            border-radius: 0;
          }
        }
      </style>

      <nav class="tabs">
        <a class="tab" data-key="videos" target="_self">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"></path>
            <rect x="2" y="6" width="14" height="12" rx="2"></rect>
          </svg>
          <span>동영상</span>
        </a>
        <a class="tab" data-key="board" target="_self">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
            <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
            <path d="M10 9H8"></path>
            <path d="M16 13H8"></path>
            <path d="M16 17H8"></path>
          </svg>
          <span>QnA</span>
        </a>
      </nav>
    `;
	}

	connectedCallback() {
		this.#applyLinks();
		this.#applyActive();
		this.shadowRoot.querySelectorAll(".tab").forEach((a) => {
			a.addEventListener("click", () => {
				this.setAttribute("active", a.dataset.key);
			});
		});

		if (!this.getAttribute("active")) {
			const path = (location.pathname || "").toLowerCase();
			if (path.includes("qna")) this.setAttribute("active", "board");
			else if (path.includes("utilizations"))
				this.setAttribute("active", "videos");
		}
	}

	attributeChangedCallback() {
		this.#applyLinks();
		this.#applyActive();
	}

	#applyLinks() {
		const videosHref = this.getAttribute("videos-href") || "#";
		const qnaHref = this.getAttribute("qna-href") || "#";
		this.shadowRoot
			.querySelector('.tab[data-key="videos"]')
			.setAttribute("href", videosHref);
		this.shadowRoot
			.querySelector('.tab[data-key="board"]')
			.setAttribute("href", qnaHref);
	}

	#applyActive() {
		const active = this.getAttribute("active");
		this.shadowRoot.querySelectorAll(".tab").forEach((a) => {
			a.classList.toggle("active", a.dataset.key === active);
		});
	}
}

customElements.define("app-tabs", AppTabs);
