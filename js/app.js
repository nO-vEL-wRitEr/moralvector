const AXIS_META = {
  fairness: {
    label: '절차 공정성',
    short: 'F',
    tip: '사람이나 상황이 달라도 비슷한 기준과 절차를 유지하려는 정도입니다.'
  },
  loyalty: {
    label: '선택 충성성',
    short: 'L',
    tip: '가까운 사람과 자기편에게 더 큰 책임과 보호 의무를 느끼는 정도입니다.'
  },
  altruism: {
    label: '보편적 이타성',
    short: 'A',
    tip: '친분과 무관하게 타인의 피해와 복지를 고려하려는 정도입니다.'
  },
  goal: {
    label: '목표 지향성',
    short: 'G',
    tip: '원칙보다 결과와 효율, 성취를 우선하려는 정도입니다.'
  },
  relationalBias: {
    label: '관계 편향도',
    short: 'R',
    tip: '상대가 누구인지에 따라 판단 강도가 얼마나 달라지는지 보여줍니다.'
  },
  consistency: {
    label: '응답 일관성',
    short: 'C',
    tip: '비슷한 질문에서 얼마나 안정적으로 같은 방향의 응답을 했는지 보여줍니다.'
  }
};

let selectedMode = 'casual';
let activeQuestions = [];
let currentIndex = 0;
let answers = [];
let radarInstance = null;
let relationChartInstance = null;
let lastResult = null;
let subjectName = 'SUBJECT #0419';
let pinnedInfoButton = null;

function setMode(mode) {
  selectedMode = mode;
  const cfg = MODE_CONFIGS[mode];
  document.querySelectorAll('.mode-card').forEach((card) => {
    card.classList.toggle('active', card.dataset.mode === mode);
  });
  document.getElementById('mode-title').textContent = `${cfg.label} · ${cfg.ko}`;
  document.getElementById('mode-description').textContent = cfg.description;
}

function show(id) {
  ['welcome-view', 'question-view', 'loading-view', 'result-view'].forEach((viewId) => {
    document.getElementById(viewId).classList.toggle('hidden', viewId !== id);
  });
}

function makeDefaultSubject() {
  return `SUBJECT #${Math.floor(1000 + Math.random() * 9000)}`;
}

