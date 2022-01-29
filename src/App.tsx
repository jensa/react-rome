import React from "react";
import logo from "./logo.svg";
import IntroScreen from "./intro";
import SceneState, { Scene } from "./sceneState";
import WorldState, { Tribe } from "./worldState";
import WorldMapScreen from "./worldMap";
import BattleScreen from "./battleScene";

function App() {
  const currentState = SceneState((s) => s.state);
  const playerTribe = WorldState((s) => s.playerTribe);

  if (currentState === Scene.Intro) {
    return <IntroScreen />;
  } else if (currentState === Scene.Worldmap) {
    return <WorldMapScreen />;
  } else {
    return <BattleScreen />;
  }
}

export default App;
