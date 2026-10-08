# croche — FailTwin

> **풀이를 기록하고, 같은 약점을 다른 문제로 연습합니다.**
> SNU × Croche AI Hackathon 2026

FailTwin은 **어떻게 반복해서 틀리는지**를 Error DNA로 기억하고,
다음 실수를 예측한 뒤 같은 약점을 노리는 **새로운 Trap Mode 문제**로 교정하는 학습 앱입니다.

```bash
cd failtwin
npm ci
npm run web -- --offline
```

온보딩의 **심사용 빠른 데모**로 시작하세요.
[90–120초 발표 가이드](docs/JUDGE_DEMO.md)는 입력할 정확한 답과 예상 화면을 안내합니다.

공업수학·일반물리·Python에 과목당 **30,000개**, 쉬움·보통·어려움 각 **10,000개**의
조건 조합 문제를 제공합니다. [문제 은행](docs/PROBLEM_BANK.md)에 유형과 검증 범위를 정리했습니다.

현재 런타임은 **Mock AI**이며 Real Croche는 **미연결**입니다.
공식 SDK·접근 정보가 제공된 이후 `CrocheAIService` / `client.ts` 경계에서 통합할 구조를 유지합니다.
주 시연은 Expo Web이며 최신 iPhone Expo Go의 SDK 51 호환을 약속하지 않습니다.

- [실행·기술·테스트·저장 구조](failtwin/README.md)
- [검증 결과와 제약](docs/QA.md)
- [채점 범위와 반복 출제](docs/GRADING.md)
- [실제 AI 연결 준비와 남은 작업](docs/AI_INTEGRATION.md)
- [디자인 기준과 화면 비교](docs/DESIGN.md)
- [기존 PR #1](https://github.com/hundol047/croche/pull/1)
- [설계 문서](.kiro/specs/failtwin/)
