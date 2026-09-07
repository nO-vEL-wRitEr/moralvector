# MoralVector — Likert Refactor

## 무엇이 바뀌었나
- 긴 3지선다 딜레마 → 짧은 문장 + 5점 리커트 척도
- 실제 AI 미사용. 모든 결과는 브라우저에서 점수 계산
- 핵심 축: 공정성 / 관계 충성 / 보편적 이타성 / 목표 우선성
- 파생 축: 관계 편향도 / 응답 일관성
- QUICK / STANDARD / DEEP / PARADOX 4개 모드
- 모바일 Web Share API 기반 결과 공유 및 테스트 링크 공유
- HTML / CSS / 데이터 / 로직 분리

## 구조
- `index.html`
- `css/style.css`
- `js/statements.js` — 문항 은행과 모드 정의
- `js/app.js` — 테스트 진행, 점수 계산, 결과 및 공유

## 주의
이 테스트는 자기이해/엔터테인먼트 목적이며 심리학적·의학적 진단 도구가 아닙니다.
