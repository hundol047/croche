import { officialUrl, validateExamBundle } from '@/domain/examIngestion';
import { curriculumProblem, CURRICULUM_UNITS } from '@/content/curriculumUnits';

/** Synthetic contract fixture. It is NOT an official question or review. */
const fixture = () => ({
  receipt: { publisher:'KICE',examKind:'csat',examId:'test-fixture-only',year:2026,title:'합성 검증 자료',
    sourceUrl:'https://www.kice.re.kr/test-fixture-only',answerUrl:'https://www.kice.re.kr/test-fixture-answers',
    questionSha256:'a'.repeat(64),answerSha256:'b'.repeat(64),rightsSha256:'c'.repeat(64),
    checkedBy:'테스트 전용',checkedAt:'2026-10-08',
    rights:{basisUrl:'https://www.kice.re.kr/test-fixture-rights',basis:'written-permission',summary:'계약 구조 검사만을 위한 가짜 권한 증빙입니다.',thirdPartyCleared:true,redistributionAllowed:true} },
  items:[{number:1,officialAnswer:'5',materialComplete:true,transcriptionChecked:true,
    problem:{id:'official:test-fixture-only:1',educationLevel:'csat',subject:'수학',topic:'합성 검증',prompt:'검증용: 2+3은? 숫자만 입력하세요.',answerType:'numeric',correctAnswer:'5',explanation:'합성 자료 2+3=5.',difficulty:'easy',source:'bank'}}],
});
describe('official exam ingestion contract',()=>{
  it('accepts a complete structural fixture without certifying its assertions',()=>{
    const result=validateExamBundle(fixture());expect(result.ok).toBe(true);
    if(result.ok){expect(result.value.exams).toHaveLength(1);expect(result.value.exams[0]?.problem.correctAnswer).toBe('5');}
  });
  it('rejects spoofed official domains, credentials, ports and insecure URLs',()=>{
    for(const url of ['http://www.kice.re.kr/a','https://www.kice.re.kr.evil.test/a','https://www.kice.re.kr@evil.test/a','https://www.kice.re.kr:443/a','https://evil.test/kice.re.kr','https://www.kice.re.kr/a\n'])expect(officialUrl(url,'KICE')).toBe(false);
    expect(officialUrl('https://www.kice.re.kr/a','KICE')).toBe(true);
    expect(officialUrl('https://www.historyexam.go.kr/a','KICE')).toBe(false);
  });
  it('rejects missing rights, unverified third-party material and missing hashes',()=>{
    let b=fixture();b.receipt.rights.redistributionAllowed=false;expect(validateExamBundle(b).ok).toBe(false);
    b=fixture();b.receipt.rights.thirdPartyCleared=false;expect(validateExamBundle(b).ok).toBe(false);
    b=fixture();b.receipt.questionSha256='';expect(validateExamBundle(b).ok).toBe(false);
    b=fixture();b.receipt.checkedBy='';expect(validateExamBundle(b).ok).toBe(false);
  });
  it('rejects wrong final answers, duplicate numbers and incomplete diagrams/passages',()=>{
    let b=fixture();b.items[0]!.officialAnswer='-5';expect(validateExamBundle(b).ok).toBe(false);
    b=fixture();b.items.push(b.items[0]!);expect(validateExamBundle(b).ok).toBe(false);
    b=fixture();b.items[0]!.materialComplete=false;expect(validateExamBundle(b).ok).toBe(false);
    b=fixture();b.items[0]!.transcriptionChecked=false;expect(validateExamBundle(b).ok).toBe(false);
  });
  it('rejects original bank rebranding and code-like answer inputs safely',()=>{
    const b=fixture();const original=curriculumProblem(CURRICULUM_UNITS[0]!,0);
    expect(validateExamBundle({...b,items:[{...b.items[0],problem:original}]}).ok).toBe(false);
    b.items[0]!.officialAnswer='(()=>{globalThis.pwned=true;return 5})()';expect(validateExamBundle(b).ok).toBe(false);
    expect((globalThis as unknown as {pwned?:boolean}).pwned).toBe(undefined);
  });
  it('keeps Korean history certification separate from CSAT provenance',()=>{
    const b=fixture();b.receipt.examKind='history-certification';expect(validateExamBundle(b).ok).toBe(false);
  });
  it('drops undeclared receipt metadata rather than copying it into a client release',()=>{
    const b=fixture();const result=validateExamBundle({...b,receipt:{...b.receipt,unneededPrivateNote:'test-only-note'}});
    expect(result.ok).toBe(true);
    if(result.ok)expect('unneededPrivateNote' in result.value.receipt).toBe(false);
  });
  it('requires exact official numeric keys even inside the student rounding tolerance',()=>{
    const b=fixture();b.items[0]!.problem.correctAnswer='5.0000005';expect(validateExamBundle(b).ok).toBe(false);
  });
});
