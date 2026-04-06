class AppFooter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // index.html에서 팝업 재등장을 막기 위한 코드. 현재 index라면 href에 /index.html 제외
    const isIndex =
      location.pathname === "/" || location.pathname.endsWith("index.html");
    const downloadHref = isIndex ? "#downloads" : "/index.html#downloads";

    this.shadowRoot.innerHTML = `
      <style>
        footer {
          font-size: 14px;
          color: #000;
        }

        .footer-icon img {
          width: 35px;
        }

        /* Footer top */
        .footer-top {
          background-color: #ccc;
          border-top: 4px solid #ff5f30;
          display: flex;
          justify-content: center;
          padding: 40px 20px;
          gap: 100px;
        }

        .footer-section h4 {
          color: #ff5f30;
          font-size: 20px;
          margin-top: 0;
          margin-bottom: 12px;
        }

        .footer-section ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-section ul li {
          margin-bottom: 8px;
        }

        .footer-section ul li a {
          text-decoration: none;
          color: #000;
        }

        /* Footer bottom */
        .footer-bottom {
          background-color: #ff5f30;
          text-align: center;
          color: #fff;
          padding: 50px 0;
        }

        .policy-links {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 16px;
          margin-bottom: 10px;
        }

        .policy-links a {
          color: #fff;
          text-decoration: none;
          font-size: 13px;
        }

        .address {
          font-size: 12px;
          margin: 15px;
        }

        .copyright {
          font-size: 10px;
        }

        /* 반응형 */
        @media (max-width: 1024px) {
          .footer-top {
            padding: 20px 20px;
            gap: 70px;
          }

          .footer-section {
            text-align: left;
          }

          .policy-links {
            flex-direction: row;
            gap: 8px;
          }
        }

        @media (max-width: 768px) {
          .footer-top {
            padding: 20px 20px;
            gap: 30px;
          }

          .footer-section {
            text-align: left;
          }

          .policy-links {
            flex-direction: row;
            gap: 8px;
          }
        }
      </style>

      <footer>
        <div class="footer-top">
          <div class="footer-section">
            <h4>회사</h4>
            <ul>
              <li><a href="https://diorco.com" target="_blank">About diorco</a></li>
              <li><a href="https://dexis.com/en-us/about-us" target="_blank">About DEXIS</a></li>
            </ul>
          </div>

          <div class="footer-section">
            <h4>지원</h4>
            <ul>
              <li><a href="/service.html">A/S 신청</a></li>
              <li><a href="/contact.html">문의하기</a></li>
              <li><a href="${downloadHref}">IS 3800 User Guide</a></li>
              <li><a href="https://www.youtube.com/@dexiskorea" target="_blank">유튜브</a></li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <div class="policy-links">
            <slot name="policy-links"></slot>
          </div>

          <div class="address">
            경기도 용인시 기흥구 중부대로 184 지식산업센터 518호<br>
            사업자등록번호 : 135-86-49642
          </div>

          <div class="copyright">
            Copyright © diorco. Co., Ltd. All right reserved
          </div>
        </div>
      </footer>
    `;
  }

  connectedCallback() {
    this._setupPolicyLinks();
  }

  _setupPolicyLinks() {
    // Desktop, Mobile 둘 다 포함
    const container = this.shadowRoot.querySelector(".policy-links");

    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

    if (isMobile) {
      container.innerHTML = `
        <a href="/pdf/DEXIS_Korea_terms.pdf" target="_blank">이용 약관</a>
        <a href="/pdf/DEXIS_Korea_privacy_policy.pdf" target="_blank">개인정보 보호정책</a>
        <a href="/pdf/DEXIS_Korea_cookie.pdf" target="_blank">쿠키 정책</a>
        <a href="/pdf/DEXIS_Korea_Compliance_Transparency.pdf" target="_blank">규정 준수 및 투명성</a>
        <a href="/pdf/DEXIS_Korea_EULA.pdf" target="_blank">최종 사용자 사용권 계약</a>
        <a href="/pdf/DEXIS_Korea_patent.pdf" target="_blank">특허</a>
      `;
    } else {
      container.innerHTML = `
        <a href="javascript:void(0)" onclick="openModal('/pdf/DEXIS_Korea_terms.pdf')">이용 약관</a>
        <a href="javascript:void(0)" onclick="openModal('/pdf/DEXIS_Korea_privacy_policy.pdf')">개인정보 보호정책</a>
        <a href="javascript:void(0)" onclick="openModal('/pdf/DEXIS_Korea_cookie.pdf')">쿠키 정책</a>
        <a href="javascript:void(0)" onclick="openModal('/pdf/DEXIS_Korea_Compliance_Transparency.pdf')">규정 준수 및 투명성</a>
        <a href="javascript:void(0)" onclick="openModal('/pdf/DEXIS_Korea_EULA.pdf')">최종 사용자 사용권 계약</a>
        <a href="javascript:void(0)" onclick="openModal('/pdf/DEXIS_Korea_patent.pdf')">특허</a>
      `;
    }
  }
}

customElements.define("app-footer", AppFooter);
