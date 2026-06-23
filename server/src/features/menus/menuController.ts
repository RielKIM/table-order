import type { Request, Response, NextFunction } from 'express';
import { MenuService } from './menuService';
import { createMenuSchema, updateMenuSchema, reorderMenuSchema } from './menuSchemas';
import { sendSuccess } from '../../shared/response';
import { ValidationError } from '../../shared/errors';

function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError('유효하지 않은 메뉴 ID입니다');
  }
  return id;
}

export const menuController = {
  // GET /api/menus (공개)
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = typeof req.query.category === 'string' ? req.query.category : undefined;
      const menus = await MenuService.getMenus(category);
      sendSuccess(res, menus);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/menus/:id (공개)
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseId(req.params.id);
      const menu = await MenuService.getMenuById(id);
      sendSuccess(res, menu);
    } catch (err) {
      next(err);
    }
  },

  // POST /api/menus (보호)
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = createMenuSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('입력값이 올바르지 않습니다');
      }
      const menu = await MenuService.createMenu(parsed.data);
      sendSuccess(res, menu, 201);
    } catch (err) {
      next(err);
    }
  },

  // PUT /api/menus/reorder (보호)
  async reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = reorderMenuSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('입력값이 올바르지 않습니다');
      }
      const menus = await MenuService.reorderMenus(parsed.data.orders);
      sendSuccess(res, menus);
    } catch (err) {
      next(err);
    }
  },

  // PUT /api/menus/:id (보호)
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseId(req.params.id);
      const parsed = updateMenuSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('입력값이 올바르지 않습니다');
      }
      const menu = await MenuService.updateMenu(id, parsed.data);
      sendSuccess(res, menu);
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/menus/:id (보호, Soft Delete)
  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseId(req.params.id);
      await MenuService.deleteMenu(id);
      sendSuccess(res, { id, deleted: true });
    } catch (err) {
      next(err);
    }
  },
};
