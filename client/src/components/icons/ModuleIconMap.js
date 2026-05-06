// /client/src/components/icons/ModuleIconMap.js
/**
 * @fileoverview Centralised icon registry for module display.
 *
 * Maps string keys (stored in module data as `module.icon`) to Lucide React
 * components. Used by `ModuleEditorModal.jsx` for the icon picker and by any
 * component that needs to resolve a module's icon from its string key.
 *
 * Also exports `ICON_OPTIONS` — an array of `{ value, label, icon }` for
 * rendering icon picker dropdowns.
 *
 * To add a new icon: import it from lucide-react and add an entry to `ICON_MAP`.
 *
 * @module components/icons/ModuleIconMap
 * @requires lucide-react
 */

import {
  BookOpen,
  FileText,
  Database,
  Puzzle,
  Code,
  Rocket,
  Zap,
  Lightbulb,
  Palette,
  Cog,
  Star,
  Trophy,
  Flame,
  Leaf,
  Heart,
  Shield,
  Globe,
  Cloud,
  Cpu,
  GraduationCap,
  Key,
  Layers,
  Magnet,
  Map,
  Medal,
  Microscope,
  Mountain,
  Network,
  Satellite,
  Scale,
  Telescope,
  TrendingUp,
  User,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";

/**
 * String key → Lucide React component mapping.
 *
 * @type {{ [key: string]: React.Component }}
 */
export const ICON_MAP = {
  book: BookOpen,
  file: FileText,
  database: Database,
  puzzle: Puzzle,
  code: Code,
  rocket: Rocket,
  zap: Zap,
  bulb: Lightbulb,
  palette: Palette,
  settings: Cog,
  star: Star,
  trophy: Trophy,
  flame: Flame,
  leaf: Leaf,
  heart: Heart,
  shield: Shield,
  globe: Globe,
  cloud: Cloud,
  cpu: Cpu,
  graduation: GraduationCap,
  key: Key,
  layers: Layers,
  magnet: Magnet,
  map: Map,
  medal: Medal,
  microscope: Microscope,
  mountain: Mountain,
  network: Network,
  satellite: Satellite,
  scale: Scale,
  telescope: Telescope,
  trending: TrendingUp,
  user: User,
  users: Users,
  wallet: Wallet,
  wrench: Wrench,
};

/**
 * Array form of ICON_MAP for use in dropdowns and pickers.
 *
 * @type {{ value: string, label: string, icon: React.Component }[]}
 */
export const ICON_OPTIONS = Object.entries(ICON_MAP).map(([key, Icon]) => ({
  value: key,
  label: key.charAt(0).toUpperCase() + key.slice(1),
  icon: Icon,
}));
