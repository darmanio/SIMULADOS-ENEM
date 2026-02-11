
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BookOpen, 
  Settings, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  BarChart3, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw,
  Sparkles,
  Trophy,
  Timer,
  ChevronDown,
  ChevronUp,
  Tag,
  Zap,
  Info,
  Target,
  FileText,
  PenTool,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Question, QuizResult, UserAnswer, ImprovementPlan, EssayTheme, EssayCorrection, EssayCompetency } from './types';
import { ENEM_DISCIPLINES, QUESTION_COUNT_OPTIONS } from './constants';
import { generateQuestions, analyzePerformance, generateEssayTheme, evaluateEssay } from './services/gemini';

// --- Subcomponents ---

const Header: React.FC = () => (
  <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <BookOpen className="text-white w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">ENEM <span className="text-indigo-600">Master AI</span></h1>
      </div>
      <div className="hidden sm:flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full border">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Base 2024 Atualizada</span>
        </div>
      </div>
    </div>
  </header>
);

const LoadingState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
    <div className="relative w-24 h-24 mb-8">
      <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
      </div>
    </div>
    <p className="text-xl font-bold text-slate-800">{message}</p>
    <p className="text-slate-400 text-sm mt-3 text-center max-w-xs leading-relaxed">Nossa IA está cruzando a base de dados histórica para gerar conteúdo com o nível exato do ENEM.</p>
  </div>
);

// --- Main App ---

