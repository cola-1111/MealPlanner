This is a study project using Claude Code.

# Low-Fat High-Protein Meal Planner MCP Server

A Model Context Protocol (MCP) server that provides intelligent meal planning for low-fat, high-protein diets. Perfect for fitness enthusiasts, weight management, and healthy eating goals.

## Features

- **Individual Meal Suggestions**: Get personalized meal recommendations based on preferences
- **Multi-Day Meal Plans**: Create comprehensive meal plans for up to 14 days
- **Nutritional Information**: Detailed nutrition facts for foods and complete meals
- **Dietary Preferences**: Support for vegetarian options and ingredient exclusions
- **Optimized Nutrition**: Focus on high protein-to-fat ratios and balanced macronutrients

## Installation

```bash
npm install
npm run build
```

## Usage

### As an MCP Server

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "meal-planner": {
      "command": "node",
      "args": ["/path/to/low-fat-high-protein-meal-planner/dist/index.js"]
    }
  }
}
```

### Available Tools

#### 1. `suggest_meal`
Get a single meal suggestion optimized for low-fat, high-protein content.

**Parameters:**
- `mealType` (required): "breakfast", "lunch", "dinner", or "snack"
- `calories` (optional): Target calories (100-1500)
- `excludeIngredients` (optional): Array of ingredients to avoid
- `vegetarian` (optional): Boolean for vegetarian-only options

**Example:**
```json
{
  "mealType": "lunch",
  "calories": 450,
  "excludeIngredients": ["chicken"],
  "vegetarian": false
}
```

#### 2. `get_nutrition_info`
Get detailed nutritional information for a specific food item.

**Parameters:**
- `foodItem` (required): Name of the food item

**Example:**
```json
{
  "foodItem": "salmon fillet"
}
```

#### 3. `create_meal_plan`
Generate a comprehensive multi-day meal plan.

**Parameters:**
- `days` (required): Number of days (1-14)
- `dailyCalories` (required): Target daily calories (1200-3000)
- `vegetarian` (optional): Boolean for vegetarian-only meals
- `excludeIngredients` (optional): Array of ingredients to avoid

**Example:**
```json
{
  "days": 7,
  "dailyCalories": 1800,
  "vegetarian": false,
  "excludeIngredients": ["dairy"]
}
```

## Food Database

The system includes a comprehensive database of nutritionally optimized foods:

### Lean Proteins
- Chicken breast, salmon, white fish
- Egg whites, Greek yogurt, cottage cheese
- Tofu, tempeh, lentils, chickpeas

### Vegetables
- Broccoli, spinach, bell peppers
- Asparagus, cucumber, zucchini

### Complex Carbohydrates
- Brown rice, quinoa, sweet potato, oatmeal

### Fruits
- Blueberries, strawberries, apple

## Nutritional Focus

All meal suggestions are optimized for:
- **High Protein**: 25-40% of calories from protein
- **Low Fat**: Typically <25% of calories from fat
- **Complex Carbs**: Emphasis on fiber-rich, nutrient-dense carbohydrates
- **Micronutrients**: Inclusion of vitamin and mineral-rich foods

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start development mode
npm run dev

# Run type checking
npm run typecheck

# Run linting
npm run lint
```

## Architecture

- `src/index.ts`: Main MCP server implementation
- `src/meal-database.ts`: Food database and nutrition information
- `src/meal-planner.ts`: Meal planning algorithms and logic
- `src/types.ts`: TypeScript type definitions

## License

MIT License