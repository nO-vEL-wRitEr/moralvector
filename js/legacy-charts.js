function mvClamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

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
      labels: [
        '인지공감',
        '목표지향',
        '선택충성',
        '저비용이타',
        '도구관계',
        '마키아벨리',
        '원수가학',
        '통제욕구',
        '절차공정',
        '정서공감'
      ],
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
          pointLabels: {
            color: '#aeb8ca',
            font: { family: 'Noto Sans KR', size: 11 }
          }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => ` 합성지표 ${context.raw}`
          }
        }
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
          ticks: {
            color: '#dbe7fb',
            font: { family: 'Noto Sans KR', size: 11 }
          }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => ` 스위치 강도 ${context.raw}/10`
          }
        }
      }
    }
  });
}
