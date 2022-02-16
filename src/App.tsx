import IntroScreen from "./intro";
import SceneState, { Scene } from "./sceneState";
import WorldMapScreen from "./worldMap";
import BattleScreen from "./battle/battleScene";

function App() {
  const currentState = SceneState((s) => s.state);

  if (currentState === Scene.Intro) {
    return <IntroScreen />;
  } else if (currentState === Scene.Worldmap) {
    return <WorldMapScreen />;
  } else {
    return <BattleScreen />;
  }
}

export default App;
