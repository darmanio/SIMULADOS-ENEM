
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
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Question, QuizResult, UserAnswer, ImprovementPlan, SubTopic } from './types';
import { ENEM_DISCIPLINES, QUESTION_COUNT_OPTIONS } from './constants';
import { generateQuestions, analyzePerformance } from './services/gemini';

// --- Subcomponents ---

const Header: React.FC = () => (
  <header className="bg-white border-b sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <BookOpen className="text-white w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">ENEM <span className="text-indigo-600">Master AI</span></h1>
      </div>
      <div className="hidden sm:block text-sm text-slate-500 font-medium">
        Estatísticas reais dos últimos 15 anos de prova
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
    <p className="text-slate-400 text-sm mt-3 text-center max-w-xs">Aguarde enquanto nossa IA consulta a base histórica e elabora suas questões.</p>
  </div>
);

// --- Main App ---

export default function App() {
  const [step, setStep] = useState<'config' | 'loading' | 'quiz' | 'results'>('config');
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

  // --- Handlers ---

  const handleStartQuiz = async () => {
    if (config.selectedDisciplines.length === 0) {
      alert("Selecione pelo menos uma disciplina.");
      return;
    }
    setStep('loading');
    try {
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
    } catch (error) {
      alert("Erro ao gerar questões. Tente selecionar menos subassuntos ou reduzir a quantidade.");
      setStep('config');
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
  };

  // --- Views ---

  if (step === 'config') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
          <div className="bg-white rounded-3xl shadow-xl border-2 border-slate-100 p-6 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
              <div className="flex items-center gap-3">
                <Settings className="text-indigo-600 w-8 h-8" />
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Setup do Simulado</h2>
              </div>
              <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-2xl flex items-center gap-2 text-sm font-bold border border-amber-100">
                <Zap className="w-4 h-4 fill-current" />
                Baseado em 15 anos de ENEM
              </div>
            </div>

            <div className="space-y-12">
              {/* Quantidade */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                    <span className="bg-slate-100 w-6 h-6 rounded flex items-center justify-center text-[10px]">01</span>
                    Volume de Questões
                  </label>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {QUESTION_COUNT_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setConfig({ ...config, count: opt })}
                      className={`py-4 px-4 rounded-2xl text-sm font-black transition-all ${
                        config.count === opt 
                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-105' 
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Disciplinas */}
              <div>
                <label className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2 mb-6">
                  <span className="bg-slate-100 w-6 h-6 rounded flex items-center justify-center text-[10px]">02</span>
                  Áreas do Conhecimento
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all text-left ${
                        config.selectedDisciplines.includes(d.id)
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-lg shadow-indigo-50'
                        : 'border-slate-100 hover:border-slate-200 text-slate-600'
                      }`}
                    >
                      <span className="font-black text-lg">{d.name}</span>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-colors ${
                        config.selectedDisciplines.includes(d.id) ? 'bg-indigo-600 border-indigo-600 shadow-sm' : 'border-slate-300'
                      }`}>
                        {config.selectedDisciplines.includes(d.id) && <CheckCircle2 className="w-5 h-5 text-white" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hierarchical Refinement */}
              {config.selectedDisciplines.length > 0 && (
                <div className="space-y-8 animate-in slide-in-from-top-6 duration-500">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                      <span className="bg-slate-100 w-6 h-6 rounded flex items-center justify-center text-[10px]">03</span>
                      Refinamento por Incidência
                    </label>
                    <span className="text-[10px] font-black bg-slate-100 text-slate-400 px-3 py-1 rounded-full flex items-center gap-1">
                      <Info className="w-3 h-3" /> % = Frequência no ENEM
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                    {ENEM_DISCIPLINES
                      .filter(d => config.selectedDisciplines.includes(d.id))
                      .map(d => (
                        <div key={d.id} className="bg-slate-50/50 rounded-3xl p-6 border-2 border-slate-100">
                          <h4 className="text-xs font-black text-indigo-500 uppercase mb-6 tracking-[0.2em] flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                            {d.name}
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {d.topics.map(topic => (
                              <div key={topic.name} className="space-y-3">
                                <button
                                  onClick={() => {
                                    const isSelected = config.selectedTopics.includes(topic.name);
                                    setConfig({
                                      ...config,
                                      selectedTopics: isSelected 
                                        ? config.selectedTopics.filter(t => t !== topic.name)
                                        : [...config.selectedTopics, topic.name]
                                    });
                                  }}
                                  className={`w-full flex items-center justify-between p-4 rounded-2xl text-sm font-black transition-all ${
                                    config.selectedTopics.includes(topic.name)
                                    ? 'bg-white text-indigo-700 shadow-md border-2 border-indigo-100'
                                    : 'bg-white/50 text-slate-500 border-2 border-transparent'
                                  }`}
                                >
                                  {topic.name}
                                  {config.selectedTopics.includes(topic.name) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>

                                {config.selectedTopics.includes(topic.name) && (
                                  <div className="grid grid-cols-1 gap-2 pl-2 py-2 animate-in fade-in slide-in-from-left-4">
                                    {topic.subTopics.sort((a,b) => b.frequency - a.frequency).map(sub => (
                                      <button
                                        key={sub.name}
                                        onClick={() => {
                                          const isSelected = config.selectedSubTopics.includes(sub.name);
                                          setConfig({
                                            ...config,
                                            selectedSubTopics: isSelected 
                                              ? config.selectedSubTopics.filter(st => st !== sub.name)
                                              : [...config.selectedSubTopics, sub.name]
                                          });
                                        }}
                                        className={`p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
                                          config.selectedSubTopics.includes(sub.name)
                                          ? 'bg-indigo-600 text-white shadow-lg'
                                          : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-300'
                                        }`}
                                      >
                                        <div className="flex items-center gap-3">
                                          <Tag className={`w-3.5 h-3.5 ${config.selectedSubTopics.includes(sub.name) ? 'text-indigo-200' : 'text-slate-300'}`} />
                                          <span className="truncate max-w-[150px]">{sub.name}</span>
                                        </div>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg shrink-0 ${
                                          config.selectedSubTopics.includes(sub.name) 
                                          ? 'bg-indigo-500 text-white' 
                                          : sub.frequency > 15 
                                            ? 'bg-amber-100 text-amber-700' 
                                            : 'bg-slate-100 text-slate-400'
                                        }`}>
                                          {sub.frequency.toFixed(1)}%
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="pt-10">
                <button
                  onClick={handleStartQuiz}
                  className="w-full bg-indigo-600 text-white py-6 rounded-3xl font-black text-2xl flex items-center justify-center gap-4 hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:translate-y-0"
                  disabled={config.selectedDisciplines.length === 0}
                >
                  <Sparkles className="w-8 h-8 fill-current text-indigo-200" />
                  Gerar Simulado de Especialista
                </button>
                <p className="text-center text-slate-400 text-sm mt-6 font-medium italic">
                  A IA focará nas recorrências históricas de <span className="text-indigo-600 font-bold">{config.selectedSubTopics.length || 'todos'}</span> subassuntos selecionados.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- Reuse the refined Quiz and Results logic from the previous step ---

  if (step === 'loading') {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><LoadingState message="A IA está processando estatísticas e gerando questões..." /></div>;
  }

  if (step === 'quiz') {
    const currentQ = questions[currentQuestionIndex];
    const userAns = userAnswers[currentQuestionIndex];

    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <div className="w-full bg-slate-200 h-1.5"><div className="bg-indigo-600 h-full transition-all duration-500" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }} /></div>
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 text-slate-500 font-black uppercase text-xs tracking-[0.2em]">
              Questão <span className="text-indigo-600 text-2xl">{currentQuestionIndex + 1}</span> <span className="opacity-30">/</span> {questions.length}
            </div>
            <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border-2 border-slate-100 shadow-sm">
              <Timer className="w-5 h-5 text-indigo-600" />
              <span className="text-lg font-black text-slate-700 font-mono">
                {Math.floor((Date.now() - quizStartTime) / 1000 / 60)}m {String(Math.round((Date.now() - quizStartTime) / 1000) % 60).padStart(2, '0')}s
              </span>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-2xl border-2 border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="px-10 py-5 bg-slate-50/50 border-b flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-100/50 px-3 py-1.5 rounded-lg border border-indigo-100">
                {currentQ.discipline}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                {currentQ.topic}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-100 px-3 py-1.5 rounded-lg border border-orange-200 flex items-center gap-2">
                <Tag className="w-3.5 h-3.5" />
                {currentQ.subTopic}
              </span>
            </div>
            
            <div className="p-10 md:p-14">
              <div className="mb-12">
                <div className="bg-slate-50 p-8 rounded-3xl border-2 border-slate-100 mb-10 relative">
                  <div className="absolute -top-3 -left-3 bg-white p-2 rounded-lg border-2 border-slate-100 shadow-sm"><Info className="w-4 h-4 text-slate-400" /></div>
                  <p className="text-slate-700 text-lg md:text-xl leading-relaxed italic text-justify">
                    {currentQ.context}
                  </p>
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight tracking-tight">
                  {currentQ.question}
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {currentQ.options.map((option, idx) => {
                  const letter = ['A', 'B', 'C', 'D', 'E'][idx];
                  const isSelected = userAns?.selectedOption === idx;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      className={`w-full flex items-start text-left p-6 rounded-[1.5rem] border-2 transition-all duration-300 group ${
                        isSelected
                        ? 'border-indigo-600 bg-indigo-50 shadow-xl shadow-indigo-100 translate-x-3 scale-[1.02]'
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/80 hover:translate-x-1'
                      }`}
                    >
                      <span className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-black mr-6 text-xl transition-all duration-300 ${
                        isSelected ? 'bg-indigo-600 text-white rotate-6' : 'bg-slate-100 text-slate-400 group-hover:text-indigo-400'
                      }`}>
                        {letter}
                      </span>
                      <span className={`text-lg md:text-xl font-bold py-2 leading-snug ${
                        isSelected ? 'text-indigo-900' : 'text-slate-600'
                      }`}>
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-10 bg-slate-50/80 border-t flex items-center justify-between">
              <button
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-3 text-slate-400 font-black px-6 py-3 hover:text-slate-800 disabled:opacity-20 transition-all uppercase text-sm tracking-widest"
              >
                <ChevronLeft className="w-6 h-6" />
                Voltar
              </button>

              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={finishQuiz}
                  disabled={userAnswers.length < questions.length || userAnswers.some(a => a === undefined)}
                  className="bg-green-600 text-white px-12 py-5 rounded-3xl font-black flex items-center gap-3 hover:bg-green-700 transition-all shadow-2xl shadow-green-100 disabled:opacity-50 uppercase text-lg tracking-wider active:scale-95"
                >
                  <CheckCircle2 className="w-7 h-7" />
                  Finalizar
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  disabled={!userAns}
                  className="bg-indigo-600 text-white px-12 py-5 rounded-3xl font-black flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 disabled:opacity-50 uppercase text-lg tracking-wider active:scale-95"
                >
                  Avançar
                  <ChevronRight className="w-7 h-7" />
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (step === 'results' && finalResult) {
    const percentage = Math.round((finalResult.correctAnswers / finalResult.totalQuestions) * 100);
    const avgTimePerQuestion = Math.round(finalResult.totalTime / finalResult.totalQuestions);

    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-12">
          
          <div className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
            <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">Performance Master</h2>
            <div className="w-24 h-1.5 bg-indigo-600 mx-auto rounded-full mb-4"></div>
            <p className="text-slate-500 font-bold text-lg uppercase tracking-widest">Relatório Analítico de Subassuntos</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-xl text-center relative overflow-hidden group hover:border-indigo-100 transition-all">
              <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:scale-125 transition-transform duration-700"><Trophy className="w-32 h-32 text-indigo-600" /></div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-4">Taxa de Acerto</p>
              <h3 className="text-7xl font-black text-slate-900 leading-none mb-4">{percentage}%</h3>
              <div className="flex items-center justify-center gap-2 text-indigo-600 font-black bg-indigo-50 py-2 rounded-2xl border border-indigo-100">
                {finalResult.correctAnswers} / {finalResult.totalQuestions} acertos
              </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-xl text-center relative overflow-hidden group hover:border-orange-100 transition-all">
               <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:scale-125 transition-transform duration-700"><Clock className="w-32 h-32 text-orange-600" /></div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-4">Gerenciamento de Tempo</p>
              <h3 className="text-7xl font-black text-slate-900 leading-none mb-4">
                {Math.floor(finalResult.totalTime / 60)}<span className="text-3xl">m</span> {finalResult.totalTime % 60}<span className="text-3xl">s</span>
              </h3>
              <div className="flex items-center justify-center gap-2 text-orange-600 font-black bg-orange-50 py-2 rounded-2xl border border-orange-100">
                Média: {avgTimePerQuestion}s por questão
              </div>
            </div>

            <div className="bg-indigo-600 p-10 rounded-[3rem] shadow-2xl shadow-indigo-100 text-center text-white flex flex-col justify-center items-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-indigo-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <Sparkles className="w-16 h-16 mb-6 animate-bounce" />
              <h4 className="text-2xl font-black mb-3 uppercase tracking-tight">IA Master Analysis</h4>
              <p className="text-indigo-100 text-base font-bold leading-relaxed">Seu plano de ação personalizado está pronto para visualização</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-20">
            {/* Chart */}
            <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-xl">
              <div className="flex items-center justify-between mb-10">
                <h4 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-indigo-600" />
                  Métrica de Velocidade
                </h4>
              </div>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={finalResult.answers.map((a, i) => ({ name: `Q${i+1}`, tempo: a.timeSpent, status: a.isCorrect }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 14, fontWeight: 900, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }} />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc', radius: 12 }} 
                      contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px', fontWeight: 900 }} 
                    />
                    <Bar dataKey="tempo" radius={[10, 10, 0, 0]}>
                      {finalResult.answers.map((a, index) => (
                        <Cell key={`cell-${index}`} fill={a.isCorrect ? '#4f46e5' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Performance Analysis */}
            <div className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10"><Zap className="w-24 h-24 text-indigo-400" /></div>
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-900/50"><Sparkles className="w-8 h-8 text-white" /></div>
                  <h4 className="text-2xl font-black tracking-tighter uppercase">Análise de Pontos Cegos</h4>
                </div>
                {isAnalyzing && <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-indigo-400"></div>}
              </div>

              {improvementPlan ? (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                  <p className="text-slate-300 text-lg leading-relaxed border-l-4 border-indigo-600 pl-8 bg-white/5 py-4 rounded-r-2xl italic">{improvementPlan.summary}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 group hover:bg-green-500/10 transition-all border-l-8 border-l-green-500">
                      <p className="text-[10px] font-black text-green-400 uppercase tracking-[0.3em] mb-4">Alta Precisão</p>
                      <ul className="space-y-3">
                        {improvementPlan.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-100">
                            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" /> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 group hover:bg-red-500/10 transition-all border-l-8 border-l-red-500">
                      <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.3em] mb-4">Gaps Críticos</p>
                      <ul className="space-y-3">
                        {improvementPlan.weaknesses.map((w, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-100">
                            <XCircle className="w-5 h-5 text-red-400 shrink-0" /> {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 mb-6">Plano de Ataque Recomendado:</p>
                    {improvementPlan.actionItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-6 bg-white/5 p-6 rounded-3xl border border-white/10 hover:bg-indigo-600/20 transition-all group">
                        <span className="bg-indigo-600 text-white text-sm font-black w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform">{i + 1}</span>
                        <p className="text-base font-bold text-indigo-50 group-hover:text-white transition-colors">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-24 flex flex-col items-center opacity-30">
                  <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-8"></div>
                  <p className="font-black text-xl uppercase tracking-widest">IA Conectando Dados...</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-12">
            <h4 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
              Revisão por Subassunto
              <span className="text-sm font-bold bg-slate-200 text-slate-500 px-4 py-1 rounded-full">{finalResult.questions.length} Questões</span>
            </h4>
            {finalResult.questions.map((q, idx) => {
              const ans = finalResult.answers[idx];
              const isCorrect = ans.isCorrect;
              return (
                <div key={idx} className={`bg-white rounded-[3rem] border-2 shadow-sm overflow-hidden transition-all hover:shadow-2xl ${isCorrect ? 'border-green-100 hover:border-green-200' : 'border-red-100 hover:border-red-200'}`}>
                  <div className={`px-10 py-6 flex items-center justify-between ${isCorrect ? 'bg-green-50/30' : 'bg-red-50/30'}`}>
                    <div className="flex items-center gap-6">
                      <span className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg ${isCorrect ? 'bg-green-600' : 'bg-red-600'}`}>{idx + 1}</span>
                      <div>
                        <span className={`text-xs font-black uppercase tracking-[0.3em] ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>{isCorrect ? 'Domínio Identificado' : 'Atenção Necessária'}</span>
                        <div className="flex flex-wrap gap-3 mt-2">
                           <span className="text-[10px] font-black text-slate-400 bg-white px-3 py-1 rounded-lg border uppercase shadow-sm">{q.discipline}</span>
                           <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100 uppercase shadow-sm flex items-center gap-2"><Tag className="w-3 h-3" />{q.subTopic}</span>
                        </div>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border-2 shadow-sm">
                      <Clock className="w-5 h-5 text-slate-300" /> 
                      <span className="font-black text-slate-700 font-mono text-lg">{ans.timeSpent}s</span>
                    </div>
                  </div>
                  
                  <div className="p-10 md:p-14">
                    <div className="bg-slate-50 p-8 rounded-[2rem] border-2 border-slate-100 mb-8 italic text-slate-600 text-lg leading-relaxed text-justify relative">
                       <span className="absolute -top-4 -left-4 bg-white px-3 py-1 rounded-lg border-2 border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">Contexto ENEM</span>
                       {q.context}
                    </div>
                    <p className="text-slate-900 text-2xl font-black mb-10 leading-snug tracking-tight">{q.question}</p>
                    
                    <div className="grid grid-cols-1 gap-4 mb-12">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className={`p-6 rounded-[1.5rem] text-base flex items-start gap-5 border-2 transition-all ${
                          oIdx === q.correctIndex ? 'bg-green-50 border-green-200 text-green-900 font-black shadow-lg shadow-green-50' : 
                          oIdx === ans.selectedOption && !isCorrect ? 'bg-red-50 border-red-200 text-red-900 font-bold' : 'bg-white border-slate-100 text-slate-400'
                        }`}>
                          <span className="w-8 h-8 rounded-lg bg-slate-200/50 flex items-center justify-center text-sm font-black shrink-0">{['A','B','C','D','E'][oIdx]}</span>
                          <span className="py-1">{opt}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-10 bg-indigo-50 rounded-[2.5rem] border-2 border-indigo-100 relative group overflow-hidden">
                      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500"><Sparkles className="w-32 h-32 text-indigo-600" /></div>
                      <div className="flex items-center gap-3 mb-6"><Sparkles className="w-6 h-6 text-indigo-600" /><p className="text-indigo-900 font-black text-sm uppercase tracking-[0.2em]">Explicativa da Especialista:</p></div>
                      <p className="text-indigo-800 text-lg leading-relaxed font-bold italic text-justify">{q.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-24 text-center pb-32">
            <button onClick={resetApp} className="inline-flex items-center gap-4 px-14 py-7 bg-indigo-600 text-white font-black rounded-[2rem] hover:bg-indigo-700 transition-all shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:-translate-y-2 active:scale-95 text-xl tracking-tighter">
              <RotateCcw className="w-8 h-8" /> NOVO SIMULADO ESTRATÉGICO
            </button>
            <p className="text-slate-400 text-sm mt-8 font-medium">Reajuste seus subassuntos para focar nos seus pontos fracos.</p>
          </div>
        </main>
      </div>
    );
  }

  return null;
}