function startAssessment() {
  const cfg = MODE_CONFIGS[selectedMode];
  const input = document.getElementById('subject-name');
  subjectName = (input?.value || '').trim() || makeDefaultSubject();
  if (input && !input.value.trim()) input.value = subjectName;

  activeQuestions = cfg.ids.map((id) => STATEMENTS.find((q) => q.id === id)).filter(Boolean);
  answers = new Array(activeQuestions.length).fill(null);
  currentIndex = 0;
  lastResult = null;
  closeShareMenu();
  show('question-view');
  loadQuestion();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function relationLabel(relation) {
  return {
    close: '가까운 사람',
    stranger: '무관한 타인',
    rival: '경쟁자',
    adversary: '나를 해친 사람'
  }[relation] || relation;
}

function loadQuestion() {
  const question = activeQuestions[currentIndex];
  const total = activeQuestions.length;

  document.getElementById('question-count').textContent = `QUESTION ${currentIndex + 1} / ${total}`;
  document.getElementById('top-progress').textContent = `${currentIndex + 1}/${total}`;
  document.getElementById('question-category').textContent = question.category;
  document.getElementById('question-kicker').textContent = question.relation
    ? `RELATION · ${relationLabel(question.relation)}`
    : 'VALUE STATEMENT';
  document.getElementById('question-text').textContent = question.text;
  document.getElementById('progress-bar').style.width = `${((currentIndex + 1) / total) * 100}%`;
  document.getElementById('back-button').style.visibility = currentIndex === 0 ? 'hidden' : 'visible';

  document.querySelectorAll('#likert-options button').forEach((button, index) => {
    button.classList.toggle('selected', answers[currentIndex] === index + 1);
  });
}

function answerQuestion(value) {
  answers[currentIndex] = value;
  if (currentIndex < activeQuestions.length - 1) {
    currentIndex += 1;
    loadQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    finishAssessment();
  }
}

function goBack() {
  if (currentIndex > 0) {
    currentIndex -= 1;
    loadQuestion();
  }
}

function finishAssessment() {
  show('loading-view');
  document.getElementById('top-progress').textContent = 'CALCULATING';
  setTimeout(() => {
    lastResult = calculateResults();
    renderResults(lastResult);
    show('result-view');
    document.getElementById('top-progress').textContent = 'REPORT GENERATED';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 850);
}

function normalizeLikert(value, reverse = false) {
  const score = (value - 1) * 25;
  return reverse ? 100 - score : score;
}

function average(values, fallback = 50) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : fallback;
}

function toTenScale(value) {
  return (value / 10).toFixed(1);
}

function calculateResults() {
  const axisValues = { fairness: [], loyalty: [], altruism: [], goal: [] };
  const relationValues = { close: [], stranger: [], rival: [], adversary: [] };
  const pairValues = {};
  const consistencyGroups = {};

  activeQuestions.forEach((question, index) => {
    const rawAnswer = answers[index] ?? 3;
    const score = normalizeLikert(rawAnswer, question.reverse);

    if (axisValues[question.axis]) axisValues[question.axis].push(score);
    if (question.relation && relationValues[question.relation]) relationValues[question.relation].push(score);

    if (question.pair) {
      pairValues[question.pair] ||= {};
      pairValues[question.pair][question.relation] = score;
    }

    if (question.consistency) {
      consistencyGroups[question.consistency] ||= [];
      consistencyGroups[question.consistency].push(score);
    }
  });

  const axes = Object.fromEntries(
    Object.entries(axisValues).map(([key, values]) => [key, Math.round(average(values))])
  );

  const relationAverages = Object.fromEntries(
    Object.entries(relationValues).map(([key, values]) => [key, Math.round(average(values))])
  );

  const spreads = Object.values(pairValues)
    .map((group) => Object.values(group))
    .filter((values) => values.length >= 2)
    .map((values) => Math.max(...values) - Math.min(...values));

  const relationalBias = spreads.length ? Math.round(average(spreads, 0)) : 0;

  const consistencyDiffs = Object.values(consistencyGroups)
    .filter((values) => values.length >= 2)
    .map((values) => Math.abs(values[0] - values[1]));

  const consistency = consistencyDiffs.length
    ? Math.round(Math.max(0, 100 - average(consistencyDiffs, 0)))
    : 50;

  const archetype = getLegacyArchetype({ ...axes, relationalBias, consistency });

  return {
    ...axes,
    relationalBias,
    consistency,
    relationAverages,
    ...archetype
  };
}

function getLegacyArchetype(scores) {
  const { fairness, altruism, goal, relationalBias, consistency } = scores;

  if (fairness >= 68 && altruism >= 64 && relationalBias <= 35) {
    return {
      theme: 'guardian',
      stampEn: 'UNIVERSAL GUARDIAN',
      title: '보편적 원칙 수호자',
      quote: '"상대방이 누구든 관계없이 보편적 절차와 공정성을 지키려 노력하며, 사적 복수나 통제보다는 법과 공정함을 중시하는 성향."',
      body: '개인적 감정이나 이익 손실에 연연하지 않고, 사회적 규범과 약자에 대한 도덕적 의무를 우선시하는 패턴이 관찰됩니다.'
    };
  }

  if (relationalBias >= 58 && fairness < 58 && altruism < 58) {
    return {
      theme: 'executor',
      stampEn: 'CONTROLLING EXECUTIONER',
      title: '통제형 단죄자',
      quote: '"배신이나 적대적 상황에서 상대의 도덕적 자격을 박탈하고 심리적 통제권을 강하게 확보하려는 보복형 성향."',
      body: '평소에는 조용해 보여도, 적대 대상으로 분류된 상대에게는 보호 기준을 급격히 낮추고 강한 제재 욕구를 드러낼 수 있습니다.'
    };
  }

  if (goal >= 68 && fairness < 62 && consistency >= 56) {
    return {
      theme: 'strategist',
      stampEn: 'COLD STRATEGIST',
      title: '냉철한 전략가',
      quote: '"목표 달성과 기회비용 정밀 계산에 특화되어 있으며, 상대의 심리와 언어를 고도로 활용하는 전략적 성향."',
      body: '도덕적 명분 자체보다 상황 통제력과 실질적 성과를 중요하게 여기며, 판단 과정에서도 효율을 우선시하는 경향이 나타납니다.'
    };
  }

  return {
    theme: 'pragmatist',
    stampEn: 'SELECTIVE PRAGMATIST',
    title: '선택적 실용주의자',
    quote: '"높은 목표 지향성과 관계 기반 차등화를 지녔으며, 상대와의 거리나 맥락에 따라 보호와 판단 기준이 달라지는 선택적 실용주의형."',
    body: '모든 대상을 동일하게 다루기보다는 관계성과 실질적 결과를 함께 고려해 유연하게 기준을 조정하는 패턴이 관찰됩니다.'
  };
}

function scoreBand(score) {
  if (score >= 75) return '높음';
  if (score >= 55) return '중간';
  return '낮음';
}

function relationDescriptor(result) {
  return {
    close: result.loyalty >= 65 ? '충성심 & 책임감' : '거리 유지 & 원칙',
    stranger: result.altruism >= 65 ? '저비용 이타성' : '선별적 개입',
    rival: result.goal >= 65 ? '심리전 & 우월감' : '정당 경쟁 선호',
    adversary: result.relationalBias >= 55 ? '보복 & 도덕적 배제' : '감정 절제 & 원칙 유지'
  };
}

function buildInsights(result) {
  return [
    {
      title: '판단 기준의 핵심',
      body: result.fairness >= 65
        ? '비슷한 상황이라면 상대가 누구든 일정한 기준을 유지하려는 경향이 비교적 강합니다.'
        : '상황의 맥락과 관계의 무게를 함께 고려해 기준을 조정하는 편입니다.'
    },
    {
      title: '관계와 충성의 비중',
      body: result.loyalty >= 65
        ? '가까운 사람일수록 더 큰 보호와 책임을 느끼는 경향이 두드러집니다.'
        : '친분이 있더라도 판단 기준이 크게 흔들리지 않도록 거리를 두는 편입니다.'
    },
    {
      title: '성과 vs 원칙',
      body: result.goal >= 65
        ? '과정이 다소 불편하더라도 결과와 실효성을 확보하는 쪽에 무게를 둡니다.'
        : '성과보다 과정의 정당성과 원칙의 유지에 더 높은 가치를 두는 편입니다.'
    },
    {
      title: '관계 편향 신호',
      body: result.relationalBias >= 50
        ? '동일한 행위라도 상대에 따라 판단 강도가 꽤 크게 달라지는 패턴이 나타났습니다.'
        : '대상이 달라져도 판단 강도의 차이가 비교적 작게 유지되는 편입니다.'
    }
  ];
}

function renderResults(result) {
  const resultView = document.getElementById('result-view');
  resultView.dataset.theme = result.theme;

  document.getElementById('res-metadata-name').textContent = subjectName;
  document.getElementById('res-metadata-archetype').textContent = result.title;
  document.getElementById('res-metadata-goal').textContent = `RATING: ${toTenScale(result.goal)}/10`;
  document.getElementById('res-metadata-bias').textContent = `RATING: ${toTenScale(result.relationalBias)}/10`;
  document.getElementById('result-archetype-stamp').innerHTML = `${result.stampEn}<span>${result.title}</span>`;
  document.getElementById('res-summary-quote').textContent = result.quote;
  document.getElementById('res-summary-body').textContent = result.body;

  const matrix = relationDescriptor(result);
  document.getElementById('res-matrix-colleague').textContent = matrix.close;
  document.getElementById('res-matrix-stranger').textContent = matrix.stranger;
  document.getElementById('res-matrix-rival').textContent = matrix.rival;
  document.getElementById('res-matrix-enemy').textContent = matrix.adversary;

  const scoreRows = [
    ['fairness', result.fairness],
    ['loyalty', result.loyalty],
    ['altruism', result.altruism],
    ['goal', result.goal],
    ['relationalBias', result.relationalBias],
    ['consistency', result.consistency]
  ];

  document.getElementById('score-list').innerHTML = scoreRows.map(([key, value]) => {
    const meta = AXIS_META[key];
    return `
      <div class="score-row">
        <div class="score-row-header">
          <strong>${meta.label}</strong>
          <button type="button" class="info-btn" data-tip="${meta.tip}">i</button>
        </div>
        <b>${value}</b>
        <small>${scoreBand(value)}</small>
        <div class="score-bar"><span style="width:${value}%"></span></div>
      </div>
    `;
  }).join('');

  document.getElementById('insight-list').innerHTML = buildInsights(result).map((item) => `
    <div class="insight">
      <b>${item.title}</b>
      <p>${item.body}</p>
    </div>
  `).join('');

  closeShareMenu();
  renderRadar(result);
  renderRelationChart(result.relationAverages);
}

function renderRadar(result) {
  const ctx = document.getElementById('radar-chart');
  if (radarInstance) radarInstance.destroy();

  radarInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['공정성', '관계 충성', '이타성', '목표 지향', '관계 편향', '응답 일관성'],
      datasets: [{
        data: [result.fairness, result.loyalty, result.altruism, result.goal, result.relationalBias, result.consistency],
        borderColor: '#ff4040',
        backgroundColor: 'rgba(255,64,64,.18)',
        pointBackgroundColor: '#8ff3ff',
        pointBorderColor: '#ffffff',
        pointRadius: 4,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { display: false },
          grid: { color: 'rgba(255,255,255,.11)' },
          angleLines: { color: 'rgba(255,255,255,.11)' },
          pointLabels: { color: '#d7e2f5', font: { family: 'Noto Sans KR', size: 12 } }
        }
      },
      plugins: { legend: { display: false } }
    }
  });
}

