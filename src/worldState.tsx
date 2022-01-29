import create from "zustand";
import { persist } from "zustand/middleware";

export type Tribe = {
  name: string;
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

type WorldState = {
  playerTribe: Tribe;
  setPlayerTribe: (tribe: Tribe) => void;
  map: Map;
  setMap: (map: Map) => void;
  mapViewPort: Coord;
  setMapViewPort: (vp: Coord) => void;
};

const worldState = create<WorldState>(
  persist(
    (set, get) => ({
      playerTribe: { name: "none" },
      setPlayerTribe: (tribe: Tribe) => set((_) => ({ playerTribe: tribe })),
      setMap: (map: Map) => set((_) => ({ map: map })),
      map: { h: 0, w: 0, terrain: [] },
      mapViewPort: { x: 500, y: 500 },
      setMapViewPort: (vp: Coord) => set((_) => ({ mapViewPort: vp })),
    }),
    { name: "world-store" }
  )
);

export default worldState;
