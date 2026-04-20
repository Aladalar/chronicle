import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { CampaignMember } from "../entities";
import { AppError } from "./errorHandler";

declare global {
  namespace Express {
    interface Request {
      campaignId?: string;
      campaignRole?: "dm" | "player";
    }
  }
}

/**
 * Extracts :campaignId from route params, validates user is a member,
 * and attaches campaignId + campaignRole to the request.
 */
export function campaignScope(req: Request, res: Response, next: NextFunction): void {
  const campaignId = req.params.campaignId;
  if (!campaignId) {
    throw new AppError(400, "Missing campaignId");
  }
  if (!req.auth) {
    throw new AppError(401, "Not authenticated");
  }

  const memberRepo = AppDataSource.getRepository(CampaignMember);
  memberRepo
    .findOne({
      where: { campaignId, userId: req.auth.userId },
    })
    .then((member) => {
      if (!member) {
        res.status(403).json({ error: "Not a member of this campaign" });
        return;
      }
      req.campaignId = campaignId;
      req.campaignRole = member.role;
      next();
    })
    .catch(next);
}

/**
 * Require DM role within the current campaign. Must be used AFTER campaignScope.
 */
export function requireCampaignDM(req: Request, res: Response, next: NextFunction): void {
  if (req.campaignRole !== "dm") {
    res.status(403).json({ error: "DM access required" });
    return;
  }
  next();
}
