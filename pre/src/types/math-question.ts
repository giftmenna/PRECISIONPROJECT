export interface MathQuestion {
  id: string;
  prompt: string;
  topic: string;
  subtopic?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  choices: string[];
  correct: string;
  explanation?: string;
  imageUrl?: string | null;
  timeLimit?: number;
  isactive: boolean;
  createdat: Date;
  updatedat: Date;
}

export interface MathQuestionCreateInput {
  prompt: string;
  topic: string;
  subtopic?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  choices: string[];
  correct: string;
  explanation?: string;
  imageUrl?: string;
  timeLimit?: number;
  isactive?: boolean;
}

export interface MathQuestionUpdateInput {
  prompt?: string;
  topic?: string;
  subtopic?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  choices?: string[];
  correct?: string;
  explanation?: string;
  imageUrl?: string;
  timeLimit?: number;
  isactive?: boolean;
}
