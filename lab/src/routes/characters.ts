import { Router, Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import {
  Character,
  CharacterAttribute,
  CharacterAbility,
  CharacterKnowledge,
  CharacterInventory,
  CharacterTrait,
  CharacterArcane,
  CharacterTask,
} from "../entities";
import { authenticate, campaignScope, requireCampaignDM, AppError } from "../middleware";
import { charSubRouter } from "../services";
import { broadcast } from "../socket/emitter";

const router = Router({ mergeParams: true });

// All character routes require auth + campaign scope
router.use(authenticate, campaignScope);

// ─── LIST CHARACTERS ──────────────────────────────────────────
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const charRepo = AppDataSource.getRepository(Character);
    const where: any = { campaignId: req.campaignId, isCompanion: false };

    // Players see only their own
    if (req.campaignRole === "player") {
      where.ownerId = req.auth!.userId;
    }

    const chars = await charRepo.find({
      where,
      relations: [
        "attributes", "abilities", "knowledge", "inventory",
        "traits", "arcane", "tasks", "companions", "race",
      ],
      order: { name: "ASC" },
    });
    res.json(chars);
  } catch (e) { next(e); }
});

// ─── GET ONE CHARACTER ────────────────────────────────────────
router.get("/:characterId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const char = await AppDataSource.getRepository(Character).findOne({
      where: { id: req.params.characterId, campaignId: req.campaignId },
      relations: [
        "attributes", "abilities", "knowledge", "inventory",
        "traits", "arcane", "tasks", "companions", "race",
      ],
    });
    if (!char) throw new AppError(404, "Character not found");

    // Player can only see their own
    if (req.campaignRole === "player" && char.ownerId !== req.auth!.userId) {
      throw new AppError(403, "Not your character");
    }

    res.json(char);
  } catch (e) { next(e); }
});

// ─── CREATE CHARACTER ─────────────────────────────────────────
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const charRepo = AppDataSource.getRepository(Character);
    const body = {
      ...req.body,
      campaignId: req.campaignId,
      ownerId: req.body.ownerId || req.auth!.userId,
    };

    // Players can only create for themselves
    if (req.campaignRole === "player" && body.ownerId !== req.auth!.userId) {
      throw new AppError(403, "Cannot create characters for other players");
    }

    const char = charRepo.create(body);
    const saved = await charRepo.save(char);

    broadcast(req.campaignId!, "character:create", saved);
    res.status(201).json(saved);
  } catch (e) { next(e); }
});

// ─── UPDATE CHARACTER (top-level fields) ──────────────────────
router.patch("/:characterId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const charRepo = AppDataSource.getRepository(Character);
    const char = await charRepo.findOne({
      where: { id: req.params.characterId, campaignId: req.campaignId },
    });
    if (!char) throw new AppError(404, "Character not found");

    if (req.campaignRole === "player" && char.ownerId !== req.auth!.userId) {
      throw new AppError(403, "Not your character");
    }

    const body = { ...req.body };
    delete body.id;
    delete body.campaignId;
    delete body.ownerId; // can't reassign ownership via patch

    charRepo.merge(char, body);
    const saved = await charRepo.save(char);

    broadcast(req.campaignId!, "character:update", { characterId: saved.id, fields: body });
    res.json(saved);
  } catch (e) { next(e); }
});

// ─── DELETE CHARACTER (DM only) ───────────────────────────────
router.delete("/:characterId", requireCampaignDM, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const charRepo = AppDataSource.getRepository(Character);
    const char = await charRepo.findOne({
      where: { id: req.params.characterId, campaignId: req.campaignId },
    });
    if (!char) throw new AppError(404, "Character not found");

    await charRepo.remove(char);
    broadcast(req.campaignId!, "character:delete", { characterId: req.params.characterId });
    res.json({ deleted: true, id: req.params.characterId });
  } catch (e) { next(e); }
});

// ─── STEPPER (delta +/- for souls, currency) ─────────────────
router.post("/:characterId/stepper", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { field, delta } = req.body;
    const allowedFields = ["soulsEnergy", "currencyMinor", "currencyMajor"];
    if (!allowedFields.includes(field)) throw new AppError(400, `Invalid stepper field: ${field}`);
    if (typeof delta !== "number" || (delta !== 1 && delta !== -1)) {
      throw new AppError(400, "Delta must be +1 or -1");
    }

    const charRepo = AppDataSource.getRepository(Character);
    const char = await charRepo.findOne({
      where: { id: req.params.characterId, campaignId: req.campaignId },
    });
    if (!char) throw new AppError(404, "Character not found");

    if (req.campaignRole === "player" && char.ownerId !== req.auth!.userId) {
      throw new AppError(403, "Not your character");
    }

    // SQL increment for race-condition safety
    await charRepo
      .createQueryBuilder()
      .update(Character)
      .set({ [field]: () => `${field} + ${delta}` } as any)
      .where("id = :id", { id: char.id })
      .execute();

    const updated = await charRepo.findOne({ where: { id: char.id } });
    broadcast(req.campaignId!, "char:stepper", {
      characterId: char.id,
      field,
      value: (updated as any)?.[field],
    });
    res.json({ field, value: (updated as any)?.[field] });
  } catch (e) { next(e); }
});

// ─── SUB-RESOURCE MOUNTS (factory pattern) ────────────────────
// Adding a new sub-resource = one line here + one entity.
router.use("/:characterId/attributes", charSubRouter({ entity: CharacterAttribute, eventPrefix: "char:attribute" }));
router.use("/:characterId/abilities", charSubRouter({ entity: CharacterAbility, eventPrefix: "char:ability" }));
router.use("/:characterId/knowledge", charSubRouter({ entity: CharacterKnowledge, eventPrefix: "char:knowledge" }));
router.use("/:characterId/inventory", charSubRouter({ entity: CharacterInventory, eventPrefix: "char:inventory" }));
router.use("/:characterId/traits", charSubRouter({ entity: CharacterTrait, eventPrefix: "char:trait" }));
router.use("/:characterId/arcane", charSubRouter({ entity: CharacterArcane, eventPrefix: "char:arcane" }));
router.use("/:characterId/tasks", charSubRouter({ entity: CharacterTask, eventPrefix: "char:task" }));

export default router;
