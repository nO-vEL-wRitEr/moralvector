function mvClamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

const LEGACY_SPECTRUM_META = {
  cognitiveEmpathy: {
    label: '인지공감',
    tip: '타인의 입장과 손익을 인지적으로 고려하는 경향을 이타성·공정성·일관성 응답에서 조합한 합성지표입니다.'
  },
  goalOrientation: {
    label: '목표지향',
    tip: '성과와 결과 달성을 얼마나 우선하는지 보여주는 기초 목표지향 축입니다.'
  },
  selectiveLoyalty: {
    label: '선택충성',
    tip: '가까운 사람과 자기편에 더 큰 책임과 보호를 부여하는 경향입니다.'
  },
  lowCostAltruism: {
    label: '저비용이타',
    tip: '큰 희생이 요구되지 않는 상황에서 타인을 돕고 피해를 줄이려는 경향을 나타냅니다.'
  },
  instrumentalRelation: {
    label: '도구관계',
    tip: '관계를 원칙 자체보다 목표·효율·상황 통제의 수단으로 보는 경향을 여러 기초축에서 조합한 합성지표입니다.'
  },
  machiavellianism: {
    label: '마키아벨리',
    tip: '목표·관계 편향·절차 공정성의 조합으로 만든 전략적 수단성 지표입니다. 임상적 성격 진단이 아닙니다.'
  },
  enemySadism: {
    label: '원수가학',
    tip: '적대 대상으로 분류된 상대에게 제재나 보복 방향의 반응이 얼마나 강화되는지를 나타내는 연출용 합성지표입니다. 실제 가학성 진단이 아닙니다.'
  },
  controlUrge: {
    label: '통제욕구',
    tip: '상황과 상대에 대한 통제·규율 선호를 관계 편향, 목표지향, 공정성 응답에서 조합한 합성지표입니다.'
  },
  proceduralFairness: {
    label: '절차공정',
    tip: '상대나 맥락이 달라도 유사한 절차와 기준을 적용하려는 경향입니다.'
  },
  emotionalEmpathy: {
    label: '정서공감',
    tip: '타인의 피해를 정서적으로 고려하는 방향을 이타성과 낮은 관계 편향에서 조합한 합성지표입니다.'
  }
};

function buildLegacySpectrum(result) {
  return {
    cognitiveEmpathy: Math.round(mvClamp(result.altruism * 0.55 + result.fairness * 0.25 + result.consistency * 0.20)),
    goalOrientation: result.goal,
    selectiveLoyalty: result.loyalty,
    lowCostAltruism: result.altruism,
    instrumentalRelation: Math.round(mvClamp(result.goal * 0.45 + result.relationalBias * 0.35 + (100 - result.fairness) * 0.20)),
    machiavellianism: Math.round(mvClamp(result.goal * 0.35 + result.relationalBias * 0.35 + (100 - result.fairness) * 0.30)),
    enemySadism: Math.round(mvClamp(result.relationalBias * 0.55 + result.goal * 0.15 + (100 - result.altruism) * 0.30)),
    controlUrge: Math.round(mvClamp(result.relationalBias * 0.40 + result.goal * 0.25 + (100 - result.fairness) * 0.35)),
    proceduralFairness: result.fairness,
    emotionalEmpathy: Math.round(mvClamp(result.altruism * 0.70 + (100 - result.relationalBias) * 0.30))
  };
}

function renderRadar(result) {
  const ctx = document.getElementById('radar-chart');
  if (radarInstance) radarInstance.destroy();

  const spectrum = buildLegacySpectrum(result);

  radarInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['인지공감','목표지향','선택충성','저비용이타','도구관계','마키아벨리','원수가학','통제욕구','절차공정','정서공감'],
      datasets: [{
        data: [
          spectrum.cognitiveEmpathy,
          spectrum.goalOrientation,
          spectrum.selectiveLoyalty,
          spectrum.lowCostAltruism,
          spectrum.instrumentalRelation,
          spectrum.machiavellianism,
          spectrum.enemySadism,
          spectrum.controlUrge,
          spectrum.proceduralFairness,
          spectrum.emotionalEmpathy
        ],
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
          pointLabels: { color: '#aeb8ca', font: { family: 'Noto Sans KR', size: 11 } }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (context) => ` 합성지표 ${context.raw}` } }
      }
    }
  });
}

function buildLegacyRevengeSwitch(averages) {
  const stranger = mvClamp((100 - averages.stranger) * 0.34, 0, 100) / 10;
  const rival = mvClamp((100 - averages.rival) * 0.42 + 10, 0, 100) / 10;
  const adversary = mvClamp((100 - averages.adversary) * 0.52 + 18, 0, 100) / 10;
  return [stranger, rival, adversary].map((value) => Number(value.toFixed(1)));
}

function renderRelationChart(averages) {
  const ctx = document.getElementById('relation-chart');
  if (relationChartInstance) relationChartInstance.destroy();

  const switchValues = buildLegacyRevengeSwitch(averages);

  relationChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['무관한 타인', '경쟁자', '원수 / 배신자'],
      datasets: [{
        data: switchValues,
        borderColor: '#ff4040',
        backgroundColor: 'rgba(255,64,64,.12)',
        fill: true,
        tension: 0.12,
        pointRadius: 6,
        pointHoverRadius: 7,
        pointBackgroundColor: ['#35d399', '#f59e0b', '#ef4444'],
        pointBorderColor: '#ffffff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0,
          max: 10,
          ticks: { stepSize: 1, color: '#9fb0c9' },
          grid: { color: 'rgba(255,255,255,.08)' }
        },
        x: {
          grid: { color: 'rgba(255,255,255,.08)' },
          ticks: { color: '#dbe7fb', font: { family: 'Noto Sans KR', size: 11 } }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (context) => ` 스위치 강도 ${context.raw}/10` } }
      }
    }
  });
}

