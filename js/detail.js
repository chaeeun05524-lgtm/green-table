/* 상세 페이지: 주소의 ?id=번호 를 읽어서 그 디저트를 보여줌 */

const id = new URLSearchParams(location.search).get('id');
const d = findDessert(id);
const main = document.getElementById('detail');
const nav = document.getElementById('detailNav');

if (!d) {
  main.innerHTML = '<p class="mono">그림을 찾을 수 없어요. <a class="red" href="index.html">식탁으로 돌아가기</a></p>';
} else {
  document.title = d.name + ' · 그린 식탁';

  // 확대 원 2개: 같은 그림을 크게 확대해서 일부만 보여줌
  const zooms = (d.zooms || [[35, 35], [65, 65]]).map(function (z, i) {
    return '<figure class="zoom-wrap">' +
             '<div class="zoom" style="background-image:url(' + d.image + ');' +
             'background-position:' + z[0] + '% ' + z[1] + '%"></div>' +
             '<figcaption>디테일 ' + (i + 1) + '</figcaption>' +
           '</figure>';
  }).join('');

  // 그때의 흔적: 사진이 없으면 빈 액자 3개
  let traces = d.traces;
  if (!traces || traces.length === 0) {
    traces = [{ caption: '사진' }, { caption: '영수증' }, { caption: '포장지' }];
  }
  const traceHtml = traces.map(function (t) {
    const inner = t.src
      ? '<img src="' + t.src + '" alt="' + t.caption + '">'
      : '<div class="ph">자리</div>';
    return '<figure class="trace">' + inner + '<figcaption>' + t.caption + '</figcaption></figure>';
  }).join('');

  main.innerHTML =
    '<section class="detail-art">' +
      '<div class="big-num">' + pad(d.id) + '</div>' +
      '<img class="big-img" src="' + d.image + '" alt="' + d.name + '">' +
      '<div class="zooms">' + zooms + '</div>' +
    '</section>' +
    '<section class="detail-text">' +
      '<div class="detail-head">' +
        '<div>' +
          '<h1>' + d.name + '</h1>' +
          '<p class="meta">' + d.en + '  |  ' + joinParts([d.place, d.date, d.who]) + '</p>' +
        '</div>' +
        (d.date ? '<div class="stamp small">' + stampDate(d.date) + '</div>' : '') +
      '</div>' +
      '<h2 class="sec-title">만난 순간</h2>' +
      '<div class="scrap tilt-r"><p class="story">' + (d.story || '<span class="mute">기록 준비 중</span>') + '</p></div>' +
      '<h2 class="sec-title">그때의 흔적</h2>' +
      '<div class="traces">' + traceHtml + '</div>' +
      '<h2 class="sec-title">짧은 정보</h2>' +
      '<div class="scrap tilt-l"><p class="story">' + d.info + '</p></div>' +
    '</section>';

  // 이전 / 다음 (끝에서 넘기면 처음으로)
  const i = DESSERTS.indexOf(d);
  const prev = DESSERTS[(i - 1 + DESSERTS.length) % DESSERTS.length];
  const next = DESSERTS[(i + 1) % DESSERTS.length];

  // 같은 장소에서 만난 것들
  const same = groupBy('장소')[d.groups['장소']].filter(function (x) { return x.id !== d.id; });
  const sameHtml = same.map(function (x) {
    return '<a href="detail.html?id=' + x.id + '">' + pad(x.id) + ' ' + x.name + '</a>';
  }).join(' · ');

  nav.innerHTML =
    '<a href="detail.html?id=' + prev.id + '">← ' + pad(prev.id) + ' ' + prev.name + '</a>' +
    '<span class="links">' + d.groups['장소'] + ' 만난 것들: ' + (sameHtml || '없음') + '</span>' +
    '<a href="detail.html?id=' + next.id + '">' + pad(next.id) + ' ' + next.name + ' →</a>';

  // 종이 넘기는 효과: 들어올 때
  let dir = null;
  try { dir = sessionStorage.getItem('gt-turn'); sessionStorage.removeItem('gt-turn'); } catch (e) {}
  if (dir) main.classList.add('turn-in-' + dir);

  // 넘기고 나서 이동
  function turnTo(url, direction) {
    try { sessionStorage.setItem('gt-turn', direction); } catch (e) {}
    main.classList.add('turn-out-' + direction);
    setTimeout(function () { location.href = url; }, 300);
  }

  const links = nav.querySelectorAll('a');
  links[0].addEventListener('click', function (e) { e.preventDefault(); turnTo(this.href, 'prev'); });
  links[links.length - 1].addEventListener('click', function (e) { e.preventDefault(); turnTo(this.href, 'next'); });

  // 키보드 ← → 로도 넘기기
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') turnTo('detail.html?id=' + prev.id, 'prev');
    if (e.key === 'ArrowRight') turnTo('detail.html?id=' + next.id, 'next');
  });
}