function renderRelationChart(averages) {
  const ctx = document.getElementById('relation-chart');
  if (relationChartInstance) relationChartInstance.destroy();

  relationChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['동료/내 사람', '무관한 타인', '경쟁자', '원수/해를 입힌 자'],
      datasets: [{
        data: [averages.close, averages.stranger, averages.rival, averages.adversary],
        borderColor: '#ff4040',
        backgroundColor: 'rgba(255,64,64,.12)',
        fill: true,
        tension: 0.32,
        pointRadius: 5,
        pointBackgroundColor: ['#31d8ff', '#d9e4ff', '#f7b955', '#ff4040'],
        pointBorderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0,
          max: 100,
          grid: { color: 'rgba(255,255,255,.08)' },
          ticks: { color: '#9fb0c9' }
        },
        x: {
          grid: { color: 'rgba(255,255,255,.08)' },
          ticks: { color: '#dbe7fb', font: { family: 'Noto Sans KR', size: 11 } }
        }
      },
      plugins: { legend: { display: false } }
    }
  });
}

function toggleShareMenu() {
  const menu = document.getElementById('share-menu');
  const button = document.getElementById('share-toggle-btn');
  const isHidden = menu.classList.contains('hidden');
  menu.classList.toggle('hidden', !isHidden);
  button.textContent = isHidden ? '공유 옵션 닫기' : '공유하기';
}

