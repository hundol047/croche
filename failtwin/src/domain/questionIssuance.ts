import type { Repositories } from '@/storage/repositories';
import type { CrocheAIService, TrapInput } from '@/services/ai/CrocheAIService';
import type { Problem, Subject, TrapProblem } from './types';

export interface IssuedQuestion { kind: 'practice' | 'trap'; subject: Subject; target?: string; text: string }

export async function issuePractice(repos: Repositories, ai: CrocheAIService, userId: string, subject: Subject): Promise<Problem> {
  const history = (await repos.learning.get(userId)).issued ?? [];
  const res = await ai.generateProblem({ subject, avoidPrompts: history.filter((q) => q.kind === 'practice' && q.subject === subject).map((q) => q.text) });
  if (!res.ok) throw new Error(res.error);
  await reserve(repos, userId, { kind: 'practice', subject: res.value.subject, text: res.value.prompt });
  return res.value;
}

export async function issueTrap(repos: Repositories, ai: CrocheAIService, userId: string, input: TrapInput): Promise<TrapProblem> {
  const history = (await repos.learning.get(userId)).issued ?? [];
  const res = await ai.generateTrapProblem({ ...input, avoidQuestions: history.filter((q) => q.kind === 'trap').map((q) => q.text) });
  if (!res.ok) throw new Error(res.error);
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
