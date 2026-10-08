const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { HISTORY_FACTS } = require('../.verify-out/src/content/schoolHistory');
const { CURRICULUM_UNITS, curriculumProblem } = require('../.verify-out/src/content/curriculumUnits');
const { schoolFamilies, schoolProblem } = require('../.verify-out/src/content/schoolBank');
const { SOURCE_ACCESS_CHECKED_AT } = require('../.verify-out/src/content/coverage');
const sha = data => crypto.createHash('sha256').update(data).digest('hex');
const notes = {
  676: '통일의 범위와 한계, 통일 신라·남북국 명칭을 학년별로 설명할 때의 적절성',
  993: '강동 6주 확보의 계기와 실제 확보 과정의 구별',
  1443: '창제·반포 연도 구별, 음력·양력 날짜를 추가할 경우 원문 대조',
  1446: '창제와 반포의 구별',
  1894: '동학 농민 운동의 전개와 반봉건·반외세 설명의 맥락',
  1905: '강제 체결과 외교권 박탈 설명, 용어 선택',
  1910: '국권 피탈의 강제성과 시기 구분',
  1948: '정부 수립과 1919년 임시 정부의 관계, 대한민국 건국 논쟁을 임의로 단정하지 않을 것',
  1950: '전쟁 발발과 경과의 구별',
  1980: '공식 명칭·민주화 요구·신군부 진압 설명의 정확성과 연령 적합성',
  1991: '남북한 동시 가입의 날짜·유엔 자료 대조',
};
const facts = HISTORY_FACTS.map(f => ({ id: `event-${f.year}`, ...f, contentSha256: sha(JSON.stringify(f)),
  sourceStatus: 'unverified-access-blocked', sourceUrl: null, sourceLocation: null, sourceExcerpt: null,
  reviewer: null, reviewStatus: 'pending', note: notes[f.year] ?? '연도·주체·사건 명칭·요약의 사실성과 수업 수준을 확인할 것' }));
