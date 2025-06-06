#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { MealDatabase } from './meal-database.js';
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
const mealPlanner = new MealPlanner(mealDatabase);

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