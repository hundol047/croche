import type { Repositories, LearningState } from '@/storage/repositories';
import type { CrocheAIService, TrapInput } from '@/services/ai/CrocheAIService';
import type { Problem, Subject, TrapProblem, EducationLevel } from './types';
import { practiceCatalog, practiceProblem, PRACTICE_BANK_VERSION, VARIANTS_PER_FAMILY, type Difficulty } from '@/content/practiceVariants';
import { validateProblem, validateTrapProblem } from './schemas';

export interface IssuedQuestion { kind: 'practice' | 'trap'; subject: Subject; target?: string; text: string }

export const practiceProgressKey = (subject: Subject, difficulty: Difficulty, family: string, level: EducationLevel = 'university') => `${level==='university'?PRACTICE_BANK_VERSION:`school-v1:${level}`}:${subject}:${difficulty}:${family}`;

export function practiceAvailability(state: LearningState, subject: Subject, difficulty: Difficulty, level: EducationLevel = 'university') {
  return practiceCatalog(subject, difficulty, level).map((f) => {
    const next = state.practiceProgress?.[practiceProgressKey(subject, difficulty, f.id, level)] ?? 0;
    if (!Number.isInteger(next) || next < 0 || next > VARIANTS_PER_FAMILY) throw new Error('출제 이력을 읽지 못했습니다. 저장된 학습 기록을 확인해주세요.');
    return { ...f, next, remaining: f.count - next };
  });
}

export async function issuePractice(repos: Repositories, ai: CrocheAIService, userId: string, subject: Subject, difficulty: Difficulty = 'medium', topic?: string, level: EducationLevel = 'university'): Promise<Problem> {
  if (ai.kind === 'mock') {
    let problem: Problem | undefined;
    // Selection and reservation share the serialized update. The local bank
    // stores counters, not 90,000 full question texts.
    await repos.learning.update(userId, (state) => {
      const pool = practiceAvailability(state, subject, difficulty, level).filter((f) => f.remaining > 0 && (!topic || f.topic === topic));
      pool.sort((a, b) => a.next - b.next);
      const family = pool[0];
      if (!family) throw new Error('EXHAUSTED: 선택한 난이도 또는 유형의 문제를 모두 열어봤습니다. 다른 유형이나 기본 문제를 선택해주세요.');
      const checked = validateProblem(practiceProblem(subject, difficulty, family.id, family.next, level));
      if (!checked.ok) throw new Error(checked.error);
      problem = checked.value;
      return { ...state, practiceSelection:{educationLevel:level,subject,difficulty}, practiceProgress: { ...state.practiceProgress, [practiceProgressKey(subject, difficulty, family.id, level)]: family.next + 1 } };
    });
    return problem!;
  }
  const history = (await repos.learning.get(userId)).issued ?? [];
  const res = await ai.generateProblem({ educationLevel:level, subject, difficulty, topic, avoidPrompts: history.filter((q) => q.kind === 'practice' && q.subject === subject).map((q) => q.text) });
  if (!res.ok) throw new Error(res.error);
  if (!validateProblem(res.value).ok || res.value.subject!==subject || (res.value.educationLevel??'university')!==level || res.value.difficulty!==difficulty) throw new Error('생성된 문제가 선택한 과목·학습 단계·난이도와 일치하지 않습니다.');
  await reserve(repos, userId, { kind: 'practice', subject: res.value.subject, text: res.value.prompt });
  return res.value;
}

export async function issueTrap(repos: Repositories, ai: CrocheAIService, userId: string, input: TrapInput): Promise<TrapProblem> {
  const history = (await repos.learning.get(userId)).issued ?? [];
  const res = await ai.generateTrapProblem({ ...input, avoidQuestions: history.filter((q) => q.kind === 'trap').map((q) => q.text) });
  if (!res.ok) throw new Error(res.error);
  if (!validateTrapProblem(res.value).ok || res.value.subject!==input.subject || (res.value.educationLevel??'university')!==(input.educationLevel??'university') || res.value.targetErrorType!==input.targetErrorType) throw new Error('생성된 훈련이 선택한 과목·학습 단계·실수 유형과 일치하지 않습니다.');
  await reserve(repos, userId, { kind: 'trap', subject: res.value.subject, target: res.value.targetErrorType, text: res.value.question });
  return res.value;
}

async function reserve(repos: Repositories, userId: string, question: IssuedQuestion): Promise<void> {
  // Issuance is recorded before opening the session, even when the answer is abandoned.
  await repos.learning.update(userId, (state) => {
    const issued = state.issued ?? [];
    if (issued.some((q) => q.kind === question.kind && q.text === question.text)) throw new Error('이미 준비한 문제입니다. 다시 시도해주세요.');
    return { ...state, issued: [...issued, question] };
  });
}
