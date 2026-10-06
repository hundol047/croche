# croche — FailTwin

> **FailTwin — AI가 당신의 실수를 먼저 예측합니다.**
> SNU × Croche AI Hackathon 2026 출품작.

이 저장소에는 AI 학습 앱 **FailTwin**이 들어 있습니다. 앱 코드는 [`failtwin/`](failtwin/) 폴더에 있습니다.

## FailTwin이란

기존 AI 튜터가 *"무엇을 모르는가"*를 분석하는 반면, FailTwin은 **"어떻게 반복해서 틀리는가"**를
학습합니다. 사용자의 풀이와 오답을 분석해 개인별 **Error DNA**(구조화된 실수 패턴)를 누적하고,
다음 문제에서 발생할 가능성이 높은 실수를 예측하며, 그 사용자가 가장 실수하기 쉬운 조건을 담은
맞춤 문제(**Trap Mode**)를 생성해 시험 전에 실수를 미리 경험하고 교정하게 합니다.

핵심 루프:

```
문제 풀이 → AI 오답 분석 → Error DNA 업데이트 → 다음 실수 예측
          → Trap Mode 문제 생성 → 재도전 → Prediction HIT / Trap 극복 → 학습 리포트
```

## 왜 다른가
| 기존 AI 튜터 | FailTwin |
|---|---|
| 무엇을 모르는가 | **어떻게 반복해서 틀리는가 + 다음에 어떤 실수를 할 가능성이 높은가** |
| 오답을 정답으로 교정 | 오답의 **인지적 원인(Error Type)**을 구조화해 누적 |
| 문제 더 추천 | 당신이 **틀리기 쉬운 실수를 유발하는** 맞춤 문제 생성(Trap Mode) |

## Croche는 어떻게 쓰이나
AI 기능은 `CrocheAIService` 인터페이스 하나에 격리됩니다. UI/도메인 코드는 Croche/LLM을 직접
호출하지 않습니다.
- **Mock(`MockCrocheAIService`)**: 결정적 규칙 기반, 네트워크/SDK 없이 전체 Demo가 동작.
- **Real(`RealCrocheAIService`)**: 실제 Croche 클라이언트 기반. 프롬프트 구성, 모델 티어 선택
  (저비용/고품질), **관련 Memory만** context 주입, Zod 스키마 검증, 검증 실패 시 재시도/폴백,
  톤 가드까지 완성되어 있고 — **Croche 클라이언트만 꽂으면** 동일하게 동작합니다.
- 앱은 지금 어떤 모드로 동작 중인지 대시보드에 **정직하게 표시**(Demo Mock / Real Croche /
  Croche 연결 안 됨)합니다. Mock을 Real처럼 위장하지 않습니다.

> ⚠️ 현재 공개된 공식 "Croche" AI 런타임/SDK/문서를 확인할 수 없었고(개발 환경 npm 레지스트리
> 차단 + 공식 문서 부재), 조직자 제공 자격 증명/엔드포인트도 환경에 없습니다. 따라서 Real
> 연동의 **클라이언트 생성부(`failtwin/src/services/croche/client.ts`)만** 명시적 TODO로
> 남겨두고 — 존재하지 않는 Croche 심볼을 지어내지 않았습니다. 조직자가 공식 SDK/엔드포인트를
> 제공하면 그 파일 한 곳만 채우면 됩니다. 자세한 내용은 `failtwin/README.md`의 "Croche 연동 상태".

## 실행
```bash
cd failtwin
cp .env.example .env
npm install
npm run web          # PC 브라우저 시연
# 또는: npm run start (Expo Go), npm run android, npm run ios
```

빠른 심사: 온보딩 화면의 **"⚡ 심사용 빠른 데모"** 버튼 → 2분 내 전체 루프 체험.

## 더 보기
- 앱 상세 문서 / 실행 / Demo / 테스트 / Croche 연동: [`failtwin/README.md`](failtwin/README.md)
- 설계 문서: [`.kiro/specs/failtwin/`](.kiro/specs/failtwin/)
