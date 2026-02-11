
import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuizResult, ImprovementPlan, EssayTheme, EssayCorrection } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
  3. Cada questão deve her 5 alternativas (A-E) e apenas uma correta.
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
    // Access response.text property directly (not a method).
    const jsonStr = (response.text || '[]').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Failed to parse questions:", error);
    throw new Error("Erro ao processar as questões geradas pela IA.");
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
          summary: { type: Type.STRING },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          actionItems: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['summary', 'strengths', 'weaknesses', 'actionItems']
      }
    }
  });

  const jsonStr = (response.text || '{}').trim();
  return JSON.parse(jsonStr);
}

export async function generateEssayTheme(): Promise<EssayTheme> {
  const prompt = `Gere um tema de redação inédito no estilo ENEM, focando em problemas sociais, políticos, ambientais ou culturais do Brasil.
  Inclua o título do tema e pelo menos 3 pequenos textos motivadores.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          contextTexts: { type: Type.ARRAY, items: { type: Type.STRING } },
          instructions: { type: Type.STRING }
        },
        required: ['title', 'contextTexts', 'instructions']
      }
    }
  });

  const jsonStr = (response.text || '{}').trim();
  return JSON.parse(jsonStr);
}

export async function evaluateEssay(theme: string, essay: string): Promise<EssayCorrection> {
  const prompt = `Aja como um corretor oficial do ENEM. Corrija a redação abaixo baseada no tema: "${theme}".
  Redação do aluno: "${essay}"
  
  Avalie rigorosamente as 5 competências (0 a 200 cada):
  C1: Norma culta da língua.
  C2: Compreensão do tema e uso de repertório sociocultural.
  C3: Organização, interpretação de dados e defesa de ponto de vista.
  C4: Mecanismos linguísticos (coesão).
  C5: Proposta de intervenção.
  
  Retorne a nota de cada competência, feedback específico e dicas de melhora.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          totalScore: { type: Type.INTEGER },
          competencies: {
            type: Type.OBJECT,
            properties: {
              c1: { type: Type.OBJECT, properties: { score: { type: Type.INTEGER }, feedback: { type: Type.STRING } }, required: ['score', 'feedback'] },
              c2: { type: Type.OBJECT, properties: { score: { type: Type.INTEGER }, feedback: { type: Type.STRING } }, required: ['score', 'feedback'] },
              c3: { type: Type.OBJECT, properties: { score: { type: Type.INTEGER }, feedback: { type: Type.STRING } }, required: ['score', 'feedback'] },
              c4: { type: Type.OBJECT, properties: { score: { type: Type.INTEGER }, feedback: { type: Type.STRING } }, required: ['score', 'feedback'] },
              c5: { type: Type.OBJECT, properties: { score: { type: Type.INTEGER }, feedback: { type: Type.STRING } }, required: ['score', 'feedback'] }
            },
            required: ['c1', 'c2', 'c3', 'c4', 'c5']
          },
          generalAnalysis: { type: Type.STRING },
          improvementTips: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['totalScore', 'competencies', 'generalAnalysis', 'improvementTips']
      }
    }
  });

  const jsonStr = (response.text || '{}').trim();
  return JSON.parse(jsonStr);
}
