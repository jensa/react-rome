import mapSvg from "./svg/map.svg";
import mountain from "./svg/mountain.svg";
import lake from "./svg/lake.svg";
import forest from "./svg/forest.svg";
import { useState } from "react";
import Button from "./button";
import SceneState, { Scene } from "./sceneState";
import WorldState, { Map, TerrainSquare, Coord, Enemy } from "./worldState";
import BattleState from "./battleState";
import { enemyName } from "./util";

const mapWidth =
  Math.max(document.documentElement.clientWidth, window.innerWidth || 0) * 0.8;
const mapHeight =
  Math.max(document.documentElement.clientHeight, window.innerHeight || 0) *
  0.8;

const coordKey = (i: Coord) => {
  return `${i.x}:${i.y}`;
};

const createEnemy = (home: Coord) => {
  // fin the midpoint, calculate new home from there.
  return {
    home: home,
    name: enemyName(),
    color: "hsla(" + Math.floor(Math.random() * 360) + ", 100%, 70%, 1)",
    defeatedAt: undefined,
  };
};

const getEnemies = (defeatedEnemies: Enemy[], offset: Coord) => {
  console.log("getting enemies");
  console.log(offset);
  console.log(defeatedEnemies);

  const newCoords = [
    {
      x: offset.x + mapWidth * (1 / 10),
      y: offset.y - mapHeight * (1 / 10),
    },
    {
      x: offset.x + mapWidth * (1 / 10),
      y: offset.y + mapHeight * (1 / 10),
    },
    {
      x: offset.x + mapWidth * (2 / 10),
      y: offset.y,
    },
  ];
  console.log(newCoords);
  const newEnemies = newCoords.map((n) => createEnemy(n));
  return [...defeatedEnemies, ...newEnemies];
};
const WorldMapScreen: React.FC<{}> = ({}) => {
  const currentState = SceneState((s) => s.state);
  const playerTribe = WorldState((s) => s.playerTribe);
  const offsets = WorldState((s) => s.mapViewPort);
  const changeScene = SceneState((s) => s.changeState);
  const setOffsets = WorldState((s) => s.setMapViewPort);
  const map = WorldState((s) => s.map);
  const setEnemyTribe = BattleState((s) => s.setEnemy);

  const defeatedEnemies = WorldState((s) => s.defeatedEnemies);
  const lastEnemy = defeatedEnemies.sort((a, b) => {
    if (!b.defeatedAt || !a.defeatedAt) {
      return 0;
    }
    return new Date(b.defeatedAt).getTime() - new Date(a.defeatedAt).getTime();
  })[0];
  const [home] = useState({
    x: 500 + mapWidth / 3,
    y: 500 + mapHeight / 2,
  });

  console.log(`home: ${JSON.stringify(home)}`);

  const [enemies] = useState(
    getEnemies(
      defeatedEnemies,
      lastEnemy?.home ? { x: lastEnemy.home.x, y: lastEnemy.home.y } : home
    )
  );
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedEnemy, setSelectedEnemy] = useState<Enemy>();

  return (
    <div style={{ display: "flex", flexDirection: "row", paddingTop: "30px" }}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            overflow: "hidden",
            position: "relative",
            height: `${mapHeight}px`,
            width: `${mapWidth}px`,
            border: "1px solid black",
          }}
        >
          {defeatedEnemies.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: 20,
                left: mapWidth - 100,
                fontSize: "20px",
                zIndex: 1,
              }}
            >
              💥:{defeatedEnemies.length}
            </div>
          )}
          <VillageDrawing
            color="green"
            defeated={false}
            coord={{ x: home.x - offsets.x, y: home.y - offsets.y }}
            onClick={() =>
              setSelectedItem(`The village of ${playerTribe.name}. Your home.`)
            }
          />
          {enemies.map((e) => {
            const { x, y } = e.home;
            return (
              <VillageDrawing
                key={coordKey({ x: x - offsets.x, y: y - offsets.y }) + e.color}
                color={
                  selectedEnemy === e
                    ? e.color
                    : e.defeatedAt
                    ? "lightgray"
                    : "white"
                }
                coord={{ x: x - offsets.x, y: y - offsets.y }}
                defeated={e.defeatedAt !== undefined}
                onClick={() => {
                  const msg = e.defeatedAt
                    ? `The ashes of village of ${e.name}. They burned by your hand. Bing bong.`
                    : `The thriving village of ${e.name}. Your enemy.`;
                  setSelectedItem(msg);
                  setSelectedEnemy(e);
                }}
              />
            );
          })}
          <MapDrawing
            map={map}
            offsets={offsets}
            onClick={() => setSelectedItem("")}
          />
        </div>
        <MoveButtons
          offsets={offsets}
          setOffsets={setOffsets}
          changeScene={changeScene}
        />
      </div>
      <TooltipBox
        selectedItem={selectedItem}
        selectedEnemy={selectedEnemy}
        startBattle={() => {
          setEnemyTribe(selectedEnemy!!);
          changeScene(Scene.Battle);
        }}
      />
    </div>
  );
};

