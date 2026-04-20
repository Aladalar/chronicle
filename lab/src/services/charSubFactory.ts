import { Router, Request, Response, NextFunction } from "express";
import { ObjectLiteral, EntityTarget, FindOptionsWhere } from "typeorm";
import { AppDataSource } from "../data-source";
import { Character } from "../entities";
import { authenticate, AppError } from "../middleware";
import { broadcast } from "../socket/emitter";

interface CharSubOptions<T extends ObjectLiteral> {
  /** TypeORM entity class */
  entity: EntityTarget<T>;
  /** Socket event prefix, e.g. "char:ability" */
  eventPrefix: string;
  /** Relations to load on GET */
  relations?: string[];
}

/**
 * Ownership check: player can only write their own characters (or companions of their chars).
 * DM can write any character in the campaign.
 */
async function verifyCharacterAccess(req: Request, characterId: string): Promise<Character> {
  const charRepo = AppDataSource.getRepository(Character);
  const char = await charRepo.findOne({
    where: { id: characterId },
    relations: ["parentCharacter"],
  });

  if (!char) throw new AppError(404, "Character not found");

  if (req.auth!.role === "dm") return char;

  // Player: must own this character or its parent
  const ownerId = char.parentCharacterId
    ? (await charRepo.findOne({ where: { id: char.parentCharacterId } }))?.ownerId
    : char.ownerId;

  if (ownerId !== req.auth!.userId) {
    throw new AppError(403, "Not your character");
  }

  return char;
}

/**
 * Creates POST / PATCH / DELETE routes for a character sub-resource.
 *
 * Mounted at: /characters/:characterId/<subPath>
 *
 * GET    /               → list all for character
 * POST   /               → add entry
 * PATCH  /:id            → update entry
 * DELETE /:id            → remove entry
 */
export function charSubRouter<T extends ObjectLiteral>(opts: CharSubOptions<T>): Router {
  const router = Router({ mergeParams: true });
  const repo = () => AppDataSource.getRepository(opts.entity);

  router.use(authenticate);

  // ─── LIST ───
  router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const char = await verifyCharacterAccess(req, req.params.characterId);
      const items = await repo().find({
        where: { characterId: char.id } as unknown as FindOptionsWhere<T>,
        relations: opts.relations,
        order: { sortOrder: "ASC", createdAt: "ASC" } as any,
      });
      res.json(items);
    } catch (e) { next(e); }
  });

  // ─── CREATE ───
  router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const char = await verifyCharacterAccess(req, req.params.characterId);
      const body = { ...req.body, characterId: char.id };
      const entity = repo().create(body as any);
      const saved = await repo().save(entity as any);

      broadcast(char.campaignId, `${opts.eventPrefix}:create`, {
        characterId: char.id,
        data: saved,
      });
      res.status(201).json(saved);
    } catch (e) { next(e); }
  });

  // ─── UPDATE ───
  router.patch("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const char = await verifyCharacterAccess(req, req.params.characterId);
      const existing = await repo().findOne({
        where: { id: req.params.id, characterId: char.id } as unknown as FindOptionsWhere<T>,
      });
      if (!existing) throw new AppError(404, "Not found");

      const body = { ...req.body };
      delete body.id;
      delete body.characterId;

      repo().merge(existing, body as any);
      const saved = await repo().save(existing as any);

      broadcast(char.campaignId, `${opts.eventPrefix}:update`, {
        characterId: char.id,
        data: saved,
      });
      res.json(saved);
    } catch (e) { next(e); }
  });

  // ─── DELETE ───
  router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const char = await verifyCharacterAccess(req, req.params.characterId);
      const existing = await repo().findOne({
        where: { id: req.params.id, characterId: char.id } as unknown as FindOptionsWhere<T>,
      });
      if (!existing) throw new AppError(404, "Not found");

      await repo().remove(existing);
      broadcast(char.campaignId, `${opts.eventPrefix}:delete`, {
        characterId: char.id,
        id: req.params.id,
      });
      res.json({ deleted: true, id: req.params.id });
    } catch (e) { next(e); }
  });

  return router;
}
