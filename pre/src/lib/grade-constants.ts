export const GRADE_OPTIONS = [
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6",
  "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12",
  "University Year 1", "University Year 2", "University Year 3", "University Year 4",
  "Graduate Student", "Other"
] as const;

export type GradeOption = typeof GRADE_OPTIONS[number]; 