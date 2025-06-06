import { NutritionInfo } from './types.js';

export class MealDatabase {
  private foods: Map<string, NutritionInfo> = new Map();

  constructor() {
    this.initializeFoodDatabase();
  }

  private initializeFoodDatabase(): void {
    const foodData: NutritionInfo[] = [
      // Lean Proteins
      {
        name: 'chicken breast',
        calories: 165,
        protein: 31,
        fat: 3.6,
        carbohydrates: 0,
        fiber: 0,
        sodium: 74,
        servingSize: '100g',
        isVegetarian: false,
        category: 'protein'
      },
      {
        name: 'salmon fillet',
        calories: 208,
        protein: 22,
        fat: 12,
        carbohydrates: 0,
        fiber: 0,
        sodium: 59,
        servingSize: '100g',
        isVegetarian: false,
        category: 'protein'
      },
      {
        name: 'white fish',
        calories: 82,
        protein: 18,
        fat: 0.7,
        carbohydrates: 0,
        fiber: 0,
        sodium: 78,
        servingSize: '100g',
        isVegetarian: false,
        category: 'protein'
      },
      {
        name: 'egg whites',
        calories: 52,
        protein: 11,
        fat: 0.2,
        carbohydrates: 0.7,
        fiber: 0,
        sodium: 166,
        servingSize: '100g',
        isVegetarian: true,
        category: 'protein'
      },
      {
        name: 'greek yogurt',
        calories: 97,
        protein: 10,
        fat: 0.4,
        carbohydrates: 6,
        fiber: 0,
        sodium: 36,
        servingSize: '100g',
        isVegetarian: true,
        category: 'dairy'
      },
      {
        name: 'cottage cheese',
        calories: 98,
        protein: 11,
        fat: 4.3,
        carbohydrates: 3.4,
        fiber: 0,
        sodium: 364,
        servingSize: '100g',
        isVegetarian: true,
        category: 'dairy'
      },
      {
        name: 'tofu',
        calories: 76,
        protein: 8,
        fat: 4.8,
        carbohydrates: 1.9,
        fiber: 0.3,
        sodium: 7,
        servingSize: '100g',
        isVegetarian: true,
        category: 'protein'
      },
      {
        name: 'tempeh',
        calories: 192,
        protein: 19,
        fat: 11,
        carbohydrates: 9,
        fiber: 9,
        sodium: 9,
        servingSize: '100g',
        isVegetarian: true,
        category: 'protein'
      },
      {
        name: 'lentils',
        calories: 116,
        protein: 9,
        fat: 0.4,
        carbohydrates: 20,
        fiber: 8,
        sodium: 2,
        servingSize: '100g cooked',
        isVegetarian: true,
        category: 'protein'
      },
      {
        name: 'chickpeas',
        calories: 164,
        protein: 8,
        fat: 2.6,
        carbohydrates: 27,
        fiber: 8,
        sodium: 7,
        servingSize: '100g cooked',
        isVegetarian: true,
        category: 'protein'
      },

      // Vegetables
      {
        name: 'broccoli',
        calories: 34,
        protein: 2.8,
        fat: 0.4,
        carbohydrates: 7,
        fiber: 2.6,
        sodium: 33,
        servingSize: '100g',
        isVegetarian: true,
        category: 'vegetable'
      },
      {
        name: 'spinach',
        calories: 23,
        protein: 2.9,
        fat: 0.4,
        carbohydrates: 3.6,
        fiber: 2.2,
        sodium: 79,
        servingSize: '100g',
        isVegetarian: true,
        category: 'vegetable'
      },
      {
        name: 'bell peppers',
        calories: 31,
        protein: 1,
        fat: 0.3,
        carbohydrates: 7,
        fiber: 2.5,
        sodium: 4,
        servingSize: '100g',
        isVegetarian: true,
        category: 'vegetable'
      },
      {
        name: 'asparagus',
        calories: 20,
        protein: 2.2,
        fat: 0.1,
        carbohydrates: 3.9,
        fiber: 2.1,
        sodium: 2,
        servingSize: '100g',
        isVegetarian: true,
        category: 'vegetable'
      },
      {
        name: 'cucumber',
        calories: 16,
        protein: 0.7,
        fat: 0.1,
        carbohydrates: 4,
        fiber: 0.5,
        sodium: 2,
        servingSize: '100g',
        isVegetarian: true,
        category: 'vegetable'
      },
      {
        name: 'zucchini',
        calories: 17,
        protein: 1.2,
        fat: 0.3,
        carbohydrates: 3.1,
        fiber: 1,
        sodium: 8,
        servingSize: '100g',
        isVegetarian: true,
        category: 'vegetable'
      },

      // Complex Carbs
      {
        name: 'brown rice',
        calories: 112,
        protein: 2.6,
        fat: 0.9,
        carbohydrates: 23,
        fiber: 1.8,
        sodium: 7,
        servingSize: '100g cooked',
        isVegetarian: true,
        category: 'grain'
      },
      {
        name: 'quinoa',
        calories: 120,
        protein: 4.4,
        fat: 1.9,
        carbohydrates: 22,
        fiber: 2.8,
        sodium: 7,
        servingSize: '100g cooked',
        isVegetarian: true,
        category: 'grain'
      },
      {
        name: 'sweet potato',
        calories: 86,
        protein: 1.6,
        fat: 0.1,
        carbohydrates: 20,
        fiber: 3,
        sodium: 7,
        servingSize: '100g',
        isVegetarian: true,
        category: 'vegetable'
      },
      {
        name: 'oatmeal',
        calories: 68,
        protein: 2.4,
        fat: 1.4,
        carbohydrates: 12,
        fiber: 1.7,
        sodium: 49,
        servingSize: '100g cooked',
        isVegetarian: true,
        category: 'grain'
      },

      // Fruits
      {
        name: 'blueberries',
        calories: 57,
        protein: 0.7,
        fat: 0.3,
        carbohydrates: 14,
        fiber: 2.4,
        sodium: 1,
        servingSize: '100g',
        isVegetarian: true,
        category: 'fruit'
      },
      {
        name: 'strawberries',
        calories: 32,
        protein: 0.7,
        fat: 0.3,
        carbohydrates: 7.7,
        fiber: 2,
        sodium: 1,
        servingSize: '100g',
        isVegetarian: true,
        category: 'fruit'
      },
      {
        name: 'apple',
        calories: 52,
        protein: 0.3,
        fat: 0.2,
        carbohydrates: 14,
        fiber: 2.4,
        sodium: 1,
        servingSize: '100g',
        isVegetarian: true,
        category: 'fruit'
      }
    ];

    foodData.forEach(food => {
      this.foods.set(food.name.toLowerCase(), food);
    });
  }

  getNutritionInfo(foodName: string): NutritionInfo | undefined {
    return this.foods.get(foodName.toLowerCase());
  }

  getFoodsByCategory(category: string): NutritionInfo[] {
    return Array.from(this.foods.values()).filter(food => food.category === category);
  }

  getVegetarianFoods(): NutritionInfo[] {
    return Array.from(this.foods.values()).filter(food => food.isVegetarian);
  }

  searchFoods(query: string): NutritionInfo[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.foods.values()).filter(food => 
      food.name.toLowerCase().includes(lowerQuery)
    );
  }

  getAllFoods(): NutritionInfo[] {
    return Array.from(this.foods.values());
  }
}