function renderLegacyScoreBreakdown(result) {
  const spectrum = buildLegacySpectrum(result);
  const order = [
    'cognitiveEmpathy','goalOrientation','selectiveLoyalty','lowCostAltruism','instrumentalRelation',
    'machiavellianism','enemySadism','controlUrge','proceduralFairness','emotionalEmpathy'
  ];

  const list = document.getElementById('score-list');
  if (!list) return;

  list.innerHTML = order.map((key) => {
    const meta = LEGACY_SPECTRUM_META[key];
    const value = spectrum[key];
    const band = typeof scoreBand === 'function' ? scoreBand(value) : (value >= 75 ? '높음' : value >= 55 ? '중간' : '낮음');
    return `
      <div class="score-row">
        <div class="score-row-header">
          <strong>${meta.label}</strong>
          <span class="synth-badge">SYNTH</span>
          <button type="button" class="info-btn" data-tip="${meta.tip}">i</button>
        </div>
        <b>${value}</b>
        <small>${band}</small>
        <div class="score-bar"><span style="width:${value}%"></span></div>
      </div>
    `;
  }).join('');
}

function axisEvidenceLabel(question) {
  const map = {
    fairness: '절차 공정성',
    loyalty: '선택 충성성',
    altruism: '보편적 이타성',
    goal: '목표 지향성'
  };
  return map[question.axis] || question.category || '기초축';
}

function answerEvidenceLabel(value) {
  return {
    1: '전혀 아니다',
    2: '아니다',
    3: '보통이다',
    4: '그렇다',
    5: '매우 그렇다'
  }[value] || String(value);
}

function buildArchetypeRuleText(result) {
  if (result.theme === 'guardian') {
    return `보편적 원칙 수호자 조건: 절차 공정성 ≥ 68, 보편적 이타성 ≥ 64, 관계 편향도 ≤ 35. 현재 값은 공정성 ${result.fairness}, 이타성 ${result.altruism}, 관계 편향 ${result.relationalBias}로 이 조건을 충족했습니다.`;
  }
  if (result.theme === 'executor') {
    return `통제형 단죄자 조건: 관계 편향도 ≥ 58, 절차 공정성 < 58, 보편적 이타성 < 58. 현재 값은 관계 편향 ${result.relationalBias}, 공정성 ${result.fairness}, 이타성 ${result.altruism}로 이 조건을 충족했습니다.`;
  }
  if (result.theme === 'strategist') {
    return `냉철한 전략가 조건: 목표 지향성 ≥ 68, 절차 공정성 < 62, 응답 일관성 ≥ 56. 현재 값은 목표 지향 ${result.goal}, 공정성 ${result.fairness}, 일관성 ${result.consistency}로 이 조건을 충족했습니다.`;
  }
  return `선택적 실용주의자는 다른 극단 유형의 임계조건을 단독으로 충족하지 않을 때 적용되는 기본 분류입니다. 현재 기초축은 공정성 ${result.fairness}, 선택 충성 ${result.loyalty}, 이타성 ${result.altruism}, 목표 지향 ${result.goal}, 관계 편향 ${result.relationalBias}, 일관성 ${result.consistency}입니다.`;
}

function buildAnswerEvidence() {
  if (!Array.isArray(activeQuestions) || !Array.isArray(answers)) return [];

  const candidates = activeQuestions.map((question, index) => {
    const value = answers[index] ?? 3;
    return {
      question,
      value,
      strength: Math.abs(value - 3),
      index
    };
  });

  const strong = candidates
    .filter((item) => item.strength > 0)
    .sort((a, b) => b.strength - a.strength || a.index - b.index)
    .slice(0, 6);

  return strong.length ? strong : candidates.slice(0, 4);
}

function renderEvidencePanel(result) {
  const rule = document.getElementById('evidence-rule');
  const list = document.getElementById('evidence-list');
  if (!rule || !list) return;

  rule.textContent = buildArchetypeRuleText(result);

  const evidence = buildAnswerEvidence();
  list.innerHTML = evidence.map((item, index) => {
    const q = item.question;
    const relation = q.relation ? ` · 대상: ${typeof relationLabel === 'function' ? relationLabel(q.relation) : q.relation}` : '';
    const reverse = q.reverse ? ' · 역채점 반영' : '';
    return `
      <div class="evidence-item">
        <span class="evidence-num">#${String(index + 1).padStart(2, '0')}</span>
        <div class="evidence-text">
          ${q.text}
          <span class="evidence-meta">기초축: ${axisEvidenceLabel(q)}${relation}${reverse}</span>
        </div>
        <span class="evidence-answer">${answerEvidenceLabel(item.value)}</span>
      </div>
    `;
  }).join('');
}

function toggleEvidencePanel() {
  const panel = document.getElementById('evidence-panel');
  const button = document.getElementById('evidence-toggle');
  if (!panel || !button) return;

  const willOpen = panel.classList.contains('hidden');
  panel.classList.toggle('hidden', !willOpen);
  button.setAttribute('aria-expanded', String(willOpen));
  button.textContent = willOpen ? '근거 닫기' : '왜 이렇게 분석했나요? · 근거 보기';
}

const mvOriginalRenderResults = renderResults;
renderResults = function(result) {
  mvOriginalRenderResults(result);
  renderLegacyScoreBreakdown(result);
  renderEvidencePanel(result);

  const panel = document.getElementById('evidence-panel');
  const button = document.getElementById('evidence-toggle');
  if (panel) panel.classList.add('hidden');
  if (button) {
    button.setAttribute('aria-expanded', 'false');
    button.textContent = '왜 이렇게 분석했나요? · 근거 보기';
  }
};
