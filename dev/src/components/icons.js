import {
  faDungeon, faScroll, faShieldHalved, faWandMagicSparkles,
  faDragon, faPaw, faLeaf, faFlask, faGem, faCrown,
  faLocationDot, faMountainSun, faHouseChimneyCrack,
  faHandFist, faBrain, faFeather, faArrowUp, faDiamond,
  faHammer, faStar, faBook, faSun, faCircleNodes,
  faUsers, faEnvelopeOpenText, faBars,
  faGear, faUserPlus,
  faVolumeHigh, faMusic, faCloudSun, faLayerGroup,
  faPlay, faStop, faPause, faVolumeXmark,
  faPlus, faXmark, faPencil, faTrash, faArrowLeft,
  faMoon, faCircleHalfStroke,
  faChessQueen, faHandsPraying, faFaceSmile,
  faPenNib,
} from "@fortawesome/free-solid-svg-icons";

// Navigation
export const NAV_ICONS = {
  campaigns:   faBars,
  characters:  faShieldHalved,
  content:     faScroll,
  refs:        faGear,
  "ref-edits": faEnvelopeOpenText,
  players:     faUsers,
  sounds:      faVolumeHigh,
};

// Shared DB groups
export const GROUP_ICONS = {
  foundation: faDiamond,
  mechanics:  faHandFist,
  world:      faMountainSun,
  creatures:  faDragon,
  locations:  faLocationDot,
  alchemy:    faWandMagicSparkles,
};

// Individual ref tables
export const TABLE_ICONS = {
  types:            faDiamond,
  "item-templates": faHammer,
  abilities:        faHandFist,
  knowledge:        faBrain,
  traits:           faFeather,
  ranks:            faArrowUp,
  races:            faCrown,
  items:            faGem,
  beasts:           faPaw,
  flora:            faLeaf,
  materials:        faFlask,
  monsters:         faDragon,
  "npc-important":  faChessQueen,
  gods:             faHandsPraying,
  "npc-other":      faFaceSmile,
  settlements:      faLocationDot,
  wonders:          faMountainSun,
  ruins:            faHouseChimneyCrack,
  dungeons:         faDungeon,
  spells:           faStar,
  tomes:            faBook,
  transmutations:   faSun,
  runes:            faCircleNodes,
};

// Soundboard
export const SOUND_ICONS = {
  sounds:   faVolumeHigh,
  music:    faMusic,
  ambient:  faCloudSun,
  bundles:  faLayerGroup,
};

// Theme switcher
export const THEME_ICONS = {
  dark:  faMoon,
  light: faSun,
  hc:    faCircleHalfStroke,
};

// Actions
export const ACTION_ICONS = {
  add:    faPlus,
  close:  faXmark,
  edit:   faPencil,
  delete: faTrash,
  back:   faArrowLeft,
  play:   faPlay,
  stop:   faStop,
  pause:  faPause,
  mute:   faVolumeXmark,
  invite: faUserPlus,
};

// Brand
export const BRAND_ICON = faPenNib;
