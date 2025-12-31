const form = document.getElementById('contactForm');
const startTime = document.getElementById('startTime');
const endTime = document.getElementById('endTime');
const callDateInput = document.getElementById('callDate');

// 오늘 날짜를 최소값으로 설정 (어제 이전은 선택 불가)
const today = new Date().toISOString().split('T')[0];
callDateInput.setAttribute('min', today);

// 시간 옵션
const timeOptions = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
];

// 시작시간 옵션 (마지막 18:00 제외)
const startTimeOptions = timeOptions.slice(0, -1);

// callDate 변경 시 시작 시간 필터링
callDateInput.addEventListener('change', filterStartTimeOptions);

function filterStartTimeOptions() {
  const now = new Date();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const callDate = callDateInput.value;

  startTime.innerHTML = '<option value="" disabled selected hidden>시작</option>';

  startTimeOptions.forEach(time => {
    // 오늘이면 현재 시간 이후만 표시
    if (callDate !== today || time >= now.toTimeString().slice(0, 5)) {
      const option = document.createElement('option');
      option.value = time;
      option.textContent = time;
      startTime.appendChild(option);
    }
  });

  // 종료시간 초기화
  endTime.innerHTML = '<option value="" disabled selected hidden>종료</option>';
}

// 종료시간 자동 필터링
startTime.addEventListener('change', function () {
  const selected = this.value;
  endTime.innerHTML = '<option value="" disabled selected hidden>종료</option>';
  timeOptions.forEach(time => {
    if (time > selected) {
      const option = document.createElement('option');
      option.value = time;
      option.textContent = time;
      endTime.appendChild(option);
    }
  });
});

// 유효성 검사
form.addEventListener('submit', function (e) {
  const date = callDateInput.value;
  if (!date) {
    alert('통화 가능일을 선택해주세요.');
    e.preventDefault();
    return;
  }

  if (!startTime.value || !endTime.value) {
    alert('통화 가능 시간을 모두 선택해주세요.');
    e.preventDefault();
    return;
  }

  if (startTime.value >= endTime.value) {
    alert('시작 시간은 종료 시간보다 빨라야 합니다.');
    e.preventDefault();
    return;
  }
});
