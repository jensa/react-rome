import create from "zustand";
import { persist } from "zustand/middleware";

export enum Scene {
  Intro,
  Worldmap,
  Battle,
}

type SceneState = {
  state: Scene;
  changeState: (state: Scene) => void;
};

const sceneState = create<SceneState>(
  persist(
    (set, get) => ({
      state: Scene.Intro,
      changeState: (state: Scene) => set((_) => ({ state: state })),
    }),
    { name: "scene-store" }
  )
);

export default sceneState;
