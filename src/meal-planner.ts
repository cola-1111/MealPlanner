import { MealDatabase } from './meal-database.js';
import { MenuDatabase } from './menu-database.js';
import { 
  MealSuggestion, 
  MealPlanOptions, 
  MealPlanRequest, 
  DailyMealPlan, 
  MealPlan,
  NutritionInfo,
  RegisteredMenu,
  MenuSuggestionOptions
} from './types.js';

export class MealPlanner {
  constructor(private mealDatabase: MealDatabase, private menuDatabase?: MenuDatabase) {}

  suggestMeal(options: MealPlanOptions): MealSuggestion {
    const { mealType, targetCalories, excludeIngredients, vegetarian } = options;
    
    // Get available foods
    let availableFoods = vegetarian 
      ? this.mealDatabase.getVegetarianFoods()
      : this.mealDatabase.getAllFoods();

    // Filter out excluded ingredients
    availableFoods = availableFoods.filter(food => 
      !excludeIngredients.some(excluded => 
        food.name.toLowerCase().includes(excluded.toLowerCase())
      )
    );

    // Generate meal based on type and calorie target
    return this.generateMeal(mealType, targetCalories || this.getDefaultCalories(mealType), availableFoods);
  }

  createMealPlan(request: MealPlanRequest): MealPlan {
    const { days, dailyCalories, vegetarian, excludeIngredients } = request;
    const dailyPlans: DailyMealPlan[] = [];

    for (let day = 1; day <= days; day++) {
      const breakfastCalories = Math.round(dailyCalories * 0.25);
      const lunchCalories = Math.round(dailyCalories * 0.35);
      const dinnerCalories = Math.round(dailyCalories * 0.35);
      const snackCalories = Math.round(dailyCalories * 0.05);

      const breakfast = this.suggestMeal({
        mealType: 'breakfast',
        targetCalories: breakfastCalories,
        excludeIngredients,
        vegetarian
      });

      const lunch = this.suggestMeal({
        mealType: 'lunch',
        targetCalories: lunchCalories,
        excludeIngredients,
        vegetarian
      });

      const dinner = this.suggestMeal({
        mealType: 'dinner',
        targetCalories: dinnerCalories,
        excludeIngredients,
        vegetarian
      });

      const snack = this.suggestMeal({
        mealType: 'snack',
        targetCalories: snackCalories,
        excludeIngredients,
        vegetarian
      });

      const totalNutrition = this.calculateTotalNutrition([breakfast, lunch, dinner, snack]);

      dailyPlans.push({
        day,
        breakfast,
        lunch,
        dinner,
        snack,
        totalNutrition
      });
    }

    const summary = this.calculateMealPlanSummary(dailyPlans);

    return {
      days: dailyPlans,
      summary
    };
  }

