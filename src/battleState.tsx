import create from "zustand";
import { persist } from "zustand/middleware";
import { Enemy } from "./worldState";

type BattleState = {
  enemy: Enemy;
  setEnemy: (e: Enemy) => void;
};

const state = create<BattleState>(
  persist(
    (set, get) => ({
      enemy: {
        name: "none",
        color: "transparent",
        home: { x: 0, y: 0 },
        defeatedAt: undefined,
      },
      setEnemy: (e: Enemy) => set((_) => ({ enemy: e })),
    }),
    { name: "scene-store" }
  )
);

export default state;
