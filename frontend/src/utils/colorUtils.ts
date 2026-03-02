const BASE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Generate a consistent color for a given string
const generateColor = (str: string, index: number): string => {
  if (index < BASE_COLORS.length) {
    return BASE_COLORS[index];
  }
  
  // Generate consistent hash from string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate HSL color with good saturation and lightness
  const hue = Math.abs(hash % 360);
  const saturation = 65 + (Math.abs(hash >> 8) % 20); // 65-85%
  const lightness = 45 + (Math.abs(hash >> 16) % 15); // 45-60%
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// Create consistent color mapping for categories
export const getCategoryColor = (categoryName: string, allCategories: string[]): string => {
  const index = allCategories.indexOf(categoryName);
  return generateColor(categoryName, index);
};
