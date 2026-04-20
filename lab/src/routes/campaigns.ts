import { Router, Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { AppDataSource } from "../data-source";
import { Campaign, CampaignMember } from "../entities";
import { authenticate, requireRole, AppError } from "../middleware";

const router = Router();

// ─── LIST MY CAMPAIGNS ───────────────────────────────────────
router.get("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const members = await AppDataSource.getRepository(CampaignMember).find({
      where: { userId: req.auth!.userId },
      relations: ["campaign"],
    });
    res.json(members.map((m) => ({ ...m.campaign, memberRole: m.role })));
  } catch (e) { next(e); }
});

// ─── CREATE CAMPAIGN (DM only) ────────────────────────────────
router.post("/", authenticate, requireRole("dm"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;
    if (!name) throw new AppError(400, "Campaign name required");

    const campaignRepo = AppDataSource.getRepository(Campaign);
    const campaign = campaignRepo.create({
      name,
      description: description || null,
      createdById: req.auth!.userId,
    });
    const saved = await campaignRepo.save(campaign);

    // Auto-add DM as member
    const memberRepo = AppDataSource.getRepository(CampaignMember);
    const dmMember = memberRepo.create({
      campaignId: saved.id,
      userId: req.auth!.userId,
      role: "dm",
      inviteCode: uuidv4(),
      inviteClaimed: true,
    });
    await memberRepo.save(dmMember);

    res.status(201).json(saved);
  } catch (e) { next(e); }
});

// ─── GET CAMPAIGN (full data with refs) ───────────────────────
router.get("/:campaignId", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaign = await AppDataSource.getRepository(Campaign).findOne({
      where: { id: req.params.campaignId },
    });
    if (!campaign) throw new AppError(404, "Campaign not found");

    // Verify membership
    const member = await AppDataSource.getRepository(CampaignMember).findOne({
      where: { campaignId: campaign.id, userId: req.auth!.userId },
    });
    if (!member) throw new AppError(403, "Not a member");

    res.json({ ...campaign, memberRole: member.role });
  } catch (e) { next(e); }
});

// ─── GENERATE INVITE (DM only) ───────────────────────────────
router.post("/:campaignId/invite", authenticate, requireRole("dm"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { campaignId } = req.params;
    const { role } = req.body; // optional: "dm" | "player", defaults to "player"

    const memberRepo = AppDataSource.getRepository(CampaignMember);
    const inviteCode = uuidv4();

    const member = memberRepo.create({
      campaignId,
      userId: null,
      role: role === "dm" ? "dm" : "player",
      inviteCode,
      inviteClaimed: false,
    });
    const saved = await memberRepo.save(member);

    res.status(201).json({ inviteCode: saved.inviteCode, role: saved.role });
  } catch (e) { next(e); }
});

// ─── LIST MEMBERS ─────────────────────────────────────────────
router.get("/:campaignId/members", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const members = await AppDataSource.getRepository(CampaignMember).find({
      where: { campaignId: req.params.campaignId },
      relations: ["user"],
    });
    res.json(
      members.map((m) => ({
        id: m.id,
        role: m.role,
        inviteClaimed: m.inviteClaimed,
        inviteCode: m.inviteClaimed ? undefined : m.inviteCode,
        user: m.user
          ? { id: m.user.id, username: m.user.username, displayName: m.user.displayName }
          : null,
      })),
    );
  } catch (e) { next(e); }
});

// ─── PATCH CAMPAIGN (DM only) ────────────────────────────────
router.patch("/:campaignId", authenticate, requireRole("dm"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaignRepo = AppDataSource.getRepository(Campaign);
    const campaign = await campaignRepo.findOne({ where: { id: req.params.campaignId } });
    if (!campaign) throw new AppError(404, "Campaign not found");

    const body = { ...req.body };
    delete body.id;
    delete body.createdById;

    campaignRepo.merge(campaign, body);
    const saved = await campaignRepo.save(campaign);
    res.json(saved);
  } catch (e) { next(e); }
});

// ─── DELETE CAMPAIGN (DM only) ───────────────────────────────
router.delete("/:campaignId", authenticate, requireRole("dm"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaignRepo = AppDataSource.getRepository(Campaign);
    const campaign = await campaignRepo.findOne({ where: { id: req.params.campaignId } });
    if (!campaign) throw new AppError(404, "Campaign not found");

    // Members cascade via DB or manual cleanup
    await AppDataSource.getRepository(CampaignMember).delete({ campaignId: campaign.id });
    await campaignRepo.remove(campaign);
    res.status(204).send();
  } catch (e) { next(e); }
});

// ─── LIST PENDING INVITES (DM only) ──────────────────────────
router.get("/:campaignId/invites", authenticate, requireRole("dm"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invites = await AppDataSource.getRepository(CampaignMember).find({
      where: { campaignId: req.params.campaignId, inviteClaimed: false },
      order: { createdAt: "DESC" },
    });
    res.json(invites.map((i) => ({
      inviteCode: i.inviteCode,
      role: i.role,
      createdAt: i.createdAt,
    })));
  } catch (e) { next(e); }
});

// ─── REVOKE INVITE (DM only) ─────────────────────────────────
router.delete("/invites/:code", authenticate, requireRole("dm"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const memberRepo = AppDataSource.getRepository(CampaignMember);
    const invite = await memberRepo.findOne({
      where: { inviteCode: req.params.code, inviteClaimed: false },
    });
    if (!invite) throw new AppError(404, "Invite not found or already claimed");

    await memberRepo.remove(invite);
    res.status(204).send();
  } catch (e) { next(e); }
});

export default router;
