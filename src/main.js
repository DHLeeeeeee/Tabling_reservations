const reservationApp = (() => {
  const elements = {
    reservationsList: document.querySelector('.reservation-list ul'),
    detailsContent: document.querySelector('.reservation-details'),
  };

  // 초기화 함수
  const init = () => {
    window.addEventListener('DOMContentLoaded', getReservations);
  };

  // API 호출
  const getReservations = async () => {
    try {
      const response = await fetch('https://frontend.tabling.co.kr/v1/store/9533/reservations');
      const data = await response.json();
      localStorage.setItem('reservations', JSON.stringify(data.reservations));
    } catch (e) {
      console.error(e);
    }
  };

  // Reservation Status 확인 함수
  const isSeated = (status) => {
    return status === 'seated';
  };

  // 시간 형식 포맷 함수
  const formatDate = (time, format) => {
    const date = new Date(time);
    let formattedDate = format;

    const hours = date.getHours();
    const minutes = date.getMinutes();

    formattedDate = formattedDate.replace('HH', hours.toString().padStart(2, '0'));
    formattedDate = formattedDate.replace('mm', minutes.toString().padStart(2, '0'));

    return formattedDate;
  };

  // HTML 생성 함수
  const createElement = (tag, className, id) => {
    const element = document.createElement(tag);
    className && element.classList.add(className);
    id && element.setAttribute('id', id);
    return element;
  };

  // LIST ITEM 생성 함수
  const createReservationItem = (reservation) => {
    const listItm = createElement('li', 'reservation-itm', reservation.id);
    elements.reservationsList.appendChild(listItm);

    const itmInfo = createItmInfo(reservation);
    listItm.appendChild(itmInfo);

    const itmContent = createItmContent(reservation);
    listItm.appendChild(itmContent);

    const itmBtnBox = createElement('div', 'itm-btnBox');
    listItm.appendChild(itmBtnBox);

    const itmBtn = createItmBtn(reservation);
    itmBtnBox.appendChild(itmBtn);
  };

  // LIST ITEM 의 시간과 상태 생성함수
  const createItmInfo = (reservation) => {
    const itmInfo = createElement('div', 'itm-info');

    const time = createElement('p', 'itm-info-time');
    itmInfo.appendChild(time);
    const status = createElement('p', 'itm-info-status');
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
    const menus = reservation.menus.map((menu) => `${menu.name}(${menu.qty})`).join(', ');
    nameAndTable.textContent = `${reservation.customer.name} - 테이블명[${tableNames}]`;
    numberOfPeople.textContent = `성인 ${reservation.customer.adult} 아이 ${reservation.customer.child}`;
    menu.textContent = `메뉴명(갯수) [${menus}]`;
  };

  return { init };
})();

reservationApp.init();
