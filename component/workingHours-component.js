class AppWorkingHours extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });

		this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        #working_hours {
          background-color: #666;
          color: white;
          padding: 40px 0;
        }

        #working_hours .text {
          display: flex;
          justify-content: center;
          margin: 0 auto;
          text-align: left;
        }

        #working_hours .text .culumn {
          margin: 0 100px;
        }

        #working_hours h3 {
          font-size: 30px;
          font-weight: bold;
          margin-bottom: 36px;
        }

        #working_hours p {
          font-size: 20px;
          line-height: 1.6;
          margin-bottom: 24px;
        }

        /* Tablet (1024px 이하) */
        @media (max-width: 1024px) {
          #working_hours .text .culumn {
            margin: 0 20px;
          }
        }

        /* Mobile (768px 이하) */
        @media (max-width: 768px) {
          #working_hours .text {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          #working_hours .text .culumn {
            margin: 20px 0;
          }

          #working_hours .text .culumn h3 {
            font-size: 20px;
          }

          #working_hours .text .culumn p {
            font-size: 16px;
          }
        }
      </style>

      <section id="working_hours">
        <div class="text">
          <div class="culumn">
            <h3>서비스 및 판매</h3>
            <p>월요일~금요일<br />오전 9시~오후 6시</p>
          </div>

          <div class="culumn">
            <h3>문의</h3>
            <p>070-5030-3605<br />info@dexiskorea.com</p>
          </div>
        </div>
      </section>
    `;
	}
}

customElements.define("app-working-hours", AppWorkingHours);
