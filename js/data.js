/* =========================================================
   그린 식탁: 디저트 목록
   ---------------------------------------------------------
   그림을 추가하려면 { ... } 한 덩어리를 복사해서 아래에 붙이고
   내용만 바꾸면 돼. 홈, 상세, 분류 페이지가 전부 여기서 불러와.

   id      : 번호 (겹치지 않게)
   image   : images 폴더에 넣은 그림 파일
   x, y    : 식탁 위 위치 (0~100). 50, 50이 식탁 한가운데
   size    : 그림 크기 (식탁 너비의 몇 %인지)
   rotate  : 살짝 돌리기 (도). 0이면 그대로
   date    : 먹은 날짜 '연.월.일' 형식 (가장 최근 날짜가 날짜 도장에 찍힘)
   story   : 만난 순간. 줄을 바꾸려면 \n
   traces  : 그때의 흔적 사진. 비워두면 빈 액자가 보여
             예) [{ src: 'images/traces/receipt.jpg', caption: '영수증' }]
   zooms   : 상세 페이지 확대 원 2개의 위치 (그림 안에서 x%, y%)
   groups  : 분류 보기 기준. 같은 '장소'끼리 홈에서 선으로 이어져
   ========================================================= */

const DESSERTS = [
  {
    id: 1,
    name: '크루아상',
    en: 'Croissant',
    image: 'images/croissant.png',
    x: 29, y: 25, size: 21, rotate: -10,
    date: '2026.09.12',
    place: '장소',
    who: '누구와',
    memory: '한 줄 기억',
    story: '',
    info: '버터를 넣은 반죽을 여러 번 접어 구워 결이 겹겹이 생기는 빵. 프랑스를 대표하는 비에누아즈리.',
    traces: [],
    zooms: [[30, 40], [70, 60]],
    groups: { 장소: '여행에서', 감정: '처음 먹어본', 시간: '2026' }
  },
  {
    id: 2,
    name: '체리',
    en: 'Cherry',
    image: 'images/cherry.png',
    x: 55, y: 20, size: 12, rotate: 0,
    date: '2025.06.20',
    place: '장소',
    who: '누구와',
    memory: '한 줄 기억',
    story: '',
    info: '초여름이 제철인 작은 과일. 타르트나 케이크 위 장식으로 자주 쓰인다.',
    traces: [],
    zooms: [[30, 75], [70, 70]],
    groups: { 장소: '여행에서', 감정: '축하할 때', 시간: '2025' }
  },
  {
    id: 3,
    name: '베이글',
    en: 'Bagel',
    image: 'images/bagel.png',
    x: 75, y: 33, size: 20, rotate: 6,
    date: '2026.03.08',
    place: '장소',
    who: '누구와',
    memory: '한 줄 기억',
    story: '',
    info: '반죽을 끓는 물에 데친 뒤 구워 겉은 단단하고 속은 쫄깃한 고리 모양 빵.',
    traces: [],
    zooms: [[40, 30], [55, 80]],
    groups: { 장소: '여행에서', 감정: '축하할 때', 시간: '2026' }
  },
  {
    id: 4,
    name: '복숭아',
    en: 'Peach',
    image: 'images/peach.png',
    x: 79, y: 59, size: 17, rotate: 12,
    date: '2025.08.02',
    place: '장소',
    who: '누구와',
    memory: '한 줄 기억',
    story: '',
    info: '한여름이 제철인 과일. 단면의 붉은 결이 씨앗 쪽으로 모인다.',
    traces: [],
    zooms: [[35, 30], [70, 55]],
    groups: { 장소: '동네에서', 감정: '위로가 된', 시간: '2025' }
  },
  {
    id: 5,
    name: '피자',
    en: 'Pizza',
    image: 'images/pizza.png',
    x: 62, y: 79, size: 18, rotate: -6,
    date: '2024.12.24',
    place: '장소',
    who: '누구와',
    memory: '한 줄 기억',
    story: '',
    info: '납작한 반죽 위에 소스와 치즈를 올려 구운 이탈리아 음식.',
    traces: [],
    zooms: [[40, 45], [62, 55]],
    groups: { 장소: '동네에서', 감정: '축하할 때', 시간: '2024' }
  },
  {
    id: 6,
    name: '만두',
    en: 'Dumpling',
    image: 'images/dumpling.png',
    x: 37, y: 78, size: 16, rotate: 4,
    date: '2024.11.30',
    place: '장소',
    who: '누구와',
    memory: '한 줄 기억',
    story: '',
    info: '반죽 안에 소를 넣고 빚어 익힌 음식.',
    traces: [],
    zooms: [[50, 50], [25, 40]],
    groups: { 장소: '누군가에게 받은', 감정: '위로가 된', 시간: '2024' }
  },
  {
    id: 7,
    name: '토마토',
    en: 'Tomato',
    image: 'images/tomato.png',
    x: 21, y: 56, size: 15, rotate: 0,
    date: '2025.07.15',
    place: '장소',
    who: '누구와',
    memory: '한 줄 기억',
    story: '',
    info: '여름이 제철인 열매채소. 꼭지의 초록 잎이 별 모양으로 퍼진다.',
    traces: [],
    zooms: [[40, 25], [60, 70]],
    groups: { 장소: '누군가에게 받은', 감정: '처음 먹어본', 시간: '2025' }
  },
  {
    id: 8,
    name: '팬케이크',
    en: 'Pancake',
    image: 'images/pancake.png',
    x: 49, y: 49, size: 29, rotate: 0,
    date: '2026.10.03',
    place: '장소',
    who: '누구와',
    memory: '한 줄 기억',
    story: '',
    info: '반죽을 팬에 둥글게 구워 겹겹이 쌓고, 시럽과 과일을 올려 먹는다.',
    traces: [],
    zooms: [[35, 30], [62, 55]],
    groups: { 장소: '누군가에게 받은', 감정: '위로가 된', 시간: '2026' }
  }
];
