import { Router, Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { Proposal } from "../entities";
import { authenticate, requireRole, AppError } from "../middleware";
import { broadcast } from "../socket/emitter";

/**
 * Map of table names to entity classes.
 * When a proposal is approved, we look up the target entity here.
 * Extend this map when adding new ref tables.
 */
import {
  RefType, RefAbility, RefKnowledge, RefTrait, RefArcaneElement,
  RefRace, RefRank, RefItemTemplate, RefItem, RefBeast, RefFlora,
  RefMaterial, RefMonster, RefNpcImportant, RefGod, RefNpcOther,
  RefSettlement, RefWonder, RefRuin, RefDungeon, RefSpell, RefTome,
  RefTransmutation, RefRune,
} from "../entities";

const entityMap: Record<string, any> = {
  types: RefType,
  abilities: RefAbility,
  knowledge: RefKnowledge,
  traits: RefTrait,
  "arcane-elements": RefArcaneElement,
  races: RefRace,
  ranks: RefRank,
  "item-templates": RefItemTemplate,
  items: RefItem,
  beasts: RefBeast,
  flora: RefFlora,
  materials: RefMaterial,
  monsters: RefMonster,
  "npc-important": RefNpcImportant,
  gods: RefGod,
  "npc-other": RefNpcOther,
  settlements: RefSettlement,
  wonders: RefWonder,
  ruins: RefRuin,
  dungeons: RefDungeon,
  spells: RefSpell,
  tomes: RefTome,
  transmutations: RefTransmutation,
  runes: RefRune,
};

const router = Router();
router.use(authenticate);

const proposalRepo = () => AppDataSource.getRepository(Proposal);

// ─── LIST ─────────────────────────────────────────────────────
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const where: any = {};
    if (req.query.status) where.status = req.query.status;
    // Players see only their own
    if (req.auth!.role === "player") where.authorId = req.auth!.userId;

    const proposals = await proposalRepo().find({
      where,
      relations: ["author"],
      order: { createdAt: "DESC" },
    });

    res.json(proposals.map((p) => ({
      ...p,
      author: p.author
        ? { username: p.author.username, displayName: p.author.displayName }
        : null,
    })));
  } catch (e) { next(e); }
});

// ─── CREATE ───────────────────────────────────────────────────
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { table, op, targetId, data } = req.body;
    if (!table || !op) throw new AppError(400, "table and op required");
    if (!entityMap[table]) throw new AppError(400, `Unknown table: ${table}`);

    const proposal = proposalRepo().create({
      authorId: req.auth!.userId,
      tableName: table,
      op,
      targetId: targetId || null,
      data: data || null,
      status: "pending",
    });
    const saved = await proposalRepo().save(proposal);
    broadcast("global", "proposal:create", saved);
    res.status(201).json(saved);
  } catch (e) { next(e); }
});

// ─── APPROVE (DM only) ───────────────────────────────────────
router.post("/:id/approve", requireRole("dm"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const proposal = await proposalRepo().findOne({ where: { id: req.params.id } });
    if (!proposal) throw new AppError(404, "Proposal not found");
    if (proposal.status !== "pending") throw new AppError(400, "Only pending proposals can be approved");

    const EntityClass = entityMap[proposal.tableName];
    if (!EntityClass) throw new AppError(400, `Unknown table: ${proposal.tableName}`);
    const targetRepo = AppDataSource.getRepository(EntityClass);

    // Apply the change
    if (proposal.op === "create") {
      const entity = targetRepo.create(proposal.data as any);
      await targetRepo.save(entity);
    } else if (proposal.op === "update") {
      if (!proposal.targetId) throw new AppError(400, "targetId required for update");
      const existing = await targetRepo.findOne({ where: { id: proposal.targetId } });
      if (!existing) throw new AppError(404, "Target entity not found");
      targetRepo.merge(existing, proposal.data as any);
      await targetRepo.save(existing);
    } else if (proposal.op === "delete") {
      if (!proposal.targetId) throw new AppError(400, "targetId required for delete");
      const existing = await targetRepo.findOne({ where: { id: proposal.targetId } });
      if (!existing) throw new AppError(404, "Target entity not found");
      await targetRepo.remove(existing);
    }

    proposal.status = "approved";
    const saved = await proposalRepo().save(proposal);
    broadcast("global", "proposal:approve", saved);
    res.json({ proposal: saved, applied: true });
  } catch (e) { next(e); }
});

// ─── REJECT (DM only) ────────────────────────────────────────
router.post("/:id/reject", requireRole("dm"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const proposal = await proposalRepo().findOne({ where: { id: req.params.id } });
    if (!proposal) throw new AppError(404, "Proposal not found");
    if (proposal.status !== "pending") throw new AppError(400, "Only pending proposals can be rejected");

    proposal.status = "rejected";
    proposal.reason = req.body.reason || null;
    const saved = await proposalRepo().save(proposal);
    broadcast("global", "proposal:reject", saved);
    res.json(saved);
  } catch (e) { next(e); }
});

// ─── WITHDRAW (own pending only) ──────────────────────────────
router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const proposal = await proposalRepo().findOne({ where: { id: req.params.id } });
    if (!proposal) throw new AppError(404, "Proposal not found");
    if (proposal.authorId !== req.auth!.userId) throw new AppError(403, "Not your proposal");
    if (proposal.status !== "pending") throw new AppError(400, "Can only withdraw pending proposals");

    await proposalRepo().remove(proposal);
    res.status(204).send();
  } catch (e) { next(e); }
});

export default router;
