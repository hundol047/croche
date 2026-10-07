# croche — FailTwin

> **AI가 당신의 실수를 먼저 예측합니다.**
> SNU × Croche AI Hackathon 2026

FailTwin은 **어떻게 반복해서 틀리는지**를 Error DNA로 기억하고,
다음 실수를 예측한 뒤 같은 약점을 노리는 **새로운 Trap Mode 문제**로 교정하는 학습 앱입니다.

```bash
cd failtwin
npm ci
npm run web -- --offline
```

온보딩의 **⚡ 심사용 빠른 데모**로 시작하세요.
[90–120초 발표 가이드](docs/JUDGE_DEMO.md)는 입력할 정확한 답과 예상 화면을 안내합니다.

현재 런타임은 **Mock AI**이며 Real Croche는 **미연결**입니다.
공식 SDK·접근 정보가 제공된 이후 `CrocheAIService` / `client.ts` 경계에서 통합할 구조를 유지합니다.
주 시연은 Expo Web이며 최신 iPhone Expo Go의 SDK 51 호환을 약속하지 않습니다.

- [실행·기술·테스트·저장 구조](failtwin/README.md)
- [검증 결과와 제약](docs/QA.md)
- [기존 PR #1](https://github.com/hundol047/croche/pull/1)
- [설계 문서](.kiro/specs/failtwin/)
