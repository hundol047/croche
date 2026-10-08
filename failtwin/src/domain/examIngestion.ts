import { validateProblem } from './schemas';
import { assessAnswer } from './answerAssessment';
import type { OfficialExam } from '@/content/officialExams';
import type { Result } from '@/utils/result';
import { Err, Ok } from '@/utils/result';

export interface ExamReceipt {
  examKind: 'csat' | 'csat-mock' | 'history-certification';
  publisher: 'KICE' | 'NIKH';
  examId: string; year: number; title: string;
  sourceUrl: string; answerUrl: string;
  questionSha256: string; answerSha256: string; rightsSha256: string;
  checkedBy: string; checkedAt: string;
  rights: { basisUrl: string; basis: 'public-license' | 'written-permission'; summary: string; thirdPartyCleared: boolean; redistributionAllowed: boolean };
}
const allowedHosts: Record<ExamReceipt['publisher'], string[]> = {
  KICE: ['www.kice.re.kr', 'kice.re.kr', 'www.suneung.re.kr', 'suneung.re.kr'],
  NIKH: ['www.historyexam.go.kr', 'historyexam.go.kr', 'www.history.go.kr', 'history.go.kr'],
};
export function officialUrl(url: unknown, publisher: ExamReceipt['publisher']): boolean {
  if (typeof url !== 'string' || url.length > 2000) return false;
  // No URL runtime dependency in the offline/mobile domain. Exact host boundary,
  // HTTPS and no credentials/port; reject whitespace and host spoofing.
  const match = /^https:\/\/([a-z0-9.-]+)(\/[^\s]*)?$/.exec(url);
  return !!match && !!allowedHosts[publisher]?.includes(match[1]!);
}
const hash = (v: unknown) => typeof v === 'string' && /^[a-f0-9]{64}$/.test(v);
const bounded = (v: unknown, min: number, max: number): v is string => typeof v === 'string' && v.trim().length >= min && v.length <= max;
const object = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Structural gate, NOT a factual/legal verification or expert attestation.
 * The CLI also checks artifact hashes. Maintainers must verify the receipt's
 * claims against actual official files and redistribution rights before release.
 */
export function validateExamBundle(input: unknown): Result<{ receipt: ExamReceipt; exams: OfficialExam[] }> {
  if (!object(input) || !object(input.receipt) || !Array.isArray(input.items) || !input.items.length || input.items.length > 200) return Err('기출 묶음에 증빙과 1~200개 문항이 필요합니다.');
  const r = input.receipt;
  if (r.publisher !== 'KICE' && r.publisher !== 'NIKH') return Err('지원하는 공식 발행 기관이 아닙니다.');
  const publisher = r.publisher;
  if ((publisher === 'KICE' && r.examKind !== 'csat' && r.examKind !== 'csat-mock') || (publisher === 'NIKH' && r.examKind !== 'history-certification')) return Err('수능·모의평가·한국사능력검정의 시험 종류를 구분해주세요.');
  if (!bounded(r.examId, 1, 80) || !/^[a-z0-9-]+$/.test(r.examId) || !Number.isInteger(r.year) || (r.year as number) < 1994 || (r.year as number) > 2100 || !bounded(r.title, 1, 120)) return Err('시험 식별 정보가 올바르지 않습니다.');
  if (!officialUrl(r.sourceUrl, publisher) || !officialUrl(r.answerUrl, publisher)) return Err('문제와 확정 정답은 해당 기관의 HTTPS 원문 주소여야 합니다.');
  if (!hash(r.questionSha256) || !hash(r.answerSha256) || !hash(r.rightsSha256)) return Err('원문·정답·이용 권한 자료의 SHA-256이 필요합니다.');
  if (!bounded(r.checkedBy, 2, 120) || !bounded(r.checkedAt, 10, 10) || !/^\d{4}-\d{2}-\d{2}$/.test(r.checkedAt)) return Err('실제 대조 담당자와 확인일이 필요합니다.');
  const date = new Date(r.checkedAt);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0,10) !== r.checkedAt) return Err('확인일이 실제 날짜가 아닙니다.');
  if (!object(r.rights) || (r.rights.basis !== 'public-license' && r.rights.basis !== 'written-permission') || !officialUrl(r.rights.basisUrl, publisher) || !bounded(r.rights.summary, 20, 2000) || r.rights.thirdPartyCleared !== true || r.rights.redistributionAllowed !== true) return Err('앱 재배포와 제3자 지문·그림의 이용 권한을 확인한 증빙이 필요합니다.');
  const exams: OfficialExam[] = [];
  const numbers = new Set<number>();
  for (const item of input.items) {
    if (!object(item) || !Number.isInteger(item.number) || (item.number as number) < 1 || (item.number as number) > 200 || numbers.has(item.number as number)) return Err('문항 번호가 잘못되었거나 중복되었습니다.');
    const number = item.number as number;
    const parsed = validateProblem(item.problem);
    if (!parsed.ok) return Err(`문항 ${number}: ${parsed.error}`);
    const p = parsed.value;
    if (p.options && new Set(p.options.map(o => o.toLowerCase().replace(/\s+/g,''))).size !== p.options.length) return Err(`문항 ${number}: 채점 기준에서 보기가 중복되었습니다.`);
    if (p.options?.some(o => o.length > 256)) return Err(`문항 ${number}: 보기 전체를 채점 입력 범위에서 처리할 수 없습니다.`);
    if (p.source !== 'bank' || p.contentOrigin || p.curriculumUnitId || p.id !== `official:${r.examId}:${number}`) return Err('기출 식별자와 일반 연습 문항을 구분해주세요.');
    if ((publisher === 'KICE' && p.educationLevel !== 'csat') || (publisher === 'NIKH' && (p.educationLevel !== 'csat' || p.subject !== '한국사'))) return Err('기출 과목 또는 학습 분류가 기관과 일치하지 않습니다.');
    if (typeof item.officialAnswer !== 'string' || assessAnswer(p, item.officialAnswer).verdict !== 'correct') return Err(`문항 ${number}: 전사 정답이 공식 확정 정답과 다릅니다.`);
    if (p.answerType === 'numeric' && Number(p.correctAnswer) !== Number(item.officialAnswer)) return Err(`문항 ${number}: 공식 수치 정답은 근삿값으로 전사할 수 없습니다.`);
    // Image/long-passage questions cannot silently lose material on import.
    if (item.materialComplete !== true || item.transcriptionChecked !== true) return Err(`문항 ${number}: 지문·그림을 포함한 전사 확인이 필요합니다.`);
    numbers.add(number);
    exams.push({ kind: r.examKind as OfficialExam['kind'], id: p.id, year: r.year as number, title: r.title as string, educationLevel: p.educationLevel!, subject: p.subject,
      sourceUrl: r.sourceUrl as string, answerUrl: r.answerUrl as string, questionNumber: number, problem: p });
  }
  // Persist only declared evidence fields, never arbitrary input metadata.
  const receipt: ExamReceipt = {
    publisher, examKind: r.examKind as ExamReceipt['examKind'], examId: r.examId, year: r.year as number, title: r.title,
    sourceUrl: r.sourceUrl as string, answerUrl: r.answerUrl as string,
    questionSha256: r.questionSha256 as string, answerSha256: r.answerSha256 as string, rightsSha256: r.rightsSha256 as string,
    checkedBy: r.checkedBy, checkedAt: r.checkedAt,
    rights: { basisUrl: r.rights.basisUrl as string, basis: r.rights.basis,
      summary: r.rights.summary, thirdPartyCleared: true, redistributionAllowed: true },
  };
  return Ok({ receipt, exams });
}
