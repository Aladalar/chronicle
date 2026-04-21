import { Router } from "express";
import { globalCrudRouter } from "../services";
import { SoundEffect, SoundMusic, SoundAmbient, SoundPreset } from "../entities";
import { discoverRouter } from "./sounds_discover";

const router = Router();

router.use(discoverRouter());

router.use("/sounds",  globalCrudRouter({ entity: SoundEffect,  eventPrefix: "sound:effects" }));
router.use("/music",   globalCrudRouter({ entity: SoundMusic,   eventPrefix: "sound:music" }));
router.use("/ambient", globalCrudRouter({ entity: SoundAmbient, eventPrefix: "sound:ambient" }));
router.use("/presets", globalCrudRouter({ entity: SoundPreset,  eventPrefix: "sound:presets" }));

export default router;