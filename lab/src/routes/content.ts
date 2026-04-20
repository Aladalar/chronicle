import { Router } from "express";
import { campaignCrudRouter } from "../services";
import {
  JournalEntry,
  LoreEntry,
  Ingredient,
  Transmutation,
  Rune,
} from "../entities";

const router = Router({ mergeParams: true });

/**
 * Content tables mounted under /campaigns/:campaignId/<table>
 * Journal: anyone can write. Others: DM only.
 * Adding a new content type = one line here + one entity.
 */
router.use(
  "/journal",
  campaignCrudRouter({
    entity: JournalEntry,
    eventPrefix: "journal",
    writeAccess: "any",
    transformBody: (body, req) => ({ ...body, authorId: req.auth!.userId }),
  }),
);

router.use(
  "/lore",
  campaignCrudRouter({ entity: LoreEntry, eventPrefix: "lore", writeAccess: "dm" }),
);

router.use(
  "/ingredients",
  campaignCrudRouter({
    entity: Ingredient,
    eventPrefix: "ingredient",
    writeAccess: "dm",
    relations: ["parts"],
  }),
);

router.use(
  "/transmutations",
  campaignCrudRouter({ entity: Transmutation, eventPrefix: "transmutation", writeAccess: "dm" }),
);

router.use(
  "/runes",
  campaignCrudRouter({ entity: Rune, eventPrefix: "rune", writeAccess: "dm" }),
);

export default router;
