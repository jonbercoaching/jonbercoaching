// 1%코칭클럽 테스트 엔진 — 각 테스트 페이지에서 window.TEST 를 읽어 실행
(function () {
  const SCALE = [
    { t:'전혀 아니다', v:0 }, { t:'가끔 그렇다', v:1 }, { t:'자주 그렇다', v:2 }, { t:'항상 그렇다', v:3 },
  ];
  const T = window.TEST;
  const box = document.getElementById('test-runner');
  let step = 0, answers = [], opts = [];

  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  function top(label) {
    return `<div class="run-top"><div class="run-name">${T.emoji} ${esc(T.title)}</div><div class="run-count">${label}</div></div>`;
  }

  window.startTest = function () {
    step = 0;
    answers = T.type === 'check' ? [] : new Array(T.questions.length).fill(null);
    document.getElementById('test-intro').style.display = 'none';
    box.style.display = '';
    T.type === 'check' ? renderChecklist() : renderQuestion();
    box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  function renderQuestion() {
    const total = T.questions.length;
    const q = T.questions[step];
    const qText = typeof q === 'string' ? q : q.q;
    opts = T.type === 'scale' ? SCALE.map(o => ({ t:o.t, val:o.v })) : q.a.map(o => ({ t:o.t, val:o.k }));
    box.innerHTML = `
      ${top(`${step + 1} / ${total}`)}
      <div class="bar"><i style="width:${step / total * 100}%"></i></div>
      ${step === 0 && T.intro ? `<div class="run-intro">${esc(T.intro)}</div>` : ''}
      <div class="run-q">${esc(qText)}</div>
      <div class="opts">${opts.map((o, i) => `<button class="opt ${answers[step] === o.val ? 'sel' : ''}" data-i="${i}">${esc(o.t)}</button>`).join('')}</div>
      <div class="run-actions"><button class="btn ghost" id="prev-q" ${step === 0 ? 'disabled' : ''}><span class="material-icons-round">chevron_left</span>이전</button></div>`;
    box.querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => answer(+b.dataset.i)));
    document.getElementById('prev-q').addEventListener('click', () => { if (step > 0) { step--; renderQuestion(); } });
  }

  function answer(i) {
    answers[step] = opts[i].val;
    box.querySelectorAll('.opt').forEach((b, j) => b.classList.toggle('sel', j === i));
    setTimeout(() => {
      if (step < T.questions.length - 1) { step++; renderQuestion(); }
      else showResult();
    }, 220);
  }

  function renderChecklist() {
    box.innerHTML = `
      ${top(`<span id="chk-n">0</span>개 선택`)}
      ${T.intro ? `<div class="run-intro">${esc(T.intro)}</div>` : ''}
      <div class="opts check-list">${T.questions.map((q, i) =>
        `<button class="opt" data-i="${i}"><span class="cbox"></span><span>${esc(q)}</span></button>`).join('')}</div>
      <div class="run-actions"><button class="btn primary" id="see-result">결과 보기<span class="material-icons-round">arrow_forward</span></button></div>`;
    box.querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => {
      const i = +b.dataset.i;
      answers = answers.includes(i) ? answers.filter(x => x !== i) : [...answers, i];
      b.classList.toggle('sel');
      document.getElementById('chk-n').textContent = answers.length;
    }));
    document.getElementById('see-result').addEventListener('click', showResult);
  }

  function compute() {
    if (T.type === 'scale') {
      const score = answers.reduce((a, v) => a + (v || 0), 0);
      const pct = Math.round(score / (T.questions.length * 3) * 100);
      return { r: [...T.results].reverse().find(x => pct >= x.min), meter: pct, label: `${pct}점 / 100점` };
    }
    if (T.type === 'check') {
      const n = answers.length;
      return { r: [...T.results].reverse().find(x => n >= x.min), meter: Math.round(n / T.questions.length * 100), label: `${n}개 / ${T.questions.length}개 해당` };
    }
    if (T.type === 'count') {
      const n = answers.filter(a => a === T.key).length;
      return { r: [...T.results].reverse().find(x => n >= x.min), meter: n * 10, label: `에겐 ${100 - n * 10}% · 테토 ${n * 10}%` };
    }
    const cnt = {};
    answers.forEach(a => cnt[a] = (cnt[a] || 0) + 1);
    const top = Object.keys(T.results).sort((a, b) => (cnt[b] || 0) - (cnt[a] || 0))[0];
    return { r: T.results[top], meter: null };
  }

  function showResult() {
    const { r, meter, label } = compute();
    box.innerHTML = `
      ${top('결과')}
      <div class="result">
        <div class="res-label">MY RESULT</div>
        <div class="res-emoji">${r.emoji}</div>
        <div class="res-title">${esc(r.title)}</div>
        <div class="res-sum">${esc(r.summary)}</div>
        ${meter !== null ? `<div class="res-meter"><div class="bar" style="margin:0 0 6px"><i style="width:${meter}%"></i></div><div class="res-meter-l">${label}</div></div>` : ''}
        <div class="res-coach"><img src="coach.jpg" alt=""/><div class="res-desc">${esc(r.desc)}</div></div>
        <div class="res-tips"><h4>1%코치의 마음 처방</h4><ul>${r.tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>
        <div class="run-actions">
          <button class="btn ghost" id="retry"><span class="material-icons-round">replay</span>다시 하기</button>
          <button class="btn primary" id="share"><span class="material-icons-round">share</span>결과 공유</button>
        </div>
        <div class="run-actions" style="margin-top:8px">
          <a class="btn ghost" href="tests.html">다른 테스트 보기</a>
          <a class="btn kakao" href="https://open.kakao.com/me/jonber" target="_blank" rel="noopener">💬 고민 보내기</a>
        </div>
        <div class="res-note">이 테스트는 재미와 자기 이해를 위한 자가점검이며, 의학적 진단이 아닙니다.</div>
      </div>`;
    document.getElementById('retry').addEventListener('click', window.startTest);
    document.getElementById('share').addEventListener('click', () => share(r.title));
    box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function share(resultTitle) {
    const url = location.origin + location.pathname;
    const text = `[1%코칭클럽] ${T.title}\n내 결과: ${resultTitle}\n너도 해봐 👉`;
    if (navigator.share) {
      try { await navigator.share({ title: T.title, text, url }); return; } catch (e) { if (e.name === 'AbortError') return; }
    }
    try { await navigator.clipboard.writeText(text + ' ' + url); window.showSnack('링크가 복사됐어요! 친구에게 붙여넣어 보세요'); }
    catch (e) { window.showSnack(url); }
  }
})();
