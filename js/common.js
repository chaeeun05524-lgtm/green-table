/* 여러 페이지에서 같이 쓰는 도우미 함수들 */

// 번호로 디저트 하나 찾기
function findDessert(id) {
  return DESSERTS.find(function (d) { return d.id === Number(id); });
}

// 분류 기준(장소·감정·시간)으로 묶기 → { '여행에서': [디저트, ...], ... }
function groupBy(key) {
  const groups = {};
  DESSERTS.forEach(function (d) {
    const name = d.groups[key];
    if (!name) return;
    if (!groups[name]) groups[name] = [];
    groups[name].push(d);
  });
  return groups;
}

// 1 → '01'
function pad(n) {
  return String(n).padStart(2, '0');
}

// 가장 최근 날짜 ('2026.10.03' 형식은 글자 순서로 정렬해도 날짜 순서가 맞음)
function latestDate() {
  return DESSERTS.map(function (d) { return d.date; }).sort().pop();
}

// '2026.10.03' → '3 OCT. 2026' (날짜 도장 모양)
function stampDate(dateText) {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const parts = dateText.split('.');
  return Number(parts[2]) + ' ' + months[Number(parts[1]) - 1] + '. ' + parts[0];
}