const TooltipBox: React.FC<{
  selectedItem: string;
  selectedEnemy?: Enemy;
  startBattle: () => void;
}> = ({ selectedItem, selectedEnemy, startBattle }) => {
  return (
    <div
      style={{
        marginLeft: "5px",
        border: "2px dashed black",
        height: `${mapHeight - 12}px`,
        width: `${mapWidth / 5}px`,
        padding: "5px",
      }}
    >
      <p style={{ height: "80%" }}>{selectedItem}</p>
      {selectedItem !== "" && !selectedEnemy?.defeatedAt && (
        <Button
          title="FIGHT"
          onClick={() => {
            startBattle();
          }}
        />
      )}
    </div>
  );
};

const VillageDrawing: React.FC<{
  coord: Coord;
  color: string;
  defeated: boolean;
  onClick?: () => void;
}> = ({ coord, color, defeated, onClick }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: coord.y,
        left: coord.x,
        fontSize: "10px",
        zIndex: 1,
        width: defeated ? "20px" : "50px",
        height: defeated ? "20px" : "50px",
        border: "1px solid black",
        backgroundColor: color,
        cursor: "pointer",
        lineHeight: defeated ? "20px" : "50px",
        textAlign: "center",
      }}
      onClick={onClick}
    >
      {defeated ? "🔥" : ""}
    </div>
  );
};

const terrainImages = [forest, lake, mountain];

const MapDrawing: React.FC<{
  map: Map;
  offsets: { x: number; y: number };
  onClick?: () => void;
}> = ({ map, offsets, onClick }) => {
  return (
    <div
      style={{
        position: "relative",
        left: `-${offsets.x}px`,
        top: `-${offsets.y}px`,
        height: `${map.h}px`,
        width: `${map.w}px`,
        backgroundColor: "rgba(243, 193, 94, 0.43)",
      }}
      onClick={onClick}
    >
      {map.terrain.map((i) => (
        <MapItem key={coordKey(i)} i={i} />
      ))}
    </div>
  );
};

const MapItem: React.FC<{ i: TerrainSquare }> = ({ i }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: `${i.y - i.h}px`,
        left: `${i.x - i.w}px`,
        height: `${i.h}px`,
        width: `${i.w}px`,
      }}
    >
      <img
        style={{ width: "100%", height: "100%", zIndex: 0 }}
        src={terrainImages[i.t]}
      />
    </div>
  );
};

const MoveButtons: React.FC<{
  offsets: Coord;
  setOffsets: (vp: Coord) => void;
  changeScene: (scene: Scene) => void;
}> = ({ offsets, setOffsets, changeScene }) => {
  return (
    <div style={{ position: "relative" }}>
      <div style={{ width: "100px" }}>
        <Button title="Go back" onClick={() => changeScene(Scene.Intro)} />
      </div>
      <Button
        style={{
          position: "absolute",
          left: "40vh",
          top: "10px",
          width: "60px",
        }}
        title="Up"
        onClick={() => setOffsets({ x: offsets.x, y: offsets.y - 100 })}
      />
      <Button
        style={{
          position: "absolute",
          left: "50vh",
          top: "20px",
          width: "60px",
        }}
        title="Right"
        onClick={() => setOffsets({ x: offsets.x + 100, y: offsets.y })}
      />

      <Button
        style={{
          position: "absolute",
          left: "40vh",
          top: "60px",
          width: "60px",
        }}
        title="Down"
        onClick={() => setOffsets({ x: offsets.x, y: offsets.y + 100 })}
      />

      <Button
        style={{
          position: "absolute",
          left: "30vh",
          top: "20px",
          width: "60px",
        }}
        title="Left"
        onClick={() => setOffsets({ x: offsets.x - 100, y: offsets.y })}
      />
    </div>
  );
};

export default WorldMapScreen;
