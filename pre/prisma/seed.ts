import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Gem weights for different math topics
const GEM_WEIGHTS: Record<string, number> = {
  "arithmetic:addition": 1,
  "arithmetic:subtraction": 1,
  "arithmetic:multiplication": 1,
  "arithmetic:division": 1,
  "fractions": 2,
  "percentages": 2,
  "ratios": 2,
  "linear_algebra_basics": 3,
  "geometry_basics": 3,
  "quadratics": 4,
  "functions": 4,
  "probability": 4,
  "statistics:advanced": 5,
  "calculus:limits": 5,
  "calculus:derivatives": 5,
  "calculus:integrals": 5
};

// Sample math questions for both practice and competitions
const mathQuestions = [
  // Arithmetic: Addition (10 questions)
  {
    prompt: "What is 15 + 27?",
    choices: { A: "40", B: "42", C: "43", D: "44" },
    correct: "B",
    topic: "arithmetic:addition",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_15_plus_27"
  },
  {
    prompt: "Calculate: 89 + 156",
    choices: { A: "235", B: "245", C: "255", D: "265" },
    correct: "B",
    topic: "arithmetic:addition",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_89_plus_156"
  },
  {
    prompt: "What is 234 + 567?",
    choices: { A: "791", B: "801", C: "811", D: "821" },
    correct: "B",
    topic: "arithmetic:addition",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_234_plus_567"
  },
  {
    prompt: "Add: 1,234 + 5,678",
    choices: { A: "6,802", B: "6,812", C: "6,822", D: "6,832" },
    correct: "B",
    topic: "arithmetic:addition",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_1234_plus_5678"
  },
  {
    prompt: "Calculate: 12,345 + 67,890",
    choices: { A: "80,135", B: "80,235", C: "80,335", D: "80,435" },
    correct: "B",
    topic: "arithmetic:addition",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_12345_plus_67890"
  },
  {
    prompt: "What is 0.5 + 0.25?",
    choices: { A: "0.65", B: "0.70", C: "0.75", D: "0.80" },
    correct: "C",
    topic: "arithmetic:addition",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_0_5_plus_0_25"
  },
  {
    prompt: "Add: 3.14 + 2.86",
    choices: { A: "5.90", B: "6.00", C: "6.10", D: "6.20" },
    correct: "B",
    topic: "arithmetic:addition",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_3_14_plus_2_86"
  },
  {
    prompt: "Calculate: 1/4 + 1/8",
    choices: { A: "1/12", B: "2/12", C: "3/8", D: "1/3" },
    correct: "C",
    topic: "arithmetic:addition",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_1_4_plus_1_8"
  },
  {
    prompt: "What is 2/3 + 1/6?",
    choices: { A: "3/9", B: "5/6", C: "1/2", D: "4/6" },
    correct: "B",
    topic: "arithmetic:addition",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_2_3_plus_1_6"
  },
  {
    prompt: "Add: 7/8 + 3/4",
    choices: { A: "10/12", B: "13/8", C: "5/4", D: "11/8" },
    correct: "B",
    topic: "arithmetic:addition",
    difficulty: "hard",
    source: "internal",
    uidExternal: "math_7_8_plus_3_4"
  },
  // Arithmetic: Subtraction (10 questions)
  {
    prompt: "What is 45 - 23?",
    choices: { A: "20", B: "22", C: "24", D: "26" },
    correct: "B",
    topic: "arithmetic:subtraction",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_45_minus_23"
  },
  {
    prompt: "Calculate: 156 - 89",
    choices: { A: "57", B: "67", C: "77", D: "87" },
    correct: "B",
    topic: "arithmetic:subtraction",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_156_minus_89"
  },
  {
    prompt: "What is 567 - 234?",
    choices: { A: "323", B: "333", C: "343", D: "353" },
    correct: "B",
    topic: "arithmetic:subtraction",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_567_minus_234"
  },
  {
    prompt: "Subtract: 5,678 - 1,234",
    choices: { A: "4,344", B: "4,444", C: "4,544", D: "4,644" },
    correct: "B",
    topic: "arithmetic:subtraction",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_5678_minus_1234"
  },
  {
    prompt: "Calculate: 67,890 - 12,345",
    choices: { A: "55,445", B: "55,545", C: "55,645", D: "55,745" },
    correct: "B",
    topic: "arithmetic:subtraction",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_67890_minus_12345"
  },
  {
    prompt: "What is 0.75 - 0.25?",
    choices: { A: "0.40", B: "0.45", C: "0.50", D: "0.55" },
    correct: "C",
    topic: "arithmetic:subtraction",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_0_75_minus_0_25"
  },
  {
    prompt: "Subtract: 6.00 - 3.14",
    choices: { A: "2.76", B: "2.86", C: "2.96", D: "3.06" },
    correct: "B",
    topic: "arithmetic:subtraction",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_6_00_minus_3_14"
  },
  {
    prompt: "Calculate: 3/4 - 1/8",
    choices: { A: "5/8", B: "6/8", C: "7/8", D: "1/2" },
    correct: "A",
    topic: "arithmetic:subtraction",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_3_4_minus_1_8"
  },
  {
    prompt: "What is 5/6 - 1/3?",
    choices: { A: "1/2", B: "2/3", C: "3/6", D: "4/6" },
    correct: "A",
    topic: "arithmetic:subtraction",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_5_6_minus_1_3"
  },
  {
    prompt: "Subtract: 13/8 - 3/4",
    choices: { A: "7/8", B: "8/8", C: "9/8", D: "10/8" },
    correct: "A",
    topic: "arithmetic:subtraction",
    difficulty: "hard",
    source: "internal",
    uidExternal: "math_13_8_minus_3_4"
  },
  // Arithmetic: Multiplication (10 questions)
  {
    prompt: "What is 7 × 8?",
    choices: { A: "54", B: "56", C: "58", D: "60" },
    correct: "B",
    topic: "arithmetic:multiplication",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_7_times_8"
  },
  {
    prompt: "Calculate: 12 × 15",
    choices: { A: "170", B: "180", C: "190", D: "200" },
    correct: "B",
    topic: "arithmetic:multiplication",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_12_times_15"
  },
  {
    prompt: "What is 23 × 45?",
    choices: { A: "1,015", B: "1,035", C: "1,055", D: "1,075" },
    correct: "B",
    topic: "arithmetic:multiplication",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_23_times_45"
  },
  {
    prompt: "Multiply: 67 × 89",
    choices: { A: "5,863", B: "5,963", C: "6,063", D: "6,163" },
    correct: "B",
    topic: "arithmetic:multiplication",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_67_times_89"
  },
  {
    prompt: "Calculate: 234 × 567",
    choices: { A: "132,678", B: "133,678", C: "134,678", D: "135,678" },
    correct: "A",
    topic: "arithmetic:multiplication",
    difficulty: "hard",
    source: "internal",
    uidExternal: "math_234_times_567"
  },
  {
    prompt: "What is 0.5 × 0.25?",
    choices: { A: "0.1", B: "0.125", C: "0.15", D: "0.2" },
    correct: "B",
    topic: "arithmetic:multiplication",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_0_5_times_0_25"
  },
  {
    prompt: "Multiply: 3.14 × 2",
    choices: { A: "6.18", B: "6.28", C: "6.38", D: "6.48" },
    correct: "B",
    topic: "arithmetic:multiplication",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_3_14_times_2"
  },
  {
    prompt: "Calculate: 1/4 × 1/2",
    choices: { A: "1/6", B: "1/8", C: "1/10", D: "1/12" },
    correct: "B",
    topic: "arithmetic:multiplication",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_1_4_times_1_2"
  },
  {
    prompt: "What is 2/3 × 3/4?",
    choices: { A: "1/2", B: "3/8", C: "6/12", D: "1/2" },
    correct: "A",
    topic: "arithmetic:multiplication",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_2_3_times_3_4"
  },
  {
    prompt: "Multiply: 5/6 × 7/8",
    choices: { A: "35/48", B: "35/42", C: "35/54", D: "35/56" },
    correct: "A",
    topic: "arithmetic:multiplication",
    difficulty: "hard",
    source: "internal",
    uidExternal: "math_5_6_times_7_8"
  },
  // Arithmetic: Division (10 questions)
  {
    prompt: "What is 56 ÷ 8?",
    choices: { A: "6", B: "7", C: "8", D: "9" },
    correct: "B",
    topic: "arithmetic:division",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_56_divided_by_8"
  },
  {
    prompt: "Calculate: 180 ÷ 12",
    choices: { A: "12", B: "13", C: "14", D: "15" },
    correct: "D",
    topic: "arithmetic:division",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_180_divided_by_12"
  },
  {
    prompt: "What is 1,035 ÷ 23?",
    choices: { A: "43", B: "44", C: "45", D: "46" },
    correct: "C",
    topic: "arithmetic:division",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_1035_divided_by_23"
  },
  {
    prompt: "Divide: 5,963 ÷ 67",
    choices: { A: "87", B: "88", C: "89", D: "90" },
    correct: "C",
    topic: "arithmetic:division",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_5963_divided_by_67"
  },
  {
    prompt: "Calculate: 132,678 ÷ 234",
    choices: { A: "565", B: "566", C: "567", D: "568" },
    correct: "C",
    topic: "arithmetic:division",
    difficulty: "hard",
    source: "internal",
    uidExternal: "math_132678_divided_by_234"
  },
  {
    prompt: "What is 0.125 ÷ 0.5?",
    choices: { A: "0.2", B: "0.25", C: "0.3", D: "0.35" },
    correct: "B",
    topic: "arithmetic:division",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_0_125_divided_by_0_5"
  },
  {
    prompt: "Divide: 6.28 ÷ 3.14",
    choices: { A: "1.8", B: "1.9", C: "2.0", D: "2.1" },
    correct: "C",
    topic: "arithmetic:division",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_6_28_divided_by_3_14"
  },
  {
    prompt: "Calculate: 1/8 ÷ 1/4",
    choices: { A: "1/2", B: "1/3", C: "1/4", D: "1/6" },
    correct: "A",
    topic: "arithmetic:division",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_1_8_divided_by_1_4"
  },
  {
    prompt: "What is 1/2 ÷ 2/3?",
    choices: { A: "1/3", B: "2/3", C: "3/4", D: "1/2" },
    correct: "C",
    topic: "arithmetic:division",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_1_2_divided_by_2_3"
  },
  {
    prompt: "Divide: 35/48 ÷ 5/6",
    choices: { A: "7/8", B: "6/7", C: "5/6", D: "4/5" },
    correct: "A",
    topic: "arithmetic:division",
    difficulty: "hard",
    source: "internal",
    uidExternal: "math_35_48_divided_by_5_6"
  },
  // Fractions (10 questions)
  {
    prompt: "What is 1/2 + 1/4?",
    choices: { A: "1/6", B: "2/6", C: "3/4", D: "1/3" },
    correct: "C",
    topic: "fractions",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_1_2_plus_1_4"
  },
  {
    prompt: "Calculate: 2/3 - 1/6",
    choices: { A: "1/2", B: "1/3", C: "1/6", D: "2/6" },
    correct: "A",
    topic: "fractions",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_2_3_minus_1_6"
  },
  {
    prompt: "What is 3/4 × 2/5?",
    choices: { A: "3/10", B: "6/20", C: "3/20", D: "6/10" },
    correct: "A",
    topic: "fractions",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_3_4_times_2_5"
  },
  {
    prompt: "Divide: 3/8 ÷ 1/4",
    choices: { A: "1/2", B: "3/2", C: "1/3", D: "3/4" },
    correct: "B",
    topic: "fractions",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_3_8_divided_by_1_4"
  },
  {
    prompt: "Simplify: 12/18",
    choices: { A: "1/2", B: "2/3", C: "3/4", D: "4/5" },
    correct: "B",
    topic: "fractions",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_simplify_12_18"
  },
  {
    prompt: "Convert 0.75 to a fraction",
    choices: { A: "1/4", B: "2/4", C: "3/4", D: "4/4" },
    correct: "C",
    topic: "fractions",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_0_75_to_fraction"
  },
  {
    prompt: "What is 2/5 as a decimal?",
    choices: { A: "0.2", B: "0.3", C: "0.4", D: "0.5" },
    correct: "C",
    topic: "fractions",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_2_5_as_decimal"
  },
  {
    prompt: "Add: 1/3 + 1/4 + 1/6",
    choices: { A: "3/4", B: "4/5", C: "5/6", D: "6/7" },
    correct: "A",
    topic: "fractions",
    difficulty: "hard",
    source: "internal",
    uidExternal: "math_1_3_plus_1_4_plus_1_6"
  },
  {
    prompt: "What is 5/6 of 24?",
    choices: { A: "18", B: "20", C: "22", D: "24" },
    correct: "B",
    topic: "fractions",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_5_6_of_24"
  },
  {
    prompt: "Find 2/3 of 3/4",
    choices: { A: "1/2", B: "2/3", C: "3/4", D: "1/3" },
    correct: "A",
    topic: "fractions",
    difficulty: "hard",
    source: "internal",
    uidExternal: "math_2_3_of_3_4"
  },
  // Percentages (10 questions)
  {
    prompt: "What is 25% of 80?",
    choices: { A: "15", B: "20", C: "25", D: "30" },
    correct: "B",
    topic: "percentages",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_25_percent_of_80"
  },
  {
    prompt: "Calculate: 15% of 200",
    choices: { A: "25", B: "30", C: "35", D: "40" },
    correct: "B",
    topic: "percentages",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_15_percent_of_200"
  },
  {
    prompt: "What is 3/4 as a percentage?",
    choices: { A: "65%", B: "70%", C: "75%", D: "80%" },
    correct: "C",
    topic: "percentages",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_3_4_as_percentage"
  },
  {
    prompt: "Convert 0.6 to a percentage",
    choices: { A: "50%", B: "60%", C: "70%", D: "80%" },
    correct: "B",
    topic: "percentages",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_0_6_to_percentage"
  },
  {
    prompt: "What is 120% of 50?",
    choices: { A: "55", B: "60", C: "65", D: "70" },
    correct: "B",
    topic: "percentages",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_120_percent_of_50"
  },
  {
    prompt: "If 20 is 25% of a number, what is the number?",
    choices: { A: "60", B: "70", C: "80", D: "90" },
    correct: "C",
    topic: "percentages",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_20_is_25_percent_of_what"
  },
  {
    prompt: "Calculate: 8% of 250",
    choices: { A: "18", B: "20", C: "22", D: "25" },
    correct: "B",
    topic: "percentages",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_8_percent_of_250"
  },
  {
    prompt: "What is 2/5 as a percentage?",
    choices: { A: "30%", B: "35%", C: "40%", D: "45%" },
    correct: "C",
    topic: "percentages",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_2_5_as_percentage"
  },
  {
    prompt: "If a price increases by 20%, what is the multiplier?",
    choices: { A: "1.1", B: "1.2", C: "1.3", D: "1.4" },
    correct: "B",
    topic: "percentages",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_20_percent_increase_multiplier"
  },
  {
    prompt: "What is 150% of 40?",
    choices: { A: "50", B: "55", C: "60", D: "65" },
    correct: "C",
    topic: "percentages",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_150_percent_of_40"
  },
  // Ratios (10 questions)
  {
    prompt: "Simplify the ratio 6:8",
    choices: { A: "2:3", B: "3:4", C: "4:5", D: "5:6" },
    correct: "B",
    topic: "ratios",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_simplify_ratio_6_8"
  },
  {
    prompt: "What is the ratio of 15 to 25?",
    choices: { A: "2:3", B: "3:4", C: "3:5", D: "4:5" },
    correct: "C",
    topic: "ratios",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_ratio_15_to_25"
  },
  {
    prompt: "If 3:4 = x:20, find x",
    choices: { A: "12", B: "15", C: "18", D: "20" },
    correct: "B",
    topic: "ratios",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_ratio_3_4_equals_x_20"
  },
  {
    prompt: "Divide 60 in the ratio 2:3",
    choices: { A: "20:40", B: "24:36", C: "30:30", D: "25:35" },
    correct: "B",
    topic: "ratios",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_divide_60_ratio_2_3"
  },
  {
    prompt: "If 5:7 = 15:x, find x",
    choices: { A: "18", B: "20", C: "21", D: "25" },
    correct: "C",
    topic: "ratios",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_ratio_5_7_equals_15_x"
  },
  {
    prompt: "What is the ratio of 1/2 to 1/4?",
    choices: { A: "1:2", B: "2:1", C: "1:4", D: "4:1" },
    correct: "B",
    topic: "ratios",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_ratio_1_2_to_1_4"
  },
  {
    prompt: "Simplify 12:18:24",
    choices: { A: "2:3:4", B: "3:4:5", C: "4:5:6", D: "5:6:7" },
    correct: "A",
    topic: "ratios",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_simplify_12_18_24"
  },
  {
    prompt: "If 2:3:4 = x:15:y, find x and y",
    choices: { A: "x=10, y=20", B: "x=12, y=18", C: "x=8, y=16", D: "x=6, y=12" },
    correct: "A",
    topic: "ratios",
    difficulty: "hard",
    source: "internal",
    uidExternal: "math_ratio_2_3_4_equals_x_15_y"
  },
  {
    prompt: "What is 0.5:0.25 as a ratio?",
    choices: { A: "1:2", B: "2:1", C: "1:4", D: "4:1" },
    correct: "B",
    topic: "ratios",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_ratio_0_5_to_0_25"
  },
  {
    prompt: "Divide 100 in the ratio 1:2:3",
    choices: { A: "15:30:55", B: "16:32:52", C: "17:33:50", D: "18:36:46" },
    correct: "C",
    topic: "ratios",
    difficulty: "hard",
    source: "internal",
    uidExternal: "math_divide_100_ratio_1_2_3"
  },
  // Linear Algebra Basics (10 questions)
  {
    prompt: "Solve for x: 2x + 5 = 13",
    choices: { A: "3", B: "4", C: "5", D: "6" },
    correct: "B",
    topic: "linear_algebra_basics",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_2x_plus_5_equals_13"
  },
  {
    prompt: "Solve: 3x - 7 = 8",
    choices: { A: "3", B: "4", C: "5", D: "6" },
    correct: "C",
    topic: "linear_algebra_basics",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_3x_minus_7_equals_8"
  },
  {
    prompt: "What is x if 4x + 12 = 32?",
    choices: { A: "4", B: "5", C: "6", D: "7" },
    correct: "B",
    topic: "linear_algebra_basics",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_4x_plus_12_equals_32"
  },
  {
    prompt: "Solve: 5x - 3 = 2x + 9",
    choices: { A: "2", B: "3", C: "4", D: "5" },
    correct: "C",
    topic: "linear_algebra_basics",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_5x_minus_3_equals_2x_plus_9"
  },
  {
    prompt: "Find x: 2(x + 3) = 10",
    choices: { A: "1", B: "2", C: "3", D: "4" },
    correct: "B",
    topic: "linear_algebra_basics",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_2_times_x_plus_3_equals_10"
  },
  {
    prompt: "Solve: 3x + 2 = 4x - 1",
    choices: { A: "1", B: "2", C: "3", D: "4" },
    correct: "C",
    topic: "linear_algebra_basics",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_3x_plus_2_equals_4x_minus_1"
  },
  {
    prompt: "What is x if 2x/3 = 6?",
    choices: { A: "6", B: "8", C: "9", D: "12" },
    correct: "C",
    topic: "linear_algebra_basics",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_2x_divided_by_3_equals_6"
  },
  {
    prompt: "Solve: 3(x - 2) = 2(x + 1)",
    choices: { A: "6", B: "7", C: "8", D: "9" },
    correct: "C",
    topic: "linear_algebra_basics",
    difficulty: "hard",
    source: "internal",
    uidExternal: "math_3_times_x_minus_2_equals_2_times_x_plus_1"
  },
  {
    prompt: "Find x: (x + 4)/2 = 5",
    choices: { A: "4", B: "5", C: "6", D: "7" },
    correct: "C",
    topic: "linear_algebra_basics",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_x_plus_4_divided_by_2_equals_5"
  },
  {
    prompt: "Solve: 2x + 3 = 3x - 2",
    choices: { A: "3", B: "4", C: "5", D: "6" },
    correct: "C",
    topic: "linear_algebra_basics",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_2x_plus_3_equals_3x_minus_2"
  },
  // Geometry Basics (10 questions)
  {
    prompt: "What is the area of a circle with radius 5?",
    choices: { A: "25π", B: "50π", C: "75π", D: "100π" },
    correct: "A",
    topic: "geometry_basics",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_circle_area_radius_5"
  },
  {
    prompt: "Find the perimeter of a square with side length 6",
    choices: { A: "18", B: "24", C: "30", D: "36" },
    correct: "B",
    topic: "geometry_basics",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_square_perimeter_side_6"
  },
  {
    prompt: "What is the area of a rectangle with length 8 and width 5?",
    choices: { A: "35", B: "40", C: "45", D: "50" },
    correct: "B",
    topic: "geometry_basics",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_rectangle_area_8_by_5"
  },
  {
    prompt: "Calculate the circumference of a circle with diameter 10",
    choices: { A: "10π", B: "20π", C: "25π", D: "30π" },
    correct: "A",
    topic: "geometry_basics",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_circle_circumference_diameter_10"
  },
  {
    prompt: "What is the area of a triangle with base 6 and height 8?",
    choices: { A: "18", B: "24", C: "30", D: "36" },
    correct: "B",
    topic: "geometry_basics",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_triangle_area_base_6_height_8"
  },
  {
    prompt: "Find the volume of a cube with edge length 4",
    choices: { A: "48", B: "56", C: "64", D: "72" },
    correct: "C",
    topic: "geometry_basics",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_cube_volume_edge_4"
  },
  {
    prompt: "What is the surface area of a cube with edge length 3?",
    choices: { A: "36", B: "45", C: "54", D: "63" },
    correct: "C",
    topic: "geometry_basics",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_cube_surface_area_edge_3"
  },
  {
    prompt: "Calculate the area of a circle with diameter 12",
    choices: { A: "36π", B: "48π", C: "60π", D: "72π" },
    correct: "A",
    topic: "geometry_basics",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_circle_area_diameter_12"
  },
  {
    prompt: "What is the perimeter of a rectangle with length 10 and width 7?",
    choices: { A: "28", B: "34", C: "40", D: "46" },
    correct: "B",
    topic: "geometry_basics",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_rectangle_perimeter_10_by_7"
  },
  {
    prompt: "Find the area of a trapezoid with bases 5 and 9, height 4",
    choices: { A: "24", B: "28", C: "32", D: "36" },
    correct: "B",
    topic: "geometry_basics",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_trapezoid_area_bases_5_9_height_4"
  },
  // Quadratics (10 questions)
  {
    prompt: "Solve: x² - 4x + 4 = 0",
    choices: { A: "x = 2", B: "x = -2", C: "x = 2 or -2", D: "x = 0" },
    correct: "A",
    topic: "quadratics",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_quadratic_x_squared_minus_4x_plus_4"
  },
  {
    prompt: "What are the roots of x² - 9 = 0?",
    choices: { A: "x = 3", B: "x = -3", C: "x = 3 or -3", D: "x = 0" },
    correct: "C",
    topic: "quadratics",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_quadratic_x_squared_minus_9"
  },
  {
    prompt: "Solve: x² + 5x + 6 = 0",
    choices: { A: "x = -2 or -3", B: "x = 2 or 3", C: "x = -1 or -6", D: "x = 1 or 6" },
    correct: "A",
    topic: "quadratics",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_quadratic_x_squared_plus_5x_plus_6"
  },
  {
    prompt: "What is the vertex of y = x² - 4x + 3?",
    choices: { A: "(2, -1)", B: "(-2, -1)", C: "(2, 1)", D: "(-2, 1)" },
    correct: "A",
    topic: "quadratics",
    difficulty: "hard",
    source: "internal",
    uidExternal: "math_quadratic_vertex_x_squared_minus_4x_plus_3"
  },
  {
    prompt: "Solve: 2x² - 8x = 0",
    choices: { A: "x = 0", B: "x = 4", C: "x = 0 or 4", D: "x = 2" },
    correct: "C",
    topic: "quadratics",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_quadratic_2x_squared_minus_8x"
  },
  {
    prompt: "What are the roots of x² - 7x + 12 = 0?",
    choices: { A: "x = 3 or 4", B: "x = -3 or -4", C: "x = 2 or 6", D: "x = -2 or -6" },
    correct: "A",
    topic: "quadratics",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_quadratic_x_squared_minus_7x_plus_12"
  },
  {
    prompt: "Solve: x² + 2x - 15 = 0",
    choices: { A: "x = 3 or -5", B: "x = -3 or 5", C: "x = 3 or 5", D: "x = -3 or -5" },
    correct: "A",
    topic: "quadratics",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_quadratic_x_squared_plus_2x_minus_15"
  },
  {
    prompt: "What is the discriminant of x² - 6x + 9 = 0?",
    choices: { A: "0", B: "36", C: "-36", D: "12" },
    correct: "A",
    topic: "quadratics",
    difficulty: "hard",
    source: "internal",
    uidExternal: "math_quadratic_discriminant_x_squared_minus_6x_plus_9"
  },
  {
    prompt: "Solve: 3x² - 12x + 9 = 0",
    choices: { A: "x = 1", B: "x = 3", C: "x = 1 or 3", D: "x = 2" },
    correct: "C",
    topic: "quadratics",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_quadratic_3x_squared_minus_12x_plus_9"
  },
  {
    prompt: "What is the axis of symmetry of y = x² + 4x + 3?",
    choices: { A: "x = -2", B: "x = 2", C: "x = -1", D: "x = 1" },
    correct: "A",
    topic: "quadratics",
    difficulty: "hard",
    source: "internal",
    uidExternal: "math_quadratic_axis_symmetry_x_squared_plus_4x_plus_3"
  },
  // Functions (10 questions)
  {
    prompt: "If f(x) = 2x + 3, what is f(4)?",
    choices: { A: "8", B: "10", C: "11", D: "12" },
    correct: "C",
    topic: "functions",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_function_f_x_equals_2x_plus_3"
  },
  {
    prompt: "What is g(5) if g(x) = x² - 2x?",
    choices: { A: "15", B: "20", C: "25", D: "30" },
    correct: "A",
    topic: "functions",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_function_g_x_equals_x_squared_minus_2x"
  },
  {
    prompt: "If h(x) = 3x - 1, find h(-2)",
    choices: { A: "-5", B: "-7", C: "-8", D: "-9" },
    correct: "B",
    topic: "functions",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_function_h_x_equals_3x_minus_1"
  },
  {
    prompt: "What is f(0) if f(x) = x² + 4x + 3?",
    choices: { A: "0", B: "3", C: "4", D: "7" },
    correct: "B",
    topic: "functions",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_function_f_x_equals_x_squared_plus_4x_plus_3"
  },
  {
    prompt: "If f(x) = 2x + 1 and g(x) = x - 3, what is f(g(5))?",
    choices: { A: "3", B: "5", C: "7", D: "9" },
    correct: "B",
    topic: "functions",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_function_composition_f_g_5"
  },
  {
    prompt: "What is the domain of f(x) = √(x - 2)?",
    choices: { A: "x ≥ 0", B: "x ≥ 2", C: "x > 2", D: "x ≤ 2" },
    correct: "B",
    topic: "functions",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_function_domain_sqrt_x_minus_2"
  },
  {
    prompt: "If f(x) = x² and g(x) = x + 2, what is f(g(3))?",
    choices: { A: "25", B: "36", C: "49", D: "64" },
    correct: "A",
    topic: "functions",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_function_composition_f_g_3"
  },
  {
    prompt: "What is the range of f(x) = x² + 1?",
    choices: { A: "y ≥ 0", B: "y ≥ 1", C: "y > 1", D: "y ≤ 1" },
    correct: "B",
    topic: "functions",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_function_range_x_squared_plus_1"
  },
  {
    prompt: "If f(x) = 3x - 2, find f⁻¹(7)",
    choices: { A: "1", B: "2", C: "3", D: "4" },
    correct: "C",
    topic: "functions",
    difficulty: "hard",
    source: "internal",
    uidExternal: "math_function_inverse_f_inverse_7"
  },
  {
    prompt: "What is f(x + h) - f(x) if f(x) = x²?",
    choices: { A: "h²", B: "2xh + h²", C: "2x + h", D: "x² + h²" },
    correct: "B",
    topic: "functions",
    difficulty: "hard",
    source: "internal",
    uidExternal: "math_function_difference_quotient_x_squared"
  },
  // Probability (10 questions)
  {
    prompt: "What is the probability of rolling a 6 on a fair die?",
    choices: { A: "1/3", B: "1/4", C: "1/5", D: "1/6" },
    correct: "D",
    topic: "probability",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_probability_rolling_6"
  },
  {
    prompt: "What is the probability of flipping heads on a fair coin?",
    choices: { A: "1/3", B: "1/2", C: "2/3", D: "3/4" },
    correct: "B",
    topic: "probability",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_probability_flipping_heads"
  },
  {
    prompt: "What is the probability of drawing a red card from a standard deck?",
    choices: { A: "1/4", B: "1/2", C: "1/3", D: "2/3" },
    correct: "B",
    topic: "probability",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_probability_red_card"
  },
  {
    prompt: "What is the probability of rolling an even number on a die?",
    choices: { A: "1/3", B: "1/2", C: "2/3", D: "3/4" },
    correct: "B",
    topic: "probability",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_probability_even_number_die"
  },
  {
    prompt: "What is the probability of drawing an ace from a deck?",
    choices: { A: "1/13", B: "1/12", C: "1/11", D: "1/10" },
    correct: "A",
    topic: "probability",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_probability_drawing_ace"
  },
  {
    prompt: "What is the probability of rolling a sum of 7 with two dice?",
    choices: { A: "1/6", B: "1/8", C: "1/10", D: "1/12" },
    correct: "A",
    topic: "probability",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_probability_sum_7_two_dice"
  },
  {
    prompt: "What is the probability of drawing a face card (J, Q, K)?",
    choices: { A: "1/13", B: "3/13", C: "1/4", D: "1/3" },
    correct: "B",
    topic: "probability",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_probability_face_card"
  },
  {
    prompt: "What is the probability of rolling doubles with two dice?",
    choices: { A: "1/6", B: "1/8", C: "1/10", D: "1/12" },
    correct: "A",
    topic: "probability",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_probability_rolling_doubles"
  },
  {
    prompt: "What is the probability of drawing a spade from a deck?",
    choices: { A: "1/4", B: "1/3", C: "1/2", D: "2/3" },
    correct: "A",
    topic: "probability",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_probability_drawing_spade"
  },
  {
    prompt: "What is the probability of rolling a number greater than 4 on a die?",
    choices: { A: "1/3", B: "1/2", C: "2/3", D: "3/4" },
    correct: "A",
    topic: "probability",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_probability_greater_than_4"
  },
  // Statistics: Advanced (10 questions)
  {
    prompt: "What is the mean of 2, 4, 6, 8, 10?",
    choices: { A: "4", B: "5", C: "6", D: "7" },
    correct: "C",
    topic: "statistics:advanced",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_statistics_mean_2_4_6_8_10"
  },
  {
    prompt: "What is the median of 1, 3, 5, 7, 9?",
    choices: { A: "3", B: "5", C: "7", D: "9" },
    correct: "B",
    topic: "statistics:advanced",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_statistics_median_1_3_5_7_9"
  },
  {
    prompt: "What is the mode of 2, 2, 3, 4, 4, 4, 5?",
    choices: { A: "2", B: "3", C: "4", D: "5" },
    correct: "C",
    topic: "statistics:advanced",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_statistics_mode_2_2_3_4_4_4_5"
  },
  {
    prompt: "What is the range of 5, 8, 12, 15, 20?",
    choices: { A: "10", B: "12", C: "15", D: "20" },
    correct: "C",
    topic: "statistics:advanced",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_statistics_range_5_8_12_15_20"
  },
  {
    prompt: "What is the variance of 2, 4, 6, 8, 10?",
    choices: { A: "6", B: "8", C: "10", D: "12" },
    correct: "B",
    topic: "statistics:advanced",
    difficulty: "hard",
    source: "internal",
    uidExternal: "math_statistics_variance_2_4_6_8_10"
  },
  {
    prompt: "What is the standard deviation of 1, 3, 5, 7, 9?",
    choices: { A: "2", B: "2.83", C: "3", D: "3.16" },
    correct: "D",
    topic: "statistics:advanced",
    difficulty: "hard",
    source: "internal",
    uidExternal: "math_statistics_std_dev_1_3_5_7_9"
  },
  {
    prompt: "What is the mean of 10, 20, 30, 40, 50?",
    choices: { A: "25", B: "30", C: "35", D: "40" },
    correct: "B",
    topic: "statistics:advanced",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_statistics_mean_10_20_30_40_50"
  },
  {
    prompt: "What is the median of 2, 4, 6, 8, 10, 12?",
    choices: { A: "5", B: "6", C: "7", D: "8" },
    correct: "C",
    topic: "statistics:advanced",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_statistics_median_2_4_6_8_10_12"
  },
  {
    prompt: "What is the mode of 1, 1, 2, 3, 3, 3, 4, 5?",
    choices: { A: "1", B: "2", C: "3", D: "4" },
    correct: "C",
    topic: "statistics:advanced",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_statistics_mode_1_1_2_3_3_3_4_5"
  },
  {
    prompt: "What is the range of 3, 7, 11, 15, 19, 23?",
    choices: { A: "15", B: "18", C: "20", D: "25" },
    correct: "C",
    topic: "statistics:advanced",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_statistics_range_3_7_11_15_19_23"
  },
  // Calculus: Limits (10 questions)
  {
    prompt: "Find the limit as x approaches 0 of sin(x)/x",
    choices: { A: "0", B: "1", C: "undefined", D: "∞" },
    correct: "B",
    topic: "calculus:limits",
    difficulty: "hard",
    source: "internal",
    uidExternal: "math_calculus_limit_sin_x_over_x"
  },
  {
    prompt: "What is the limit as x approaches 2 of (x² - 4)/(x - 2)?",
    choices: { A: "0", B: "2", C: "4", D: "undefined" },
    correct: "C",
    topic: "calculus:limits",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_calculus_limit_x_squared_minus_4_over_x_minus_2"
  },
  {
    prompt: "Find the limit as x approaches ∞ of 1/x",
    choices: { A: "0", B: "1", C: "∞", D: "undefined" },
    correct: "A",
    topic: "calculus:limits",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_calculus_limit_1_over_x_as_x_approaches_infinity"
  },
  {
    prompt: "What is the limit as x approaches 0 of (1 - cos(x))/x?",
    choices: { A: "0", B: "1", C: "undefined", D: "∞" },
    correct: "A",
    topic: "calculus:limits",
    difficulty: "hard",
    source: "internal",
    uidExternal: "math_calculus_limit_1_minus_cos_x_over_x"
  },
  {
    prompt: "Find the limit as x approaches 1 of (x² - 1)/(x - 1)",
    choices: { A: "0", B: "1", C: "2", D: "undefined" },
    correct: "C",
    topic: "calculus:limits",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_calculus_limit_x_squared_minus_1_over_x_minus_1"
  },
  {
    prompt: "What is the limit as x approaches ∞ of x/(x + 1)?",
    choices: { A: "0", B: "1", C: "∞", D: "undefined" },
    correct: "B",
    topic: "calculus:limits",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_calculus_limit_x_over_x_plus_1_as_x_approaches_infinity"
  },
  {
    prompt: "Find the limit as x approaches 0 of (e^x - 1)/x",
    choices: { A: "0", B: "1", C: "e", D: "undefined" },
    correct: "B",
    topic: "calculus:limits",
    difficulty: "hard",
    source: "internal",
    uidExternal: "math_calculus_limit_e_to_x_minus_1_over_x"
  },
  {
    prompt: "What is the limit as x approaches 3 of (x² - 9)/(x - 3)?",
    choices: { A: "0", B: "3", C: "6", D: "undefined" },
    correct: "C",
    topic: "calculus:limits",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_calculus_limit_x_squared_minus_9_over_x_minus_3"
  },
  {
    prompt: "Find the limit as x approaches ∞ of (2x + 1)/(3x - 2)",
    choices: { A: "0", B: "1/2", C: "2/3", D: "1" },
    correct: "C",
    topic: "calculus:limits",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_calculus_limit_2x_plus_1_over_3x_minus_2_as_x_approaches_infinity"
  },
  {
    prompt: "What is the limit as x approaches 0 of (√(x + 1) - 1)/x?",
    choices: { A: "0", B: "1/2", C: "1", D: "undefined" },
    correct: "B",
    topic: "calculus:limits",
    difficulty: "hard",
    source: "internal",
    uidExternal: "math_calculus_limit_sqrt_x_plus_1_minus_1_over_x"
  },
  // Calculus: Derivatives (10 questions)
  {
    prompt: "Find the derivative of x²",
    choices: { A: "x", B: "2x", C: "x²", D: "2x²" },
    correct: "B",
    topic: "calculus:derivatives",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_calculus_derivative_x_squared"
  },
  {
    prompt: "What is the derivative of 3x + 2?",
    choices: { A: "3", B: "3x", C: "3x + 2", D: "6x" },
    correct: "A",
    topic: "calculus:derivatives",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_calculus_derivative_3x_plus_2"
  },
  {
    prompt: "Find the derivative of x³",
    choices: { A: "x²", B: "2x²", C: "3x²", D: "3x³" },
    correct: "C",
    topic: "calculus:derivatives",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_calculus_derivative_x_cubed"
  },
  {
    prompt: "What is the derivative of sin(x)?",
    choices: { A: "cos(x)", B: "-cos(x)", C: "sin(x)", D: "-sin(x)" },
    correct: "A",
    topic: "calculus:derivatives",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_calculus_derivative_sin_x"
  },
  {
    prompt: "Find the derivative of cos(x)",
    choices: { A: "sin(x)", B: "-sin(x)", C: "cos(x)", D: "-cos(x)" },
    correct: "B",
    topic: "calculus:derivatives",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_calculus_derivative_cos_x"
  },
  {
    prompt: "What is the derivative of e^x?",
    choices: { A: "e^x", B: "xe^x", C: "e^(x-1)", D: "ln(x)" },
    correct: "A",
    topic: "calculus:derivatives",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_calculus_derivative_e_to_x"
  },
  {
    prompt: "Find the derivative of ln(x)",
    choices: { A: "1/x", B: "x", C: "1", D: "e^x" },
    correct: "A",
    topic: "calculus:derivatives",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_calculus_derivative_ln_x"
  },
  {
    prompt: "What is the derivative of x² + 3x + 1?",
    choices: { A: "2x + 3", B: "2x + 4", C: "x + 3", D: "2x² + 3" },
    correct: "A",
    topic: "calculus:derivatives",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_calculus_derivative_x_squared_plus_3x_plus_1"
  },
  {
    prompt: "Find the derivative of √x",
    choices: { A: "1/√x", B: "1/(2√x)", C: "√x", D: "2√x" },
    correct: "B",
    topic: "calculus:derivatives",
    difficulty: "hard",
    source: "internal",
    uidExternal: "math_calculus_derivative_sqrt_x"
  },
  {
    prompt: "What is the derivative of 1/x?",
    choices: { A: "1/x²", B: "-1/x²", C: "ln(x)", D: "x" },
    correct: "B",
    topic: "calculus:derivatives",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_calculus_derivative_1_over_x"
  },
  // Calculus: Integrals (10 questions)
  {
    prompt: "Find the integral of 2x",
    choices: { A: "x²", B: "x² + C", C: "2x²", D: "2x² + C" },
    correct: "B",
    topic: "calculus:integrals",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_calculus_integral_2x"
  },
  {
    prompt: "What is the integral of x²?",
    choices: { A: "x³/3", B: "x³/3 + C", C: "x³", D: "x³ + C" },
    correct: "B",
    topic: "calculus:integrals",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_calculus_integral_x_squared"
  },
  {
    prompt: "Find the integral of 1",
    choices: { A: "x", B: "x + C", C: "1", D: "C" },
    correct: "B",
    topic: "calculus:integrals",
    difficulty: "easy",
    source: "internal",
    uidExternal: "math_calculus_integral_1"
  },
  {
    prompt: "What is the integral of cos(x)?",
    choices: { A: "sin(x)", B: "sin(x) + C", C: "-sin(x)", D: "-sin(x) + C" },
    correct: "B",
    topic: "calculus:integrals",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_calculus_integral_cos_x"
  },
  {
    prompt: "Find the integral of sin(x)",
    choices: { A: "cos(x)", B: "cos(x) + C", C: "-cos(x)", D: "-cos(x) + C" },
    correct: "D",
    topic: "calculus:integrals",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_calculus_integral_sin_x"
  },
  {
    prompt: "What is the integral of e^x?",
    choices: { A: "e^x", B: "e^x + C", C: "xe^x", D: "xe^x + C" },
    correct: "B",
    topic: "calculus:integrals",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_calculus_integral_e_to_x"
  },
  {
    prompt: "Find the integral of 1/x",
    choices: { A: "ln(x)", B: "ln(x) + C", C: "1/x²", D: "1/x² + C" },
    correct: "B",
    topic: "calculus:integrals",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_calculus_integral_1_over_x"
  },
  {
    prompt: "What is the integral of x³?",
    choices: { A: "x⁴/4", B: "x⁴/4 + C", C: "x⁴", D: "x⁴ + C" },
    correct: "B",
    topic: "calculus:integrals",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_calculus_integral_x_cubed"
  },
  {
    prompt: "Find the integral of 3x² + 2x",
    choices: { A: "x³ + x²", B: "x³ + x² + C", C: "3x³ + 2x²", D: "3x³ + 2x² + C" },
    correct: "B",
    topic: "calculus:integrals",
    difficulty: "medium",
    source: "internal",
    uidExternal: "math_calculus_integral_3x_squared_plus_2x"
  },
  {
    prompt: "What is the integral of 1/√x?",
    choices: { A: "2√x", B: "2√x + C", C: "√x", D: "√x + C" },
    correct: "B",
    topic: "calculus:integrals",
    difficulty: "hard",
    source: "internal",
    uidExternal: "math_calculus_integral_1_over_sqrt_x"
  },
];

