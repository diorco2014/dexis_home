# DEXIS Korea 홈페이지

DEXIS IS 3800 제품 소개/문의를 위한 **정적 웹사이트** 프로젝트입니다.  
빌드 도구 없이 `HTML + CSS + JavaScript`로 구성되어 있으며, 일부 기능은 외부 API와 통신합니다.

## 1. 프로젝트 한눈에 보기

- 메인 페이지: 제품 소개, 특징, 다운로드, 팝업
- 문의 페이지: 상담/케어/A/S 접수 폼
- 활용방: 유튜브 영상 목록 + QnA 게시판
- 공통 UI: Web Component(`app-header`, `app-footer` 등)

## 2. 기술 스택

- HTML5
- CSS3
- Vanilla JavaScript (ES Modules 일부 사용)
- Web Components (Shadow DOM)

## 3. 로컬 실행 방법

이 프로젝트는 정적 파일이라 설치가 거의 필요 없습니다.

1. 프로젝트 폴더로 이동
2. 원하는 파일 선택 (html)
3. 우클릭 후 Open with Live Server 실행
4. 브라우저에서 접속

```text
http://localhost:5500
or
http://127.0.0.1
```

## 4. 주요 페이지

- `index.html`: 메인 랜딩
- `contact.html`: 문의하기 폼
- `care.html`: 프리미엄 케어 요청 폼
- `service.html`: A/S 신청 폼
- `utilizations.html`: 유튜브 영상 목록
- `board.html`: QnA 게시판

## 5. 폴더/파일 구조

```text
.
├── index.html
├── contact.html / care.html / service.html / utilizations.html / board.html
├── style.css / form.css / board.css / video.css / carousel.css
├── script.js           # 공통 폼 제출 + 토스트
├── form.js             # 문의 페이지 날짜/시간 검증
├── video.js            # 유튜브 playlist API 조회
├── board.js            # QnA UI/이벤트/상태 관리 (ES Module)
├── api.js              # 게시판 서버 API 호출
├── token.js            # 메모리 토큰/API key 저장
├── captcha.js          # 캡차 생성/검증
├── modal.js            # PDF 모달
├── popup.js            # 오늘 하루 팝업 숨김
├── carepopup.js        # 케어 팝업 오버레이
├── component/
│   ├── common-header-component.js
│   ├── header-component.js
│   ├── footer-component.js
│   ├── section-component.js
│   ├── tabs-component.js
│   └── workingHours-component.js
├── images/
├── pdf/
└── user_guide/
```

## 6. 외부 API 연동

### 6-1. 문의/케어/A/S 폼 전송

- 위치: `script.js`
- Endpoint: `https://api.motiv-ai.com/api/dexiskorea/formmail`
- 방식: `POST` JSON

### 6-2. QnA 게시판

- 위치: `api.js`, `board.js`
- Base URL: `https://api.dexiskorea.co.kr`
- 기능: 글/댓글 CRUD, 비밀번호 검증, 관리자 로그인/로그아웃, 토큰 재발급
- 작성하기 버튼을 3초이상 누르면 관리자로그인 창이 뜹니다.

### 6-3. 유튜브 영상

- 위치: `video.js`
- API: YouTube Data API v3 (`playlistItems`)
- 주의: 현재 API Key가 프론트 코드에 하드코딩되어 있습니다.

## 7. 핵심 동작 포인트

### 헤더/푸터 공통화

- 각 페이지에서 `component/*.js`를 로드해 커스텀 태그 사용
- `insertCommonHead()`로 기본 meta/css를 주입

### 게시판 권한 모델

- 일반 사용자: 글 작성 가능, 댓글 작성 불가
- 관리자: 로그인 후 글/댓글 관리 가능
- 비밀글: 비밀번호 확인 후 열람/수정/삭제

### 캡차

- 게시글 작성/수정 시 캡차 검증 필요 (`captcha.js`)

## 8. 유지보수할 때 자주 수정하는 파일

- 메뉴/네비 변경: `component/header-component.js`
- 푸터 링크/PDF 변경: `component/footer-component.js`
- 메인 스타일: `style.css`
- 문의 폼 로직: `script.js`, `form.js`
- QnA 동작: `board.js`, `api.js`
- 팝업 이미지/동작: `index.html`, `popup.js`, `carepopup.js`

## 9. 배포 참고

- Filezilla를 이용하여 배포
- 호스트: dexiskorea.com

---
