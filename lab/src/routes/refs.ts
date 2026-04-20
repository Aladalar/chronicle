import { Router } from "express";
import { globalCrudRouter } from "../services";
import {
  RefType,
  RefAbility,
  RefKnowledge,
  RefTrait,
  RefArcaneElement,
  RefRace,
  RefRank,
  RefItemTemplate,
  RefItem,
  RefBeast,
  RefFlora,
  RefMaterial,
  RefMonster,
  RefNpcImportant,
  RefGod,
  RefNpcOther,
  RefSettlement,
  RefWonder,
  RefRuin,
  RefDungeon,
  RefSpell,
  RefTome,
  RefTransmutation,
  RefRune,
} from "../entities";

const router = Router();

/**
 * Global ref tables at /api/v1/refs/<table>
 * Adding a new ref = one entity + one line here.
 */
router.use("/types",           globalCrudRouter({ entity: RefType,          eventPrefix: "ref:types" }));
router.use("/abilities",       globalCrudRouter({ entity: RefAbility,       eventPrefix: "ref:abilities" }));
router.use("/knowledge",       globalCrudRouter({ entity: RefKnowledge,     eventPrefix: "ref:knowledge" }));
router.use("/traits",          globalCrudRouter({ entity: RefTrait,         eventPrefix: "ref:traits" }));
router.use("/arcane-elements", globalCrudRouter({ entity: RefArcaneElement, eventPrefix: "ref:arcane-elements" }));
router.use("/ranks",           globalCrudRouter({ entity: RefRank,          eventPrefix: "ref:ranks" }));
router.use("/races",           globalCrudRouter({ entity: RefRace,          eventPrefix: "ref:races" }));
router.use("/item-templates",  globalCrudRouter({ entity: RefItemTemplate,  eventPrefix: "ref:item-templates" }));
router.use("/items",           globalCrudRouter({ entity: RefItem,          eventPrefix: "ref:items" }));
router.use("/beasts",          globalCrudRouter({ entity: RefBeast,         eventPrefix: "ref:beasts" }));
router.use("/flora",           globalCrudRouter({ entity: RefFlora,         eventPrefix: "ref:flora" }));
router.use("/materials",       globalCrudRouter({ entity: RefMaterial,      eventPrefix: "ref:materials" }));
router.use("/monsters",        globalCrudRouter({ entity: RefMonster,       eventPrefix: "ref:monsters" }));
router.use("/npc-important",   globalCrudRouter({ entity: RefNpcImportant,  eventPrefix: "ref:npc-important" }));
router.use("/gods",            globalCrudRouter({ entity: RefGod,           eventPrefix: "ref:gods" }));
router.use("/npc-other",       globalCrudRouter({ entity: RefNpcOther,      eventPrefix: "ref:npc-other" }));
router.use("/settlements",     globalCrudRouter({ entity: RefSettlement,    eventPrefix: "ref:settlements" }));
router.use("/wonders",         globalCrudRouter({ entity: RefWonder,        eventPrefix: "ref:wonders" }));
router.use("/ruins",           globalCrudRouter({ entity: RefRuin,          eventPrefix: "ref:ruins" }));
router.use("/dungeons",        globalCrudRouter({ entity: RefDungeon,       eventPrefix: "ref:dungeons" }));
router.use("/spells",          globalCrudRouter({ entity: RefSpell,         eventPrefix: "ref:spells" }));
router.use("/tomes",           globalCrudRouter({ entity: RefTome,          eventPrefix: "ref:tomes" }));
router.use("/transmutations",  globalCrudRouter({ entity: RefTransmutation, eventPrefix: "ref:transmutations" }));
router.use("/runes",           globalCrudRouter({ entity: RefRune,          eventPrefix: "ref:runes" }));

export default router;
