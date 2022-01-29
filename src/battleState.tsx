import create from "zustand";
import { persist } from "zustand/middleware";

export type Enemy = {
  name: string;
};

type BattleState = {
  enemy: Enemy;
  setEnemy: (e: Enemy) => void;
};

const state = create<BattleState>(
  persist(
    (set, get) => ({
      enemy: { name: "none" },
      setEnemy: (e: Enemy) => set((_) => ({ enemy: e })),
    }),
    { name: "scene-store" }
  )
);

export default state;