function closeShareMenu() {
  const menu = document.getElementById('share-menu');
  const button = document.getElementById('share-toggle-btn');
  if (menu) menu.classList.add('hidden');
  if (button) button.textContent = '공유하기';
}

async function shareResult() {
  if (!lastResult) return;
  const text = `내 MoralVector 결과는 '${lastResult.title}'! 공정성 ${lastResult.fairness}, 관계 충성 ${lastResult.loyalty}, 이타성 ${lastResult.altruism}, 목표 지향 ${lastResult.goal}. 너도 해봐.`;
  await sharePayload(text);
}

async function shareTest() {
  await sharePayload('짧은 문장으로 보는 도덕 판단 성향 테스트 MoralVector. 너는 어떤 결과가 나오는지 해봐!');
}

async function sharePayload(text) {
  const url = location.href.split('#')[0];
  const data = { title: 'MoralVector', text, url };
  try {
    if (navigator.share) await navigator.share(data);
    else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      status('공유 문구를 복사했어요.');
    }
  } catch (error) {
    if (error.name !== 'AbortError') status('공유에 실패했어요.');
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(location.href.split('#')[0]);
    status('링크를 복사했어요.');
  } catch {
    status('링크 복사에 실패했어요.');
  }
}

function printReport() {
  window.print();
}