  private generateMeal(mealType: string, targetCalories: number, availableFoods: NutritionInfo[]): MealSuggestion {
    // Select foods optimized for low fat, high protein
    const proteinFoods = availableFoods.filter(food => food.category === 'protein');
    const vegetables = availableFoods.filter(food => food.category === 'vegetable');
    const grains = availableFoods.filter(food => food.category === 'grain');
    const fruits = availableFoods.filter(food => food.category === 'fruit');

    // Select primary protein (highest protein-to-fat ratio)
    const protein = this.selectBestProtein(proteinFoods);
    
    // Calculate protein serving size to meet ~40% of calories from protein
    const proteinCalories = targetCalories * 0.4;
    const proteinServing = proteinCalories / protein.calories;

    // Select vegetables (low calorie, high fiber)
    const vegetable1 = vegetables[Math.floor(Math.random() * vegetables.length)];
    const vegetable2 = vegetables.filter(v => v.name !== vegetable1.name)[Math.floor(Math.random() * (vegetables.length - 1))];
    
    // Select grain if needed for calories
    const remainingCalories = targetCalories - (proteinCalories + 50); // 50 for vegetables
    let grain: NutritionInfo | null = null;
    let grainServing = 0;
    
    if (remainingCalories > 100 && grains.length > 0) {
      grain = grains[Math.floor(Math.random() * grains.length)];
      grainServing = remainingCalories / grain.calories;
    }

    // Add fruit for breakfast or snack
    let fruit: NutritionInfo | null = null;
    let fruitServing = 0;
    if ((mealType === 'breakfast' || mealType === 'snack') && fruits.length > 0) {
      fruit = fruits[Math.floor(Math.random() * fruits.length)];
      fruitServing = 0.5;
    }

    // Build ingredients list
    const ingredients: string[] = [
      `${Math.round(proteinServing * 100)}g ${protein.name}`,
      `100g ${vegetable1.name}`,
      `50g ${vegetable2.name}`
    ];

    if (grain) {
      ingredients.push(`${Math.round(grainServing * 100)}g ${grain.name}`);
    }

    if (fruit) {
      ingredients.push(`${Math.round(fruitServing * 100)}g ${fruit.name}`);
    }

    // Calculate total nutrition
    const totalNutrition = {
      calories: Math.round(
        (protein.calories * proteinServing) +
        (vegetable1.calories * 1) +
        (vegetable2.calories * 0.5) +
        (grain ? grain.calories * grainServing : 0) +
        (fruit ? fruit.calories * fruitServing : 0)
      ),
      protein: Math.round(
        (protein.protein * proteinServing) +
        (vegetable1.protein * 1) +
        (vegetable2.protein * 0.5) +
        (grain ? grain.protein * grainServing : 0) +
        (fruit ? fruit.protein * fruitServing : 0)
      ),
      fat: Math.round(
        (protein.fat * proteinServing) +
        (vegetable1.fat * 1) +
        (vegetable2.fat * 0.5) +
        (grain ? grain.fat * grainServing : 0) +
        (fruit ? fruit.fat * fruitServing : 0)
      ),
      carbohydrates: Math.round(
        (protein.carbohydrates * proteinServing) +
        (vegetable1.carbohydrates * 1) +
        (vegetable2.carbohydrates * 0.5) +
        (grain ? grain.carbohydrates * grainServing : 0) +
        (fruit ? fruit.carbohydrates * fruitServing : 0)
      ),
      fiber: Math.round(
        (protein.fiber * proteinServing) +
        (vegetable1.fiber * 1) +
        (vegetable2.fiber * 0.5) +
        (grain ? grain.fiber * grainServing : 0) +
        (fruit ? fruit.fiber * fruitServing : 0)
      ),
      sodium: Math.round(
        (protein.sodium * proteinServing) +
        (vegetable1.sodium * 1) +
        (vegetable2.sodium * 0.5) +
        (grain ? grain.sodium * grainServing : 0) +
        (fruit ? fruit.sodium * fruitServing : 0)
      )
    };

    // Generate cooking instructions
    const instructions = this.generateCookingInstructions(mealType, protein, [vegetable1, vegetable2], grain, fruit);

    return {
      name: this.generateMealName(mealType, protein, vegetable1, grain),
      description: `Low-fat, high-protein ${mealType} optimized for muscle building and weight management`,
      ingredients,
      instructions,
      totalNutrition,
      prepTime: this.estimatePrepTime(mealType),
      servings: 1,
      mealType
    };
  }

  private selectBestProtein(proteinFoods: NutritionInfo[]): NutritionInfo {
    // Sort by protein-to-fat ratio (higher is better for low-fat, high-protein)
    return proteinFoods.sort((a, b) => {
      const ratioA = a.protein / Math.max(a.fat, 0.1);
      const ratioB = b.protein / Math.max(b.fat, 0.1);
      return ratioB - ratioA;
    })[0];
  }

  private generateMealName(mealType: string, protein: NutritionInfo, vegetable: NutritionInfo, grain: NutritionInfo | null): string {
    const proteinName = protein.name.charAt(0).toUpperCase() + protein.name.slice(1);
    const vegName = vegetable.name.charAt(0).toUpperCase() + vegetable.name.slice(1);
    
    if (grain) {
      const grainName = grain.name.charAt(0).toUpperCase() + grain.name.slice(1);
      return `${proteinName} with ${vegName} and ${grainName}`;
    }
    
    return `${proteinName} with ${vegName}`;
  }

