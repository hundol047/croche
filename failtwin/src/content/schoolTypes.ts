import type { ErrorType, Problem } from '@/domain/types';
export type Difficulty = Problem['difficulty'];
export type SchoolSpec = Pick<Problem, 'prompt' | 'answerType' | 'correctAnswer' | 'explanation' | 'options'>;
export interface SchoolFamily { id: string; topic: string; target: ErrorType; build: (a: number,b: number,c: number) => SchoolSpec }
export const schoolFamily = (id:string,topic:string,build:SchoolFamily['build'],target:ErrorType='calculation_error'):SchoolFamily => ({id,topic,build,target});
export const decimal = (n:number) => String(Number(n.toFixed(6)));
export const numericSchool = (prompt:string,value:number,explanation:string):SchoolSpec => ({
  prompt: `${prompt}\n숫자만 입력하세요.${Number.isInteger(value)?'':' 소수점 아래 6자리까지 반올림해도 됩니다.'}`,
  answerType:'numeric',correctAnswer:decimal(value),explanation,
});
/** Rotate full, distinct option text so correct answers do not occupy a fixed position. */
export function choiceSchool(prompt:string,correct:string,distractors:string[],explanation:string,turn:number,optionCount=4):SchoolSpec {
  const options=[...new Set([correct,...distractors])].slice(0,optionCount);
  if(options.length!==optionCount) throw new Error('보기의 수 또는 구분을 확인해주세요.');
  const shift=turn%options.length;
  return {prompt,answerType:'mcq',correctAnswer:correct,options:[...options.slice(shift),...options.slice(0,shift)],explanation};
}
export const add = (values:number[]) => values.reduce((s,v)=>s+v,0);
export const countWhere = (from:number,to:number,predicate:(n:number)=>boolean) => { let n=0; for(let x=from;x<=to;x+=1)if(predicate(x))n+=1;return n; };
