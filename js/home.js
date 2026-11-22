/* 홈: 식탁 위에 디저트 올리기 */

const table = document.querySelector('.spin');  // 회전하는 식탁보 위에 올림
const svg = document.querySelector('.lines');

// 1. 연결선: 같은 '장소'에서 만난 디저트끼리 번호 순서대로 잇기
const placeGroups = groupBy('장소');
Object.values(placeGroups).forEach(function (list) {
  for (let i = 0; i < list.length - 1; i++) {
    const a = list[i];
    const b = list[i + 1];
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', a.x);
    line.setAttribute('y1', a.y);
    line.setAttribute('x2', b.x);
    line.setAttribute('y2', b.y);
    svg.appendChild(line);
  }
});

// 2. 디저트 그림 + 빨간 번호 + 마우스 올리면 뜨는 쪽지
DESSERTS.forEach(function (d) {
  const dish = document.createElement('a');
  dish.className = 'dish';
  dish.href = 'detail.html?id=' + d.id;
  dish.style.left = d.x + '%';
  dish.style.top = d.y + '%';
  dish.style.width = d.size + '%';
  dish.style.setProperty('--rot', (d.rotate || 0) + 'deg');

  dish.innerHTML =
    '<img src="' + d.image + '" alt="' + d.name + '">' +
    '<span class="num">' + d.id + '</span>';

  // 마우스를 올리면 쪽지 내용 바꾸고 보이기
  const noteHtml =
    '<b>' + pad(d.id) + '</b>' + d.name +
    '<span>' + joinParts([d.place, d.date, d.memory]) + '</span>';

  dish.addEventListener('mouseenter', function () { showTip(noteHtml); });
  dish.addEventListener('mousemove', function (e) { moveTip(e.clientX, e.clientY); });
  dish.addEventListener('mouseleave', hideTip);
  dish.addEventListener('focus', function () {   // 키보드(Tab)로 이동할 때
    const r = dish.getBoundingClientRect();
    showTip(noteHtml);
    moveTip(r.left + r.width / 2, r.bottom);
  });
  dish.addEventListener('blur', hideTip);

  table.appendChild(dish);
});

// 쪽지: 식탁은 돌아도 쪽지는 돌지 않게, 회전하지 않는 바깥 틀(.table)에 하나만 둠
const frame = document.querySelector('.table');
const tip = document.createElement('div');
tip.className = 'note';
frame.appendChild(tip);

function showTip(html) {
  tip.innerHTML = html;
  tip.classList.add('show');
}

function moveTip(x, y) {   // 마우스 위치 바로 아래에 쪽지 놓기
  const r = frame.getBoundingClientRect();
  tip.style.left = (x - r.left) + 'px';
  tip.style.top = (y - r.top) + 'px';
}

function hideTip() {
  tip.classList.remove('show');
}

// 3. 하단 색인 (타자기체 목록)
const list = document.getElementById('indexList');
let html = '<span class="lead">직접 먹고 그린 디저트들, 내가 만난 곳과 순간을 따라 모음 ////////</span><br>';
DESSERTS.forEach(function (d) {
  html += '<a href="detail.html?id=' + d.id + '">' +
          d.id + '. ' + d.name + ' (' + d.place + '), ' + joinParts([d.date, d.memory]).replace(' · ', ', ') +
          '</a> | ';
});
html += '<span class="lead">//////// 다음 접시: 준비 중</span>';
list.innerHTML = html;

// 4. 날짜 도장: 가장 최근에 기록한 날짜
const stamp = document.getElementById('stamp');
const last = latestDate();
if (last) stamp.textContent = stampDate(last);
else stamp.textContent = stampDate(todayText());   // 날짜를 아직 안 적었으면 오늘 날짜