  private generateCookingInstructions(mealType: string, protein: NutritionInfo, vegetables: NutritionInfo[], grain: NutritionInfo | null, fruit: NutritionInfo | null): string[] {
    const instructions: string[] = [];

    // Prep instructions
    instructions.push("Wash and prepare all vegetables");
    
    if (grain) {
      if (grain.name.includes('rice') || grain.name.includes('quinoa')) {
        instructions.push(`Cook ${grain.name} according to package directions`);
      } else if (grain.name.includes('oatmeal')) {
        instructions.push("Prepare oatmeal with water or low-fat milk");
      }
    }

    // Protein cooking
    if (protein.name.includes('chicken')) {
      instructions.push("Season chicken breast and grill or bake at 375°F for 20-25 minutes");
    } else if (protein.name.includes('fish') || protein.name.includes('salmon')) {
      instructions.push("Season fish and bake at 400°F for 12-15 minutes or until flaky");
    } else if (protein.name.includes('egg')) {
      instructions.push("Whisk egg whites and cook in non-stick pan over medium heat");
    } else if (protein.name.includes('tofu')) {
      instructions.push("Press tofu, cube, and pan-fry until golden");
    } else {
      instructions.push(`Prepare ${protein.name} according to preference`);
    }

    // Vegetable cooking
    instructions.push("Steam or lightly sauté vegetables until tender-crisp");
    
    // Assembly
    if (grain) {
      instructions.push(`Serve ${protein.name} over ${grain.name} with vegetables on the side`);
    } else {
      instructions.push(`Plate ${protein.name} with vegetables`);
    }

    if (fruit) {
      instructions.push(`Add fresh ${fruit.name} as garnish or side`);
    }

    instructions.push("Season with herbs and spices to taste (avoid high-sodium seasonings)");

    return instructions;
  }

  private estimatePrepTime(mealType: string): number {
    switch (mealType) {
      case 'breakfast': return 15;
      case 'lunch': return 25;
      case 'dinner': return 35;
      case 'snack': return 10;
      default: return 20;
    }
  }

  private getDefaultCalories(mealType: string): number {
    switch (mealType) {
      case 'breakfast': return 350;
      case 'lunch': return 450;
      case 'dinner': return 500;
      case 'snack': return 150;
      default: return 400;
    }
  }

  private calculateTotalNutrition(meals: MealSuggestion[]) {
    return meals.reduce((total, meal) => ({
      calories: total.calories + meal.totalNutrition.calories,
      protein: total.protein + meal.totalNutrition.protein,
      fat: total.fat + meal.totalNutrition.fat,
      carbohydrates: total.carbohydrates + meal.totalNutrition.carbohydrates,
      fiber: total.fiber + meal.totalNutrition.fiber,
      sodium: total.sodium + meal.totalNutrition.sodium,
    }), {
      calories: 0,
      protein: 0,
      fat: 0,
      carbohydrates: 0,
      fiber: 0,
      sodium: 0,
    });
  }

  private calculateMealPlanSummary(dailyPlans: DailyMealPlan[]) {
    const totalDays = dailyPlans.length;
    const totals = dailyPlans.reduce((acc, day) => ({
      calories: acc.calories + day.totalNutrition.calories,
      protein: acc.protein + day.totalNutrition.protein,
      fat: acc.fat + day.totalNutrition.fat,
      carbs: acc.carbs + day.totalNutrition.carbohydrates,
    }), { calories: 0, protein: 0, fat: 0, carbs: 0 });

    return {
      totalDays,
      avgDailyCalories: Math.round(totals.calories / totalDays),
      avgDailyProtein: Math.round(totals.protein / totalDays),
      avgDailyFat: Math.round(totals.fat / totalDays),
      avgDailyCarbs: Math.round(totals.carbs / totalDays),
    };
  }