export default function App() {
  const [step, setStep] = useState<'config' | 'loading' | 'quiz' | 'results' | 'essay-writing' | 'essay-result'>('config');
  const [mode, setMode] = useState<'simulado' | 'redacao'>('simulado');
  const [config, setConfig] = useState({
    count: 10,
    selectedDisciplines: [] as string[],
    selectedTopics: [] as string[],
    selectedSubTopics: [] as string[]
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [finalResult, setFinalResult] = useState<QuizResult | null>(null);
  const [improvementPlan, setImprovementPlan] = useState<ImprovementPlan | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Essay specific state
  const [essayTheme, setEssayTheme] = useState<EssayTheme | null>(null);
  const [essayText, setEssayText] = useState('');
  const [essayCorrection, setEssayCorrection] = useState<EssayCorrection | null>(null);

  // --- Handlers ---

  const handleStartActivity = async () => {
    setStep('loading');
    try {
      if (mode === 'simulado') {
        const generated = await generateQuestions(
          config.count, 
          config.selectedDisciplines, 
          config.selectedTopics,
          config.selectedSubTopics
        );
        setQuestions(generated);
        setCurrentQuestionIndex(0);
        setUserAnswers([]);
        setQuizStartTime(Date.now());
        setQuestionStartTime(Date.now());
        setStep('quiz');
      } else {
        const theme = await generateEssayTheme();
        setEssayTheme(theme);
        setEssayText('');
        setQuizStartTime(Date.now());
        setStep('essay-writing');
      }
    } catch (error) {
      alert("Erro ao gerar conteúdo. Tente novamente.");
      setStep('config');
    }
  };

  const handleFinishEssay = async () => {
    if (essayText.length < 300) {
      if (!confirm("Seu texto parece curto demais para uma redação do ENEM. Deseja finalizar mesmo assim?")) return;
    }
    setStep('loading');
    try {
      const correction = await evaluateEssay(essayTheme?.title || '', essayText);
      setEssayCorrection(correction);
      setStep('essay-result');
    } catch (error) {
      alert("Erro ao corrigir redação.");
      setStep('essay-writing');
    }
  };

  const handleAnswer = (optionIndex: number) => {
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    const isCorrect = optionIndex === questions[currentQuestionIndex].correctIndex;
    
    const newAnswer: UserAnswer = {
      questionId: questions[currentQuestionIndex].id,
      selectedOption: optionIndex,
      timeSpent,
      isCorrect
    };

    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestionIndex] = newAnswer;
    setUserAnswers(newUserAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setQuestionStartTime(Date.now());
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const finishQuiz = async () => {
    const totalTime = Math.round((Date.now() - quizStartTime) / 1000);
    const correctCount = userAnswers.filter(a => a?.isCorrect).length;
    
    const result: QuizResult = {
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      totalTime,
      answers: userAnswers,
      questions
    };

    setFinalResult(result);
    setStep('results');
    
    setIsAnalyzing(true);
    try {
      const analysis = await analyzePerformance(result);
      setImprovementPlan(analysis);
    } catch (e) {
      console.error("AI Analysis failed", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetApp = () => {
    setStep('config');
    setQuestions([]);
    setUserAnswers([]);
    setFinalResult(null);
    setImprovementPlan(null);
    setEssayTheme(null);
    setEssayText('');
    setEssayCorrection(null);
  };

  // --- Views ---

  if (step === 'config') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50/50">
        <Header />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border-2 border-slate-100 p-6 md:p-12">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <button 
                onClick={() => setMode('simulado')}
                className={`p-8 rounded-[2rem] border-2 transition-all text-left flex items-start gap-4 ${mode === 'simulado' ? 'border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
              >
                <div className={`p-4 rounded-2xl ${mode === 'simulado' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}><Target className="w-8 h-8" /></div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">Simulado de Questões</h3>
                  <p className="text-sm text-slate-500 font-medium">Questões objetivas com foco estatístico e análise de tempo.</p>
                </div>
              </button>

              <button 
                onClick={() => setMode('redacao')}
                className={`p-8 rounded-[2rem] border-2 transition-all text-left flex items-start gap-4 ${mode === 'redacao' ? 'border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
              >
                <div className={`p-4 rounded-2xl ${mode === 'redacao' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}><PenTool className="w-8 h-8" /></div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">Simulado de Redação</h3>
                  <p className="text-sm text-slate-500 font-medium">Temas inéditos corrigidos pela IA seguindo as 5 competências do ENEM.</p>
                </div>
              </button>
            </div>

            {mode === 'simulado' ? (
              <div className="space-y-14 animate-in fade-in slide-in-from-bottom-4">
                {/* Same simulation config as before */}
                <div>
                  <label className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-3 mb-6">
                    <span className="bg-indigo-600 text-white w-7 h-7 rounded-lg flex items-center justify-center text-xs shadow-md">01</span>
                    Volume de Questões
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                    {QUESTION_COUNT_OPTIONS.map(opt => (
                      <button key={opt} onClick={() => setConfig({ ...config, count: opt })} className={`py-5 px-4 rounded-3xl text-sm font-black transition-all ${config.count === opt ? 'bg-indigo-600 text-white shadow-xl scale-105' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border-2 border-transparent'}`}>{opt}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-3 mb-8">
                    <span className="bg-indigo-600 text-white w-7 h-7 rounded-lg flex items-center justify-center text-xs shadow-md">02</span>
                    Áreas de Conhecimento
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {ENEM_DISCIPLINES.map(d => (
                      <button
                        key={d.id}
                        onClick={() => {
                          const isSelected = config.selectedDisciplines.includes(d.id);
                          setConfig({
                            ...config,
                            selectedDisciplines: isSelected 
                              ? config.selectedDisciplines.filter(id => id !== d.id)
                              : [...config.selectedDisciplines, d.id],
                            selectedTopics: isSelected ? config.selectedTopics.filter(t => !d.topics.some(dt => dt.name === t)) : config.selectedTopics,
                            selectedSubTopics: isSelected ? config.selectedSubTopics.filter(st => !d.topics.some(dt => dt.subTopics.some(s => s.name === st))) : config.selectedSubTopics
                          });
                        }}
                        className={`flex flex-col items-start justify-between p-6 rounded-3xl border-2 transition-all ${config.selectedDisciplines.includes(d.id) ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700' : 'border-slate-100 text-slate-500 bg-slate-50/30'}`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 mb-4 ${config.selectedDisciplines.includes(d.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}`}>
                          {config.selectedDisciplines.includes(d.id) && <CheckCircle2 className="w-5 h-5 text-white" />}
                        </div>
                        <span className="font-black text-xs uppercase leading-tight">{d.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {config.selectedDisciplines.length > 0 && (
                  <div className="space-y-10 pt-4">
                    {/* Simplified Topics Selection for space */}
                    <div className="grid grid-cols-1 gap-4">
                       {ENEM_DISCIPLINES.filter(d => config.selectedDisciplines.includes(d.id)).map(d => (
                         <div key={d.id} className="bg-slate-50 rounded-2xl p-6 border-2 border-slate-100">
                           <h4 className="text-xs font-black text-indigo-600 uppercase mb-4 tracking-widest">{d.name}</h4>
                           <div className="flex flex-wrap gap-2">
                             {d.topics.flatMap(t => t.subTopics).sort((a,b) => b.frequency - a.frequency).map(sub => (
                               <button
                                 key={sub.name}
                                 onClick={() => {
                                   const isSelected = config.selectedSubTopics.includes(sub.name);
                                   setConfig({
                                     ...config,
                                     selectedSubTopics: isSelected ? config.selectedSubTopics.filter(st => st !== sub.name) : [...config.selectedSubTopics, sub.name]
                                   });
                                 }}
                                 className={`px-4 py-2 rounded-xl text-[10px] font-bold border-2 transition-all flex items-center gap-2 ${config.selectedSubTopics.includes(sub.name) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-500'}`}
                               >
                                 {sub.name} <span className="opacity-50">{sub.frequency}%</span>
                               </button>
                             ))}
                           </div>
                         </div>
                       ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 animate-in fade-in slide-in-from-bottom-4">
                <FileText className="w-20 h-20 text-indigo-200 mx-auto mb-6" />
                <h3 className="text-3xl font-black text-slate-900 mb-4">Pronto para escrever?</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-10 leading-relaxed font-medium">A IA irá gerar um tema surpresa, textos motivadores e avaliar sua escrita conforme os critérios do MEC.</p>
                <div className="bg-amber-50 text-amber-800 p-6 rounded-3xl border border-amber-100 flex items-start gap-4 text-left max-w-lg mx-auto">
                   <AlertCircle className="w-6 h-6 shrink-0 mt-1" />
                   <div>
                     <p className="font-bold mb-1">Dica de Especialista:</p>
                     <p className="text-sm">Procure escrever pelo menos 7 linhas e máximo de 30 linhas (cerca de 3000 caracteres) para uma avaliação fidedigna.</p>
                   </div>
                </div>
              </div>
            )}

            <div className="pt-12 border-t-2 border-slate-50 mt-12">
              <button
                onClick={handleStartActivity}
                className="w-full bg-indigo-600 text-white py-8 rounded-[2.5rem] font-black text-2xl flex items-center justify-center gap-4 hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100"
                disabled={mode === 'simulado' && config.selectedDisciplines.length === 0}
              >
                <Sparkles className="w-8 h-8 fill-current text-indigo-300" />
                Começar Simulado {mode === 'redacao' ? 'de Redação' : 'de Questões'}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (step === 'loading') {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><LoadingState message={mode === 'redacao' ? "A IA está elaborando seu tema e textos motivadores..." : "Gerando questões objetivas..."} /></div>;
  }

  // Quiz view
  if (step === 'quiz') {
    const currentQ = questions[currentQuestionIndex];
    const userAns = userAnswers[currentQuestionIndex];
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <div className="w-full bg-slate-200 h-2"><div className="bg-indigo-600 h-full transition-all duration-500" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }} /></div>
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4 text-slate-400 font-black uppercase text-xs tracking-[0.3em]">
              Questão <span className="text-indigo-600 text-3xl font-black">{currentQuestionIndex + 1}</span> / {questions.length}
            </div>
            <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl border-2 shadow-sm">
              <Timer className="w-6 h-6 text-indigo-600" />
              <span className="text-xl font-black text-slate-800 font-mono">
                {Math.floor((Date.now() - quizStartTime) / 1000 / 60)}m {String(Math.round((Date.now() - quizStartTime) / 1000) % 60).padStart(2, '0')}s
              </span>
            </div>
          </div>
          <div className="bg-white rounded-[3rem] shadow-2xl border-2 border-slate-100 overflow-hidden">
            <div className="px-10 py-5 bg-slate-50 border-b flex flex-wrap gap-2 text-[10px] font-black uppercase text-slate-500">
               <span className="bg-indigo-100 text-indigo-600 px-2 py-1 rounded">{currentQ.discipline}</span>
               <span className="bg-slate-200 px-2 py-1 rounded">{currentQ.subTopic}</span>
            </div>
            <div className="p-10 md:p-14">
              <p className="bg-slate-50 p-6 rounded-2xl border mb-8 italic text-slate-600">{currentQ.context}</p>
              <h3 className="text-2xl font-black text-slate-900 mb-8">{currentQ.question}</h3>
              <div className="space-y-4">
                {currentQ.options.map((opt, i) => (
                  <button key={i} onClick={() => handleAnswer(i)} className={`w-full flex items-start gap-4 p-5 rounded-2xl border-2 transition-all ${userAns?.selectedOption === i ? 'border-indigo-600 bg-indigo-50 shadow-lg' : 'border-slate-100 hover:border-slate-200'}`}>
                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0 ${userAns?.selectedOption === i ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{['A','B','C','D','E'][i]}</span>
                    <span className="text-lg font-bold py-1.5">{opt}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="p-8 bg-slate-50 border-t flex justify-between">
              <button onClick={prevQuestion} disabled={currentQuestionIndex === 0} className="text-slate-400 font-black uppercase text-xs flex items-center gap-2"><ChevronLeft /> Voltar</button>
              {currentQuestionIndex === questions.length - 1 ? (
                <button onClick={finishQuiz} disabled={userAnswers.length < questions.length} className="bg-green-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-sm shadow-xl">Finalizar</button>
              ) : (
                <button onClick={nextQuestion} disabled={!userAns} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-sm shadow-xl">Próxima <ChevronRight className="inline" /></button>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (step === 'essay-writing' && essayTheme) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side: Theme & Texts */}
          <div className="bg-white rounded-[2.5rem] shadow-xl border-2 border-slate-100 p-8 overflow-y-auto max-h-[calc(100vh-160px)] custom-scrollbar">
            <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-xs font-black uppercase mb-6 inline-block">Proposta de Redação</div>
            <h2 className="text-3xl font-black text-slate-900 mb-8 leading-tight">{essayTheme.title}</h2>
            
            <div className="space-y-8">
              {essayTheme.contextTexts.map((text, i) => (
                <div key={i} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 relative">
                  <span className="absolute -top-3 left-6 bg-white border px-2 py-0.5 rounded text-[10px] font-black text-slate-400 uppercase">Texto Motivador {i+1}</span>
                  <p className="text-slate-600 text-sm leading-relaxed text-justify whitespace-pre-wrap">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 p-6 bg-amber-50 rounded-3xl border border-amber-100">
               <h4 className="font-black text-amber-900 text-sm uppercase mb-3">Comando da Proposta:</h4>
               <p className="text-amber-800 text-sm leading-relaxed">{essayTheme.instructions}</p>
            </div>
          </div>

          {/* Right Side: Writing Area */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-[2.5rem] shadow-xl border-2 border-slate-100 p-8 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-slate-400 font-black uppercase text-[10px] tracking-widest">
                  <PenTool className="w-4 h-4" /> Folha de Redação
                </div>
                <div className="text-[10px] font-black text-slate-400">{essayText.length} caracteres</div>
              </div>
              
              <textarea
                value={essayText}
                onChange={(e) => setEssayText(e.target.value)}
                placeholder="Comece seu texto aqui..."
                className="flex-1 w-full p-8 rounded-3xl bg-slate-50/50 border-2 border-slate-100 focus:border-indigo-600 outline-none font-medium text-slate-800 leading-relaxed resize-none text-lg min-h-[500px]"
              />

              <div className="mt-8 flex items-center justify-between">
                <div className="text-slate-400 text-xs font-bold">
                  Dica: Utilize conectivos e uma proposta de intervenção clara no último parágrafo.
                </div>
                <button
                  onClick={handleFinishEssay}
                  className="bg-green-600 text-white px-10 py-5 rounded-3xl font-black uppercase text-sm hover:bg-green-700 transition-all shadow-xl shadow-green-100 flex items-center gap-3"
                >
                  <CheckCircle2 className="w-6 h-6" /> Entregar Redação
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (step === 'essay-result' && essayCorrection) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-12">
          
          <div className="text-center mb-16 animate-in fade-in slide-in-from-top-6 duration-1000">
            <p className="text-indigo-600 font-black text-sm uppercase tracking-[0.4em] mb-4">Avaliação Concluída</p>
            <h2 className="text-6xl font-black text-slate-900 mb-6 tracking-tighter">Resultado da Redação</h2>
            <div className="bg-white p-10 rounded-[4rem] border-4 border-indigo-600 inline-block shadow-2xl scale-110 mb-8">
               <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Nota Final</p>
               <h3 className="text-9xl font-black text-indigo-600 leading-none">{essayCorrection.totalScore}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-16">
            {Object.entries(essayCorrection.competencies).map(([key, compValue], idx) => {
              // Explicitly cast to EssayCompetency to fix property access errors on 'unknown'
              const comp = compValue as EssayCompetency;
              return (
                <div key={key} className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-xl hover:border-indigo-100 transition-all group">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Competência {idx+1}</p>
                  <h4 className="text-4xl font-black text-slate-900 mb-2">{comp.score}</h4>
                  <div className="w-full bg-slate-100 h-1 rounded-full mb-4">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${(comp.score/200)*100}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold leading-tight group-hover:text-slate-700 transition-colors">{comp.feedback}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-20">
             <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 opacity-5"><Zap className="w-48 h-48" /></div>
                <h4 className="text-2xl font-black mb-8 flex items-center gap-3"><Sparkles className="w-8 h-8 text-indigo-400" /> Diagnóstico do Texto</h4>
                <p className="text-slate-300 text-lg leading-relaxed border-l-4 border-indigo-600 pl-8 bg-white/5 py-6 rounded-r-2xl italic">{essayCorrection.generalAnalysis}</p>
             </div>

             <div className="bg-white rounded-[3rem] p-12 border-2 border-slate-100 shadow-xl">
                <h4 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3"><Target className="w-8 h-8 text-indigo-600" /> Dicas de Evolução</h4>
                <div className="space-y-4">
                   {essayCorrection.improvementTips.map((tip, i) => (
                     <div key={i} className="flex items-center gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <span className="bg-indigo-600 text-white text-sm font-black w-8 h-8 rounded-xl flex items-center justify-center shrink-0">{i+1}</span>
                        <p className="text-base font-bold text-slate-700">{tip}</p>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          <div className="bg-white rounded-[3.5rem] p-12 md:p-20 border-2 border-slate-100 shadow-2xl">
             <h4 className="text-3xl font-black text-slate-900 mb-10 text-center">Revisão do Seu Texto</h4>
             <div className="bg-slate-50 p-12 rounded-[2.5rem] shadow-inner text-xl md:text-2xl font-medium text-slate-700 leading-loose italic whitespace-pre-wrap text-justify">
                {essayText}
             </div>
          </div>

          <div className="mt-32 text-center pb-40">
            <button onClick={resetApp} className="inline-flex items-center gap-6 px-20 py-10 bg-indigo-600 text-white font-black rounded-[3rem] hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 text-3xl tracking-tighter group">
              <RotateCcw className="w-10 h-10 group-hover:rotate-180 transition-transform" /> NOVO TREINAMENTO
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Simulations results step
  if (step === 'results' && finalResult) {
    const percentage = Math.round((finalResult.correctAnswers / finalResult.totalQuestions) * 100);
    const avgTimePerQuestion = Math.round(finalResult.totalTime / finalResult.totalQuestions);
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-12">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">Resultado Estratégico</h2>
            <div className="w-32 h-2 bg-indigo-600 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="bg-white p-10 rounded-[3rem] border-2 shadow-xl text-center">
              <p className="text-slate-400 text-xs font-black uppercase mb-4">Taxa de Acerto</p>
              <h3 className="text-7xl font-black text-slate-900 leading-none mb-4">{percentage}%</h3>
              <div className="bg-indigo-50 text-indigo-700 font-black py-2 rounded-2xl">{finalResult.correctAnswers} / {finalResult.totalQuestions} acertos</div>
            </div>
            <div className="bg-white p-10 rounded-[3rem] border-2 shadow-xl text-center">
              <p className="text-slate-400 text-xs font-black uppercase mb-4">Tempo Total</p>
              <h3 className="text-7xl font-black text-slate-900 leading-none mb-4">{Math.floor(finalResult.totalTime / 60)}m {finalResult.totalTime % 60}s</h3>
              <div className="bg-orange-50 text-orange-700 font-black py-2 rounded-2xl">Média: {avgTimePerQuestion}s/q</div>
            </div>
            <div className="bg-slate-900 p-10 rounded-[3rem] shadow-xl text-center text-white flex flex-col justify-center items-center">
              <Sparkles className="w-12 h-12 mb-4 text-indigo-400 animate-pulse" />
              <h4 className="text-xl font-black mb-2 uppercase tracking-tight">Análise IA Pronta</h4>
              <p className="text-indigo-100 text-xs">Seu diagnóstico personalizado está disponível abaixo.</p>
            </div>
          </div>
          <div className="text-center pb-40">
            <button onClick={resetApp} className="inline-flex items-center gap-6 px-20 py-10 bg-indigo-600 text-white font-black rounded-[3rem] hover:bg-indigo-700 transition-all text-2xl tracking-tighter">
              <RotateCcw className="w-10 h-10" /> NOVO SIMULADO
            </button>
          </div>
        </main>
      </div>
    );
  }

  return null;
}
