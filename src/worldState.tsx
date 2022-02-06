import create from "zustand";
import { persist } from "zustand/middleware";
import { Card } from "./battleState";

export type Tribe = {
  name: string;
  deck: Card[];
};

export enum Terrain {
  Forest,
  Lake,
  Mountain,
  None,
}

export type TerrainSquare = {
  x: number;
  y: number;
  h: number;
  w: number;
  t: Terrain;
};

export type Map = {
  h: number;
  w: number;
  terrain: TerrainSquare[];
};

export type Coord = {
  x: number;
  y: number;
};

export type Enemy = {
  name: string;
  color: string;
  home: Coord;
  deck: Card[];
  defeatedAt?: Date;
};

export type DefeatedEnemy = Enemy & {
  defeatedAt: Date;
};

type WorldState = {
  playerTribe: Tribe;
  setPlayerTribe: (tribe: Tribe) => void;
  map: Map;
  setMap: (map: Map) => void;
  mapViewPort: Coord;
  setMapViewPort: (vp: Coord) => void;
  defeatedEnemies: Enemy[];
  addDefeatedEnemy: (e: Enemy) => void;
  clearState: () => void;
};

const emptyState = () => {
  return {
    playerTribe: { name: "none", deck: [] },
    map: { h: 0, w: 0, terrain: [] },
    mapViewPort: { x: 500, y: 500 },
    defeatedEnemies: [],
  };
};

const worldState = create<WorldState>(
  persist(
    (set, get) => ({
      ...emptyState(),
      setPlayerTribe: (tribe: Tribe) => set((_) => ({ playerTribe: tribe })),
      setMap: (map: Map) => set((_) => ({ map: map })),
      setMapViewPort: (vp: Coord) => set((_) => ({ mapViewPort: vp })),
      addDefeatedEnemy: (e: Enemy) =>
        set((state) => ({ defeatedEnemies: [...state.defeatedEnemies, e] })),
      clearState: () => set((_) => emptyState()),
    }),
    { name: "world-store" }
  )
);

export default worldState;
