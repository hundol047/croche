import type { EducationLevel, Subject, Problem } from '@/domain/types';
import { OFFICIAL_EXAM_RELEASE } from './officialExamRelease';

export interface OfficialExam {
  kind: 'csat' | 'csat-mock' | 'history-certification';
  id: string;
  year: number;
  title: string;
  educationLevel: EducationLevel;
  subject: Subject;
  sourceUrl: string;
  answerUrl: string;
  questionNumber: number;
  /** Only repository-reviewed releases may populate this list. */
  problem: Problem;
}
/** No official question/answer/license has been retrieved in this environment.
 * An original practice question must never be placed here to inflate coverage.
 */
export const OFFICIAL_EXAMS: readonly OfficialExam[] = OFFICIAL_EXAM_RELEASE;
export const OFFICIAL_SOURCE_PORTALS = [
  { name: '교육부', url: 'https://www.moe.go.kr', purpose: '교육과정 고시·적용 일정' },
  { name: '국가교육과정정보센터', url: 'https://ncic.re.kr', purpose: '교육과정 원문·성취기준' },
  { name: '한국교육과정평가원', url: 'https://www.kice.re.kr', purpose: '수능·모의평가 문제 및 정답' },
  { name: '대학수학능력시험', url: 'https://www.suneung.re.kr', purpose: '공식 기출·정답 공개 자료' },
  { name: '국사편찬위원회 우리역사넷', url: 'https://contents.history.go.kr', purpose: '한국사 근거 자료 조사' },
  { name: '한국사능력검정시험', url: 'https://www.historyexam.go.kr', purpose: '한국사 기출 문제 및 정답' },
] as const;
