# FailTwin — Implementation Tasks

> 순서대로 구현한다. 각 단계 후 가능한 검증(ts 컴파일/노드 테스트)을 수행한다.
> 네트워크 제약으로 RN/Expo 런타임 검증은 README의 "networked machine" 절차로 위임.

- [x] 1. 프로젝트 스캐폴드 (package.json, tsconfig strict, babel, app.json, jest config, .gitignore)
- [x] 2. 디자인 토큰 & 상수 (theme, errorDna config 계수, demo seed, errorTypes 메타)
- [x] 3. 도메인 타입 & Zod schemas + validate helper
- [x] 4. Error DNA 엔진 (deterministic applyMistake/applyCorrection/decay)
- [x] 5. Memory 선택 로직 (selectRelevantMemories)
- [x] 6. Prediction & Report 집계 로직
- [x] 7. Storage KV 추상화 + repositories (per-userId)
- [x] 8. 문제 뱅크 (공업수학/일반물리/Python)
- [x] 9. CrocheAIService 인터페이스 + Mock 구현 + model policy + tools + factory
- [x] 10. Croche memory/client 경계 (Real TODO) + RealCrocheAIService 스텁
- [x] 11. 재사용 UI 컴포넌트 (Screen/Card/Button/ProgressBar/아이콘/차트/카드류)
- [x] 12. 전역 상태 provider & hooks
- [x] 13. 화면: onboarding
- [x] 14. 화면: Home dashboard (탭)
- [x] 15. 화면: practice (선택/생성) + solve
- [x] 16. 화면: analysis
- [x] 17. 화면: prediction
- [x] 18. 화면: trap mode (HIT/극복 피드백)
- [x] 19. 화면: report (line chart + insight)
- [x] 20. Demo Mode / 심사용 빠른 데모 경로
- [x] 21. 단위 테스트 (engine/memory/schema/prediction/report/mock loop/storage)
- [x] 22. ts 컴파일 검증(순수 로직) + 테스트 실행
- [x] 23. README (실행/Expo/Web/Croche 연결/Mock/env/Demo/구조/향후)
- [x] 24. commit & push (new branch) + PR
