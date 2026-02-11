
import { Discipline } from './types';

export const ENEM_DISCIPLINES: Discipline[] = [
  {
    id: 'matematica',
    name: 'Matemática e suas Tecnologias',
    topics: [
      {
        name: 'Aritmética e Razonamento',
        subTopics: [
          { name: 'Razão, Proporção e Regra de Três', frequency: 28.5 },
          { name: 'Porcentagem', frequency: 12.4 },
          { name: 'Escalas Numéricas', frequency: 6.2 },
          { name: 'Operações com Inteiros e Frações', frequency: 5.1 }
        ]
      },
      {
        name: 'Geometria',
        subTopics: [
          { name: 'Geometria Plana (Áreas e Perímetros)', frequency: 14.8 },
          { name: 'Geometria Espacial (Volumes)', frequency: 10.2 },
          { name: 'Trigonometria (Seno, Cosseno, Tangente)', frequency: 4.5 },
          { name: 'Geometria Analítica', frequency: 2.8 }
        ]
      },
      {
        name: 'Funções e Álgebra',
        subTopics: [
          { name: 'Função de 1º Grau', frequency: 8.4 },
          { name: 'Função de 2º Grau', frequency: 6.1 },
          { name: 'Logaritmos e Exponenciais', frequency: 3.2 },
          { name: 'Progressões (PA e PG)', frequency: 2.5 }
        ]
      },
      {
        name: 'Estatística e Probabilidade',
        subTopics: [
          { name: 'Média, Mediana e Moda', frequency: 9.2 },
          { name: 'Interpretação de Gráficos e Tabelas', frequency: 11.5 },
          { name: 'Probabilidade', frequency: 5.8 },
          { name: 'Análise Combinatória', frequency: 4.3 }
        ]
      }
    ]
  },
  {
    id: 'natureza',
    name: 'Ciências da Natureza',
    topics: [
      {
        name: 'Biologia',
        subTopics: [
          { name: 'Ecologia e Meio Ambiente', frequency: 29.5 },
          { name: 'Genética e Biotecnologia', frequency: 14.2 },
          { name: 'Fisiologia Humana', frequency: 11.8 },
          { name: 'Citologia (Células)', frequency: 9.5 },
          { name: 'Botânica', frequency: 7.2 },
          { name: 'Microbiologia e Doenças', frequency: 8.4 }
        ]
      },
      {
        name: 'Física',
        subTopics: [
          { name: 'Mecânica (Cinemática e Dinâmica)', frequency: 31.2 },
          { name: 'Eletricidade e Magnetismo', frequency: 22.5 },
          { name: 'Termologia', frequency: 14.8 },
          { name: 'Ondulatória', frequency: 12.4 },
          { name: 'Óptica', frequency: 9.2 }
        ]
      },
      {
        name: 'Química',
        subTopics: [
          { name: 'Físico-Química (Soluções, Termo, Eletro)', frequency: 26.8 },
          { name: 'Química Orgânica', frequency: 20.4 },
          { name: 'Química Geral (Atomística, Ligações)', frequency: 18.2 },
          { name: 'Estequiometria', frequency: 15.5 },
          { name: 'Meio Ambiente e Química Verde', frequency: 10.1 }
        ]
      }
    ]
  },
  {
    id: 'humanas',
    name: 'Ciências Humanas',
    topics: [
      {
        name: 'História',
        subTopics: [
          { name: 'História do Brasil (Colônia e Império)', frequency: 15.2 },
          { name: 'Brasil República (Era Vargas e Ditadura)', frequency: 12.8 },
          { name: 'História Geral (Antiguidade e Idade Média)', frequency: 10.4 },
          { name: 'Idade Moderna e Contemporânea', frequency: 18.5 },
          { name: 'Cultura e Identidade', frequency: 11.2 }
        ]
      },
      {
        name: 'Geografia',
        subTopics: [
          { name: 'Geografia Agrária e Meio Ambiente', frequency: 22.4 },
          { name: 'Urbanização e População', frequency: 18.2 },
          { name: 'Geopolítica Mundial', frequency: 14.5 },
          { name: 'Geografia Física (Clima, Relevo)', frequency: 15.8 },
          { name: 'Cartografia', frequency: 6.2 }
        ]
      },
      {
        name: 'Filosofia e Sociologia',
        subTopics: [
          { name: 'Ética e Justiça', frequency: 20.2 },
          { name: 'Filosofia Antiga e Medieval', frequency: 14.5 },
          { name: 'Cultura e Sociedade (Indústria Cultural)', frequency: 18.8 },
          { name: 'Mundo do Trabalho', frequency: 15.2 },
          { name: 'Movimentos Sociais e Política', frequency: 12.4 }
        ]
      }
    ]
  },
  {
    id: 'linguagens',
    name: 'Linguagens e Códigos',
    topics: [
      {
        name: 'Língua Portuguesa',
        subTopics: [
          { name: 'Estratégias Argumentativas e Textuais', frequency: 32.5 },
          { name: 'Variação Linguística', frequency: 18.4 },
          { name: 'Gêneros Textuais', frequency: 15.2 },
          { name: 'Funções da Linguagem', frequency: 12.8 }
        ]
      },
      {
        name: 'Literatura',
        subTopics: [
          { name: 'Modernismo no Brasil', frequency: 25.4 },
          { name: 'Quinhentismo, Barroco e Arcadismo', frequency: 10.2 },
          { name: 'Realismo e Naturalismo', frequency: 12.8 },
          { name: 'Literatura Contemporânea', frequency: 15.5 }
        ]
      },
      {
        name: 'Artes e Educação Física',
        subTopics: [
          { name: 'Artes Plásticas e Vanguardas', frequency: 14.2 },
          { name: 'Patrimônio e Cultura Popular', frequency: 11.5 },
          { name: 'Linguagem Corporal e Saúde', frequency: 18.4 }
        ]
      }
    ]
  }
];

export const QUESTION_COUNT_OPTIONS = [5, 10, 15, 20, 30, 45];
