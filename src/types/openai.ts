
import { MCQ } from "./mcq";

export interface OpenAIResponse {
  topic: string;
  concept: string;
  questionKey: string;
  baseQuestionKeys?: string;
  questionText: string;
  learningOutcome: string;
  contentType: 'HTML' | 'MARKDOWN';
  questionType: MCQ['questionType'];
  code?: string;
  codeLanguage?: string;
  options: string[];
  correctOption?: string;
  explanation?: string;
  bloomLevel: string;
  input?: string;
  output?: string;
  dbUrl?: string;
  testUrl?: string;
  tablesUsed?: string[];
  displayOrders?: number[];
  correctOrders?: number[];
}
