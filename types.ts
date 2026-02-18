
export enum Language {
  ENGLISH = 'English',
  HINDI = 'Hindi',
  BENGALI = 'Bengali',
  TELUGU = 'Telugu',
  MARATHI = 'Marathi',
  TAMIL = 'Tamil',
  URDU = 'Urdu',
  KANNADA = 'Kannada',
  ODIA = 'Odia',
  PUNJABI = 'Punjabi',
  MALAYALAM = 'Malayalam'
}

export enum ExplanationMode {
  PROFESSIONAL = 'Professional',
  SIMPLE = 'Simple',
  STORY = 'Story-based'
}

export interface ServiceResult {
  name: string;
  description: string;
  officialUrl: string;
  category: 'Government' | 'Healthcare' | 'Education' | 'Technical';
  whyRecommended: string;
}

export interface ServiceDetail {
  overview: string;
  steps: string[];
  documents: string[];
  deadlines: string;
  recommendationReason: string;
}

export interface CodingHelpResponse {
  explanation: string;
  simplifiedCode: string;
  terms: { term: string; meaning: string }[];
}
