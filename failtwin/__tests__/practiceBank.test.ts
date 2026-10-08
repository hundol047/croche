import { DIFFICULTIES, practiceCatalog, practiceProblemAt, PROBLEMS_PER_DIFFICULTY, practiceProblem } from '@/content/practiceVariants';
import { assessAnswer } from '@/domain/answerAssessment';
import { validateProblem } from '@/domain/schemas';
import type { Problem, Subject } from '@/domain/types';

const subjects: Subject[] = ['공업수학', '일반물리', 'Python 프로그래밍'];
const numbers = (s: string) => [...s.replace(/−/g, '-').matchAll(/-?\d+(?:\.\d+)?/g)].map(m => Number(m[0]));
const total = (xs: number[]) => xs.reduce((s,x) => s+x,0);
const sequence = (start: number, end: number, step=1) => { const values:number[]=[]; for(let x=start;x<end;x+=step) values.push(x); return values; };
const matches = (s: string, re: RegExp) => { const m=s.match(re); if(!m) throw new Error(`Cannot read displayed conditions: ${s}`); return m.slice(1).map(Number); };

/** Test-only independent reference calculations read DISPLAYED conditions,
 * not generator parameters, correctAnswer, or explanation. No code execution. */
function expectedMath(p: Problem, id: string): number | string {
  const s=p.prompt.split('\n')[0]!, n=numbers(s.replace(/−/g, ''));
  switch(id) {
    case 'derivative': return 2*n[0]!*n[2]!+n[1]!;
    case 'linear': return (n[2]!-n[1]!)/n[0]!;
    case 'integral': return n[1]!*n[0]!**2/2+n[2]!*n[0]!;
    case 'determinant': return n[0]!*n[3]!-n[1]!*n[2]!;
    case 'sequence': return total(sequence(0,n[2]!).map(i=>n[0]!+i*n[1]!));
    case 'series': return `[${n[0]!-n[1]!},${n[0]!+n[1]!}]`;
    case 'ode': { const [k,initial]=matches(s,/y′\+(\d+)y=0, y\(0\)=(\d+)/); return `${initial}e^{-${k}x}`; }
    case 'domain': return n[3]===n[1] ? '정의되지 않음' : (n[3]!**2-n[0]!)/(n[3]!-n[1]!)+n[2]!;
    case 'product': return (n[2]!+n[0]!)+(n[2]!+n[1]!);
    case 'system': return (n[2]!-n[0]!)/(n[1]!-1);
    case 'second': {
      // Multiply linear factors, then differentiate the coefficient array twice.
      let coefficients=[1];
      for(const shift of n.slice(0,3)) { const next=Array(coefficients.length+1).fill(0) as number[]; coefficients.forEach((v,i)=>{ next[i]!+=shift*v; next[i+1]!+=v; }); coefficients=next; }
      return total(coefficients.slice(2).map((v,i)=>v*(i+2)*(i+1)*n[3]!**i));
    }
    case 'polynomial-integral': return total([n[4]!,n[3]!,n[2]!].map((coef,i)=>coef*(n[1]!**(i+1)-n[0]!**(i+1))/(i+1)));
    case 'forced-ode': { const [k,rhs,initial,tden]=matches(s,/y′\+(\d+)y=(\d+), y\(0\)=(\d+)일 때 x=ln\(2\)\/(\d+)/); return rhs!/k!+(initial!-rhs!/k!)*Math.exp(-k!*Math.log(2)/tden!); }
    case 'harmonic': return `[${n[0]!-n[1]!},${n[0]!+n[1]!})`;
    case 'quotient': return (n[0]!*(n[3]!+n[2]!)-(n[0]!*n[3]!+n[1]!))/(n[3]!+n[2]!)**2;
    default: throw new Error(`No reference calculation: ${id}`);
  }
}
function expectedPhysics(p: Problem, id: string): number {
  const n=numbers(p.prompt.split('\n')[0]!);
  switch(id) {
    case 'force': return (n[1]!-n[2]!)/n[0]!;
    case 'speed': return n[0]!/n[1]!;
    case 'weight': return n[0]!*n[1]!;
    case 'work': return (n[0]!-n[1]!)*n[2]!;
    case 'voltage': return n[0]!*n[1]!;
    case 'motion': return n[0]!*n[2]!+n[1]!*n[2]!**2/2;
    case 'energy': return n[0]!*n[1]!**2/2+n[0]!*n[3]!*n[2]!;
    case 'units': return n[0]!/3.6*n[1]!;
    case 'momentum': return n[0]!*n[1]!/(n[0]!+n[2]!);
    case 'spring': return n[0]!*n[1]!**2/2+n[2]!*n[3]!*n[4]!;
    case 'braking': return n[0]!*n[1]!+n[0]!**2/(2*n[2]!);
    case 'parallel': return n[3]!/(n[2]!+1/(1/n[0]!+1/n[1]!));
    case 'incline': return (n[3]!-n[2]!*n[5]!*n[0]!-n[4]!*n[2]!*n[5]!*n[1]!)/n[2]!;
    case 'elastic': return ((n[0]!-n[1]!)*n[2]!+2*n[1]!*n[3]!)/(n[0]!+n[1]!);
    case 'heat': return n[1]!*n[2]!*(1-n[3]!/100)/n[0]!;
    default: throw new Error(`No reference calculation: ${id}`);
  }
}
function expectedPython(p: Problem, id: string): number {
  const s=p.prompt.split('\n숫자만')[0]!.split('\n\n')[1]!, n=numbers(s);
  switch(id) {
    case 'operators': return n[0]!+n[1]!*n[2]!;
    case 'index': return n.slice(0,4)[4+n[4]!]!;
    case 'range-length': return sequence(n[0]!,n[1]!,n[2]!).length;
    case 'division': return Math.floor(n[0]!/n[1]!)+n[2]!%n[3]!;
    case 'string-length': return ('x'.repeat(n[0]!)+'y'.repeat(n[1]!)).repeat(n[2]!).length;
    case 'range': return total(sequence(n[0]!,n[1]!,n[2]!));
    case 'squares': return n[0]!+total(sequence(n[1]!,n[2]!).map(x=>x*x));
    case 'filter': { const [start,end]=matches(s,/range\((\d+), (\d+)\)/), [divisor]=matches(s,/i % (\d+)/); return sequence(start!,end!).filter(x=>x%divisor! ===0).length; }
    case 'dictionary': { const values=s.match(/for x in \[([^\]]+)\]/)![1]!.split(',').map(Number), [key]=matches(s,/print\(counts\[(\d+)\]/); const counts=new Map<number,number>(); values.forEach(x=>counts.set(x,(counts.get(x)??0)+1)); return counts.get(key!)!; }
    case 'slice': return total(sequence(0,n[0]!).filter((_,i)=>i>=n[1]! && i<n[2]!));
    case 'nested': { const [outer,inner]=matches(s,/range\((\d+)\):\n    for j in range\((\d+)\)/), [mod]=matches(s,/% (\d+)/); if(outer!<2 || inner!<2 || mod!<2) throw new Error('Nested exercise lost its combined conditions'); return total(sequence(0,outer!).flatMap(i=>sequence(0,inner!).map(j=>i+j)).filter(x=>x%mod! ===0)); }
    case 'break': { const [start,end]=matches(s,/range\((\d+), (\d+)\)/), [mod]=matches(s,/% (\d+)/); const values=sequence(start!,end!); const first=values.findIndex(x=>x%mod! ===0); return first===-1 ? values.length : first; }
    case 'alias': { if(n[2]!<2) throw new Error('Alias exercise needs multiple shared rows'); const row=Array(n[1]!).fill(n[0]!) as number[], rows=Array(n[2]!).fill(row) as number[][]; rows[n[3]!]![n[4]!]!+=n[5]!; return total(rows.map(r=>r[r.length-1]!)); }
    case 'recursion': { const [initial]=matches(s,/return (\d+)\n/), [factor]=matches(s,/\+ (\d+) \* n/), [end]=matches(s,/print\(f\((\d+)\)/); let value=initial!; for(let i=1;i<=end!;i+=1) value+=factor!*i; return value; }
    case 'set': { const [mod,start,end]=matches(s,/i % (\d+) for i in range\((\d+), (\d+)\)/); if(end!-start!<=mod! || mod!<2) throw new Error('Set exercise needs nontrivial duplicate remainders'); return total([...new Set(sequence(start!,end!).map(i=>i%mod!))]); }
    default: throw new Error(`No reference calculation: ${id}`);
  }
}

describe('90,000 lazily indexed practice problems', () => {
  for(const subject of subjects) {
    it(`audits all 30,000 ${subject} variants: displayed conditions, unique IDs/prompts, schema and grading`, () => {
      const prompts=new Set<string>(), ids=new Set<string>();
      for(const difficulty of DIFFICULTIES) {
        const counts=new Map<string,number>();
        for(let index=0;index<PROBLEMS_PER_DIFFICULTY;index+=1) {
          const p=practiceProblemAt(subject,difficulty,index), id=p.id.split(':').slice(-2)[0]!;
          const expected=subject==='공업수학' ? expectedMath(p,id) : subject==='일반물리' ? expectedPhysics(p,id) : expectedPython(p,id);
          if(typeof expected==='number' ? !Number.isFinite(expected) || Math.abs(Number(p.correctAnswer)-expected)>0.00000051 : p.correctAnswer!==expected) throw new Error(`${p.id}: expected ${expected}, got ${p.correctAnswer}`);
          if(prompts.has(p.prompt) || ids.has(p.id)) throw new Error(`Duplicate ${p.id}`);
          if(/\d\.\d{10}/.test(p.prompt+p.explanation)) throw new Error(`Unformatted decimal ${p.id}`);
          if(!validateProblem(p).ok || assessAnswer(p,p.correctAnswer).verdict!=='correct') throw new Error(`Invalid/ungradable ${p.id}`);
          prompts.add(p.prompt); ids.add(p.id); counts.set(p.topic,(counts.get(p.topic)??0)+1);
        }
        expect([...counts.values()]).toEqual([2000,2000,2000,2000,2000]);
        expect(practiceCatalog(subject,difficulty)).toHaveLength(5);
      }
      expect(prompts.size).toBe(30000); expect(ids.size).toBe(30000);
    });
  }
  it('rejects out-of-range indices and unknown families rather than wrapping to repeats', () => {
    for(const index of [-1,10000,0.5,NaN]) { let failed=false; try { practiceProblemAt('공업수학','easy',index); } catch { failed=true; } expect(failed).toBe(true); }
    let failed=false; try { practiceProblem('공업수학','easy','unknown',0); } catch { failed=true; } expect(failed).toBe(true);
  });
});
