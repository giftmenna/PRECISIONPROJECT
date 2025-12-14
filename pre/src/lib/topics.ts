// Centralized topics configuration for the application
// This ensures consistency across all components and pages

export const TOPICS = [
  // In alphabetical order
  "addition_and_subtraction_of_integers",
  "angles",
  "area",
  "direct_proportion",
  "direct_variation",
  "exterior_angles_in_polygons",
  "fractions",
  "indices",
  "indirect_proportion",
  "indirect_variation",
  "interior_angles_in_polygons",
  "linear_equations_and_graphs",
  "linear_inequalities",
  "percentage",
  "perimeter",
  "place_value",
  "profit_and_loss",
  "quadratics",
  "ratio",
  "roman_numerals",
  "simultaneous_equations",
  "surds",
  "triangles",
  "trigonometry",
  "unit_conversion"
];

// Topic categories for better organization
export const TOPIC_CATEGORIES = {
  "Algebra": [
    "direct_proportion",
    "direct_variation",
    "indirect_proportion",
    "indirect_variation",
    "indices",
    "linear_equations_and_graphs",
    "linear_inequalities",
    "quadratics",
    "simultaneous_equations",
    "surds"
  ],
  "Arithmetic": [
    "addition_and_subtraction_of_integers",
    "fractions",
    "percentage",
    "place_value",
    "profit_and_loss",
    "ratio",
    "roman_numerals",
    "unit_conversion"
  ],
  "Geometry": [
    "angles",
    "area",
    "exterior_angles_in_polygons",
    "interior_angles_in_polygons",
    "perimeter",
    "triangles",
    "trigonometry"
  ]
};

// Helper function to get topic display name
export function getTopicDisplayName(topic: string): string {
  const displayNames: { [key: string]: string } = {
    "addition_and_subtraction_of_integers": "Addition and Subtraction of Integers",
    "angles": "Angles",
    "area": "Area",
    "direct_proportion": "Direct Proportion",
    "direct_variation": "Direct Variation",
    "exterior_angles_in_polygons": "Exterior Angles in Polygons",
    "fractions": "Fractions",
    "indices": "Indices",
    "indirect_proportion": "Indirect Proportion",
    "indirect_variation": "Indirect Variation",
    "interior_angles_in_polygons": "Interior Angles in Polygons",
    "linear_equations_and_graphs": "Linear Equations and Graphs",
    "linear_inequalities": "Linear Inequalities",
    "percentage": "Percentage",
    "perimeter": "Perimeter",
    "place_value": "Place Value",
    "profit_and_loss": "Profit and Loss",
    "quadratics": "Quadratics",
    "ratio": "Ratio",
    "roman_numerals": "Roman Numerals",
    "simultaneous_equations": "Simultaneous Equations",
    "surds": "Surds",
    "triangles": "Triangles",
    "trigonometry": "Trigonometry",
    "unit_conversion": "Unit Conversion"
  };
  
  return displayNames[topic] || topic;
}

// Helper function to get topic category
export function getTopicCategory(topic: string): string {
  for (const [category, topics] of Object.entries(TOPIC_CATEGORIES)) {
    if (topics.includes(topic)) {
      return category;
    }
  }
  return "Other";
} 