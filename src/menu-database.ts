import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { RegisteredMenu, MenuRegistrationRequest, MenuUpdateRequest, MenuSuggestionOptions } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class MenuDatabase {
  private menus: Map<string, RegisteredMenu> = new Map();
  private readonly dataFilePath: string;

  constructor() {
    this.dataFilePath = join(__dirname, '..', 'data', 'menus.json');
    this.loadMenus();
  }

  private async loadMenus(): Promise<void> {
    try {
      await fs.mkdir(dirname(this.dataFilePath), { recursive: true });
      const data = await fs.readFile(this.dataFilePath, 'utf-8');
      const menuData = JSON.parse(data);
      
      for (const menu of menuData) {
        menu.createdAt = new Date(menu.createdAt);
        menu.updatedAt = new Date(menu.updatedAt);
        this.menus.set(menu.id, menu);
      }
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        await this.saveMenus();
      } else {
        console.error('Error loading menus:', error);
      }
    }
  }

  private async saveMenus(): Promise<void> {
    try {
      const menuArray = Array.from(this.menus.values());
      await fs.writeFile(this.dataFilePath, JSON.stringify(menuArray, null, 2));
    } catch (error) {
      console.error('Error saving menus:', error);
      throw new Error('Failed to save menus to file');
    }
  }

  private generateId(): string {
    return `menu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async registerMenu(request: MenuRegistrationRequest): Promise<RegisteredMenu> {
    const id = this.generateId();
    const now = new Date();
    
    const menu: RegisteredMenu = {
      id,
      name: request.name,
      description: request.description,
      ingredients: request.ingredients,
      instructions: request.instructions,
      mealType: request.mealType,
      nutrition: request.nutrition,
      prepTime: request.prepTime,
      servings: request.servings,
      tags: request.tags || [],
      createdAt: now,
      updatedAt: now
    };

    this.menus.set(id, menu);
    await this.saveMenus();
    
    return menu;
  }

  async updateMenu(request: MenuUpdateRequest): Promise<RegisteredMenu | null> {
    const existingMenu = this.menus.get(request.id);
    if (!existingMenu) {
      return null;
    }

    const updatedMenu: RegisteredMenu = {
      ...existingMenu,
      ...(request.name && { name: request.name }),
      ...(request.description && { description: request.description }),
      ...(request.ingredients && { ingredients: request.ingredients }),
      ...(request.instructions && { instructions: request.instructions }),
      ...(request.mealType && { mealType: request.mealType }),
      ...(request.nutrition && { nutrition: request.nutrition }),
      ...(request.prepTime && { prepTime: request.prepTime }),
      ...(request.servings && { servings: request.servings }),
      ...(request.tags && { tags: request.tags }),
      updatedAt: new Date()
    };

    this.menus.set(request.id, updatedMenu);
    await this.saveMenus();
    
    return updatedMenu;
  }

  async deleteMenu(id: string): Promise<boolean> {
    const deleted = this.menus.delete(id);
    if (deleted) {
      await this.saveMenus();
    }
    return deleted;
  }

  getMenu(id: string): RegisteredMenu | null {
    return this.menus.get(id) || null;
  }

  getAllMenus(): RegisteredMenu[] {
    return Array.from(this.menus.values());
  }

  getMenusByType(mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'): RegisteredMenu[] {
    return Array.from(this.menus.values()).filter(menu => menu.mealType === mealType);
  }

  getMenusByTag(tag: string): RegisteredMenu[] {
    return Array.from(this.menus.values()).filter(menu => menu.tags.includes(tag));
  }

  searchMenus(query: string): RegisteredMenu[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.menus.values()).filter(menu => 
      menu.name.toLowerCase().includes(lowerQuery) ||
      menu.description.toLowerCase().includes(lowerQuery) ||
      menu.ingredients.some(ingredient => ingredient.toLowerCase().includes(lowerQuery)) ||
      menu.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  suggestMenus(options: MenuSuggestionOptions): RegisteredMenu[] {
    let filteredMenus = Array.from(this.menus.values());

    if (options.mealType) {
      filteredMenus = filteredMenus.filter(menu => menu.mealType === options.mealType);
    }

    if (options.maxCalories) {
      filteredMenus = filteredMenus.filter(menu => menu.nutrition.calories <= options.maxCalories!);
    }

    if (options.minProtein) {
      filteredMenus = filteredMenus.filter(menu => menu.nutrition.protein >= options.minProtein!);
    }

    if (options.maxFat) {
      filteredMenus = filteredMenus.filter(menu => menu.nutrition.fat <= options.maxFat!);
    }

    if (options.tags && options.tags.length > 0) {
      filteredMenus = filteredMenus.filter(menu => 
        options.tags!.some(tag => menu.tags.includes(tag))
      );
    }

    if (options.excludeMenuIds && options.excludeMenuIds.length > 0) {
      filteredMenus = filteredMenus.filter(menu => 
        !options.excludeMenuIds!.includes(menu.id)
      );
    }

    if (options.vegetarian) {
      filteredMenus = filteredMenus.filter(menu => 
        menu.tags.includes('vegetarian') || menu.tags.includes('vegan')
      );
    }

    return filteredMenus.sort((a, b) => {
      const aRatio = a.nutrition.protein / Math.max(a.nutrition.fat, 0.1);
      const bRatio = b.nutrition.protein / Math.max(b.nutrition.fat, 0.1);
      return bRatio - aRatio;
    });
  }

  getMenuCount(): number {
    return this.menus.size;
  }

  getMenusByNutritionRange(minProtein?: number, maxFat?: number, maxCalories?: number): RegisteredMenu[] {
    return Array.from(this.menus.values()).filter(menu => {
      if (minProtein && menu.nutrition.protein < minProtein) return false;
      if (maxFat && menu.nutrition.fat > maxFat) return false;
      if (maxCalories && menu.nutrition.calories > maxCalories) return false;
      return true;
    });
  }
}