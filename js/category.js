/* 분류 보기: 탭을 누르면 그 기준으로 디저트를 다시 묶음 */

const tabs = document.querySelectorAll('.tab');
const groupsEl = document.getElementById('groups');

function render(key) {
  // 누른 탭만 빨갛게
  tabs.forEach(function (t) {
    t.classList.toggle('on', t.dataset.key === key);
  });

  const groups = groupBy(key);
  let html = '';

  Object.keys(groups).forEach(function (name) {
    const list = groups[name];
    let items = '';
    list.forEach(function (d, i) {
      if (i > 0) items += '<span class="link-line"></span>'; // 그림 사이 연결선
      items +=
        '<a class="mini" href="detail.html?id=' + d.id + '">' +
          '<img src="' + d.image + '" alt="' + d.name + '">' +
          '<span>' + pad(d.id) + '</span>' +
          '<small>' + d.name + '</small>' +
        '</a>';
    });

    html +=
      '<section class="group">' +
        '<h2>' + name + ' <em>' + list.length + '</em></h2>' +
        '<div class="group-items">' + items + '</div>' +
      '</section>';
  });

  groupsEl.innerHTML = html;
}

tabs.forEach(function (t) {
  t.addEventListener('click', function () { render(t.dataset.key); });
});

render('장소'); // 처음엔 '장소' 기준
