const reservationApp = (() => {
  const elements = {
    reservationContainer: document.querySelector('.reservation-container'),
    reservationsList: document.querySelector('.reservation-list ul'),
    detailsContent: document.querySelector('.details-container'),
  };

  // API 요청경로
  const apiUrl = 'https://frontend.tabling.co.kr/v1/store/9533/reservations';

  // 초기화 함수
  const init = () => {
    window.addEventListener('DOMContentLoaded', async () => {
      await getReservations();
      updateReservation();

      const reservations = loadData();
      displayReservationDetails(reservations[0]);
    });
  };

  // API 호출
  const getReservations = async () => {
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      localStorage.setItem('reservations', JSON.stringify(data.reservations));
    } catch (e) {
      console.error(e);
    }
  };

  // 예약 데이터 불러오는 함수
  const loadData = () => {
    return JSON.parse(localStorage.getItem('reservations'));
  };

  // 예약 리스트 생성함수
  const updateReservation = () => {
    elements.reservationsList.innerHTML = '';
    const reservations = loadData();

    reservations.filter((reservation) => reservation.status !== 'done').forEach((reservation) => createReservationItem(reservation));
  };

  // Reservation Status 확인 함수
  const isSeated = (status) => {
    return status === 'seated';
  };

  // 시간 형식 포맷 함수
  const formatDate = (time, format) => {
    // 사파리 호환용 .replace(/-/g, '/') 사용
    const date = new Date(time.replace(/-/g, '/'));
    let formattedDate = format;

    const hours = date.getHours();
    const minutes = date.getMinutes();

    formattedDate = formattedDate.replace('HH', hours.toString().padStart(2, '0'));
    formattedDate = formattedDate.replace('mm', minutes.toString().padStart(2, '0'));

    return formattedDate;
  };

  // HTML Element 생성 함수
  const createElement = (tag, className, id) => {
    const element = document.createElement(tag);
    className && element.classList.add(className);
    id && element.setAttribute('id', id);
    return element;
  };

  // 예약 리스트 ITEM 생성 함수
  const createReservationItem = (reservation) => {
    const listItm = createElement('li', 'reservation-itm', reservation.id);
    elements.reservationsList.appendChild(listItm);
    listItm.addEventListener('click', handleReservationClick);

    const itmInfo = createItmInfo(reservation);
    listItm.appendChild(itmInfo);

    const itmContent = createItmContent(reservation);
    listItm.appendChild(itmContent);

    const itmBtnBox = createItmBtn(reservation);
    listItm.appendChild(itmBtnBox);

    listItm.addEventListener('click', handleListClickMobile);
  };

  // 리스트 ITEM 의 시간과 상태 생성함수
  const createItmInfo = (reservation) => {
    const itmInfo = createElement('div', 'itm-info');

    const time = createElement('p', 'itm-info__time');
    itmInfo.appendChild(time);
    const status = createElement('p', 'itm-info__status');
    status.classList.add(isSeated(reservation.status) ? 'status--seated' : 'status--reserved');
    itmInfo.appendChild(status);

    time.textContent = formatDate(reservation.timeReserved, 'HH:mm');
    status.textContent = isSeated(reservation.status) ? '착석 중' : '예약';

    return itmInfo;
  };

  // LIST Contents 생성 함수
  const createItmContent = (reservation) => {
    const itmContent = createElement('div', 'itm-content');

    const nameAndTable = createElement('p');
    itmContent.appendChild(nameAndTable);
    const numberOfPeople = createElement('p');
    itmContent.appendChild(numberOfPeople);
    const menu = createElement('p');
    itmContent.appendChild(menu);

    const tableNames = reservation.tables.map((table) => table.name).join(', ');
    const menus = reservation.menus.map((menu) => `${menu.name} (${menu.qty})`).join(', ');

    nameAndTable.textContent = `${reservation.customer.name} - 테이블명 [${tableNames}]`;
    numberOfPeople.textContent = `성인 ${reservation.customer.adult} 아이 ${reservation.customer.child}`;
    menu.textContent = `메뉴명 (갯수) [${menus}]`;

    return itmContent;
  };

  // 착석 퇴석 버튼 생성 함수
  const createItmBtn = (reservation) => {
    const itmBtnBox = createElement('form', 'itm-btnBox');
    const itmBtn = createElement('input', 'status-btn', reservation.id + 'btn');
    itmBtnBox.appendChild(itmBtn);

    itmBtn.addEventListener('click', handleItmBtnClick);

    itmBtn.setAttribute('type', 'button');
    itmBtn.setAttribute('value', isSeated(reservation.status) ? '퇴석' : '착석');

    return itmBtnBox;
  };

  // 예약 상세정보 표시 함수
  const displayReservationDetails = (reservation) => {
    const status = elements.detailsContent.querySelector('.reservation-info__status');
    status.textContent = isSeated(reservation.status) ? '착석 중' : '예약';

    const reservationTime = elements.detailsContent.querySelector('.reservation-info__timeReserved');
    reservationTime.textContent = formatDate(reservation.timeReserved, 'HH:mm');

    const reservedTime = elements.detailsContent.querySelector('.reservation-info__timeRegistered');
    reservedTime.textContent = formatDate(reservation.timeRegistered, 'HH:mm');

    const customerName = elements.detailsContent.querySelector('.customer-info__name');
    customerName.textContent = reservation.customer.name;

    const customerLevel = elements.detailsContent.querySelector('.customer-info__level');
    customerLevel.textContent = reservation.customer.level;

    const customerMemo = elements.detailsContent.querySelector('.customer-info__memo');
    customerMemo.textContent = reservation.customer.memo;

    const request = elements.detailsContent.querySelector('.request_text');
    request.textContent = reservation.customer.request;
  };

  // 리스트 아이템 클릭시 상세정보 표시 함수
  const handleReservationClick = (e) => {
    const reservationId = e.currentTarget.getAttribute('id');
    const reservations = loadData();
    const selectedReservation = reservations.find((reservation) => reservation.id === reservationId);
    displayReservationDetails(selectedReservation);
  };

  // 착석 퇴석 버튼 클릭 이벤트
  const handleItmBtnClick = (e) => {
    e.stopPropagation();
    const reservationId = e.currentTarget.getAttribute('id').replace(/[^0-9]/g, '');
    const reservations = loadData();
    const reservationIndex = reservations.findIndex((reservation) => reservation.id === reservationId);
    const reservation = reservations[reservationIndex];

    reservation.status = isSeated(reservation.status) ? 'done' : 'seated';
    localStorage.setItem('reservations', JSON.stringify(reservations));

    const newReservations = loadData();

    // 예약 리스트 및 상세정보 업데이트
    updateReservation();

    // 모든 예약이 done 상태인지 확인
    const checkStatus = newReservations.every((r) => r.status === 'done');

    // 상태가 'done'이 아니라면 클릭한 예약 정보를 표시 그렇지 않으면 상태가 'done'이 아닌 첫 번째 예약을 표시
    if (reservation.status !== 'done') {
      displayReservationDetails(reservation);
    } else if (!checkStatus) {
      const nextReservation = newReservations.find((r) => r.status !== 'done');
      if (nextReservation) {
        displayReservationDetails(nextReservation);
      }
    } else {
      // 모든 예약이 done 상태이면 예약 상세 정보를 비움
      clearReservationDetails();
    }
  };

  // 예약상세 초기화 함수
  const clearReservationDetails = () => {
    const details = [
      '.reservation-info__status',
      '.reservation-info__timeReserved',
      '.reservation-info__timeRegistered',
      '.customer-info__name',
      '.customer-info__level',
      '.customer-info__memo',
      '.request_text',
    ];

    details.forEach((selector) => {
      const element = elements.detailsContent.querySelector(selector);
      element.textContent = '';
    });
  };

  // 모바일 레이아웃 기능구현

  // 리스트 클릭 시 디테일 컨테이너 on

  const handleListClickMobile = () => {
    const details = elements.detailsContent;
    const reservationList = elements.reservationContainer;
    details.classList.add('on');
    reservationList.classList.add('on');
  };

  // 닫기 버튼 클릭 시 디테일 컨테이너 off

  const mClose = elements.detailsContent.querySelector('.m-close');
  const handleMcloseClick = () => {
    const details = elements.detailsContent;
    const reservationList = elements.reservationContainer;
    details.classList.remove('on');
    reservationList.classList.remove('on');
  };
  mClose.addEventListener('click', handleMcloseClick);

  // 뒷 배경 클릭 시 디테일 컨테이너 off

  const handleBackgroundClick = (e) => {
    if (e.target === elements.detailsContent) {
      const details = elements.detailsContent;
      const reservationList = elements.reservationContainer;
      details.classList.remove('on');
      reservationList.classList.remove('on');
    }
  };
  elements.detailsContent.addEventListener('click', handleBackgroundClick);

  return { init };
})();

reservationApp.init();
