# 공식 기출 검토·수록 계약

현재 실제 기출은 0문항입니다. 아래 형식은 준비된 수록 도구의 입력 계약이며, 형식 검사 통과는 원문·저작권·전문가 감수의 사실성 확인과 다릅니다. 공식 페이지 접근이 차단되어 실제 자료로 수록을 검증하지 못했습니다.

`bundle.json`과 증빙을 같은 폴더 안에 두세요. `files`는 상대 경로만 허용하며 폴더 밖 경로·심볼릭 링크를 통한 이탈·빈 파일·32 MiB 초과 파일은 거부합니다. 묶음 JSON은 최대 2 MiB, 한 묶음은 1~200문항입니다. 외부 검토 자료는 `.content-staging/`에 보관하고 Git에 넣지 않습니다.

```json
{
  "receipt": {
    "publisher": "KICE",
    "examKind": "csat",
    "examId": "기관-시험-과목-버전을-영문숫자와하이픈으로-정할것",
    "year": 2026,
    "title": "원문과 대조한 정확한 시험명",
    "sourceUrl": "해당 공식 기관의 실제 HTTPS 원문 주소",
    "answerUrl": "해당 기관의 확정 정답 HTTPS 주소",
    "questionSha256": "원문 파일의 실제 SHA-256 64자리 소문자 16진수",
    "answerSha256": "확정 정답 파일의 실제 SHA-256",
    "rightsSha256": "이용 권한 근거 파일의 실제 SHA-256",
    "checkedBy": "실제 출처·정답·권리 대조 담당자의 표시 이름",
    "checkedAt": "YYYY-MM-DD",
    "rights": {
      "basisUrl": "같은 기관의 이용 조건 또는 허가 확인 HTTPS 주소",
      "basis": "written-permission",
      "summary": "앱에서 문항·지문·그림을 재배포할 수 있는 실제 근거 및 범위",
      "thirdPartyCleared": true,
      "redistributionAllowed": true
    }
  },
  "files": {
    "questions": "questions.pdf",
    "answers": "final-answers.pdf",
    "rights": "permission.txt"
  },
  "items": [
    {
      "number": 1,
      "officialAnswer": "공식 확정 정답과 대조해 전사한 답 또는 보기 전체 문자열",
      "materialComplete": true,
      "transcriptionChecked": true,
      "problem": {
        "id": "official:receipt의examId:1",
        "educationLevel": "csat",
        "subject": "수학",
        "topic": "검증한 문항의 개념",
        "prompt": "필요한 지문·수식·자료가 모두 포함된 원문 전사",
        "answerType": "numeric",
        "correctAnswer": "실제 정답",
        "explanation": "정답의 근거를 검증한 해설",
        "difficulty": "medium",
        "source": "bank"
      }
    }
  ]
}
```

위 안내 문자열은 유효한 시험 자료나 실행 가능한 샘플이 아닙니다. 임의의 문제를 공식 기출로 꾸미지 마세요. API 키·개인 학습 기록은 묶음이나 증빙에 넣지 않습니다. 도구는 명시한 증빙 필드만 유지하고 불필요한 메타데이터를 출시 파일에 복사하지 않습니다.

`publisher`는 `KICE`(평가원)와 `NIKH`(국사편찬위원회)만 현재 지원합니다. `KICE`의 시험 종류는 `csat`, `csat-mock`, `NIKH`는 `history-certification`입니다. 후자를 수능 기출로 표시하지 않습니다. 현재 한국사능력검정 문항의 학습 분류는 수능 단계 한국사 보충으로만 지원하며 초등·중등·다른 자격증 수준 배치는 별도 작업입니다.

권한 근거가 공개 라이선스라면 `basis: public-license`를 사용하고 라이선스 유형·출처 표시·변경 여부 등 의무를 실제 근거와 대조하세요. 홈페이지에서 문제를 내려받을 수 있다는 것만으로 재배포 권한이 생기지는 않습니다. 자료와 지문·그림의 제3자 권한을 담당자가 실제 확인한 뒤 boolean을 기록해야 합니다. 그 확인일·담당자·문서 해시를 유지합니다. 도구는 담당자의 자격·진짜 서명·허가의 진위를 인증하지 않습니다.

문자 문항만 현재 지원합니다. `prompt` 2,000자, 해설 1,200자, 보기 2~6개/보기당 300자, 정답 400자 제한을 넘거나 필수 그림·듣기를 문자만으로 완전히 표현할 수 없으면 거부/보류합니다. 누락된 자료를 `materialComplete: true`로 적지 마세요. 그림·오디오 지원과 접근성 검토를 별도 구현해야 합니다. 채점 입력은 256자까지이므로 기출 보기 전체도 256자 안에서 처리할 수 있어야 합니다. 공식 수치 정답은 학생 입력의 반올림 허용 오차로 대체하지 않고 정확하게 대조합니다. MCQ는 `correctAnswer`와 `officialAnswer`에 보기 전체 문자열을 사용합니다. 공식 답이 보기 번호로만 공개됐다면 전사 담당자가 해당 보기와 대조해야 하며 도구가 PDF의 번호를 자동 판독하는 것은 아닙니다.

`content:prepare-exam`은 JSON만 읽으며 사용자 코드·답을 실행하지 않습니다. 원문과 확정 정답 파일을 자동 OCR하거나, 전사된 공식 답이 실제 PDF의 답인지 판독하거나, 법적 이용 권한을 추정하지 않습니다. 잘못된 공식 호스트, 중복 문항 번호·보기, 원문과 정답의 해시 변경, 정답 불일치, 불완전한 자료 표시, 기존 공개 ID 변경은 거부합니다.

기본 명령은 같은 폴더에 `bundle.candidate.json`을 만들고 앱 수록을 바꾸지 않습니다. 담당자 검토 후 `--release`를 쓰면 기존 문항을 보존하며 출시 목록과 증빙을 갱신합니다. 두 파일의 Git diff를 함께 검토·검증하고 같은 커밋에 포함하세요. 새 출시에서는 문제 본문·정답·증빙을 실제 브라우저로 확인하고 해당 문항의 회귀 검증을 추가해야 합니다.

`npm run content:check`는 감수 자료 해시 일치와 임시 폴더의 합성 수록 테스트 10개를 실행합니다. 실제 공식 사이트 호출이나 자료를 취득한 검증이 아닙니다. CI에서도 실행합니다.
