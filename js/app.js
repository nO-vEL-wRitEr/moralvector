(() => {
  'use strict';

  const allDilemmas = [
    ...(window.MORALVECTOR_DILEMMAS_1 || []),
    ...(window.MORALVECTOR_DILEMMAS_2 || []),
    ...(window.MORALVECTOR_DILEMMAS_3 || []),
    ...(window.MORALVECTOR_DILEMMAS_4 || [])
  ].sort((a, b) => a.id - b.id);

  const SCORE_KEYS = [
    'cognitiveEmpathy', 'affectiveEmpathy', 'goalOrientation', 'selectiveLoyalty',
    'universalAltruism', 'lowCostAltruism', 'instrumentalRel', 'machiavellianism',
    'bystanderSadism', 'competitorSadism', 'enemySadism', 'needForControl',
    'proceduralFairness', 'moralExclusion'
  ];

  const spectrumMap = [
    { key: 'cognitiveEmpathy', label: '인지적 공감', tone: 'cyan' },
    { key: 'affectiveEmpathy', label: '정서적 공감', tone: 'red' },
    { key: 'goalOrientation', label: '목표 지향성', tone: 'amber' },
    { key: 'selectiveLoyalty', label: '선택적 충성심', tone: '' },
    { key: 'universalAltruism', label: '보편적 이타성', tone: 'red' },
    { key: 'lowCostAltruism', label: '저비용 이타성', tone: 'cyan' },
    { key: 'instrumentalRel', label: '도구적 인간관계', tone: 'amber' },
    { key: 'machiavellianism', label: '마키아벨리즘', tone: 'amber' },
    { key: 'bystanderSadism', label: '무관한 타인 가학성', tone: '' },
    { key: 'competitorSadism', label: '경쟁자 대상 가학성', tone: 'amber' },
    { key: 'enemySadism', label: '원수 대상 가학/보복성', tone: 'red' },
    { key: 'needForControl', label: '통제 욕구', tone: 'cyan' },
    { key: 'proceduralFairness', label: '절차적 공정성', tone: 'red' },
    { key: 'moralExclusion', label: '도덕적 배제 위험성', tone: 'red' }
  ];

  let activeDilemmas = [];
  let currentDilemmaIndex = 0;
  let userSubjectName = 'SUBJECT #0419';
  let totalScores = {};
  let counts = {};
  let radarChartInstance = null;
  let sadismChartInstance = null;

  const $ = (id) => document.getElementById(id);

  function resetScoreState() {
    totalScores = {};
    counts = {};
    SCORE_KEYS.forEach((key) => {
      totalScores[key] = key === 'bystanderSadism' ? 2 : 5;
      counts[key] = 1;
    });
  }

  function shuffle(items) {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function relationGroup(item) {
    if (item.targetType.includes('동료') || item.targetType.includes('내 사람')) return 'inner';
    if (item.targetType.includes('무관한')) return 'stranger';
    if (item.targetType.includes('경쟁자')) return 'rival';
    if (item.targetType.includes('원수') || item.targetType.includes('배신자')) return 'enemy';
    return 'system';
  }

  function selectDiverseScenarios(count) {
    if (count >= allDilemmas.length) return [...allDilemmas];

    const buckets = { inner: [], stranger: [], rival: [], enemy: [], system: [] };
    allDilemmas.forEach((item) => buckets[relationGroup(item)].push(item));
    Object.keys(buckets).forEach((key) => { buckets[key] = shuffle(buckets[key]); });

    const order = shuffle(Object.keys(buckets));
    const selected = [];
    let cursor = 0;
    while (selected.length < count) {
      const key = order[cursor % order.length];
      const item = buckets[key].shift();
      if (item) selected.push(item);
      cursor += 1;
      if (cursor > 1000) break;
    }
    return shuffle(selected);
  }

  function startAssessment() {
    if (!allDilemmas.length) {
      console.error('MoralVector dataset failed to load.');
      alert('문항 데이터를 불러오지 못했습니다. 페이지를 새로고침해 주세요.');
      return;
    }

    resetScoreState();
    const inputName = $('subject-name').value.trim();
    userSubjectName = inputName || 'SUBJECT #0419';
    const selectedCount = Math.min(allDilemmas.length, parseInt($('question-count-select').value, 10) || 20);
    activeDilemmas = selectDiverseScenarios(selectedCount);
    currentDilemmaIndex = 0;

    $('welcome-view').classList.add('hidden');
    $('result-view').classList.add('hidden');
    $('loading-view').classList.add('hidden');
    $('question-view').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadScenario(0);
  }

  function loadScenario(index) {
    const dilemma = activeDilemmas[index];
    if (!dilemma) return;

    const progressPercent = Math.round(((index + 1) / activeDilemmas.length) * 100);
    $('question-tracker').innerText = `SCENARIO ${index + 1} OF ${activeDilemmas.length}`;
    $('top-progress-text').innerText = `${progressPercent}%`;
    $('question-progress-text').innerText = `${progressPercent}% COMPLETE`;
    $('bottom-next-indicator').innerText = index + 1 < activeDilemmas.length ? `SCENARIO ${index + 2} →` : 'FINALIZE →';
    $('progress-bar-inner').style.width = `${progressPercent}%`;

    $('target-relation-text').innerText = `TARGET: ${dilemma.targetType}`;
    const badgeColor = dilemma.targetBadgeColor || 'text-gray-400';
    $('target-relation-text-color').className = badgeColor;
    $('scenario-code').innerText = dilemma.code || `SITUATION #${String(dilemma.id).padStart(2, '0')}`;
    $('scenario-title').innerText = dilemma.title;
    $('scenario-desc').innerText = dilemma.description;

    const optionsContainer = $('options-container');
    optionsContainer.innerHTML = '';
    dilemma.options.forEach((opt, optIdx) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'option-card';
      button.setAttribute('aria-label', `선택 ${optIdx + 1}: ${opt.text}`);
      button.innerHTML = `
        <span class="option-number">${String(optIdx + 1).padStart(2, '0')}</span>
        <span class="option-text"></span>
        <span class="option-arrow">→</span>
      `;
      button.querySelector('.option-text').textContent = opt.text;
      button.addEventListener('click', () => selectOption(opt.scores));
      optionsContainer.appendChild(button);
    });
  }

  function selectOption(scores) {
    Object.entries(scores || {}).forEach(([key, value]) => {
      if (Object.prototype.hasOwnProperty.call(totalScores, key)) {
        totalScores[key] += Number(value) || 0;
        counts[key] += 1;
      }
    });

    currentDilemmaIndex += 1;
    if (currentDilemmaIndex < activeDilemmas.length) {
      loadScenario(currentDilemmaIndex);
    } else {
      showLoadingAndCalculate();
    }
  }

  function showLoadingAndCalculate() {
    $('question-view').classList.add('hidden');
    $('loading-view').classList.remove('hidden');
    $('top-progress-text').innerText = 'ANALYZING';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    window.setTimeout(() => {
      $('loading-view').classList.add('hidden');
      $('result-view').classList.remove('hidden');
      $('top-progress-text').innerText = 'REPORT GENERATED';
      renderResults();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1250);
  }

  function calculateFinalScores() {
    const finalScores = {};
    SCORE_KEYS.forEach((key) => {
      finalScores[key] = Math.min(10, Math.max(1, Math.round(totalScores[key] / counts[key])));
    });
    return finalScores;
  }

  function getArchetype(scores) {
    if (scores.universalAltruism >= 7 && scores.proceduralFairness >= 7) {
      return {
        title: '보편적 원칙 수호자', sub: 'UNIVERSAL GUARDIAN',
        quote: '관계의 친밀도보다 일관된 절차와 보편적 기준을 우선하는 원칙 중심형.',
        body: '개인적인 호감·반감이 판단을 완전히 지배하지 않도록 통제하며, 타인에 대한 보호 기준을 비교적 넓게 유지하는 패턴이 나타났습니다.'
      };
    }
    if (scores.machiavellianism >= 8 && scores.goalOrientation >= 7) {
      return {
        title: '냉철한 전략가', sub: 'COLD STRATEGIST',
        quote: '성과와 통제 가능성을 빠르게 계산하고, 관계와 규칙을 전략 변수로 다루는 목표 중심형.',
        body: '상황의 감정적 의미보다 결과와 기회비용을 먼저 읽는 경향이 강합니다. 높은 인지적 공감이 함께 나타나면 타인의 반응을 예측하는 능력이 전략적으로 활용될 수 있습니다.'
      };
    }
    if (scores.goalOrientation >= 7 && scores.enemySadism >= 7) {
      return {
        title: '선택적 실용주의자', sub: 'SELECTIVE PRAGMATIST',
        quote: '관계의 거리와 상대의 행동에 따라 보호·협력 기준이 크게 달라지는 선택적 실용주의형.',
        body: '모든 대상을 같은 규칙으로 처리하기보다 관계성과 손익을 함께 계산합니다. 특히 적대 관계에서는 평소보다 보복성·통제 욕구가 빠르게 상승할 수 있습니다.'
      };
    }
    if (scores.enemySadism >= 8 && scores.moralExclusion >= 8) {
      return {
        title: '보복적 통제자', sub: 'RETALIATORY CONTROLLER',
        quote: '적대 대상으로 규정한 상대에게 도덕적 보호를 크게 축소하고 직접적인 통제권을 확보하려는 유형.',
        body: '평상시 판단과 적대 상황의 판단 사이 간극이 크게 나타납니다. 이 결과는 실제 행동을 예측하는 임상 진단이 아니라 가상 딜레마에서의 선택 패턴을 요약한 것입니다.'
      };
    }
    return {
      title: '맥락적 균형형', sub: 'CONTEXTUAL BALANCER',
      quote: '한 가지 원칙에 고정되기보다 관계, 비용, 공정성, 결과를 함께 비교하는 혼합형.',
      body: '특정 축이 압도적으로 지배하지 않고 상황별로 판단 기준을 조정하는 패턴이 나타났습니다. 세부 스펙트럼과 관계별 변화량을 함께 보는 것이 더 유용합니다.'
    };
  }

  function relationLabel(value, high, middle, low) {
    if (value >= 7) return high;
    if (value <= 3) return low;
    return middle;
  }

  function renderResults() {
    const scores = calculateFinalScores();
    const archetype = getArchetype(scores);

    $('res-metadata-name').innerText = userSubjectName;
    $('res-metadata-archetype').innerText = archetype.title;
    $('res-metadata-goal').innerText = `RATING: ${scores.goalOrientation}/10`;
    $('res-metadata-sadism').innerText = `RATING: ${scores.enemySadism}/10`;
    $('result-archetype-stamp').innerHTML = `${archetype.sub}<br><small>${archetype.title}</small>`;
    $('res-summary-quote').innerText = `“${archetype.quote}”`;
    $('res-summary-body').innerText = archetype.body;

    $('res-matrix-colleague').innerText = relationLabel(scores.selectiveLoyalty, '강한 충성·보호', '선택적 협력', '관계보다 원칙/목표');
    $('res-matrix-stranger').innerText = relationLabel(scores.universalAltruism, '보편적 보호', '저비용 중심 배려', '낮은 개입 성향');
    $('res-matrix-rival').innerText = relationLabel(scores.competitorSadism, '강한 경쟁 우월감', '전략적 경쟁', '공정경쟁 선호');
    $('res-matrix-enemy').innerText = relationLabel(scores.enemySadism, '강한 보복 반응', '조건부 단죄', '감정·절차 분리');

    renderSpectrumBars(scores);
    renderRadarChart(scores);
    renderSadismChart(scores);
  }

  function renderSpectrumBars(scores) {
    const container = $('spectrum-bars-container');
    container.innerHTML = '';
    spectrumMap.forEach((item) => {
      const value = scores[item.key] ?? 5;
      const wrapper = document.createElement('div');
      wrapper.className = 'spectrum-row';
      wrapper.innerHTML = `
        <div class="spectrum-row__top"><span></span><strong>${value} / 10</strong></div>
        <div class="spectrum-track"><div class="spectrum-fill ${item.tone}" style="width:${value * 10}%"></div></div>
      `;
      wrapper.querySelector('.spectrum-row__top span').textContent = item.label;
      container.appendChild(wrapper);
    });
  }

  function renderRadarChart(scores) {
    const canvas = $('radarChartCanvas');
    if (!canvas || typeof Chart === 'undefined') return;
    if (radarChartInstance) radarChartInstance.destroy();

    radarChartInstance = new Chart(canvas.getContext('2d'), {
      type: 'radar',
      data: {
        labels: ['인지공감', '목표지향', '선택충성', '저비용이타', '도구관계', '마키아벨리', '원수가학', '통제욕구', '절차공정', '정서공감'],
        datasets: [{
          data: [scores.cognitiveEmpathy, scores.goalOrientation, scores.selectiveLoyalty, scores.lowCostAltruism, scores.instrumentalRel, scores.machiavellianism, scores.enemySadism, scores.needForControl, scores.proceduralFairness, scores.affectiveEmpathy],
          backgroundColor: 'rgba(226,59,67,.14)',
          borderColor: '#e23b43',
          borderWidth: 1.6,
          pointRadius: 2.8,
          pointHoverRadius: 4,
          pointBackgroundColor: '#e23b43',
          pointBorderColor: '#0a0b0e'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            min: 0, max: 10, beginAtZero: true,
            angleLines: { color: 'rgba(255,255,255,.075)' },
            grid: { color: 'rgba(255,255,255,.075)' },
            pointLabels: { color: '#858c98', font: { size: 10, family: 'Noto Sans KR' } },
            ticks: { display: false, stepSize: 2 }
          }
        },
        plugins: { legend: { display: false }, tooltip: { displayColors: false } }
      }
    });
  }

  function renderSadismChart(scores) {
    const canvas = $('sadismChartCanvas');
    if (!canvas || typeof Chart === 'undefined') return;
    if (sadismChartInstance) sadismChartInstance.destroy();

    sadismChartInstance = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: ['무관한 타인', '경쟁자', '원수 / 배신자'],
        datasets: [{
          data: [scores.bystanderSadism, scores.competitorSadism, scores.enemySadism],
          borderColor: '#e23b43',
          backgroundColor: 'rgba(226,59,67,.08)',
          fill: true,
          tension: .25,
          pointRadius: 4,
          pointHoverRadius: 5,
          pointBackgroundColor: '#e23b43',
          pointBorderColor: '#11141a'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { min: 0, max: 10, ticks: { stepSize: 2, color: '#59616e', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,.055)' }, border: { display: false } },
          x: { ticks: { color: '#7e8693', font: { size: 9, family: 'Noto Sans KR' } }, grid: { display: false }, border: { color: '#2b303a' } }
        },
        plugins: { legend: { display: false }, tooltip: { displayColors: false } }
      }
    });
  }

  function restartAssessment() {
    resetScoreState();
    activeDilemmas = [];
    currentDilemmaIndex = 0;
    $('result-view').classList.add('hidden');
    $('question-view').classList.add('hidden');
    $('loading-view').classList.add('hidden');
    $('welcome-view').classList.remove('hidden');
    $('top-progress-text').innerText = 'READY';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetScoreState();
  window.startAssessment = startAssessment;
  window.restartAssessment = restartAssessment;

  console.info(`[MoralVector] ${allDilemmas.length} scenarios loaded.`);
})();
