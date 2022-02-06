import create from "zustand";
import { persist } from "zustand/middleware";
import { Coord, Enemy } from "./worldState";

type Terraintile = {
  img: string;
  coord: Coord;
};

export enum UnitTypes {
  ArcherRight,
  ArcherLeft,
  Berserk,
  Catapult,
  Footman,
  Healer,
  Knight,
  Mage,
  Thief,
  Defender,
}

export type BattleMap = {
  terrainTiles: Terraintile[];
};

export type PatternPart = {
  x: number;
  y: number;
};

export type UnitType = {
  type: UnitTypes;
  image: string;
  movePattern: PatternPart[];
  attackPattern: PatternPart[];
  maxHealth: number;
  damage: number;
  tags?: string[];
};

export type Unit = UnitType & {
  id: number;
  currentHealth: number;
  pos: Coord;
};

export type Card = {
  unit: UnitType;
  image: string;
  energyRequired: number;
};

type BattleState = {
  enemy: Enemy;
  setEnemy: (e: Enemy) => void;
  battleMap: BattleMap;
  setBattleMap: (b: BattleMap) => void;
};

const state = create<BattleState>(
  persist(
    (set, get) => ({
      enemy: {
        name: "none",
        color: "transparent",
        home: { x: 0, y: 0 },
        defeatedAt: undefined,
        deck: [],
      },
      setEnemy: (e: Enemy) => set((_) => ({ enemy: e })),
      battleMap: {
        terrainTiles: [],
      },
      setBattleMap: (b: BattleMap) => set((_) => ({ battleMap: b })),
    }),
    { name: "battle-store" }
  )
);

export default state;
