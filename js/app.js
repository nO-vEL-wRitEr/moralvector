const AXIS_META = {
  fairness:{label:'공정성',short:'F'}, loyalty:{label:'관계 충성',short:'L'}, altruism:{label:'보편적 이타성',short:'A'}, goal:{label:'목표 우선성',short:'G'}
};
let selectedMode='casual', activeQuestions=[], currentIndex=0, answers=[], radarInstance=null, lastResult=null;

function setMode(mode){
  selectedMode=mode; const cfg=MODE_CONFIGS[mode];
  document.querySelectorAll('.mode-card').forEach(x=>x.classList.toggle('active',x.dataset.mode===mode));
  document.getElementById('mode-title').textContent=`${cfg.label} · ${cfg.ko}`;
  document.getElementById('mode-description').textContent=cfg.description;
}

function startAssessment(){
  const cfg=MODE_CONFIGS[selectedMode];
  activeQuestions=cfg.ids.map(id=>STATEMENTS.find(q=>q.id===id)).filter(Boolean);
  answers=new Array(activeQuestions.length).fill(null); currentIndex=0;
  show('question-view'); loadQuestion();
}

function show(id){
  ['welcome-view','question-view','loading-view','result-view'].forEach(v=>document.getElementById(v).classList.toggle('hidden',v!==id));
}

function loadQuestion(){
  const q=activeQuestions[currentIndex], total=activeQuestions.length;
  document.getElementById('question-count').textContent=`QUESTION ${currentIndex+1} / ${total}`;
  document.getElementById('top-progress').textContent=`${currentIndex+1}/${total}`;
  document.getElementById('question-category').textContent=q.category;
  document.getElementById('question-kicker').textContent=q.relation?`RELATION · ${relationLabel(q.relation)}`:'VALUE STATEMENT';
  document.getElementById('question-text').textContent=q.text;
  document.getElementById('progress-bar').style.width=`${((currentIndex+1)/total)*100}%`;
  document.getElementById('back-button').style.visibility=currentIndex===0?'hidden':'visible';
  document.querySelectorAll('#likert-options button').forEach((btn,i)=>btn.classList.toggle('selected',answers[currentIndex]===i+1));
}

function relationLabel(r){return {close:'가까운 사람',stranger:'모르는 사람',rival:'경쟁자',adversary:'나를 실망시킨 사람'}[r]||r}

function answerQuestion(value){
  answers[currentIndex]=value;
  if(currentIndex<activeQuestions.length-1){currentIndex++;loadQuestion();window.scrollTo({top:0,behavior:'smooth'});}else finishAssessment();
}
function goBack(){if(currentIndex>0){currentIndex--;loadQuestion();}}

function finishAssessment(){
  show('loading-view'); document.getElementById('top-progress').textContent='CALCULATING';
  setTimeout(()=>{lastResult=calculateResults();renderResults(lastResult);show('result-view');document.getElementById('top-progress').textContent='RESULT';window.scrollTo({top:0,behavior:'smooth'});},650);
}

function normalizeLikert(v,reverse=false){const n=(v-1)*25;return reverse?100-n:n}
function average(arr){return arr.length?arr.reduce((a,b)=>a+b,0)/arr.length:50}

function calculateResults(){
  const axisValues={fairness:[],loyalty:[],altruism:[],goal:[]};
  const pairValues={}; const consistencyGroups={};
  activeQuestions.forEach((q,i)=>{
    const raw=answers[i]??3; const score=normalizeLikert(raw,q.reverse);
    axisValues[q.axis]?.push(score);
    if(q.pair){pairValues[q.pair]??={};pairValues[q.pair][q.relation]=normalizeLikert(raw,false)}
    if(q.consistency){consistencyGroups[q.consistency]??=[];consistencyGroups[q.consistency].push(score)}
  });
  const axes=Object.fromEntries(Object.entries(axisValues).map(([k,v])=>[k,Math.round(average(v))]));
  const spreads=Object.values(pairValues).map(group=>{const vals=Object.values(group);return vals.length>=2?Math.max(...vals)-Math.min(...vals):0});
  const relationalBias=Math.round(average(spreads));
  const consistencyDiffs=Object.values(consistencyGroups).filter(v=>v.length>=2).map(v=>Math.abs(v[0]-v[1]));
  const consistency=Math.round(Math.max(0,100-average(consistencyDiffs)));
  const archetype=getArchetype(axes,relationalBias,consistency);
  return {...axes,relationalBias,consistency,...archetype};
}

function getArchetype(s,bias,consistency){
  if(s.fairness>=72&&bias<=35) return {title:'보편적 원칙주의자',summary:'관계가 달라져도 비교적 같은 기준을 유지하며, 공정성과 보편적 기준을 중요하게 보는 편입니다.'};
  if(s.loyalty>=72&&bias>=45) return {title:'관계 중심 보호자',summary:'모든 사람을 똑같이 보기보다 가까운 관계에 더 큰 책임과 의무를 느끼는 경향이 있습니다.'};
  if(s.goal>=72&&s.fairness<60) return {title:'실용적 성취가',summary:'과정의 완벽한 일관성보다 결과와 효율을 중시하며, 상황에 맞춘 판단을 선호하는 편입니다.'};
  if(s.altruism>=72&&s.fairness>=60) return {title:'보편적 배려형',summary:'관계가 멀어도 타인의 입장과 피해를 고려하는 경향이 강하며 공정성도 함께 중시합니다.'};
  if(consistency<55) return {title:'상황 반응형',summary:'하나의 고정된 원칙보다 맥락과 대상에 따라 판단 기준을 유연하게 바꾸는 편입니다.'};
  return {title:'균형형 판단자',summary:'공정성, 관계, 타인 배려, 목표 사이에서 한쪽으로 크게 치우치기보다 상황별 균형을 찾는 편입니다.'};
}

