const STATEMENTS = [
  // 공정성 / 원칙
  {id:1,text:'가까운 사람의 잘못이라도 다른 사람과 같은 기준으로 판단해야 한다.',axis:'fairness',category:'공정성',reverse:false,tier:1,consistency:'fair-a'},
  {id:2,text:'규칙이 불편하더라도 모두에게 똑같이 적용된다면 따르는 편이 맞다.',axis:'fairness',category:'공정성',reverse:false,tier:1},
  {id:3,text:'결과가 좋아진다면 절차를 조금 건너뛰는 것은 괜찮을 수 있다.',axis:'fairness',category:'공정성',reverse:true,tier:1},
  {id:4,text:'내가 손해를 보더라도 공정한 기준은 유지해야 한다.',axis:'fairness',category:'공정성',reverse:false,tier:2},
  {id:5,text:'상황에 따라 같은 잘못에도 다른 처분이 필요할 수 있다.',axis:'fairness',category:'공정성',reverse:true,tier:2},
  {id:6,text:'나에게 유리한 규칙이라도 불공정하다면 문제를 제기할 수 있다.',axis:'fairness',category:'공정성',reverse:false,tier:3,consistency:'fair-b'},

  // 관계 충성
  {id:7,text:'내 사람이라면 어느 정도의 실수는 감싸줄 수 있다.',axis:'loyalty',category:'관계 충성',reverse:false,tier:1,relation:'close',pair:'cover'},
  {id:8,text:'친한 사람이 곤란할 때는 내 시간과 기회를 조금 포기할 수 있다.',axis:'loyalty',category:'관계 충성',reverse:false,tier:1},
  {id:9,text:'조직의 규칙보다 오랜 관계에서 생긴 신의가 더 중요할 때가 있다.',axis:'loyalty',category:'관계 충성',reverse:false,tier:2},
  {id:10,text:'가까운 사람의 잘못을 알게 되면 관계보다 원칙을 먼저 생각하는 편이다.',axis:'loyalty',category:'관계 충성',reverse:true,tier:2,consistency:'loyal-a'},
  {id:11,text:'내 편을 지키기 위해서라면 어느 정도의 불이익은 감수할 수 있다.',axis:'loyalty',category:'관계 충성',reverse:false,tier:3},
  {id:12,text:'친분 때문에 판단 기준이 달라지는 것은 최대한 피해야 한다.',axis:'loyalty',category:'관계 충성',reverse:true,tier:3,consistency:'loyal-a'},

  // 보편적 이타성
  {id:13,text:'모르는 사람을 돕기 위해 몇 분 정도 늦는 것은 감수할 수 있다.',axis:'altruism',category:'이타성',reverse:false,tier:1},
  {id:14,text:'나와 상관없는 사람의 곤란함까지 신경 쓸 필요는 없다고 생각한다.',axis:'altruism',category:'이타성',reverse:true,tier:1},
  {id:15,text:'보상을 받지 못하더라도 남의 분실물을 돌려주는 것이 당연하다.',axis:'altruism',category:'이타성',reverse:false,tier:1},
  {id:16,text:'도움에 드는 비용이 커질수록 타인을 도울 의무도 줄어든다고 생각한다.',axis:'altruism',category:'이타성',reverse:true,tier:2},
  {id:17,text:'익명의 사람에게도 내가 아는 사람과 비슷한 최소한의 배려는 해야 한다.',axis:'altruism',category:'이타성',reverse:false,tier:2,consistency:'alt-a'},
  {id:18,text:'내 책임이 아니라면 누군가의 문제에 굳이 개입하지 않는 편이 낫다.',axis:'altruism',category:'이타성',reverse:true,tier:3,consistency:'alt-a'},

  // 목표 우선성
  {id:19,text:'중요한 목표가 걸려 있다면 인간관계의 불편함은 감수할 수 있다.',axis:'goal',category:'목표 우선',reverse:false,tier:1},
  {id:20,text:'좋은 결과를 만들 수 있다면 어느 정도의 전략적 행동은 필요하다.',axis:'goal',category:'목표 우선',reverse:false,tier:1},
  {id:21,text:'성과보다 과정의 정당성이 더 중요하다.',axis:'goal',category:'목표 우선',reverse:true,tier:2},
  {id:22,text:'기회를 놓치더라도 내 원칙을 지키는 편이 낫다.',axis:'goal',category:'목표 우선',reverse:true,tier:2},
  {id:23,text:'경쟁 상황에서는 상대를 배려하는 것보다 내 성과를 확보하는 것이 우선이다.',axis:'goal',category:'목표 우선',reverse:false,tier:3},
  {id:24,text:'목표 달성을 위해 다른 사람을 단순한 수단처럼 대하는 것은 피해야 한다.',axis:'goal',category:'목표 우선',reverse:true,tier:3},

  // 관계 비교 — 같은 원칙, 대상만 변경
  {id:25,text:'친구가 규칙을 어겼다면 한 번쯤은 감싸줄 수 있다.',axis:'loyalty',category:'관계 비교',reverse:false,tier:1,relation:'close',pair:'rule-break'},
  {id:26,text:'모르는 사람이 규칙을 어겼다면 한 번쯤은 감싸줄 수 있다.',axis:'altruism',category:'관계 비교',reverse:false,tier:1,relation:'stranger',pair:'rule-break'},
  {id:27,text:'경쟁자가 규칙을 어겼다면 한 번쯤은 감싸줄 수 있다.',axis:'fairness',category:'관계 비교',reverse:false,tier:2,relation:'rival',pair:'rule-break'},
  {id:28,text:'나를 크게 실망시킨 사람이 규칙을 어겼다면 한 번쯤은 감싸줄 수 있다.',axis:'fairness',category:'관계 비교',reverse:false,tier:2,relation:'adversary',pair:'rule-break'},
  {id:29,text:'친구가 곤란해졌다면 내 시간을 들여 도울 의향이 있다.',axis:'loyalty',category:'관계 비교',reverse:false,tier:1,relation:'close',pair:'help'},
  {id:30,text:'모르는 사람이 곤란해졌다면 내 시간을 들여 도울 의향이 있다.',axis:'altruism',category:'관계 비교',reverse:false,tier:1,relation:'stranger',pair:'help'},
  {id:31,text:'경쟁자가 곤란해졌다면 내 시간을 들여 도울 의향이 있다.',axis:'fairness',category:'관계 비교',reverse:false,tier:2,relation:'rival',pair:'help'},
  {id:32,text:'나를 크게 실망시킨 사람이 곤란해졌다면 내 시간을 들여 도울 의향이 있다.',axis:'fairness',category:'관계 비교',reverse:false,tier:2,relation:'adversary',pair:'help'},
  {id:33,text:'친구의 실수 때문에 내가 이익을 얻더라도 그 사실을 알려줄 것이다.',axis:'fairness',category:'관계 비교',reverse:false,tier:2,relation:'close',pair:'advantage'},
  {id:34,text:'모르는 사람의 실수 때문에 내가 이익을 얻더라도 그 사실을 알려줄 것이다.',axis:'fairness',category:'관계 비교',reverse:false,tier:2,relation:'stranger',pair:'advantage'},
  {id:35,text:'경쟁자의 실수 때문에 내가 이익을 얻더라도 그 사실을 알려줄 것이다.',axis:'fairness',category:'관계 비교',reverse:false,tier:3,relation:'rival',pair:'advantage'},
  {id:36,text:'나를 크게 실망시킨 사람의 실수 때문에 내가 이익을 얻더라도 그 사실을 알려줄 것이다.',axis:'fairness',category:'관계 비교',reverse:false,tier:3,relation:'adversary',pair:'advantage'},

  // 심층 / 경계 사례
  {id:37,text:'법적으로 허용되더라도 누군가의 무지를 이용해 큰 이익을 얻는 것은 꺼려진다.',axis:'fairness',category:'경계 판단',reverse:false,tier:3},
  {id:38,text:'조직 전체를 살리기 위해 소수에게 더 큰 부담을 지우는 선택은 가능할 수 있다.',axis:'goal',category:'경계 판단',reverse:false,tier:3},
  {id:39,text:'과거에 나를 해친 사람도 기본적인 공정성의 보호를 받아야 한다.',axis:'fairness',category:'경계 판단',reverse:false,tier:3},
  {id:40,text:'배신한 사람에게는 다른 사람보다 더 엄격한 기준을 적용해도 괜찮다.',axis:'fairness',category:'경계 판단',reverse:true,tier:3},
  {id:41,text:'좋은 의도가 있었다면 규칙 위반을 어느 정도는 다르게 평가해야 한다.',axis:'fairness',category:'경계 판단',reverse:true,tier:3},
  {id:42,text:'누군가를 돕는 일이 내 장기 목표를 크게 방해한다면 거절하는 편이 맞다.',axis:'goal',category:'경계 판단',reverse:false,tier:3},
  {id:43,text:'내가 속한 집단의 이익과 사회 전체의 공정성이 충돌하면 사회 전체를 우선해야 한다.',axis:'loyalty',category:'경계 판단',reverse:true,tier:3},
  {id:44,text:'경쟁에서 이길 수 있어도 상대의 명백한 취약점을 악용하는 것은 피하고 싶다.',axis:'goal',category:'경계 판단',reverse:true,tier:3},
  {id:45,text:'사과와 반성이 충분하다면 과거의 잘못에 대한 판단도 달라질 수 있다.',axis:'fairness',category:'경계 판단',reverse:true,tier:3},
  {id:46,text:'내 선택으로 피해를 보는 사람이 보이지 않아도 그 피해를 고려해야 한다.',axis:'altruism',category:'경계 판단',reverse:false,tier:3},
  {id:47,text:'내 편이 부당한 이익을 얻는 상황이라면 내가 먼저 제동을 걸 수 있다.',axis:'loyalty',category:'경계 판단',reverse:true,tier:3,consistency:'fair-b'},
  {id:48,text:'효율적인 선택이라면 모든 사람이 똑같이 대우받지 않아도 괜찮을 수 있다.',axis:'fairness',category:'경계 판단',reverse:true,tier:3}
];

const MODE_CONFIGS = {
  casual:{label:'QUICK',ko:'가볍게',count:12,description:'핵심 성향을 빠르게 확인하는 입문 모드입니다.',ids:[1,3,7,10,13,14,19,21,25,26,29,30]},
  standard:{label:'STANDARD',ko:'표준',count:24,description:'네 가지 핵심 성향과 관계에 따른 판단 변화 폭을 함께 봅니다.',ids:[1,2,3,4,7,8,10,12,13,14,15,17,19,20,21,22,25,26,27,28,29,30,31,32]},
  deep:{label:'DEEP',ko:'심층',count:36,description:'핵심 문항에 경계 사례와 역문항을 더해 보다 세밀하게 봅니다.',ids:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,37,39,43,47]},
  paradox:{label:'PARADOX',ko:'관계 비교',count:20,description:'같은 원칙에서 대상만 바꿔 묻고, 관계 편향을 집중적으로 계산합니다.',ids:[25,26,27,28,29,30,31,32,33,34,35,36,1,4,7,12,17,39,40,47]}
};
