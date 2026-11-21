import { useMemo, useState } from 'react';
import { Award, BookOpenCheck, CheckCircle2, ChevronRight, GraduationCap, RotateCcw, Sparkles } from 'lucide-react';
import { learningModules, type Difficulty, type LearningModule } from '../lib/learningData';
import { getLearning, updateLearning } from '../lib/storage';
import { useToast } from '../components/Toast';
import type { LearningProgress } from '../lib/types';

export function LearningPage() {
  const [progress, setProgress] = useState<LearningProgress>(() => getLearning());
  const [module, setModule] = useState<LearningModule | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [daily, setDaily] = useState(false);
  const { notify } = useToast();
  const chosenQuestions = useMemo(() => module ? module.questions.filter((question) => question.difficulty === difficulty) : [], [module, difficulty]);
  const question = chosenQuestions[questionIndex];
  const challengeModule = learningModules[Math.floor(Date.now() / 86_400_000) % learningModules.length];
  const startModule = (item: LearningModule, isDaily = false) => { setModule(item); setQuestionIndex(0); setSelected(null); setAnswered(false); setScore(0); setDaily(isDaily); };
  const choose = (index: number) => { if (!answered) setSelected(index); };
  const submitAnswer = () => {
    if (selected === null || !question) return;
    const correct = selected === question.answer;
    if (correct) setScore((value) => value + 1);
    setAnswered(true);
  };
  const nextQuestion = () => {
    if (!module) return;
    if (questionIndex < chosenQuestions.length - 1) { setQuestionIndex((value) => value + 1); setSelected(null); setAnswered(false); return; }
    const finalScore = Math.round(((score + (selected === question?.answer ? 1 : 0)) / Math.max(chosenQuestions.length, 1)) * 100);
    const next = updateLearning(module.id, finalScore, daily); setProgress(next);
    notify(`${module.title} completed · ${finalScore}%`, 'success'); setModule(null);
  };
  const completed = progress.completed.length;
  return <div className="stack">
    <div className="page-head"><div><span className="eyebrow"><GraduationCap /> Learn by doing</span><h1>Cyber Learning Lab</h1><p>Practice with fictional scenarios, build safer habits, and see a plain-language explanation after every answer.</p></div><span className="badge badge-info"><BookOpenCheck size={11} /> {completed} / 8 modules complete</span></div>
    {!module ? <>
      <section className="panel panel-pad" style={{ background: 'linear-gradient(110deg, rgba(67,139,255,.12), transparent 70%), var(--surface)' }}><div className="row-between" style={{ flexWrap: 'wrap' }}><div><span className="eyebrow"><Sparkles /> Daily challenge</span><h2 style={{ margin: '0 0 5px', fontSize: 17 }}>{challengeModule.title}</h2><p className="muted-text" style={{ margin: 0 }}>A date-based challenge selected from the learning modules. Progress stays in this browser.</p></div><button className="button button-primary" onClick={() => startModule(challengeModule, true)}>Start today's challenge <ChevronRight size={14} /></button></div>{progress.lastChallengeDate === new Date().toISOString().slice(0, 10) && <span className="badge badge-success" style={{ marginTop: 14 }}><CheckCircle2 size={11} /> Completed today</span>}</section>
      <section className="panel panel-pad stack"><div className="panel-head"><div><h2>Choose a learning module</h2><p>Difficulty selects a focused fictional question in each module.</p></div><select className="select" style={{ width: 180 }} value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)} aria-label="Quiz difficulty"><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></div>
        <div className="grid grid-4">{learningModules.map((item) => <button className="learning-card" key={item.id} onClick={() => startModule(item)}><span className="stat-icon"><BookOpenCheck /></span><span><strong style={{ display: 'block', fontSize: 11, color: 'var(--text)' }}>{item.title}</strong><span className="muted-text small">{item.description}</span></span><span className="row-between" style={{ width: '100%' }}>{progress.completed.includes(item.id) ? <span className="badge badge-success">Best {progress.scores[item.id] ?? 0}%</span> : <span className="badge badge-info">{difficulty}</span>}<ChevronRight size={13} color="var(--muted)" /></span></button>)}</div>
      </section>
      <section className="panel panel-pad"><div className="panel-head"><div><h2>Achievements</h2><p>Earned from completed local quizzes.</p></div><Award size={16} color="var(--amber)" /></div><div className="row" style={{ flexWrap: 'wrap' }}><span className={`badge ${completed >= 1 ? 'badge-success' : ''}`}>First module {completed >= 1 ? '· earned' : '· locked'}</span><span className={`badge ${completed >= 4 ? 'badge-success' : ''}`}>Security learner {completed >= 4 ? '· earned' : '· locked'}</span><span className={`badge ${completed >= 8 ? 'badge-success' : ''}`}>All-round awareness {completed >= 8 ? '· earned' : '· locked'}</span><span className={`badge ${Object.values(progress.scores).some((value) => value === 100) ? 'badge-success' : ''}`}>Perfect score {Object.values(progress.scores).some((value) => value === 100) ? '· earned' : '· locked'}</span></div></section>
    </> : <Quiz module={module} question={question} questionIndex={questionIndex} total={chosenQuestions.length} selected={selected} answered={answered} onSelect={choose} onSubmit={submitAnswer} onNext={nextQuestion} onExit={() => setModule(null)} last={questionIndex === chosenQuestions.length - 1} />}
    <div className="notice"><ShieldCheckMark /> These exercises use fictional examples. They teach recognition and verification; they do not train users to attack real services.</div>
  </div>;
}
function Quiz({ module, question, questionIndex, total, selected, answered, onSelect, onSubmit, onNext, onExit, last }: { module: LearningModule; question?: LearningModule['questions'][number]; questionIndex: number; total: number; selected: number | null; answered: boolean; onSelect: (index: number) => void; onSubmit: () => void; onNext: () => void; onExit: () => void; last: boolean }) {
  if (!question) return <section className="panel panel-pad"><div className="notice warning">No question is available for this difficulty.</div><button className="button button-secondary" onClick={onExit}>Back to modules</button></section>;
  return <section className="panel panel-pad stack"><div className="row-between"><div><span className="eyebrow">{module.title} · {question.difficulty}</span><h2 style={{ margin: 0, fontSize: 17 }}>Question {questionIndex + 1} of {total}</h2></div><button className="button button-secondary button-small" onClick={onExit}><RotateCcw size={12} /> Exit quiz</button></div><div className="progress-track"><span style={{ width: `${((questionIndex + 1) / Math.max(total, 1)) * 100}%` }} /></div><h3 style={{ margin: '8px 0', fontSize: 14, lineHeight: 1.6 }}>{question.prompt}</h3><div className="stack-sm">{question.options.map((option, index) => <button className={`quiz-option ${selected === index ? 'selected' : ''} ${answered && index === question.answer ? 'correct' : ''} ${answered && selected === index && index !== question.answer ? 'incorrect' : ''}`} key={option} disabled={answered} onClick={() => onSelect(index)}><span className="badge">{String.fromCharCode(65 + index)}</span><span>{option}</span></button>)}</div>{answered && <div className={`notice ${selected === question.answer ? '' : 'warning'}`}><CheckCircle2 /><span><strong>{selected === question.answer ? 'Correct.' : 'Not quite.'}</strong> {question.explanation}</span></div>}<div className="row-between"><span className="muted-text small">A short explanation appears after you choose.</span>{answered ? <button className="button button-primary" onClick={onNext}>{last ? 'Complete module' : 'Next question'} <ChevronRight size={13} /></button> : <button className="button button-primary" disabled={selected === null} onClick={onSubmit}>Check answer</button>}</div></section>;
}
function ShieldCheckMark() { return <span className="stat-icon"><CheckCircle2 /></span>; }