const samples = [];
for (const level of ['elementary','middle','high','csat']) for (const difficulty of ['easy','medium','hard']) {
  for (const family of schoolFamilies(level,'한국사',difficulty)) for (const variant of [0,999,1999]) {
    samples.push(schoolProblem(level,'한국사',difficulty,family.id,variant));
  }
}
const unitItems = CURRICULUM_UNITS.filter(u => u.subject === '한국사').flatMap(u => u.items.map((_,i) => curriculumProblem(u,i)));
const historyFile = fs.readFileSync(path.resolve(__dirname,'../src/content/schoolHistory.ts'));
const packet = {
  schemaVersion: 1, preparedAt: SOURCE_ACCESS_CHECKED_AT,
  status: 'pending-human-review', officialSourceAccess: 'HTTP CONNECT 403; no official fact page was retrieved',
  sourceDiscoveryPortal: 'https://contents.history.go.kr', portalIsNotAFactCitation: true,
  sourceFileSha256: sha(historyFile), historyUnitDataSha256: sha(JSON.stringify(unitItems)),
  facts, templateSamples: samples, authoredUnitItems: unitItems,
  approval: { reviewerName: null, professionalAffiliationOrQualification: null, reviewDate: null,
    approvedSourceFileSha256: null, approvedHistoryUnitDataSha256: null, sourceEvidenceReferences: [],
    decision: 'pending', approvedScope: null, corrections: [] },
  reviewChecklist: [
    '44개 사건마다 공식 출처 URL·문서 위치·근거 문장 대조(홈페이지 주소만으로 승인하지 않음)',
    '사건 명칭·연도·주체·순서·차이 계산·보기의 유일한 정답 확인',
    '학습용 요약과 실제 사료 인용을 구별, 역사 해석과 학년별 수준 점검',
    '60개 학교급·난도·유형 조합의 경계 표본 180개와 단원별 56문항 확인',
    '표본 검토는 모든 변형을 개별 감수했다는 뜻이 아님; 승인 범위를 명시',
    '실제 감수자의 자격·일자·승인 파일 해시와 출처 증빙을 기록',
    '수정 시 기존 school-v1/curriculum-v1 ID 내용을 바꾸지 않고 새 버전으로 출시',
  ],
};
const docs = path.resolve(__dirname,'../../docs/history-review');
const csvCell = s => '"'+String(s ?? '').replace(/"/g,'""')+'"';
const csv = [['사건 ID','연도','명칭','학습용 요약','내용 SHA-256','검토 유의점','공식 출처 URL','문서 위치','근거 문장','감수자','판정','수정 요청'],
  ...facts.map(f => [f.id,f.year,f.name,f.clue,f.contentSha256,f.note,'','','','','대기',''])].map(row => row.map(csvCell).join(',')).join('\n')+'\n';
const table = facts.map(f => `| ${f.id} | ${f.year} | ${f.name} | 대기 |`).join('\n');
const md = `# 한국사 감수 자료\n\n실제 전문가 감수는 **미완료**입니다. 공식 사이트 접근이 403으로 차단되어 개별 사실의 공식 출처도 아직 대조하지 못했습니다. 자동 검사는 구조·채점·연표 계산을 검증하며 역사 전문가의 감수와 다릅니다.\n\n기준: ${SOURCE_ACCESS_CHECKED_AT}. 원본 사건 44개, 학교급·난도·유형 표본 180문항, 신규 단원 56문항입니다. 표본은 2,000개 변형 전체의 개별 감수를 뜻하지 않습니다.\n\n- [감수용 CSV](./checklist.csv): 별도 파일로 복사한 뒤 출처·위치·근거 문장·감수 결과를 작성하세요.\n- [전체 검토 묶음](./packet.json): 사건·문항·파일 해시·빈 승인 양식을 포함합니다.\n\n공식 자료의 조사 시작점은 https://contents.history.go.kr 이며 개별 사건의 출처로 확인한 주소가 아닙니다. 감수자가 정해지면 전문 자격, 확인일, 승인 범위, 출처 증빙, 승인한 파일 해시를 기록해야 합니다. 생성한 packet.json과 checklist.csv는 원본 양식입니다. 실제 검토·승인 결과는 별도 복사본에 기록하고 보존하세요. 이 도구는 재생성 시 원본 양식을 갱신하므로 검토 완료 기록을 원본 양식에 직접 덮어쓰지 않습니다. 빈 승인 양식을 채우는 것만으로 자동 게시되지 않습니다. 현재 앱은 계속 ‘전문가 감수 전’을 표시합니다. 실제 감수 완료 후 승인 기록과 앱 표시를 별도 검토해 변경하세요.\n\n원본 schoolHistory.ts SHA-256: \`${packet.sourceFileSha256}\`\n\n신규 한국사 단원 데이터 SHA-256: \`${packet.historyUnitDataSha256}\`\n\n| 사건 ID | 연도 | 사건 | 전문가 감수 |\n|---|---:|---|---|\n${table}\n\n## 감수 순서\n\n${packet.reviewChecklist.map((s,i)=>`${i+1}. ${s}`).join('\n')}\n`;
const files = { 'packet.json': JSON.stringify(packet,null,2)+'\n', 'checklist.csv': csv, 'README.md': md };
if (process.argv.includes('--check')) {
  let stale = false;
  for (const [name, text] of Object.entries(files)) if (!fs.existsSync(path.join(docs,name)) || fs.readFileSync(path.join(docs,name),'utf8') !== text) stale = true;
  if(stale){ console.error('감수 자료가 현재 문항과 다릅니다. content:history-packet으로 갱신하세요.');process.exitCode=1; }
  else console.log('감수 자료의 사건·문항·해시 일치. 전문가 감수 상태: 미완료.');
} else {
  fs.mkdirSync(docs,{recursive:true});
  for (const [name,text] of Object.entries(files)) fs.writeFileSync(path.join(docs,name),text);
  console.log('한국사 감수 자료: 44개 사건 · 경계 표본 180문항 · 단원 56문항. 실제 감수·공식 출처 대조는 대기.');
}
