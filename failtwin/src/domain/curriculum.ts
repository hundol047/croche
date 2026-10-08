/** Stable values are also used in versioned issuance keys. */
export const EDUCATION_LEVELS = ['elementary', 'middle', 'high', 'university', 'csat'] as const;
export type EducationLevel = typeof EDUCATION_LEVELS[number];
export type SchoolLevel = Exclude<EducationLevel, 'university'>;
export const SUBJECTS = ['공업수학', '일반물리', 'Python 프로그래밍', '수학', '국어', '영어', '과학', '사회', '통합과학', '통합사회', '물리학Ⅰ', '사회·문화', '한국사'] as const;
export type Subject = typeof SUBJECTS[number];
export type UniversitySubject = '공업수학' | '일반물리' | 'Python 프로그래밍';
export const educationLabel: Record<EducationLevel, string> = { elementary:'초등학교', middle:'중학교', high:'고등학교', university:'대학교', csat:'수능' };
export const curriculumSubjects: Record<EducationLevel, Subject[]> = {
  elementary:['수학','국어','영어','과학','사회','한국사'],
  middle:['수학','국어','영어','과학','사회','한국사'],
  high:['수학','국어','영어','통합과학','통합사회','한국사'],
  university:['공업수학','일반물리','Python 프로그래밍'],
  csat:['수학','국어','영어','물리학Ⅰ','사회·문화','한국사'],
};
export const curriculumDescription: Record<EducationLevel, string> = {
  elementary:'수·연산, 읽기, 기초 영어와 생활 속 탐구를 연습합니다.',
  middle:'방정식·함수, 글의 근거와 과학·사회 자료를 다룹니다.',
  high:'함수·미적분과 복합 지문, 통합과학·통합사회를 연습합니다.',
  university:'공업수학·일반물리·Python의 개념과 응용을 다룹니다.',
  csat:'독해·자료 해석과 조건을 연결하는 자체 제작 수능형 문제입니다.',
};
export function isUniversitySubject(s: Subject): s is UniversitySubject { return curriculumSubjects.university.includes(s); }
export function isCurriculumSubject(level: EducationLevel, subject: Subject) { return curriculumSubjects[level]?.includes(subject) ?? false; }
