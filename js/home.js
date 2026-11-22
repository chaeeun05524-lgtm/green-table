/* 홈: 식탁 위와 식탁 주변에 그림 올리기 */

const scene = document.querySelector('.scene');
const tableEl = document.querySelector('.table');
const spin = document.querySelector('.spin');   // 회전하는 식탁보
const svg = document.querySelector('.lines');

const onTable = DESSERTS.filter(function (d) { return d.spot !== 'floor'; });
const onFloor = DESSERTS.filter(function (d) { return d.spot === 'floor'; });

// 1. 식탁 위 연결선: 번호 순서대로 한 줄로 잇기 (식탁보와 함께 돎)
for (let i = 0; i < onTable.length - 1; i++) {
  const a = onTable[i];
  const b = onTable[i + 1];
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', a.x);
  line.setAttribute('y1', a.y);
  line.setAttribute('x2', b.x);
  line.setAttribute('y2', b.y);
  svg.appendChild(line);
}

// 2. 그림 한 점 만들기 (빨간 번호 + 마우스 올리면 쪽지)
function makeDish(d) {
  const dish = document.createElement('a');
  dish.className = 'dish';
  dish.href = 'detail.html?id=' + d.id;
  dish.style.setProperty('--rot', (d.rotate || 0) + 'deg');
  dish.style.setProperty('--i', d.id - 1);   // 놓이는 순서
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

// 첫 방문 때만 그림이 하나씩 놓이는 연출 (같은 창에서 다시 오면 생략)
let played = false;
try { played = sessionStorage.getItem('gt-intro') === '1'; } catch (e) {}
if (!played && !location.search) {   // 분류에서 넘어온 경우는 생략
  scene.classList.add('intro');
  scene.style.setProperty('--count', DESSERTS.length);
  try { sessionStorage.setItem('gt-intro', '1'); } catch (e) {}
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
    // 지그재그: 하나는 식탁 쪽으로, 하나는 바깥쪽으로 번갈아 밀기
    const dx = c.x - cx;
    const dy = c.y - cy;
    const dist = Math.hypot(dx, dy);
    const push = (i % 2 === 0 ? 0.42 : -0.3) * step;
    let x = c.x + dx / dist * push;
    let y = c.y + dy / dist * push;
    // 화면 밖으로 나가지 않게
    x = Math.min(Math.max(x, step * 0.35), W - step * 0.35);
    y = Math.min(Math.max(y, step * 0.35), H - step * 0.35);
    // 살짝 흐트러뜨리기
    x += ((f.d.id * 37) % 21 - 10) / 100 * step;
    y += ((f.d.id * 53) % 21 - 10) / 100 * step;
    f.x = x;
    f.y = y;
    f.el.style.width = (T * f.d.size / 100) + 'px';
  });

  // 겹치는 그림은 서로 살살 밀어내기 (식탁과도 겹치지 않게)
  floorDishes.forEach(function (f) {
    const w = f.el.offsetWidth;
    const h = f.el.offsetHeight || w;
    f.r = Math.sqrt(w * h) / 2 + 6;
  });
  for (let it = 0; it < 200; it++) {
    for (let i = 0; i < floorDishes.length; i++) {
      for (let j = i + 1; j < floorDishes.length; j++) {
        const a = floorDishes[i];
        const b = floorDishes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 0.01;
        const over = a.r + b.r - d;
        if (over > 0) {
          a.x -= dx / d * over / 2; a.y -= dy / d * over / 2;
          b.x += dx / d * over / 2; b.y += dy / d * over / 2;
        }
      }
    }
    floorDishes.forEach(function (f) {
      const dx = f.x - cx;
      const dy = f.y - cy;
      const d = Math.hypot(dx, dy);
      const min = T / 2 + f.r * 0.8;
      if (d < min) { f.x = cx + dx / d * min; f.y = cy + dy / d * min; }
      f.x = Math.min(Math.max(f.x, f.r * 0.6), W - f.r * 0.6);
      f.y = Math.min(Math.max(f.y, f.r * 0.6), H - f.r * 0.6);
    });
  }

  floorDishes.forEach(function (f) {
    f.el.style.left = f.x + 'px';
    f.el.style.top = f.y + 'px';
  });
}

layoutFloor();
window.addEventListener('load', layoutFloor);     // 그림이 다 불러와지면 크기에 맞춰 다시
window.addEventListener('resize', layoutFloor);

// 3-1. 식탁 밖 연결선: 식탁 위 마지막 그림 → 식탁 밖 그림들을 번호 순서대로 잇기
//      식탁이 돌면 끝점도 움직이니까 화면이 바뀔 때마다 다시 그림
const outerSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
outerSvg.setAttribute('class', 'outer-lines');
scene.insertBefore(outerSvg, scene.children[1]);   // 식탁 위, 식탁 밖 그림 아래

const chain = [spin.lastElementChild].concat(floorDishes.map(function (f) { return f.el; }));

function center(el, base) {
  const r = (el.querySelector('img') || el).getBoundingClientRect();
  return { x: r.left + r.width / 2 - base.left, y: r.top + r.height / 2 - base.top,
           r: Math.min(r.width, r.height) * 0.42 };   // 그림 안쪽까지는 선을 안 그음
}

function drawOuterLines() {
  const base = scene.getBoundingClientRect();
  outerSvg.setAttribute('viewBox', '0 0 ' + base.width + ' ' + base.height);
  let paths = '';
  for (let i = 0; i < chain.length - 1; i++) {
    const a = center(chain[i], base);
    const b = center(chain[i + 1], base);
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    if (len <= a.r + b.r) continue;
    const ux = (b.x - a.x) / len;
    const uy = (b.y - a.y) / len;
    paths += '<line x1="' + (a.x + ux * a.r) + '" y1="' + (a.y + uy * a.r) +
             '" x2="' + (b.x - ux * b.r) + '" y2="' + (b.y - uy * b.r) + '"/>';
  }
  outerSvg.innerHTML = paths;
  requestAnimationFrame(drawOuterLines);
}
requestAnimationFrame(drawOuterLines);


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

// 4-1. 분류 보기에서 넘어왔을 때: 그 묶음만 진하게, 나머지는 흐리게
//      주소 예) index.html?장소=여행에서
const params = new URLSearchParams(location.search);
['장소', '감정', '시간'].forEach(function (key) {
  const value = params.get(key);
  if (!value) return;
  scene.classList.add('focus');
  document.querySelectorAll('.dish').forEach(function (el) {
    const id = Number(el.getAttribute('href').split('=')[1]);
    if (findDessert(id).groups[key] === value) el.classList.add('on');
  });
  const chip = document.createElement('a');
  chip.className = 'focus-chip';
  chip.href = 'index.html';
  chip.innerHTML = key + ' · <b>' + value + '</b> 만 보는 중 <span>✕ 전체 보기</span>';
  scene.parentNode.insertBefore(chip, scene);
});

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
