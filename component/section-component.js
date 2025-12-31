class AppSectionBlock extends HTMLElement {
	static get observedAttributes() {
		return ["title", "subtitle"];
	}

	constructor() {
		super();
		this.attachShadow({ mode: "open" });

		this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        /* contact_us section */
        #contact_us {
          text-align: center;
          padding: 40px 20px;
          height: 223px;
          margin: 0px 150px;
        }

        #contact_us h2 {
          font-size: 44px;
          word-break: keep-all;
          white-space: normal;
        }

        #contact_us span {
          font-size: 24px;
        }

        /* Tablet */
        @media (max-width: 1024px) {
          #contact_us{
            text-align: center;
            padding: 40px 20px;
            height: 223px;
            margin: 0px 20px;
          }
          #contact_us h2 {
            font-size: 36px;
          }
        }

        /* Mobile */
        @media (max-width: 768px) {
          #contact_us{
            padding: 20px 20px;
            height: 140px;
            margin: 0;
          }
          #contact_us h2 {
            font-size: 24px;
          }
          #contact_us span {
            font-size: 16px;
          }
        }
      </style>

      <section id="contact_us">
        <h2 id="title"></h2>
        <span id="subtitle" class="subtitle"></span>
      </section>
    `;
	}

	connectedCallback() {
		this.update();
	}

	update() {
		const title = this.getAttribute("title") || "";
		const subtitle = this.getAttribute("subtitle") || "";

		const titleEl = this.shadowRoot.querySelector("#title");
		const subtitleEl = this.shadowRoot.querySelector("#subtitle");

		titleEl.innerHTML = title.replace(/\n/g, "<br>");

		if (subtitle) {
			subtitleEl.innerHTML = subtitle.replace(/\n/g, "<br>");
			subtitleEl.style.display = "block";
		} else {
			subtitleEl.style.display = "none";
		}
	}
}

customElements.define("app-section-block", AppSectionBlock);
