import type { Problem, Subject, EducationLevel } from '@/domain/types';
import { isCurriculumSubject, type SchoolLevel } from '@/domain/curriculum';
import { schoolMath } from './schoolMath';
import { schoolScience } from './schoolScience';
import { koreanFamilies, englishFamilies } from './schoolReading';
import { socialFamilies } from './schoolSocial';
import { historyFamilies } from './schoolHistory';
import type { Difficulty, SchoolFamily } from './schoolTypes';
/** Released IDs, content and parameter order are immutable; bump for future edits. */
export const SCHOOL_BANK_VERSION = 'school-v1';
export function schoolFamilies(level:EducationLevel,subject:Subject,difficulty:Difficulty):SchoolFamily[] {
  if(level==='university'||!isCurriculumSubject(level,subject))throw new Error('이 학교급에서 지원하지 않는 과목입니다.');
  const school=level as SchoolLevel;
  if(subject==='수학')return schoolMath[school][difficulty];
  if(subject==='국어')return koreanFamilies(school,difficulty);
  if(subject==='영어')return englishFamilies(school,difficulty);
  if(subject==='한국사')return historyFamilies(school,difficulty);
  if(['과학','통합과학','물리학Ⅰ'].includes(subject))return schoolScience[school][difficulty];
  return socialFamilies(school,difficulty);
}
export function schoolProblem(level:EducationLevel,subject:Subject,difficulty:Difficulty,familyId:string,variant:number):Problem {
  if(!Number.isInteger(variant)||variant<0||variant>=2000)throw new Error('출제 범위를 벗어났습니다.');
  const families=schoolFamilies(level,subject,difficulty);
  const familyIndex=families.findIndex(f=>f.id===familyId);
  const family=families[familyIndex];
  if(!family)throw new Error('지원하지 않는 문제 유형입니다.');
  const permuted=(variant*137+familyIndex*271)%2000;
  const a=permuted%20+1,b=Math.floor(permuted/20)%10+1,c=Math.floor(permuted/200)+1;
  return {id:`practice:${SCHOOL_BANK_VERSION}:${level}:${subject}:${difficulty}:${familyId}:${variant}`,educationLevel:level,subject,difficulty,topic:family.topic,source:'bank',contentOrigin:level==='csat'?'original-csat':'parameterized',targetErrorType:family.target,...family.build(a,b,c)};
}
