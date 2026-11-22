/* 홈: 그림을 집어서 식탁 위에 마음대로 다시 차리기
   - 꾹 눌러 끌면 옮겨지고, 그냥 누르면 원래처럼 상세 페이지로 이동
   - 놓을 때 접시가 탁 놓이는 작은 소리
   - 새로고침하면 원래 자리로 돌아감 */

let dragging = null;   // 지금 끌고 있는 그림 정보
let moved = false;     // 끌었는지(true) 그냥 눌렀는지(false)

// 식탁보가 지금 몇 도 돌아가 있는지
function spinAngle() {
  const r = getComputedStyle(spin).rotate;
  return r && r !== 'none' ? parseFloat(r) * Math.PI / 180 : 0;
}

document.querySelectorAll('.dish').forEach(function (el) {
  el.addEventListener('dragstart', function (e) { e.preventDefault(); });   // 브라우저 기본 이미지 끌기 막기

  el.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    if (scene.classList.contains('stacked') && el.classList.contains('floor')) return;   // 휴대폰 목록에서는 안 움직임
    dragging = { el: el, x0: e.clientX, y0: e.clientY, onTable: !el.classList.contains('floor') };
    moved = false;
  });
});

window.addEventListener('pointermove', function (e) {
  if (!dragging) return;
  if (!moved && Math.hypot(e.clientX - dragging.x0, e.clientY - dragging.y0) < 6) return;   // 6px 넘게 움직여야 끌기 시작

  if (!moved) {
    moved = true;
    dragging.el.classList.add('lifted');
    scene.classList.add('dragging');
    hideTip();
  }

  if (dragging.onTable) {
    // 식탁 위: 돌아간 식탁보 기준 좌표(%)로 바꿔서 놓기
    const r = tableEl.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const a = -spinAngle();
    const x = 50 + (dx * Math.cos(a) - dy * Math.sin(a)) / r.width * 100;
    const y = 50 + (dx * Math.sin(a) + dy * Math.cos(a)) / r.height * 100;
    const d = findDessert(dragging.el.getAttribute('href').split('=')[1]);
    d.x = x;
    d.y = y;
    dragging.el.style.left = x + '%';
    dragging.el.style.top = y + '%';
    drawTableLines();
  } else {
    // 식탁 밖: 화면 좌표(px) 그대로
    const s = scene.getBoundingClientRect();
    dragging.el.style.left = (e.clientX - s.left) + 'px';
    dragging.el.style.top = (e.clientY - s.top) + 'px';
  }
});

window.addEventListener('pointerup', function () {
  if (!dragging) return;
  if (moved) {
    dragging.el.classList.remove('lifted');
    dragging.el.classList.add('dropped');
    const el = dragging.el;
    el.parentNode.appendChild(el);   // 방금 놓은 그림을 맨 위로
    setTimeout(function () { el.classList.remove('dropped'); }, 300);
    scene.classList.remove('dragging');
    tak();
  }
  dragging = null;
});

// 끌고 난 뒤에는 클릭(페이지 이동)을 막기
document.querySelectorAll('.dish').forEach(function (el) {
  el.addEventListener('click', function (e) {
    if (moved) { e.preventDefault(); moved = false; }
  });
});

// 접시가 탁 놓이는 소리 (소리 파일 없이 브라우저에서 만듦)
let audio = null;
function tak() {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const t = audio.currentTime;
    // 짧은 '톡' 소리
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.08);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(gain).connect(audio.destination);
    osc.start(t);
    osc.stop(t + 0.13);
    // 사기 그릇 같은 짧은 울림
    const ring = audio.createOscillator();
    const g2 = audio.createGain();
    ring.frequency.setValueAtTime(1850, t);
    g2.gain.setValueAtTime(0.04, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    ring.connect(g2).connect(audio.destination);
    ring.start(t);
    ring.stop(t + 0.26);
  } catch (e) {}
}
