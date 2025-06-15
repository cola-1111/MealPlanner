#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { MealDatabase } from './meal-database.js';
import { MenuDatabase } from './menu-database.js';
import { MealPlanner } from './meal-planner.js';

const server = new Server(
  {
    name: 'low-fat-high-protein-meal-planner',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const mealDatabase = new MealDatabase();
const menuDatabase = new MenuDatabase();
const mealPlanner = new MealPlanner(mealDatabase, menuDatabase);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'suggest_meal',
        description: 'Suggest a low-fat, high-protein meal based on preferences and dietary requirements',
        inputSchema: {
          type: 'object',
          properties: {
            mealType: {
              type: 'string',
              enum: ['breakfast', 'lunch', 'dinner', 'snack'],
              description: 'Type of meal to suggest',
            },
            calories: {
              type: 'number',
              description: 'Target calories for the meal (optional)',
              minimum: 100,
              maximum: 1500,
            },
            excludeIngredients: {
              type: 'array',
              items: { type: 'string' },
              description: 'Ingredients to exclude from suggestions (optional)',
            },
            vegetarian: {
              type: 'boolean',
              description: 'Whether to include only vegetarian options (optional)',
              default: false,
            },
          },
          required: ['mealType'],
        },
      },
      {
        name: 'get_nutrition_info',
        description: 'Get detailed nutritional information for a specific food item',
        inputSchema: {
          type: 'object',
          properties: {
            foodItem: {
              type: 'string',
              description: 'Name of the food item to get nutrition information for',
            },
          },
          required: ['foodItem'],
        },
      },
      {
        name: 'create_meal_plan',
        description: 'Create a multi-day low-fat, high-protein meal plan',
        inputSchema: {
          type: 'object',
          properties: {
            days: {
              type: 'number',
              description: 'Number of days for the meal plan',
              minimum: 1,
              maximum: 14,
            },
            dailyCalories: {
              type: 'number',
              description: 'Target daily calories',
              minimum: 1200,
              maximum: 3000,
            },
            vegetarian: {
              type: 'boolean',
              description: 'Whether to include only vegetarian options',
              default: false,
            },
            excludeIngredients: {
              type: 'array',
              items: { type: 'string' },
              description: 'Ingredients to exclude from the meal plan',
            },
          },
          required: ['days', 'dailyCalories'],
        },
      },
      {
        name: 'register_menu',
        description: 'Register a custom menu with ingredients, instructions, and nutritional information',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the menu',
            },
            description: {
              type: 'string',
              description: 'Description of the menu',
            },
            ingredients: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of ingredients with quantities',
            },
            instructions: {
              type: 'array',
              items: { type: 'string' },
              description: 'Step-by-step cooking instructions',
            },
            mealType: {
              type: 'string',
              enum: ['breakfast', 'lunch', 'dinner', 'snack'],
              description: 'Type of meal',
            },
            nutrition: {
              type: 'object',
              properties: {
                calories: { type: 'number', minimum: 0 },
                protein: { type: 'number', minimum: 0 },
                fat: { type: 'number', minimum: 0 },
                carbohydrates: { type: 'number', minimum: 0 },
                fiber: { type: 'number', minimum: 0 },
                sodium: { type: 'number', minimum: 0 },
              },
              required: ['calories', 'protein', 'fat', 'carbohydrates', 'fiber', 'sodium'],
              description: 'Nutritional information per serving',
            },
            prepTime: {
              type: 'number',
              description: 'Preparation time in minutes',
              minimum: 1,
            },
            servings: {
              type: 'number',
              description: 'Number of servings this recipe makes',
              minimum: 1,
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Tags for categorization (e.g., vegetarian, vegan, gluten-free)',
            },
          },
          required: ['name', 'description', 'ingredients', 'instructions', 'mealType', 'nutrition', 'prepTime', 'servings'],
        },
      },
      {
        name: 'list_menus',
        description: 'List all registered menus or filter by meal type',
        inputSchema: {
          type: 'object',
          properties: {
            mealType: {
              type: 'string',
              enum: ['breakfast', 'lunch', 'dinner', 'snack'],
              description: 'Filter by meal type (optional)',
            },
            tag: {
              type: 'string',
              description: 'Filter by tag (optional)',
            },
            search: {
              type: 'string',
              description: 'Search term for menu name, description, or ingredients (optional)',
            },
          },
        },
      },
      {
        name: 'update_menu',
        description: 'Update an existing registered menu',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID of the menu to update',
            },
            name: {
              type: 'string',
              description: 'New name of the menu (optional)',
            },
            description: {
              type: 'string',
              description: 'New description of the menu (optional)',
            },
            ingredients: {
              type: 'array',
              items: { type: 'string' },
              description: 'New list of ingredients (optional)',
            },
            instructions: {
              type: 'array',
              items: { type: 'string' },
              description: 'New cooking instructions (optional)',
            },
            mealType: {
              type: 'string',
              enum: ['breakfast', 'lunch', 'dinner', 'snack'],
              description: 'New meal type (optional)',
            },
            nutrition: {
              type: 'object',
              properties: {
                calories: { type: 'number', minimum: 0 },
                protein: { type: 'number', minimum: 0 },
                fat: { type: 'number', minimum: 0 },
                carbohydrates: { type: 'number', minimum: 0 },
                fiber: { type: 'number', minimum: 0 },
                sodium: { type: 'number', minimum: 0 },
              },
              description: 'New nutritional information (optional)',
            },
            prepTime: {
              type: 'number',
              description: 'New preparation time in minutes (optional)',
              minimum: 1,
            },
            servings: {
              type: 'number',
              description: 'New number of servings (optional)',
              minimum: 1,
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'New tags (optional)',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'delete_menu',
        description: 'Delete a registered menu',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID of the menu to delete',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'suggest_from_registered_menus',
        description: 'Suggest meals from registered menus based on criteria',
        inputSchema: {
          type: 'object',
          properties: {
            mealType: {
              type: 'string',
              enum: ['breakfast', 'lunch', 'dinner', 'snack'],
              description: 'Type of meal to suggest (optional)',
            },
            maxCalories: {
              type: 'number',
              description: 'Maximum calories per serving (optional)',
              minimum: 50,
            },
            minProtein: {
              type: 'number',
              description: 'Minimum protein per serving (optional)',
              minimum: 0,
            },
            maxFat: {
              type: 'number',
              description: 'Maximum fat per serving (optional)',
              minimum: 0,
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Required tags (optional)',
            },
            vegetarian: {
              type: 'boolean',
              description: 'Only suggest vegetarian options (optional)',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of suggestions to return (optional, default: 5)',
              minimum: 1,
              maximum: 20,
            },
          },
        },
      },
      {
        name: 'create_meal_plan_from_menus',
        description: 'Create a meal plan using registered menus when possible, falling back to generated meals',
        inputSchema: {
          type: 'object',
          properties: {
            days: {
              type: 'number',
              description: 'Number of days for the meal plan',
              minimum: 1,
              maximum: 14,
            },
            dailyCalories: {
              type: 'number',
              description: 'Target daily calories',
              minimum: 1200,
              maximum: 3000,
            },
            vegetarian: {
              type: 'boolean',
              description: 'Whether to include only vegetarian options',
              default: false,
            },
            excludeIngredients: {
              type: 'array',
              items: { type: 'string' },
              description: 'Ingredients to exclude from the meal plan',
            },
            useRegisteredMenus: {
              type: 'boolean',
              description: 'Whether to use registered menus when available',
              default: true,
            },
          },
          required: ['days', 'dailyCalories'],
        },
      },
    ] as Tool[],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case 'suggest_meal': {
      const { mealType, calories, excludeIngredients, vegetarian } = request.params.arguments as {
        mealType: string;
        calories?: number;
        excludeIngredients?: string[];
        vegetarian?: boolean;
      };

      const meal = mealPlanner.suggestMeal({
        mealType,
        targetCalories: calories,
        excludeIngredients: excludeIngredients || [],
        vegetarian: vegetarian || false,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(meal, null, 2),
          },
        ],
      };
    }

    case 'get_nutrition_info': {
      const { foodItem } = request.params.arguments as { foodItem: string };
      const nutritionInfo = mealDatabase.getNutritionInfo(foodItem);

      if (!nutritionInfo) {
        return {
          content: [
            {
              type: 'text',
              text: `Nutrition information not found for: ${foodItem}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(nutritionInfo, null, 2),
          },
        ],
      };
    }

    case 'create_meal_plan': {
      const { days, dailyCalories, vegetarian, excludeIngredients } = request.params.arguments as {
        days: number;
        dailyCalories: number;
        vegetarian?: boolean;
        excludeIngredients?: string[];
      };

      const mealPlan = mealPlanner.createMealPlan({
        days,
        dailyCalories,
        vegetarian: vegetarian || false,
        excludeIngredients: excludeIngredients || [],
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(mealPlan, null, 2),
          },
        ],
      };
    }

    case 'register_menu': {
      const menuData = request.params.arguments as {
        name: string;
        description: string;
        ingredients: string[];
        instructions: string[];
        mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
        nutrition: {
          calories: number;
          protein: number;
          fat: number;
          carbohydrates: number;
          fiber: number;
          sodium: number;
        };
        prepTime: number;
        servings: number;
        tags?: string[];
      };

      try {
        const registeredMenu = await menuDatabase.registerMenu(menuData);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(registeredMenu, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error registering menu: ${(error as Error).message}`,
            },
          ],
        };
      }
    }

    case 'list_menus': {
      const { mealType, tag, search } = request.params.arguments as {
        mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
        tag?: string;
        search?: string;
      };

      let menus = menuDatabase.getAllMenus();

      if (mealType) {
        menus = menuDatabase.getMenusByType(mealType);
      }

      if (tag) {
        menus = menuDatabase.getMenusByTag(tag);
      }

      if (search) {
        menus = menuDatabase.searchMenus(search);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              count: menus.length,
              menus: menus
            }, null, 2),
          },
        ],
      };
    }

    case 'update_menu': {
      const updateData = request.params.arguments as {
        id: string;
        name?: string;
        description?: string;
        ingredients?: string[];
        instructions?: string[];
        mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
        nutrition?: {
          calories: number;
          protein: number;
          fat: number;
          carbohydrates: number;
          fiber: number;
          sodium: number;
        };
        prepTime?: number;
        servings?: number;
        tags?: string[];
      };

      try {
        const updatedMenu = await menuDatabase.updateMenu(updateData);
        if (!updatedMenu) {
          return {
            content: [
              {
                type: 'text',
                text: `Menu with ID ${updateData.id} not found`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(updatedMenu, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error updating menu: ${(error as Error).message}`,
            },
          ],
        };
      }
    }

    case 'delete_menu': {
      const { id } = request.params.arguments as { id: string };

      try {
        const deleted = await menuDatabase.deleteMenu(id);
        if (!deleted) {
          return {
            content: [
              {
                type: 'text',
                text: `Menu with ID ${id} not found`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: `Menu with ID ${id} has been deleted successfully`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error deleting menu: ${(error as Error).message}`,
            },
          ],
        };
      }
    }

    case 'suggest_from_registered_menus': {
      const options = request.params.arguments as {
        mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
        maxCalories?: number;
        minProtein?: number;
        maxFat?: number;
        tags?: string[];
        vegetarian?: boolean;
        limit?: number;
      };

      try {
        const suggestions = mealPlanner.suggestFromRegisteredMenus(options);
        const limit = options.limit || 5;
        const limitedSuggestions = suggestions.slice(0, limit);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                count: limitedSuggestions.length,
                totalAvailable: suggestions.length,
                suggestions: limitedSuggestions
              }, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error suggesting from registered menus: ${(error as Error).message}`,
            },
          ],
        };
      }
    }

    case 'create_meal_plan_from_menus': {
      const request_args = request.params.arguments as {
        days: number;
        dailyCalories: number;
        vegetarian?: boolean;
        excludeIngredients?: string[];
        useRegisteredMenus?: boolean;
      };

      try {
        const mealPlan = mealPlanner.createMealPlanFromMenus({
          days: request_args.days,
          dailyCalories: request_args.dailyCalories,
          vegetarian: request_args.vegetarian || false,
          excludeIngredients: request_args.excludeIngredients || [],
          useRegisteredMenus: request_args.useRegisteredMenus !== false,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(mealPlan, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error creating meal plan from menus: ${(error as Error).message}`,
            },
          ],
        };
      }
    }

    default:
      throw new Error(`Unknown tool: ${request.params.name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});