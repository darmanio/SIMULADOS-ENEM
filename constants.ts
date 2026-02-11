
import { Discipline } from './types';

export const ENEM_DISCIPLINES: Discipline[] = [
  {
    id: 'matematica',
    name: 'Matemática e suas Tecnologias',
    topics: [
      {
        name: 'Matemática Básica',
        subTopics: [
          { name: 'Razão, Proporção e Regra de Três', frequency: 28.5 },
          { name: 'Porcentagem', frequency: 12.4 },
          { name: 'Escalas e Unidades de Medida', frequency: 7.2 },
          { name: 'Juros Simples e Compostos', frequency: 4.8 }
        ]
      },
      {
        name: 'Estatística',
        subTopics: [
          { name: 'Interpretação de Gráficos e Tabelas', frequency: 14.2 },
          { name: 'Média, Moda e Mediana', frequency: 9.5 },
          { name: 'Desvio Padrão e Variância', frequency: 2.1 }
        ]
      },
      {
        name: 'Geometria Plana',
        subTopics: [
          { name: 'Áreas de Figuras Planas', frequency: 8.4 },
          { name: 'Teorema de Pitágoras e Triângulos', frequency: 6.2 },
          { name: 'Círculos e Polígonos', frequency: 4.1 }
        ]
      },
      {
        name: 'Geometria Espacial',
        subTopics: [
          { name: 'Volume de Prismas e Cilindros', frequency: 7.8 },
          { name: 'Pirâmides, Cones e Esferas', frequency: 5.2 },
          { name: 'Área de Superfície', frequency: 3.1 }
        ]
      },
      {
        name: 'Funções',
        subTopics: [
          { name: 'Funções de 1º e 2º Grau', frequency: 9.2 },
          { name: 'Função Exponencial', frequency: 3.5 },
          { name: 'Logaritmos', frequency: 2.8 }
        ]
      },
      {
        name: 'Probabilidade e Combinatória',
        subTopics: [
          { name: 'Probabilidade Simples e Composta', frequency: 6.1 },
          { name: 'Análise Combinatória (Arranjo/Combinação)', frequency: 4.8 },
          { name: 'Permutações', frequency: 3.2 }
        ]
      },
      {
        name: 'Trigonometria e Sequências',
        subTopics: [
          { name: 'Triângulo Retângulo', frequency: 3.8 },
          { name: 'Ciclo Trigonométrico', frequency: 2.1 },
          { name: 'Progressão Aritmética (PA)', frequency: 3.4 },
          { name: 'Progressão Geométrica (PG)', frequency: 2.2 }
        ]
      },
      {
        name: 'Geometria Analítica',
        subTopics: [
          { name: 'Ponto e Reta', frequency: 2.5 },
          { name: 'Circunferência', frequency: 1.8 }
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
          { name: 'Ecologia (Cadeias e Impactos)', frequency: 30.2 },
          { name: 'Genética e Biotecnologia', frequency: 15.4 },
          { name: 'Fisiologia Humana', frequency: 12.8 },
          { name: 'Citologia (Organelas e Divisão)', frequency: 10.5 },
          { name: 'Botânica', frequency: 8.2 },
          { name: 'Evolução', frequency: 7.1 },
          { name: 'Microbiologia e Doenças', frequency: 9.4 }
        ]
      },
      {
        name: 'Física',
        subTopics: [
          { name: 'Mecânica (Cinética e Newton)', frequency: 28.5 },
          { name: 'Trabalho, Energia e Potência', frequency: 12.4 },
          { name: 'Eletrodinâmica (Circuitos)', frequency: 18.2 },
          { name: 'Ondulatória e Acústica', frequency: 14.5 },
          { name: 'Termologia e Calorimetria', frequency: 12.1 },
          { name: 'Óptica e Visão Humana', frequency: 8.4 },
          { name: 'Estática e Hidrostática', frequency: 5.9 }
        ]
      },
      {
        name: 'Química',
        subTopics: [
          { name: 'Físico-Química (Estequiometria)', frequency: 25.8 },
          { name: 'Química Orgânica (Funções e Reações)', frequency: 21.2 },
          { name: 'Soluções e Equilíbrio Químico', frequency: 15.4 },
          { name: 'Eletroquímica (Pilhas/Eletrólise)', frequency: 12.1 },
          { name: 'Química Geral e Ambiental', frequency: 18.5 },
          { name: 'Atomística e Ligações', frequency: 7.0 }
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
          { name: 'Brasil República (Era Vargas/Ditadura)', frequency: 14.2 },
          { name: 'Brasil Colônia e Ciclos Econômicos', frequency: 12.5 },
          { name: 'Brasil Império', frequency: 9.1 },
          { name: 'Idade Moderna (Iluminismo/Revoluções)', frequency: 15.8 },
          { name: 'Antiguidade Clássica', frequency: 8.4 },
          { name: 'Guerras Mundiais e Guerra Fria', frequency: 11.2 },
          { name: 'Feudalismo e Renascimento', frequency: 7.5 }
        ]
      },
      {
        name: 'Geografia',
        subTopics: [
          { name: 'Geografia Agrária e Ambiental', frequency: 20.4 },
          { name: 'Geopolítica e Globalização', frequency: 18.2 },
          { name: 'Geografia Humana (Demografia/Urbana)', frequency: 16.5 },
          { name: 'Geografia Física (Clima/Relevo)', frequency: 14.8 },
          { name: 'Questões Ambientais e Energia', frequency: 15.1 },
          { name: 'Cartografia e Escalas', frequency: 6.2 },
          { name: 'Hidrografia', frequency: 8.8 }
        ]
      },
      {
        name: 'Filosofia e Sociologia',
        subTopics: [
          { name: 'Ética e Justiça', frequency: 18.5 },
          { name: 'Clássicos da Sociologia', frequency: 15.2 },
          { name: 'Filosofia Antiga (Sócrates/Platão)', frequency: 12.4 },
          { name: 'Indústria Cultural e Cultura', frequency: 14.8 },
          { name: 'Movimentos Sociais e Política', frequency: 13.1 },
          { name: 'Filosofia Moderna (Empirismo/Kant)', frequency: 11.5 },
          { name: 'Trabalho e Desigualdade', frequency: 14.5 }
        ]
      }
    ]
  },
  {
    id: 'linguagens',
    name: 'Linguagens e Códigos',
    topics: [
      {
        name: 'Estratégias de Leitura',
        subTopics: [
          { name: 'Funções da Linguagem', frequency: 22.4 },
          { name: 'Figuras de Linguagem', frequency: 18.2 },
          { name: 'Variação Linguística', frequency: 15.5 },
          { name: 'Interpretação e Argumentação', frequency: 34.2 }
        ]
      },
      {
        name: 'Gêneros Textuais',
        subTopics: [
          { name: 'Notícia e Editorial', frequency: 15.4 },
          { name: 'Tirinhas e Anúncios', frequency: 14.8 },
          { name: 'Crônicas e Literatura Literária', frequency: 12.1 }
        ]
      },
      {
        name: 'Literatura Brasileira',
        subTopics: [
          { name: 'Modernismo (1922 e gerações)', frequency: 28.5 },
          { name: 'Realismo e Machado de Assis', frequency: 14.2 },
          { name: 'Quinhentismo e Barroco', frequency: 8.4 },
          { name: 'Literatura Contemporânea', frequency: 12.5 }
        ]
      },
      {
        name: 'Artes e Ed. Física',
        subTopics: [
          { name: 'Arte Moderna e Contemporânea', frequency: 18.2 },
          { name: 'Patrimônio Cultural', frequency: 12.4 },
          { name: 'Práticas Corporais e Saúde', frequency: 22.1 },
          { name: 'Vanguardas Europeias', frequency: 14.5 }
        ]
      },
      {
        name: 'Língua Estrangeira',
        subTopics: [
          { name: 'Interpretação Textual (Inglês/Espanhol)', frequency: 85.0 },
          { name: 'Gramática Aplicada', frequency: 15.0 }
        ]
      }
    ]
  }
];

export const QUESTION_COUNT_OPTIONS = [5, 10, 15, 20, 30, 45];
