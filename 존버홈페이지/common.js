// 1%코칭클럽 공통 스크립트
(function () {
  var snackTimer;
  window.showSnack = function (msg) {
    var el = document.getElementById('snackbar');
    if (!el) return;
    el.textContent = msg; el.classList.add('show');
    clearTimeout(snackTimer); snackTimer = setTimeout(function () { el.classList.remove('show'); }, 2600);
  };
  // 섹션 페이지 탭 필터
  var chips = document.querySelector('[data-filter]');
  if (chips) {
    chips.addEventListener('click', function (ev) {
      var b = ev.target.closest('.chip'); if (!b) return;
      chips.querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('active', c === b); });
      var tab = b.dataset.tab;
      document.querySelectorAll('#filter-list .list-item').forEach(function (it) {
        it.classList.toggle('hide', tab !== 'all' && it.dataset.tab !== tab);
      });
    });
  }
})();