  suggestFromRegisteredMenus(options: MenuSuggestionOptions): RegisteredMenu[] {
    if (!this.menuDatabase) {
      throw new Error('Menu database not available');
    }
    return this.menuDatabase.suggestMenus(options);
  }

  convertMenuToMealSuggestion(menu: RegisteredMenu): MealSuggestion {
    return {
      name: menu.name,
      description: menu.description,
      ingredients: menu.ingredients,
      instructions: menu.instructions,
      totalNutrition: {
        calories: menu.nutrition.calories,
        protein: menu.nutrition.protein,
        fat: menu.nutrition.fat,
        carbohydrates: menu.nutrition.carbohydrates,
        fiber: menu.nutrition.fiber,
        sodium: menu.nutrition.sodium,
      },
      prepTime: menu.prepTime,
      servings: menu.servings,
      mealType: menu.mealType
    };
  }

  createMealPlanFromMenus(request: MealPlanRequest & { useRegisteredMenus?: boolean }): MealPlan {
    if (!request.useRegisteredMenus || !this.menuDatabase) {
      return this.createMealPlan(request);
    }

    const { days, dailyCalories, vegetarian, excludeIngredients } = request;
    const dailyPlans: DailyMealPlan[] = [];

    for (let day = 1; day <= days; day++) {
      const breakfastCalories = Math.round(dailyCalories * 0.25);
      const lunchCalories = Math.round(dailyCalories * 0.35);
      const dinnerCalories = Math.round(dailyCalories * 0.35);
      const snackCalories = Math.round(dailyCalories * 0.05);

      const usedMenuIds: string[] = [];

      const breakfast = this.getMealFromMenusOrGenerate({
        mealType: 'breakfast',
        targetCalories: breakfastCalories,
        excludeIngredients,
        vegetarian
      }, usedMenuIds);

      const lunch = this.getMealFromMenusOrGenerate({
        mealType: 'lunch',
        targetCalories: lunchCalories,
        excludeIngredients,
        vegetarian
      }, usedMenuIds);

      const dinner = this.getMealFromMenusOrGenerate({
        mealType: 'dinner',
        targetCalories: dinnerCalories,
        excludeIngredients,
        vegetarian
      }, usedMenuIds);

      const snack = this.getMealFromMenusOrGenerate({
        mealType: 'snack',
        targetCalories: snackCalories,
        excludeIngredients,
        vegetarian
      }, usedMenuIds);

      const totalNutrition = this.calculateTotalNutrition([breakfast, lunch, dinner, snack]);

      dailyPlans.push({
        day,
        breakfast,
        lunch,
        dinner,
        snack,
        totalNutrition
      });
    }

    const summary = this.calculateMealPlanSummary(dailyPlans);

    return {
      days: dailyPlans,
      summary
    };
  }

  private getMealFromMenusOrGenerate(options: MealPlanOptions, usedMenuIds: string[]): MealSuggestion {
    if (!this.menuDatabase) {
      return this.suggestMeal(options);
    }

    const suggestions = this.menuDatabase.suggestMenus({
      mealType: options.mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
      maxCalories: options.targetCalories ? Math.round(options.targetCalories * 1.2) : undefined,
      vegetarian: options.vegetarian,
      excludeMenuIds: usedMenuIds
    });

    const filteredSuggestions = suggestions.filter(menu => {
      const hasExcludedIngredients = options.excludeIngredients.some(excluded =>
        menu.ingredients.some(ingredient =>
          ingredient.toLowerCase().includes(excluded.toLowerCase())
        )
      );
      return !hasExcludedIngredients;
    });

    if (filteredSuggestions.length > 0) {
      const selectedMenu = filteredSuggestions[Math.floor(Math.random() * filteredSuggestions.length)];
      usedMenuIds.push(selectedMenu.id);
      return this.convertMenuToMealSuggestion(selectedMenu);
    }

    return this.suggestMeal(options);
  }
}