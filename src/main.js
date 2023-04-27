fetch('https://frontend.tabling.co.kr/v1/store/9533/reservations')
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
  })
  .catch((error) => console.error(error));
