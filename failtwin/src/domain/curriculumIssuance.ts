import { CURRICULUM_BANK_VERSION, curriculumProblem, type CurriculumUnit } from '@/content/curriculumUnits';
import { validateProblem } from './schemas';
import type { Problem } from './types';
import type { LearningState, Repositories } from '@/storage/repositories';

export const curriculumProgressKey = (unit: CurriculumUnit) => `${CURRICULUM_BANK_VERSION}:${unit.id}`;
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