async function main() {
  console.log('🌱 Starting comprehensive learning ecosystem seed...');

  // Create a test user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
      emailVerified: true
    }
  });

  // Create wallet for the user
  const wallet = await prisma.wallet.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      gemsBalance: 0
    }
  });

  // Set initial gem exchange rate (1 Gem = ₦500,000)
  const gemRate = await prisma.gemRate.upsert({
    where: { id: 'default-rate' },
    update: {
      rateGemPerNgn: 0.000002, // 1 Gem = ₦500,000
      effectiveFrom: new Date()
    },
    create: {
      id: 'default-rate',
      rateGemPerNgn: 0.000002,
      effectiveFrom: new Date()
    }
  });

  // Create math questions
  console.log('📝 Creating math questions...');
  for (const questionData of mathQuestions) {
    const { uidExternal, correct, ...restOfQuestionData } = questionData;
    await prisma.mathQuestion.create({
      data: {
        ...restOfQuestionData,
        correctChoice: correct
      }
    });
  }

  // Create a sample competition
  const now = new Date();
  const competition = await prisma.competition.create({
    data: {
      name: "Sabinews Mathematics League - Week 1",
      description: "Join the first week of our exciting math competition! Daily drops with cash prizes and Gems.",
      startsAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
      endsAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      dropIntervalHours: 24, // Daily drops
      dropOpenMinutes: 120, // 2 hours window
      questionsPerDrop: 1,
      entryType: 'PAID',
      entryPriceNgn: 200,
      entryPriceGem: 0.0004, // 200 NGN * 0.000002
      prizeCashNgn: 200000, // ₦200k prize pool
      prizeSchema: {
        rank_rewards: [
          { rank: 1, gems: 0.5, cash_pct: 50 },
          { rank: 2, gems: 0.2, cash_pct: 30 },
          { rank: 3, gems: 0.1, cash_pct: 20 },
          { rank: 4, gems: 0.05, cash_pct: 0 },
          { rank: 5, gems: 0.05, cash_pct: 0 }
        ]
      },
      createdBy: user.id
    }
  });

  // Create competition drops for the next 7 days
  console.log('📅 Creating competition drops...');
  for (let i = 1; i <= 7; i++) {
    const dropDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const opensAt = new Date(dropDate);
    opensAt.setHours(18, 0, 0, 0); // 6:00 PM
    const closesAt = new Date(opensAt.getTime() + 120 * 60 * 1000); // 2 hours later

    await prisma.competitionDrop.create({
      data: {
        competitionId: competition.id,
        opensAt,
        closesAt,
        indexInCompetition: i
      }
    });
  }

  // Create legacy topics and questions (for backward compatibility)
  console.log('📚 Creating legacy topics...');
  for (const [key, defaultGems] of Object.entries(GEM_WEIGHTS)) {
    await prisma.topic.upsert({
      where: { key },
      update: {},
      create: {
        key,
        displayName: key.replace(':', ' - ').replace('_', ' '),
        defaultGems
      }
    });
  }

  console.log('📝 Creating legacy questions...');
  for (const questionData of mathQuestions) {
    await prisma.question.upsert({
      where: { uidExternal: questionData.uidExternal },
      update: {},
      create: {
        prompt: questionData.prompt,
        choices: questionData.choices,
        correct: questionData.correct,
        topicKey: questionData.topic,
        difficulty: questionData.difficulty,
        gemValue: GEM_WEIGHTS[questionData.topic] || 2,
        source: questionData.source,
        uidExternal: questionData.uidExternal
      }
    });
  }

  // Create a sample weekly test (for legacy system)
  const monday = new Date();
  monday.setDate(monday.getDate() - monday.getDay() + 1); // Next Monday
  monday.setHours(12, 0, 0, 0); // 12:00 PM

  const friday = new Date(monday);
  friday.setDate(friday.getDate() + 4); // Friday
  friday.setHours(23, 59, 59, 999); // 23:59:59

  const weeklyTest = await prisma.weeklyTest.upsert({
    where: { weekOf: monday },
    update: {},
    create: {
      weekOf: monday,
      liveAt: monday,
      closeAt: friday
    }
  });

  // Add questions to the weekly test
  const questionsForTest = await prisma.question.findMany({
    take: 20,
    orderBy: { createdAt: 'asc' }
  });

  for (let i = 0; i < questionsForTest.length; i++) {
    await prisma.weeklyTestQuestion.upsert({
      where: {
        weeklyTestId_questionId: {
          weeklyTestId: weeklyTest.id,
          questionId: questionsForTest[i].id
        }
      },
      update: {},
      create: {
        weeklyTestId: weeklyTest.id,
        questionId: questionsForTest[i].id,
        position: i + 1
      }
    });
  }

  // Create a default group chat
  console.log('💬 Creating default group chat...');
  const groupChat = await prisma.groupChat.upsert({
    where: { name: 'General Discussion' },
    update: {},
    create: {
      name: 'General Discussion',
      description: 'A place for all members to chat.',
      group_chat_members: {
        create: {
          user_id: user.id, // The user created earlier in the seed
          role: 'admin',
        },
      },
    },
  });
  console.log(`💬 Created group: "${groupChat.name}"`);

  console.log('✅ Comprehensive learning ecosystem seeded successfully!');
  console.log(`👤 Test user: test@example.com / password123`);
  console.log(`💰 Wallet created with 0 Gems`);
  console.log(`💎 Gem rate: 1 Gem = ₦500,000`);
  console.log(`📝 Created ${mathQuestions.length} math questions`);
  console.log(`🏆 Created sample competition: "${competition.name}"`);
  console.log(`📅 Created 7 competition drops`);
  console.log(`📚 Created ${Object.keys(GEM_WEIGHTS).length} legacy topics`);
  console.log(`📋 Created legacy weekly test for ${questionsForTest.length} questions`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 