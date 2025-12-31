// captcha.js
(function () {
	function random(min, max) {
		return Math.floor(Math.random() * (max - min) + min);
	}

	function randomColor(min, max) {
		const r = random(min, max);
		const g = random(min, max);
		const b = random(min, max);
		return `rgb(${r},${g},${b})`;
	}

	function generateText(length = 6) {
		const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
		let str = "";
		for (let i = 0; i < length; i++) {
			str += chars[random(0, chars.length)];
		}
		return str;
	}

	window.CustomCaptcha = {
		code: "",
		draw(canvasId = "captcha") {
			const canvas = document.getElementById(canvasId);
			if (!canvas) return;

			const ctx = canvas.getContext("2d");
			const width = canvas.width;
			const height = canvas.height;

			ctx.fillStyle = randomColor(180, 230);
			ctx.fillRect(0, 0, width, height);

			const text = generateText(6);
			this.code = text.toLowerCase();

			for (let i = 0; i < text.length; i++) {
				const char = text[i];
				const fontSize = random(20, 28);

				ctx.font = `${fontSize}px Arial`;
				ctx.fillStyle = randomColor(50, 160);
				ctx.textBaseline = "middle";

				const x = 20 + i * 22;
				const y = height / 2;

				const angle = (random(-20, 20) * Math.PI) / 180;

				ctx.save();
				ctx.translate(x, y);
				ctx.rotate(angle);
				ctx.fillText(char, 0, 0);
				ctx.restore();
			}

			for (let i = 0; i < 2; i++) {
				ctx.strokeStyle = randomColor(40, 180);
				ctx.beginPath();
				ctx.moveTo(random(0, width), random(0, height));
				ctx.lineTo(random(0, width), random(0, height));
				ctx.stroke();
			}

			for (let i = 0; i < 20; i++) {
				ctx.fillStyle = randomColor(0, 255);
				ctx.beginPath();
				ctx.arc(random(0, width), random(0, height), 1, 0, 2 * Math.PI);
				ctx.fill();
			}
		},

		validate(input) {
			return input.toLowerCase() === this.code;
		},
	};
})();