function status(text) {
  const node = document.getElementById('share-status');
  node.textContent = text;
  setTimeout(() => { node.textContent = ''; }, 1800);
}

function restartAssessment() {
  closeShareMenu();
  show('welcome-view');
  document.getElementById('top-progress').textContent = 'READY';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function positionPopover(button) {
  const popover = document.getElementById('info-popover');
  const rect = button.getBoundingClientRect();
  const gap = 10;
  let left = rect.left + rect.width / 2 - popover.offsetWidth / 2;
  left = Math.max(12, Math.min(left, window.innerWidth - popover.offsetWidth - 12));
  let top = rect.bottom + gap;
  if (top + popover.offsetHeight > window.innerHeight - 12) {
    top = rect.top - popover.offsetHeight - gap;
  }
  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;
}

function showInfo(button, pinned = false) {
  const popover = document.getElementById('info-popover');
  popover.textContent = button.dataset.tip || '';
  popover.setAttribute('aria-hidden', 'false');
  popover.classList.add('show');
  positionPopover(button);
  if (pinned) pinnedInfoButton = button;
}

function hideInfo(force = false) {
  if (pinnedInfoButton && !force) return;
  if (force) pinnedInfoButton = null;
  const popover = document.getElementById('info-popover');
  popover.classList.remove('show');
  popover.setAttribute('aria-hidden', 'true');
}

function bindInfoPopover() {
  document.addEventListener('mouseover', (event) => {
    if (pinnedInfoButton) return;
    const button = event.target.closest('.info-btn');
    if (button) showInfo(button, false);
  });

  document.addEventListener('mouseout', (event) => {
    if (pinnedInfoButton) return;
    const button = event.target.closest('.info-btn');
    if (button && !button.contains(event.relatedTarget)) hideInfo(true);
  });

  document.addEventListener('focusin', (event) => {
    const button = event.target.closest('.info-btn');
    if (button) showInfo(button, false);
  });

  document.addEventListener('focusout', (event) => {
    const button = event.target.closest('.info-btn');
    if (button && !pinnedInfoButton) hideInfo(true);
  });

  document.addEventListener('click', (event) => {
    const button = event.target.closest('.info-btn');
    if (button) {
      event.preventDefault();
      event.stopPropagation();
      if (pinnedInfoButton === button) {
        pinnedInfoButton = null;
        hideInfo(true);
      } else {
        pinnedInfoButton = button;
        showInfo(button, true);
      }
      return;
    }
    if (!event.target.closest('#info-popover')) hideInfo(true);
  });

  window.addEventListener('resize', () => {
    if (pinnedInfoButton) showInfo(pinnedInfoButton, true);
  });

  window.addEventListener('scroll', () => {
    if (pinnedInfoButton) showInfo(pinnedInfoButton, true);
  }, true);
}

document.addEventListener('DOMContentLoaded', () => {
  setMode(selectedMode);
  bindInfoPopover();
});