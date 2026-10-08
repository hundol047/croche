import { CURRICULUM_BANK_VERSION, CURRICULUM_UNITS, curriculumProblem, type CurriculumUnit } from '@/content/curriculumUnits';
import { validateProblem } from './schemas';
import type { Problem } from './types';
import type { LearningState, Repositories } from '@/storage/repositories';
import { uid } from '@/utils/id';

export const curriculumProgressKey = (unit: CurriculumUnit) => `${CURRICULUM_BANK_VERSION}:${unit.id}`;
export function pendingCurriculumProblem(state: LearningState): Problem | null {
  if (state.curriculumPending === undefined) return null;
  if (typeof state.curriculumPending?.token !== 'string' || !/^curriculum_[a-z0-9]{1,80}$/.test(state.curriculumPending.token)) throw new Error('이어 풀 문제의 저장 기록을 확인해주세요.');
  const id = state.curriculumPending?.problemId;
  for (const unit of CURRICULUM_UNITS) for (let i = 0; i < unit.items.length; i += 1) {
    const problem = curriculumProblem(unit, i);
    if (problem.id === id && i < unitAvailability(state, unit).next) return problem;
  }
  throw new Error('이어 풀 문제의 저장 기록을 확인해주세요.');
}

/** Counts unique answered items; the last adjudicated attempt determines correctness. */
export function unitCompletion(state: LearningState, unit: CurriculumUnit) {
  let answered = 0, correct = 0;
  for (let i = 0; i < unit.items.length; i += 1) {
    const id = curriculumProblem(unit, i).id;
    const records = state.mistakes.filter(m => m.problemId === id);
    const last = records[records.length - 1];
    if (last) { answered += 1; if (last.isCorrect) correct += 1; }
  }
  return { answered, correct };
}

/** Reserve and remember the handoff in one write, including review without consuming a new item. */
export async function prepareCurriculum(repos: Repositories, userId: string, unit: CurriculumUnit, group = unit.group, reviewIndex?: number): Promise<Problem> {
  if (group !== '전체' && group !== unit.group) throw new Error('선택한 학년 범위와 단원이 다릅니다.');
  let problem: Problem | undefined;
  await repos.learning.update(userId, state => {
    const pending = pendingCurriculumProblem(state);
    if (pending) { problem = pending; return state; }
    const { next, remaining } = unitAvailability(state, unit);
    if (reviewIndex !== undefined && (!Number.isInteger(reviewIndex) || reviewIndex < 0 || reviewIndex >= next)) throw new Error('아직 열지 않은 문항은 복습할 수 없습니다.');
    if (reviewIndex === undefined && !remaining) throw new Error('EXHAUSTED: 이 단원의 준비된 문항을 모두 열어봤습니다.');
    const result = validateProblem(curriculumProblem(unit, reviewIndex ?? next));
    if (!result.ok) throw new Error(result.error);
    problem = result.value;
    return { ...state,
      curriculumPending: { problemId: problem.id, token: uid('curriculum') },
      curriculumSelection: { educationLevel: unit.educationLevel, subject: unit.subject, group },
      curriculumProgress: { ...state.curriculumProgress, [curriculumProgressKey(unit)]: reviewIndex === undefined ? next + 1 : next },
    };
  });
  return problem!;
}

export async function finishCurriculumHandoff(repos: Repositories, userId: string, problemId: string, token: string): Promise<LearningState> {
  return repos.learning.update(userId, state => {
    if (state.curriculumPending?.problemId !== problemId || state.curriculumPending.token !== token) return state;
    const next = { ...state }; delete next.curriculumPending; return next;
  });
}
export function unitAvailability(state: LearningState, unit: CurriculumUnit) {
  if (state.curriculumProgress !== undefined && (state.curriculumProgress === null || typeof state.curriculumProgress !== 'object' || Array.isArray(state.curriculumProgress))) throw new Error('단원 출제 이력을 확인해주세요.');
  const stored = state.curriculumProgress?.[curriculumProgressKey(unit)];
  const next = stored === undefined ? 0 : stored;
  if (!Number.isInteger(next) || next < 0 || next > unit.items.length) throw new Error('단원 출제 이력을 확인해주세요.');
  return { next, remaining: unit.items.length - next };
}
/** Reserves before opening, in the same atomic queue as learning events. */
export async function issueCurriculum(repos: Repositories, userId: string, unit: CurriculumUnit, selectedGroup = unit.group): Promise<Problem> {
  if (selectedGroup !== '전체' && selectedGroup !== unit.group) throw new Error('선택한 학년 범위와 단원이 다릅니다.');
  let problem: Problem | undefined;
  await repos.learning.update(userId, state => {
    const { next, remaining } = unitAvailability(state, unit);
    if (!remaining) throw new Error('EXHAUSTED: 이 단원의 준비된 문항을 모두 열어봤습니다.');
    const result = validateProblem(curriculumProblem(unit, next));
    if (!result.ok) throw new Error(result.error);
    problem = result.value;
    return { ...state,
      curriculumSelection: { educationLevel: unit.educationLevel, subject: unit.subject, group: selectedGroup },
      curriculumProgress: { ...state.curriculumProgress, [curriculumProgressKey(unit)]: next + 1 },
    };
  });
  return problem!;
}
