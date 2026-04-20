import { Router, Request, Response, NextFunction } from "express";
import { ObjectLiteral, EntityTarget, FindOptionsWhere } from "typeorm";
import { AppDataSource } from "../data-source";
import { authenticate, campaignScope, requireCampaignDM, AppError } from "../middleware";
import { broadcast } from "../socket/emitter";

interface CampaignScopedCrudOptions<T extends ObjectLiteral> {
  /** TypeORM entity class */
  entity: EntityTarget<T>;
  /** Short name for socket events, e.g. "ref:types", "journal" */
  eventPrefix: string;
  /** Who can write. "dm" = DM only, "any" = any member */
  writeAccess: "dm" | "any";
  /** Relations to load on GET */
  relations?: string[];
  /** Hook to transform body before insert/update */
  transformBody?: (body: Record<string, unknown>, req: Request) => Record<string, unknown>;
}

/**
 * Creates a full CRUD router for a campaign-scoped entity.
 * Mounts at: /campaigns/:campaignId/<path>
 *
 * GET    /                → list all for campaign
 * GET    /:id             → get one
 * POST   /                → create
 * PATCH  /:id             → update
 * DELETE /:id             → delete
 */
export function campaignCrudRouter<T extends ObjectLiteral>(
  opts: CampaignScopedCrudOptions<T>,
): Router {
  const router = Router({ mergeParams: true });
  const repo = () => AppDataSource.getRepository(opts.entity);

  // All routes require auth + campaign membership
  router.use(authenticate, campaignScope);

  // Write guard
  const writeGuard =
    opts.writeAccess === "dm"
      ? [requireCampaignDM]
      : [];

  // ─── LIST ───
  router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await repo().find({
        where: { campaignId: req.campaignId } as unknown as FindOptionsWhere<T>,
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
        where: { id: req.params.id, campaignId: req.campaignId } as unknown as FindOptionsWhere<T>,
        relations: opts.relations,
      });
      if (!item) throw new AppError(404, "Not found");
      res.json(item);
    } catch (e) { next(e); }
  });

  // ─── CREATE ───
  router.post("/", ...writeGuard, async (req: Request, res: Response, next: NextFunction) => {
    try {
      let body = { ...req.body, campaignId: req.campaignId };
      if (opts.transformBody) body = opts.transformBody(body, req);

      const entity = repo().create(body as any);
      const saved = await repo().save(entity as any);

      broadcast(req.campaignId!, `${opts.eventPrefix}:create`, saved);
      res.status(201).json(saved);
    } catch (e) { next(e); }
  });

  // ─── UPDATE ───
  router.patch("/:id", ...writeGuard, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const existing = await repo().findOne({
        where: { id: req.params.id, campaignId: req.campaignId } as unknown as FindOptionsWhere<T>,
      });
      if (!existing) throw new AppError(404, "Not found");

      let body = { ...req.body };
      delete body.id;
      delete body.campaignId;
      if (opts.transformBody) body = opts.transformBody(body, req);

      repo().merge(existing, body as any);
      const saved = await repo().save(existing as any);

      broadcast(req.campaignId!, `${opts.eventPrefix}:update`, saved);
      res.json(saved);
    } catch (e) { next(e); }
  });

  // ─── DELETE ───
  router.delete("/:id", ...writeGuard, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const existing = await repo().findOne({
        where: { id: req.params.id, campaignId: req.campaignId } as unknown as FindOptionsWhere<T>,
      });
      if (!existing) throw new AppError(404, "Not found");

      await repo().remove(existing);
      broadcast(req.campaignId!, `${opts.eventPrefix}:delete`, { id: req.params.id });
      res.json({ deleted: true, id: req.params.id });
    } catch (e) { next(e); }
  });

  return router;
}
