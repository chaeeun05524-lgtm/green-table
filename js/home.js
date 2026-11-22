/* 홈: 식탁 위와 식탁 주변에 그림 올리기 */

const scene = document.querySelector('.scene');
const tableEl = document.querySelector('.table');
const spin = document.querySelector('.spin');   // 회전하는 식탁보
const svg = document.querySelector('.lines');

const onTable = DESSERTS.filter(function (d) { return d.spot !== 'floor'; });
const onFloor = DESSERTS.filter(function (d) { return d.spot === 'floor'; });

// 1. 연결선: 식탁 위에서 같은 '장소'에서 만난 것끼리 번호 순서대로 잇기
const placeGroups = {};
onTable.forEach(function (d) {
  const g = d.groups['장소'];
  if (!placeGroups[g]) placeGroups[g] = [];
  placeGroups[g].push(d);
});
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

// 2. 그림 한 점 만들기 (빨간 번호 + 마우스 올리면 쪽지)
function makeDish(d) {
  const dish = document.createElement('a');
  dish.className = 'dish';
  dish.href = 'detail.html?id=' + d.id;
  dish.style.setProperty('--rot', (d.rotate || 0) + 'deg');
  dish.innerHTML =
    '<img src="' + d.image + '" alt="' + d.name + '">' +
    '<span class="num">' + d.id + '</span>';

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
  return dish;
}

// 식탁 위: 식탁 크기에 대한 % 위치
onTable.forEach(function (d) {
  const dish = makeDish(d);
  dish.style.left = d.x + '%';
  dish.style.top = d.y + '%';
  dish.style.width = d.size + '%';
  spin.appendChild(dish);
});

// 식탁 밖: 위치는 아래 layoutFloor()가 화면 크기에 맞춰 정함
const floorDishes = onFloor.map(function (d) {
  const dish = makeDish(d);
  dish.classList.add('floor');
  scene.appendChild(dish);
  return { d: d, el: dish };
});

// 3. 식탁 밖 그림 배치: 식탁과 겹치지 않는 빈 자리를 찾아 고르게 흩어 놓기
function layoutFloor() {
  const W = scene.clientWidth;

  // 좁은 화면(휴대폰)에서는 식탁 아래에 차례로 늘어놓기
  if (W < 760) {
    scene.classList.add('stacked');
    scene.style.height = '';
    floorDishes.forEach(function (f) {
      f.el.style.left = '';
      f.el.style.top = '';
      f.el.style.width = '';
    });
    return;
  }
  scene.classList.remove('stacked');

  const T = tableEl.offsetWidth;          // 식탁 지름
  const step = T * 0.17;                  // 그림 한 칸 크기
  let padY = step * 0.9;                  // 식탁 위아래 여백
  let cells = [];
  let H, cx, cy;

  // 자리가 모자라면 위아래 여백을 늘려가며 다시 찾기
  for (let k = 0; k < 15; k++) {
    H = T + padY * 2;
    cx = W / 2;
    cy = padY + T / 2;
    cells = [];
    for (let y = step * 0.55; y < H - step * 0.45; y += step * 0.95) {
      for (let x = step * 0.55; x < W - step * 0.45; x += step) {
        const far = Math.hypot(x - cx, y - cy) > T / 2 + step * 0.55;
        if (far) cells.push({ x: x, y: y });
      }
    }
    if (cells.length >= floorDishes.length) break;
    padY += step * 0.5;
  }

  scene.style.height = H + 'px';
  tableEl.style.top = padY + 'px';

  // 서로 최대한 멀리 떨어지게 자리 고르기
  const chosen = [cells[0]];
  while (chosen.length < floorDishes.length && chosen.length < cells.length) {
    let best = null;
    let bestDist = -1;
    cells.forEach(function (c) {
      if (chosen.indexOf(c) !== -1) return;
      let m = Infinity;
      chosen.forEach(function (s) { m = Math.min(m, Math.hypot(c.x - s.x, c.y - s.y)); });
      if (m > bestDist) { bestDist = m; best = c; }
    });
    chosen.push(best);
  }

  // 식탁 둘레를 따라 번호 순서대로 놓기 (시계 방향)
  chosen.sort(function (a, b) {
    return angle(a) - angle(b);
  });
  function angle(c) {
    return (Math.atan2(c.y - cy, c.x - cx) + Math.PI * 2.5) % (Math.PI * 2);
  }

  floorDishes.forEach(function (f, i) {
    const c = chosen[i];
    const jx = ((f.d.id * 37) % 21 - 10) / 100 * step;   // 살짝 흐트러뜨리기
    const jy = ((f.d.id * 53) % 21 - 10) / 100 * step;
    f.el.style.left = (c.x + jx) + 'px';
    f.el.style.top = (c.y + jy) + 'px';
    f.el.style.width = (T * f.d.size / 100) + 'px';
  });
}

layoutFloor();
window.addEventListener('resize', layoutFloor);

// 4. 쪽지: 회전하지 않는 바깥(.scene)에 하나만 두고 마우스를 따라다니게
const tip = document.createElement('div');
tip.className = 'note';
scene.appendChild(tip);

function showTip(html) {
  tip.innerHTML = html;
  tip.classList.add('show');
}

function moveTip(x, y) {
  const r = scene.getBoundingClientRect();
  tip.style.left = (x - r.left) + 'px';
  tip.style.top = (y - r.top) + 'px';
}

function hideTip() {
  tip.classList.remove('show');
}

// 5. 하단 색인 (타자기체 목록)
const list = document.getElementById('indexList');
let html = '<span class="lead">직접 먹고 그린 음식들, 내가 만난 곳과 순간을 따라 모음 ////////</span><br>';
DESSERTS.forEach(function (d) {
  html += '<a href="detail.html?id=' + d.id + '">' +
          d.id + '. ' + d.name + ' (' + d.place + ')' +
          (d.date ? ', ' + d.date : '') + ', ' + d.memory +
          '</a> | ';
});
html += '<span class="lead">//////// 다음 접시: 준비 중</span>';
list.innerHTML = html;

// 6. 날짜 도장: 가장 최근에 기록한 날짜 (아직 없으면 오늘)
const stamp = document.getElementById('stamp');
const last = latestDate();
stamp.textContent = stampDate(last || todayText());
