import { Router, Request, Response, NextFunction } from "express";
import { ObjectLiteral, EntityTarget, FindOptionsWhere } from "typeorm";
import { AppDataSource } from "../data-source";
import { authenticate, requireRole, AppError } from "../middleware";
import { broadcast } from "../socket/emitter";

interface GlobalCrudOptions<T extends ObjectLiteral> {
  entity: EntityTarget<T>;
  eventPrefix: string;
  writeAccess?: "dm" | "any";
  relations?: string[];
}

/**
 * Generic CRUD for global (non-campaign-scoped) entities.
 * Same pattern as campaignCrudFactory but without campaignId filtering.
 */
export function globalCrudRouter<T extends ObjectLiteral>(
  opts: GlobalCrudOptions<T>,
): Router {
  const router = Router({ mergeParams: true });
  const repo = () => AppDataSource.getRepository(opts.entity);

  router.use(authenticate);

  const writeGuard =
    (opts.writeAccess || "dm") === "dm" ? [requireRole("dm")] : [];

  // ─── LIST ───
  router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await repo().find({
        relations: opts.relations,
        order: { createdAt: "ASC" } as any,
      });
      res.json(items);
    } catch (e) { next(e); }
  });

  // ─── GET ONE ───
  router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await repo().findOne({
        where: { id: req.params.id } as unknown as FindOptionsWhere<T>,
        relations: opts.relations,
      });
      if (!item) throw new AppError(404, "Not found");
      res.json(item);
    } catch (e) { next(e); }
  });

  // ─── CREATE ───
  router.post("/", ...writeGuard, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entity = repo().create(req.body as any);
      const saved = await repo().save(entity as any);
      broadcast("global", `${opts.eventPrefix}:create`, saved);
      res.status(201).json(saved);
    } catch (e) { next(e); }
  });

  // ─── UPDATE ───
  router.patch("/:id", ...writeGuard, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const existing = await repo().findOne({
        where: { id: req.params.id } as unknown as FindOptionsWhere<T>,
      });
      if (!existing) throw new AppError(404, "Not found");

      const body = { ...req.body };
      delete body.id;

      repo().merge(existing, body as any);
      const saved = await repo().save(existing as any);
      broadcast("global", `${opts.eventPrefix}:update`, saved);
      res.json(saved);
    } catch (e) { next(e); }
  });

  // ─── DELETE ───
  router.delete("/:id", ...writeGuard, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const existing = await repo().findOne({
        where: { id: req.params.id } as unknown as FindOptionsWhere<T>,
      });
      if (!existing) throw new AppError(404, "Not found");

      await repo().remove(existing);
      broadcast("global", `${opts.eventPrefix}:delete`, { id: req.params.id });
      res.json({ deleted: true, id: req.params.id });
    } catch (e) { next(e); }
  });

  return router;
}
