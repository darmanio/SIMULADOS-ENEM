
import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuizResult, ImprovementPlan } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function generateQuestions(
  count: number,
  disciplines: string[],
  topics: string[],
  subTopics: string[]
): Promise<Question[]> {
  const prompt = `Gere ${count} questões inéditas no estilo do ENEM (Exame Nacional do Ensino Médio). 
  As questões devem ser rigorosamente baseadas em:
  - Disciplinas: ${disciplines.join(', ')}
  - Tópicos Gerais: ${topics.join(', ')}
  - Subassuntos Específicos: ${subTopics.join(', ')}

  Instruções Importantes:
  1. O nível de dificuldade deve ser similar ao ENEM original.
  2. Use textos de apoio realistas (notícias, fragmentos literários, dados científicos).
  3. Cada questão deve ter 5 alternativas (A-E) e apenas uma correta.
  4. Forneça uma explicação pedagógica completa.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            context: { type: Type.STRING },
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              minItems: 5,
              maxItems: 5
            },
            correctIndex: { type: Type.INTEGER },
            explanation: { type: Type.STRING },
            discipline: { type: Type.STRING },
            topic: { type: Type.STRING },
            subTopic: { type: Type.STRING }
          },
          required: ['id', 'context', 'question', 'options', 'correctIndex', 'explanation', 'discipline', 'topic', 'subTopic']
        }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Failed to parse questions:", error);
    throw new Error("Erro ao processar as questões geradas pela IA. Tente selecionar menos subassuntos ou reduzir a quantidade.");
  }
}

export async function analyzePerformance(result: QuizResult): Promise<ImprovementPlan> {
  const dataForAi = {
    totalQuestions: result.totalQuestions,
    score: result.correctAnswers,
    totalTimeSeconds: result.totalTime,
    details: result.answers.map((a, idx) => ({
      discipline: result.questions[idx].discipline,
      topic: result.questions[idx].topic,
      subTopic: result.questions[idx].subTopic,
      isCorrect: a.isCorrect,
      timeSpent: a.timeSpent
    }))
  };

  const prompt = `Analise o desempenho deste estudante no simulado do ENEM e forneça um plano de melhoria extremamente detalhado por SUBASSUNTO. 
  Dados: ${JSON.stringify(dataForAi)}.
  Identifique se o tempo gasto por questão em subassuntos específicos sugere falta de domínio técnico ou dificuldade de interpretação.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "Um resumo geral do desempenho" },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Pontos fortes por subassunto" },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Pontos de melhoria por subassunto" },
          actionItems: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Ações práticas (ex: vídeos, revisões, exercícios)" }
        },
        required: ['summary', 'strengths', 'weaknesses', 'actionItems']
      }
    }
  });

  return JSON.parse(response.text);
}
