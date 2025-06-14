export interface NutritionInfo {
  name: string;
  calories: number;
  protein: number; // grams
  fat: number; // grams
  carbohydrates: number; // grams
  fiber: number; // grams
  sodium: number; // mg
  servingSize: string;
  isVegetarian: boolean;
  category: 'protein' | 'vegetable' | 'grain' | 'dairy' | 'fruit' | 'other';
}

export interface MealSuggestion {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  totalNutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbohydrates: number;
    fiber: number;
    sodium: number;
  };
  prepTime: number; // minutes
  servings: number;
  mealType: string;
}

export interface MealPlanOptions {
  mealType: string;
  targetCalories?: number;
  excludeIngredients: string[];
  vegetarian: boolean;
}

export interface MealPlanRequest {
  days: number;
  dailyCalories: number;
  vegetarian: boolean;
  excludeIngredients: string[];
}

export interface DailyMealPlan {
  day: number;
  breakfast: MealSuggestion;
  lunch: MealSuggestion;
  dinner: MealSuggestion;
  snack?: MealSuggestion;
  totalNutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbohydrates: number;
    fiber: number;
    sodium: number;
  };
}

export interface MealPlan {
  days: DailyMealPlan[];
  summary: {
    totalDays: number;
    avgDailyCalories: number;
    avgDailyProtein: number;
    avgDailyFat: number;
    avgDailyCarbs: number;
  };
}