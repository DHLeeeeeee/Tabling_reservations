// 로드 시 API 요청

window.addEventListener('load', loadReservations);

let reservations; // 예약 목록 데이터
const reservationsList = document.querySelector('.reservation-list ul'); // 예약 목록 리스트

// 예약 상세
const reservationStatus = document.querySelector('.reservation-info__status'); // 예약 상태
const reservedTime = document.querySelector('.reservation-info__timeReserved'); // 예약 시간
const registeredTime = document.querySelector('reservation-info__timeRegistered'); // 접수 시간
const customerName = document.querySelector('.customer-info__name'); // 고객 성명
const customerLevel = document.querySelector('.customer-info__level'); // 고객 등급
const customerMemo = document.querySelector('.customer-info__memo'); // 고객 메모
const request = document.querySelector('.request_text'); // 요청사항

// API 요청 함수

async function loadReservations() {
  try {
    const response = await fetch('https://frontend.tabling.co.kr/v1/store/9533/reservations');
    const data = await response.json();
    reservations = data.reservations;
    console.log(reservations);
  } catch (error) {
    console.error(error);
  }
}
