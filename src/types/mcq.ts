
export interface MCQ {
  id: string;
  unitId: string;
  topic?: string;
  concept?: string;
  questionType: 'MULTIPLE_CHOICE' | 'MORE_THAN_ONE_MULTIPLE_CHOICE' | 'CODE_ANALYSIS_MULTIPLE_CHOICE' | 'CODE_ANALYSIS_MORE_THAN_ONE_MULTIPLE_CHOICE' | 'CODE_ANALYSIS_TEXTUAL' | 'FIB_CODING' | 'FIB_SQL_CODING' | 'REARRANGE';
  questionKey: string;
  baseQuestionKeys?: string;
  questionText: string;
  contentType: 'HTML' | 'MARKDOWN';
  code?: string;
  codeLanguage?: string;
  learningOutcome: string;
  explanation?: string;
  bloomLevel: string;
  category: 'BASE' | 'VARIANT' | 'OTHER';
  options: {
    id: string;
    text: string;
    order: number;
    isCorrect: boolean;
  }[];
  // For FIB questions
  fibAnswers?: {
    position: number;
    correctAnswer: string;
    expectedOutput?: string;
  }[];
  // For Rearrange questions
  rearrangeSteps?: {
    text: string;
    displayOrder: number;
    correctOrder: number;
  }[];
  // For Code Analysis Textual
  codeAnalysis?: {
    inputCase?: string;
    expectedOutput: string;
  }[];
  // For SQL specific questions
  externalResources?: {
    dbUrl: string;
    testUrl: string;
    tablesUsed: string[];
  };
  isSelected?: boolean;
  unitTitle?: string;
}
