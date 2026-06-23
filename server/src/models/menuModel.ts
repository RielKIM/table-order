import db from '../config/database';
import type { Menu } from '../types';

interface MenuRow {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: Date;
}

export interface CreateMenuInput {
  name: string;
  price: number;
  category: string;
  description?: string | null;
  imageUrl?: string | null;
}

export interface UpdateMenuInput {
  name?: string;
  price?: number;
  category?: string;
  description?: string | null;
  imageUrl?: string | null;
  displayOrder?: number;
}

function mapRow(row: MenuRow): Menu {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    category: row.category,
    description: row.description,
    imageUrl: row.image_url,
    displayOrder: row.display_order,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

export const MenuModel = {
  async findAll(category?: string): Promise<Menu[]> {
    const query = db<MenuRow>('menus').where({ is_active: true });
    if (category) {
      query.andWhere({ category });
    }
    const rows = await query.orderBy('display_order', 'asc');
    return rows.map(mapRow);
  },

  async findById(id: number): Promise<Menu | null> {
    const row = await db<MenuRow>('menus').where({ id }).first();
    return row ? mapRow(row) : null;
  },

  async findActiveByIds(ids: number[]): Promise<Menu[]> {
    const rows = await db<MenuRow>('menus')
      .whereIn('id', ids)
      .andWhere({ is_active: true });
    return rows.map(mapRow);
  },

  async create(input: CreateMenuInput, displayOrder: number): Promise<Menu> {
    const [row] = await db<MenuRow>('menus')
      .insert({
        name: input.name,
        price: input.price,
        category: input.category,
        description: input.description ?? null,
        image_url: input.imageUrl ?? null,
        display_order: displayOrder,
        is_active: true,
      })
      .returning('*');
    return mapRow(row);
  },

  async maxDisplayOrder(category: string): Promise<number> {
    const result = await db<MenuRow>('menus')
      .where({ category })
      .max('display_order as max')
      .first();
    return (result?.max as number) ?? 0;
  },

  async update(id: number, input: UpdateMenuInput): Promise<Menu | null> {
    const patch: Partial<MenuRow> = {};
    if (input.name !== undefined) patch.name = input.name;
    if (input.price !== undefined) patch.price = input.price;
    if (input.category !== undefined) patch.category = input.category;
    if (input.description !== undefined) patch.description = input.description;
    if (input.imageUrl !== undefined) patch.image_url = input.imageUrl;
    if (input.displayOrder !== undefined) patch.display_order = input.displayOrder;

    const [row] = await db<MenuRow>('menus')
      .where({ id })
      .update(patch)
      .returning('*');
    return row ? mapRow(row) : null;
  },

  async softDelete(id: number): Promise<boolean> {
    const count = await db<MenuRow>('menus')
      .where({ id })
      .update({ is_active: false });
    return count > 0;
  },
};
