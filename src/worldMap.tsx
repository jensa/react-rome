import mapSvg from "./svg/map.svg";
import mountain from "./svg/mountain.svg";
import lake from "./svg/lake.svg";
import forest from "./svg/forest.svg";
import { useState } from "react";
import Button from "./button";
import SceneState, { Scene } from "./sceneState";
import WorldState, { Map, Terrain, TerrainSquare, Coord } from "./worldState";
import BattleState from "./battleState";

const mapWidth =
  Math.max(document.documentElement.clientWidth, window.innerWidth || 0) * 0.8;
const mapHeight =
  Math.max(document.documentElement.clientHeight, window.innerHeight || 0) *
  0.8;

const coordKey = (i: Coord) => {
  return `${i.x}:${i.y}`;
};

const WorldMapScreen: React.FC<{}> = ({}) => {
  const currentState = SceneState((s) => s.state);
  const playerTribe = WorldState((s) => s.playerTribe);
  const offsets = WorldState((s) => s.mapViewPort);
  const changeScene = SceneState((s) => s.changeState);
  const setOffsets = WorldState((s) => s.setMapViewPort);
  const map = WorldState((s) => s.map);
  const setEnemyTribe = BattleState((s) => s.setEnemy);

  const [home] = useState({
    x: 500 + mapWidth / 3,
    y: 500 + mapHeight / 2,
  });

  const [enemyVillages] = useState([
    {
      x: 500 + mapWidth * (3 / 5),
      y: 500 + mapHeight / 5,
      name: "Gromps",
    },
    {
      x: 500 + mapWidth * (3 / 5),
      y: 500 + mapHeight / 2,
      name: "Klonks",
    },
    {
      x: 500 + mapWidth * (4 / 5),
      y: 500 + mapHeight / 5,
      name: "Belonks",
    },
  ]);
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedEnemy, setSelectedEnemy] = useState({ name: "" });

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
          <VillageDrawing
            color="green"
            coord={{ x: home.x - offsets.x, y: home.y - offsets.y }}
            onClick={() =>
              setSelectedItem(`The village of ${playerTribe.name}. Your home.`)
            }
          />
          {enemyVillages.map((e) => (
            <VillageDrawing
              key={coordKey({ x: e.x - offsets.x, y: e.y - offsets.y })}
              color="red"
              coord={{ x: e.x - offsets.x, y: e.y - offsets.y }}
              onClick={() => {
                setSelectedItem(`The village of ${e.name}. Your enemy.`);
                setSelectedEnemy(e);
              }}
            />
          ))}
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
        startBattle={() => {
          setEnemyTribe({ name: selectedEnemy.name });
          changeScene(Scene.Battle);
        }}
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

const TooltipBox: React.FC<{
  selectedItem: string;
  startBattle: () => void;
}> = ({ selectedItem, startBattle }) => {
  const changeScene = SceneState((s) => s.changeState);
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
      {selectedItem !== "" && (
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
  onClick?: () => void;
}> = ({ coord, color, onClick }) => {
  return (
    <div
      style={{
        position: "relative",
        top: coord.y,
        left: coord.x,
        fontSize: "100px",
        zIndex: 1,
        width: "50px",
        height: "50px",
        border: "1px solid black",
        backgroundColor: color,
        cursor: "pointer",
      }}
      onClick={onClick}
    ></div>
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

export default WorldMapScreen;
