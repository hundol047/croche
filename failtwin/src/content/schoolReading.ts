import type { SchoolLevel } from '@/domain/curriculum';
import { schoolFamily as f, choiceSchool as q, decimal, type SchoolFamily, type Difficulty } from './schoolTypes';

export const READING_NAMES=['Mina','Jisu','Noah','Emma','Yuna','Liam','Sora','Alex','Hana','Evan','Nari','Owen','Dami','Ella','Joon','Mia','Sumin','Leo','Bora','Ian'];
export const ENGLISH_WORDS:Record<SchoolLevel,[string,string][]>={
 elementary:[['clean','깨끗한'],['dirty','더러운'],['heavy','무거운'],['light','가벼운'],['hot','뜨거운'],['cold','차가운'],['round','둥근'],['square','정사각형의'],['dry','마른'],['wet','젖은'],['safe','안전한'],['dangerous','위험한'],['strong','튼튼한'],['weak','약한'],['soft','부드러운'],['hard','단단한'],['wide','폭이 넓은'],['narrow','폭이 좁은'],['new','새로운'],['old','오래된']],
 middle:[['useful','유용한'],['useless','쓸모없는'],['necessary','필요한'],['unnecessary','불필요한'],['possible','가능한'],['impossible','불가능한'],['common','흔한'],['unusual','드문'],['similar','비슷한'],['different','다른'],['correct','옳은'],['incorrect','옳지 않은'],['clear','분명한'],['unclear','분명하지 않은'],['public','공개의'],['private','비공개의'],['local','지역의'],['global','세계적인'],['direct','직접적인'],['indirect','간접적인']],
 high:[['valid','타당한'],['invalid','타당하지 않은'],['consistent','일관된'],['inconsistent','일관되지 않은'],['precise','정밀한'],['imprecise','정밀하지 않은'],['objective','객관적인'],['subjective','주관적인'],['explicit','명시적인'],['implicit','암묵적인'],['relevant','관련 있는'],['irrelevant','관련 없는'],['logical','논리적인'],['illogical','논리적이지 않은'],['feasible','실현 가능한'],['infeasible','실현 불가능한'],['temporary','일시적인'],['permanent','영구적인'],['beneficial','유익한'],['harmful','해로운']],
 csat:[['valid','타당한'],['invalid','타당하지 않은'],['consistent','일관된'],['inconsistent','일관되지 않은'],['precise','정밀한'],['imprecise','정밀하지 않은'],['objective','객관적인'],['subjective','주관적인'],['explicit','명시적인'],['implicit','암묵적인'],['relevant','관련 있는'],['irrelevant','관련 없는'],['logical','논리적인'],['illogical','논리적이지 않은'],['feasible','실현 가능한'],['infeasible','실현 불가능한'],['temporary','일시적인'],['permanent','영구적인'],['beneficial','유익한'],['harmful','해로운']],
};
const basicObjects=['box','bag','board','ball','cup','bottle','packet','basket','plate','container'];
const abstractObjects=['plan','method','design','proposal','project','approach','strategy','system','process','solution'];
const items=['notebook','tablet','ticket','folder','card','bag','key','pen','photo','box'];
const verbs:[string,string,string,string][]=[['play','played','plays','football'],['read','read','reads','a book'],['buy','bought','buys','a notebook'],['make','made','makes','a model'],['watch','watched','watches','a movie'],['visit','visited','visits','the museum'],['eat','ate','eats','breakfast'],['drink','drank','drinks','water'],['study','studied','studies','English'],['write','wrote','writes','a diary']];
const prefix=(level:SchoolLevel)=>level==='csat'?'[수능형 · 자체 제작]\n':'';
const countOptions=(value:number,unit:string)=>[`${value+1}${unit}`,`${value+2}${unit}`,`${value+3}${unit}`,`${value+4}${unit}`];
const tier=(level:SchoolLevel,difficulty:Difficulty)=>Math.min(3,(level==='elementary'?0:1)+(difficulty==='easy'?1:difficulty==='medium'?2:3));
const permutations=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
const namesKo=['가','나','다','라'];

/** Explicit rules plus four candidate rows: exactly one candidate satisfies
 * the active criteria. These are fictional classroom/public-notice scenarios. */