function renderResults(r){
  document.getElementById('archetype-title').textContent=r.title;
  document.getElementById('archetype-summary').textContent=r.summary;
  document.getElementById('result-code').textContent=`MV-F${r.fairness}-L${r.loyalty}-A${r.altruism}-G${r.goal}-R${r.relationalBias}-C${r.consistency}`;
  const rows=[['공정성',r.fairness],['관계 충성',r.loyalty],['보편적 이타성',r.altruism],['목표 우선성',r.goal],['관계 편향도',r.relationalBias],['응답 일관성',r.consistency]];
  document.getElementById('score-list').innerHTML=rows.map(([name,v])=>`<div class="score-row"><strong>${name}</strong><b>${v}</b><div class="score-bar"><span style="width:${v}%"></span></div></div>`).join('');
  document.getElementById('insight-list').innerHTML=buildInsights(r).map(x=>`<div class="insight"><b>${x.title}</b><p>${x.body}</p></div>`).join('');
  closeShareMenu();
  renderRadar(r);
}

function buildInsights(r){
  return [
    {title:'공정성',body:r.fairness>=65?'사람이나 상황이 달라도 비슷한 기준을 유지하려는 편입니다.':'상황의 특수성과 관계를 고려해 기준을 조정하는 편입니다.'},
    {title:'관계',body:r.loyalty>=65?'가까운 사람에게 더 큰 책임과 보호 의무를 느끼는 편입니다.':'친분이 판단 기준을 크게 바꾸지 않도록 거리를 두는 편입니다.'},
    {title:'목표',body:r.goal>=65?'중요한 목표가 있다면 어느 정도의 불편이나 긴장을 감수할 수 있습니다.':'성과보다 과정과 원칙을 지키는 것을 상대적으로 더 중시합니다.'},
    {title:'관계 편향',body:r.relationalBias>=50?'같은 행동이라도 상대가 누구인지에 따라 판단 차이가 비교적 크게 나타났습니다.':'대상이 달라져도 판단 차이가 비교적 작게 나타났습니다.'}
  ];
}

function renderRadar(r){
  if(radarInstance)radarInstance.destroy();
  const ctx=document.getElementById('radar-chart');
  radarInstance=new Chart(ctx,{type:'radar',data:{labels:['공정성','관계 충성','이타성','목표 우선','관계 편향','일관성'],datasets:[{data:[r.fairness,r.loyalty,r.altruism,r.goal,r.relationalBias,r.consistency],borderColor:'#22d3ee',backgroundColor:'rgba(34,211,238,.12)',pointBackgroundColor:'#ef4444',borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,scales:{r:{min:0,max:100,ticks:{display:false},grid:{color:'rgba(255,255,255,.08)'},angleLines:{color:'rgba(255,255,255,.08)'},pointLabels:{color:'#cbd5e1',font:{size:11}}}},plugins:{legend:{display:false}}}});
}

function toggleShareMenu(){
  const menu=document.getElementById('share-menu');
  const toggle=document.querySelector('.share-toggle');
  const willOpen=menu.classList.contains('hidden');
  menu.classList.toggle('hidden',!willOpen);
  toggle?.setAttribute('aria-expanded',String(willOpen));
}

function closeShareMenu(){
  const menu=document.getElementById('share-menu');
  const toggle=document.querySelector('.share-toggle');
  menu?.classList.add('hidden');
  toggle?.setAttribute('aria-expanded','false');
}

async function shareResult(){
  if(!lastResult)return;
  const text=`내 MoralVector 결과는 '${lastResult.title}'! 공정성 ${lastResult.fairness}, 관계 충성 ${lastResult.loyalty}, 이타성 ${lastResult.altruism}, 목표 우선 ${lastResult.goal}. 너도 해봐.`;
  await sharePayload(text);
}
async function shareTest(){await sharePayload('짧은 문장으로 보는 도덕 판단 성향 테스트 MoralVector. 너는 어떤 결과가 나오는지 해봐!')}
async function sharePayload(text){
  const data={title:'MoralVector',text,url:location.href.split('#')[0]};
  try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(`${text}\n${data.url}`);status('공유 문구를 복사했어요.')}}catch(e){if(e.name!=='AbortError')status('공유에 실패했어요.')}
}
async function copyLink(){try{await navigator.clipboard.writeText(location.href.split('#')[0]);status('링크를 복사했어요.')}catch{status('링크 복사에 실패했어요.')}}
function status(t){document.getElementById('share-status').textContent=t;setTimeout(()=>document.getElementById('share-status').textContent='',1800)}
function restartAssessment(){closeShareMenu();setMode(selectedMode);show('welcome-view');document.getElementById('top-progress').textContent='READY';window.scrollTo({top:0,behavior:'smooth'})}
