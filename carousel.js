document.addEventListener("DOMContentLoaded", () => {
	const carouselRoot = document.getElementById("carousel");
	if (!carouselRoot) return;

	const carouselData = [
		{
			date: "2025-12-19",
			name: "[세인트치과] 조승헌 원장님",
			title: "디지털은 편리함보다 '진료의 정확도' 를 바꾸는 도구",
			href: "https://www.dentalarirang.com/news/articleView.html?idxno=46439",
			thumbnail: "/images/news_thumbnail/digital-for-clinical-accuracy.jpg",
		},
		{
			date: "2025-11-06",
			name: "[감탄치과] 정석환 원장님",
			title:
				"개원 부담 덜어주는 스마트 선택, AI 구강스캐너로 ‘감탄’ 솔루션 제공하다",
			href: "https://www.dentalarirang.com/news/articleView.html?idxno=45971",
			thumbnail: "/images/news_thumbnail/ai-oral-scanner-smart-choice.jpg",
		},
		{
			date: "2025-10-24",
			name: "[NY치과] 강익제 원장님",
			title:
				"20년 역사와 AI 구강스캐너가 공존하는 ‘오래됐지만 오래되지 않은 치과’ 이야기",
			href: "https://www.dentalarirang.com/news/articleView.html?idxno=45831",
			thumbnail:
				"/images/news_thumbnail/20-years-ai-oral-scanner-dental-clinic.jpg",
		},
		{
			date: "2025-09-11",
			name: "[목동탑치과] 김재환 원장님",
			title: "스캔 각도 맞춰야 하는 부담, 어깨에 힘 뺀다",
			href: "https://www.dentalarirang.com/news/articleView.html?idxno=45532",
			thumbnail: "/images/news_thumbnail/scan-angle-easy-workflow.jpg",
		},
	];

	carouselRoot.innerHTML = `
		<div class="carousel-shell">
			<button class="carousel-arrow carousel-arrow-prev" aria-label="Previous"></button>
			<div class="carousel-viewport">
				<div class="carousel-track"></div>
			</div>
			<button class="carousel-arrow carousel-arrow-next" aria-label="Next"></button>
		</div>
	`;

	const track = carouselRoot.querySelector(".carousel-track");
	const prevButton = carouselRoot.querySelector(".carousel-arrow-prev");
	const nextButton = carouselRoot.querySelector(".carousel-arrow-next");

	// 반응형 기준
	const getVisibleCount = () => {
		const w = window.innerWidth;
		if (w <= 640) return 1;
		if (w <= 930) return 2;
		if (w <= 1200) return 3;
		return 4;
	};

	let visibleCount = getVisibleCount();
	let currentIndex = visibleCount;
	let slideWidth = 0;
	let slideGap = 0;
	const isScrollable = () => carouselData.length > visibleCount;

	const transitionStyle = "transform 0.6s ease";
	let autoTimer = null;
	const buildSlide = (item, isClone = false) => {
		const slide = document.createElement("article");
		slide.className = "carousel-slide";
		if (isClone) slide.dataset.clone = "true";

		slide.innerHTML = `
			<a class="carousel-link" href="${item.href}" target="_blank" rel="noopener noreferrer">
				<div class="carousel-card">
					<div class="carousel-thumb">
						<img src="${item.thumbnail}" alt="${item.title}" loading="lazy" />
					</div>
					<div class="carousel-meta">
						<p class="carousel-name">${item.name}</p>
						<h3 class="carousel-title">${item.title}</h3>
					</div>
				</div>
			</a>
		`;

		return slide;
	};

	const renderSlides = () => {
		track.innerHTML = "";

		const head = carouselData
			.slice(-visibleCount)
			.map((d) => buildSlide(d, true));
		const body = carouselData.map((d) => buildSlide(d));
		const tail = carouselData
			.slice(0, visibleCount)
			.map((d) => buildSlide(d, true));

		[...head, ...body, ...tail].forEach((s) => track.appendChild(s));
	};

	// 위치계산
	const updateMeasurements = () => {
		const slide = track.querySelector(".carousel-slide");
		if (!slide) return;

		const styles = getComputedStyle(track);
		slideGap = parseFloat(styles.gap || styles.columnGap || 0);
		slideWidth = slide.getBoundingClientRect().width;

		setPosition(false);
	};

	const setPosition = (animate) => {
		if (!slideWidth) return;

		if (!animate) track.style.transition = "none";

		const offset = (slideWidth + slideGap) * currentIndex;
		track.style.transform = `translate3d(-${offset}px, 0, 0)`;

		if (!animate) {
			requestAnimationFrame(() => {
				track.style.transition = transitionStyle;
			});
		}
	};

	const moveBy = (step) => {
		currentIndex += step;
		setPosition(true);
		resetAuto();
	};

	const jumpTo = (index) => {
		currentIndex = index;
		track.style.transition = "none";
		setPosition(false);
		track.offsetHeight;
		track.style.transition = transitionStyle;
	};

	const handleLoop = () => {
		const maxIndex = visibleCount + carouselData.length - 1;

		if (currentIndex > maxIndex) {
			jumpTo(visibleCount);
		} else if (currentIndex < visibleCount) {
			jumpTo(maxIndex);
		}
	};

	const startAuto = () => {
		if (autoTimer) return;
		if (!isScrollable()) return;

		autoTimer = setInterval(() => moveBy(1), 3000);
	};

	const stopAuto = () => {
		clearInterval(autoTimer);
		autoTimer = null;
	};

	const resetAuto = () => {
		stopAuto();
		startAuto();
	};

	const updateControlsVisibility = () => {
		const enable = isScrollable();

		prevButton.style.visibility = enable ? "visible" : "hidden";
		nextButton.style.visibility = enable ? "visible" : "hidden";

		if (!enable) {
			stopAuto();
		} else {
			startAuto();
		}
	};

	prevButton.addEventListener("click", () => moveBy(-1));
	nextButton.addEventListener("click", () => moveBy(1));
	track.addEventListener("transitionend", handleLoop);

	window.addEventListener("resize", () => {
		requestAnimationFrame(() => {
			const nextCount = getVisibleCount();
			const realIndex =
				(((currentIndex - visibleCount) % carouselData.length) +
					carouselData.length) %
				carouselData.length;

			if (nextCount !== visibleCount) {
				visibleCount = nextCount;
				currentIndex = visibleCount + realIndex;
				renderSlides();
			}
			updateMeasurements();
			updateControlsVisibility();
		});
	});

	carouselRoot.addEventListener("mouseenter", stopAuto);
	carouselRoot.addEventListener("mouseleave", startAuto);
	carouselRoot.addEventListener("focusin", stopAuto);
	carouselRoot.addEventListener("focusout", startAuto);

	// init
	renderSlides();
	updateMeasurements();
	updateControlsVisibility();
});