function ruleCandidates(a:number,b:number,c:number,criteria:number,upperLast=false) {
 const limits=[a+5,b+5,c+5], passed=(a+b+c)%4;
 const rows=namesKo.map((name,i)=> {
   const values=[...limits];
   if(i!==passed) { const violated=((i-passed+4)%4-1)%criteria; values[violated]!+=upperLast && violated===2 ? 1 : -1; }
   return {name,values};
 });
 return {limits,passed,rows};
}
export function koreanFamilies(level:SchoolLevel,difficulty:Difficulty):SchoolFamily[] {
 const complexity=tier(level,difficulty), optionCount=level==='csat'?5:4;
 const extra=optionCount===5?['판단할 수 없음']:[];
 const intro=level==='elementary'?'학교에서 안내문을 읽습니다.':level==='middle'?'학교 자치회의 안내문을 읽습니다.':level==='high'?'다음은 가상 독서 프로그램의 운영 안내문이다.':'다음 글은 한 기관의 가상 프로그램 운영 기준을 설명한다. 일반 규칙과 예외를 구분하여 읽는다.';
 return [
  f('ko-notice','안내문에서 필요한 정보',(a,b,c)=> {
    const fee=100*a, day=b+10, seats=c+10;
    const guide=`${intro}\n참가비는 ${fee}원, 접수 마감은 이달 ${day}일, 정원은 ${seats}명이다. 접수 마감일까지 신청해야 하며, 마감 다음 날의 신청은 받지 않는다.`;
    const value=difficulty==='easy'?day:difficulty==='medium'?day+1:fee*seats;
    const ask=difficulty==='easy'?'접수 마감일은 이달 며칠인가요?':difficulty==='medium'?'신청을 받지 않기 시작하는 날은 이달 며칠인가요?':'정원을 채워 모든 참가자가 납부했을 때 걷는 참가비 합계는?';
    const unit=difficulty==='hard'?'원':'일';
    return q(prefix(level)+guide+'\n'+ask,`${value}${unit}`,[...countOptions(value,unit),...extra],difficulty==='easy'?`안내문의 마감일은 ${day}일입니다.`:difficulty==='medium'?`마감일은 포함되지만 다음 날 ${day+1}일부터는 받지 않습니다.`:`참가비 ${fee}원에 정원 ${seats}명을 곱하면 ${value}원입니다.`,a+b+c,optionCount);
  },'condition_omission'),
  f('ko-order','내용의 순서 연결',(a,b,c)=> {
    const labels=['독서 모임','발표 모임','토론 모임'], order=permutations[(a+b+c)%6]!;
    const days=[a,a+b,a+b+c], schedule=order.map((j,i)=>`${labels[j]}: 시작부터 제${days[i]}일`).join('\n');
    const correct=order.map(i=>labels[i]).join(' → ');
    const options=permutations.map(p=>p.map(i=>labels[i]).join(' → ')).filter(s=>s!==correct);
    const source=complexity===1?`행사 일정은 다음과 같습니다.\n${schedule}`:`세 모임은 같은 프로그램에 속한다. 기록에서 '제n일'은 프로그램 시작일을 제1일로 삼아 센다. 모임을 소개한 문장의 순서와 실제 진행 순서는 같다고 가정하지 않는다.\n${[...order].reverse().map(j=>`${labels[j]}: 시작부터 제${days[order.indexOf(j)]}일`).join('\n')}`;
    const chosen=difficulty==='hard'?correct:labels[order[difficulty==='easy'?0:2]!]!;
    const alternatives=difficulty==='hard'?options:[...labels.filter(l=>l!==chosen),'세 모임이 동시에 시작한다','모임 날짜를 알 수 없다'];
    return q(prefix(level)+source+'\n'+(difficulty==='hard'?'가장 먼저 시작한 모임부터 순서대로 배열한 것은?':difficulty==='easy'?'가장 먼저 시작한 모임은?':'가장 나중에 시작한 모임은?'),chosen,alternatives,`날짜 ${days.join(' < ')}의 순서로 읽으면 ${correct}입니다.`,a+b+c,optionCount);
  },'verification_omission'),
  f('ko-evidence','관찰과 해석 구분',(a,b,c)=> {
    const first=a+b+10, second=a+c+10, difference=c-b;
    const relation=difference>0?`${difference}개 증가했다`:difference<0?`${-difference}개 감소했다`:'변하지 않았다';
    const source=`가상 독서 기록의 두 주를 비교했다. 첫 주의 대출은 ${first}권, 다음 주는 ${second}권이었다. 각각 ${b}일과 ${c}일 동안 운영했으며 이용자 구성도 달랐다.${complexity>1?' 이 두 주의 차이는 관찰 결과이며 운영 기간과 이용자 구성이 함께 달라 특정 원인의 영향만 분리할 수 없다.':''}`;
    if(difficulty==='medium')return q(prefix(level)+source+'\n첫 주의 하루 평균 대출량은 몇 권인가요?',`${decimal(first/b)}권`,[1,2,3,4].map(k=>`${decimal(first/b+k)}권`),`첫 주 총량 ${first}권을 운영 일수 ${b}일로 나눕니다. 두 주의 운영 기간이 달라 총량만 비교하면 일별 평균을 알 수 없습니다.`,a+b+c,optionCount);
    if(difficulty==='hard')return q(prefix(level)+source+'\n대출 변화의 원인을 이용자의 능력 하나로 확정한다는 주장에 대한 검토로 옳은 것은?','운영 기간과 이용자 구성도 달라 단일 원인을 확정할 수 없다',['관찰한 두 총량만으로 이용자의 능력이 유일한 원인임을 알 수 있다','운영 기간이 달라도 대출 총량은 반드시 같다','다른 학교에서도 반드시 같은 차이가 난다','원인을 판단하려면 운영 기간과 이용자 구성은 확인할 필요가 없다'],`기간과 이용자 구성도 달라진 관찰 자료로 한 가지 원인을 분리할 수 없습니다.`,a+b+c,optionCount);
    return q(prefix(level)+source+'\n자료만으로 확실히 말할 수 있는 것은?',`대출 총량은 ${relation}`,[`대출 총량은 ${Math.abs(difference)+1}개 증가했다`,'운영 기간이 달라도 항상 대출 총량은 같다','대출 변화의 유일한 원인은 이용자의 능력이다','이 결과는 모든 학교에 그대로 적용된다'],`기록한 두 총량의 차는 ${difference}입니다. 기간과 이용자가 달라진 자료만으로 원인이나 모든 학교의 결과를 단정할 수 없습니다.`,a+b+c,optionCount);
  },'verification_omission'),
  f('ko-rule','조건을 적용해 읽기',(a,b,c)=> {
    const {limits,passed,rows}=ruleCandidates(a,b,c,complexity,difficulty==='hard');
    const fields=['읽은 책 수','기록한 날 수','참여 횟수'];
    const rules=fields.slice(0,complexity).map((label,i)=>`${label}가 ${limits[i]} ${difficulty==='hard'&&i===2?'이하':'이상'}`).join('이고 ');
    const table=rows.map(r=>`${r.name}: 책 ${r.values[0]}권, 기록 ${r.values[1]}일, 참여 ${r.values[2]}회`).join('\n');
    return q(prefix(level)+`${intro}\n${rules}인 학생만 신청할 수 있다. 표시하지 않은 항목은 신청 조건에 포함하지 않는다.\n${table}\n신청할 수 있는 학생은?`,namesKo[passed]!,[...namesKo.filter((_,i)=>i!==passed),...extra],`명시한 ${complexity}개 조건을 모두 만족하는 학생은 ${namesKo[passed]}입니다. 한 조건만 만족하거나 조건 밖의 항목으로 판단하면 안 됩니다.`,a+b+c,optionCount);
  },'condition_omission'),
  f('ko-counterexample','주장과 반례',(a,b,c)=> {
    const limit=a+5,days=b+5,participation=c+5,wrong=(a+b+c)%4;
    const rows=namesKo.map((name,i)=>{
      const counter=i===wrong,other=i%2===0;
      if(difficulty==='medium')return {name,books:counter?limit-1:other?limit+c:limit+c,days:counter?days+c:other?days-1:days+c,participation:participation};
      return {name,books:counter?limit+c:other?limit-1:limit+c,days:counter&&difficulty!=='hard'?days-1:days+c,participation:counter?participation-1:participation+c};
    });
    const statement=difficulty==='medium'?`“${days}일 이상 기록한 학생은 모두 책을 ${limit}권 이상 읽었다.”`:difficulty==='hard'?`“책을 ${limit}권 이상 읽고 ${days}일 이상 기록한 학생은 모두 ${participation}회 이상 참여했다.”`:`“책을 ${limit}권 이상 읽은 학생은 모두 ${days}일 이상 기록했다.”`;
    const table=rows.map(r=>`${r.name}: 책 ${r.books}권, 기록 ${r.days}일${difficulty==='hard'?`, 참여 ${r.participation}회`:''}`).join('\n');
    return q(prefix(level)+`다음 주장과 학생 기록을 비교하세요. 조건이 성립하지만 결론을 만족하지 않는 사례를 찾으세요.\n${statement}\n${table}\n위 주장의 반례는?`,namesKo[wrong]!,[...namesKo.filter((_,i)=>i!==wrong),...extra],`주장의 앞 조건을 만족하지만 뒤의 결론을 만족하지 않는 사례는 ${namesKo[wrong]}입니다.`,a+b+c,optionCount);
  },'concept_confusion'),
 ];
}
export function englishFamilies(level:SchoolLevel,difficulty:Difficulty):SchoolFamily[] {
 const complexity=tier(level,difficulty), optionCount=level==='csat'?5:4;
 return [
  f('en-vocabulary','문맥 속 어휘',(a,b,c)=> {
    const [word,meaning]=ENGLISH_WORDS[level][a-1]!, nouns=level==='elementary'?basicObjects:abstractObjects;
    const context=`This ${nouns[b-1]} is ${word}, but that ${nouns[c-1]} is not ${word}.`;
    const distractors=ENGLISH_WORDS[level].filter((_,i)=>i!==a-1).map(w=>w[1]);
    if(difficulty==='medium')return q(prefix(level)+`${context}\n첫 번째 대상에 대한 설명으로 글과 일치하는 것은?`,`${nouns[b-1]}: ${word}`, [`${nouns[b-1]}: not ${word}`,`두 대상 모두 ${word}`,`두 대상 모두 not ${word}`,'두 대상의 특징은 제시되지 않았다'],`This로 가리킨 첫 번째 대상은 ${word}라고 명시했습니다. 뜻: ${meaning}.`,a+b+c,optionCount);
    if(difficulty==='hard')return q(prefix(level)+`${context} Only an object described as ${word} is eligible under this rule.\n이 규칙에 따라 자격을 갖춘 대상은?`,'첫 번째 대상',['두 번째 대상','두 대상 모두','어느 대상도 아니다','조건을 알 수 없다'],`첫 번째 대상만 ${word}라는 조건을 만족합니다. 뜻: ${meaning}.`,a+b+c,optionCount);
    return q(prefix(level)+`${context}\n이 문맥에서 '${word}'의 뜻은?`,meaning,distractors,`'${word}'는 이 문맥에서 '${meaning}'이라는 뜻입니다. 두 대상을 대조합니다.`,a+b+c,optionCount);
  },'concept_confusion'),
  f('en-grammar','동사형과 문장 조건',(a,b,c)=> {
    const [base,past,third,object]=verbs[b-1]!, actor=READING_NAMES[a-1]!, isPast=c%2===0;
    const time=isPast?`Yesterday at ${c+1} a.m.`:`Every day at ${c+1} a.m.`, correct=isPast?past:third;
    const passage=`${time}, ${actor} ___ ${object}.`;
    const forms=[base,past,third,`${base}ing`,`to ${base}`,`have ${base}`].filter(v=>v!==correct);
    const instruction=isPast?'단순과거 동사형':'3인칭 단수 주어에 맞는 일반현재 동사형';
    const qualifier=difficulty!=='easy'?' 문장은 독립된 한 문장이며 진행형·완료형을 요구하지 않는다.':'';
    if(difficulty==='hard'){
      const second=isPast?'wrote':'writes';
      const paired=forms.map(form=>`${form}; ${second}`).concat([`${correct}; ${isPast?'writes':'wrote'}`]);
      return q(prefix(level)+`${time}, ${actor} ___ ${object} and ___ a diary.\n두 빈칸을 같은 시제로 채우세요. 답은 보기에서 선택하세요.`,`${correct}; ${second}`,paired,`시간 표현에 맞춰 두 동사 모두 ${isPast?'단순과거':'3인칭 단수 일반현재'}로 사용합니다.`,a+b+c,optionCount);
    }
    return q(prefix(level)+`${passage}\n${instruction}으로 빈칸을 채우세요.${qualifier}`,correct,forms,`시간 표현 '${time}'과 단수 인명 주어를 확인합니다. 요구한 동사형은 '${correct}'입니다.`,a+b+c,optionCount);
  },'condition_omission'),
  f('en-reference','대명사가 가리키는 대상',(a,b,c)=> {
    const actor=READING_NAMES[a-1]!, item=items[b-1]!;
    const passage=difficulty==='easy'?`${actor} bought a ${item} for ${c+1} dollars. It was new.`:`${actor} selected a ${item} after comparing prices. It cost ${c+1} dollars, so ${actor} kept the receipt. The item, rather than the act of choosing it, is the subject of the second sentence.`;
    if(difficulty==='hard')return q(prefix(level)+`${actor} bought a ${item} for ${c+1} dollars. The receipt was placed in a folder. It was safely filed.\n세 번째 문장 첫머리의 'It'이 가리키는 것은?`,'receipt',['folder',item,actor,'price','purchase','first sentence'],`바로 앞 문장의 주어인 receipt가 세 번째 문장의 It이 가리키는 대상입니다.`,a+b+c,optionCount);
    return q(prefix(level)+`${passage}\n두 번째 문장 첫머리의 'It'이 가리키는 것은?`,item,items.filter(x=>x!==item),`두 번째 문장의 It은 앞에서 선택하거나 산 '${item}'을 받습니다. 사람이나 가격을 가리키지 않습니다.`,a+b+c,optionCount);
  },'concept_confusion'),
  f('en-order','시간 관계와 글의 순서',(a,b,c)=> {
    const labels=['Reading','Discussion','Presentation'],order=permutations[(a+b+c)%6]!,days=[a,a+b,a+b+c];
    const actor=READING_NAMES[a-1]!;
    const passage=order.map((j,i)=>`${labels[j]} takes place on day ${days[i]} of ${actor}'s project.`).reverse().join(' ');
    const correct=order.map(i=>labels[i]).join(' → '), other=permutations.map(p=>p.map(i=>labels[i]).join(' → ')).filter(x=>x!==correct);
    const chosen=difficulty==='hard'?correct:labels[order[difficulty==='easy'?0:2]!]!;
    const alternatives=difficulty==='hard'?other:[...labels.filter(l=>l!==chosen),'All start together','No dates are given'];
    return q(prefix(level)+passage+'\n'+(difficulty==='hard'?'실제 진행 순서로 옳은 것은?':difficulty==='easy'?'가장 먼저 열리는 행사는?':'가장 나중에 열리는 행사는?'),chosen,alternatives,`day ${days.join(', ')} 순서로 배열하면 ${correct}입니다. 문장에 나온 순서와 행사 날짜를 구분합니다.`,a+b+c,optionCount);
  },'verification_omission'),
  f('en-rule','안내문의 복합 조건',(a,b,c)=> {
    const {limits,passed,rows}=ruleCandidates(a,b,c,complexity,true);
    const criteria=[`at least ${limits[0]} books`,`at least ${limits[1]} days of records`,`${difficulty==='hard'?'exactly':'no more than'} ${limits[2]} late reports`].slice(0,complexity).join(' AND ');
    const table=rows.map((r,i)=>`${String.fromCharCode(65+i)}: ${r.values[0]} books, ${r.values[1]} days of records, ${r.values[2]} late reports`).join('\n');
    const correct=String.fromCharCode(65+passed);
    return q(prefix(level)+`An applicant is eligible only if all these requirements are met: ${criteria}. Other columns are not requirements.\n${table}\nWho is eligible?`,correct,[...['A','B','C','D'].filter(x=>x!==correct),...(optionCount===5?['None of them']:[])],`문장에 명시한 ${complexity}개 조건을 모두 적용하면 ${correct}만 자격을 갖춥니다. at least는 이상, no more than은 이하입니다.`,a+b+c,optionCount);
  },'condition_omission'),
 ];
}
