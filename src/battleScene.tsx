import { useState } from "react";
import SceneState, { Scene } from "./sceneState";
import WorldState, { Map, Terrain, Tribe } from "./worldState";
import BattleState from "./battleState";
import Button from "./button";

const BattleScreen: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  const enemy = BattleState((s) => s.enemy);
  const changeScene = SceneState((s) => s.changeState);
  return (
    <div style={{ display: "flex", flexDirection: "column", padding: "30px" }}>
      <div>Here you're going to fight {enemy.name}</div>
      <Button
        title="Go back"
        style={{ width: "200px", marginTop: "30px" }}
        onClick={() => {
          changeScene(Scene.Worldmap);
        }}
      />
    </div>
  );
};

export default BattleScreen;
