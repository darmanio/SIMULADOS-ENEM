
export interface Question {
  id: string;
  context: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  discipline: string;
  topic: string;
  subTopic: string;
}

export interface UserAnswer {
  questionId: string;
  selectedOption: number | null;
  timeSpent: number; // in seconds
  isCorrect: boolean;
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  totalTime: number; // in seconds
  answers: UserAnswer[];
  questions: Question[];
}

export interface SubTopic {
  name: string;
  frequency: number; // Percentage of occurrence in the last 15 years
}

export interface Topic {
  name: string;
  subTopics: SubTopic[];
}

export interface Discipline {
  id: string;
  name: string;
  topics: Topic[];
}

export interface ImprovementPlan {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  actionItems: string[];
}

export interface EssayTheme {
  title: string;
  contextTexts: string[];
  instructions: string;
}

export interface EssayCompetency {
  score: number; // 0 to 200
  feedback: string;
}

export interface EssayCorrection {
  totalScore: number;
  competencies: {
    c1: EssayCompetency; // Gramática
    c2: EssayCompetency; // Repertório e Tema
    c3: EssayCompetency; // Organização
    c4: EssayCompetency; // Coesão
    c5: EssayCompetency; // Proposta de Intervenção
  };
  generalAnalysis: string;
  improvementTips: string[];
}
