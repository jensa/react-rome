import { useState } from "react";
import { UnitTypes } from "./battleState";
import SceneState, { Scene } from "./sceneState";
import { getRandomInt, hslaDegs, keyString } from "./util";
import { getCard } from "./utils/cardUtils";
import WorldState, { Map, Terrain, Tribe } from "./worldState";

const IntroScreen: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  const setPlayerTribe = WorldState((s) => s.setPlayerTribe);
  const setMap = WorldState((s) => s.setMap);
  const setOffsets = WorldState((s) => s.setMapViewPort);
  const clearState = WorldState((s) => s.clearState);
  const changeScene = SceneState((s) => s.changeState);
  const tribes = [
    {
      name: "The opulent",
      deck: [
        getCard(UnitTypes.Defender),
        getCard(UnitTypes.Defender),
        getCard(UnitTypes.Defender),
        getCard(UnitTypes.Defender),
        getCard(UnitTypes.Footman),
        getCard(UnitTypes.Footman),
        getCard(UnitTypes.Footman),
        getCard(UnitTypes.Footman),
      ],
      color: "hsla(0, 100%, 70%, 1)",
    },
    {
      name: "The clever",
      deck: [
        getCard(UnitTypes.ArcherLeft),
        getCard(UnitTypes.ArcherLeft),
        getCard(UnitTypes.ArcherLeft),
        getCard(UnitTypes.ArcherLeft),
        getCard(UnitTypes.ArcherRight),
        getCard(UnitTypes.ArcherRight),
        getCard(UnitTypes.ArcherRight),
        getCard(UnitTypes.ArcherRight),
      ],
      color: "hsla(120, 100%, 70%, 1)",
    },
    {
      name: "The crazy",
      deck: [
        getCard(UnitTypes.Berserk),
        getCard(UnitTypes.Berserk),
        getCard(UnitTypes.Berserk),
        getCard(UnitTypes.Berserk),
      ],
      color: "hsla(240, 100%, 70%, 1)",
    },
  ];
  const [selectedTribe, setSelectedTribe] = useState<Tribe | undefined>();
  return (
    <div style={{ display: "flex", flexDirection: "column", ...style }}>
      <h1 style={{ fontSize: "100px", textAlign: "center" }}>ROMELIKE</h1>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <TribeSelectionBox
          selectedTribe={selectedTribe}
          tribe={tribes[0]}
          select={setSelectedTribe}
        />
        <TribeSelectionBox
          selectedTribe={selectedTribe}
          tribe={tribes[1]}
          select={setSelectedTribe}
        />
        <TribeSelectionBox
          selectedTribe={selectedTribe}
          tribe={tribes[2]}
          select={setSelectedTribe}
        />
      </div>
      {selectedTribe && <TribeInfoBox tribe={selectedTribe} />}
      <StartGameButton
        onClick={() => {
          if (selectedTribe) {
            clearState();
            setPlayerTribe(selectedTribe);
            changeScene(Scene.Worldmap);
            setMap(generateMap());
            setOffsets({ x: 500, y: 500 });
          }
        }}
        enabled={selectedTribe !== undefined}
      />
    </div>
  );
};

const generateMap: () => Map = () => {
  const height = 5000;
  const width = 5000;

  const rows = width / 200;
  const cols = height / 200;

  const terrains = [Terrain.Forest, Terrain.Lake, Terrain.Mountain];
  const squares = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const minX = i * 200 + 5;
      const minY = j * 200 + 5;
      const maxX = (i + 1) * 200 - 5;
      const maxY = (j + 1) * 200 - 5;
      const terrain = terrains[getRandomInt(0, 3)];
      squares.push({
        x: getRandomInt(minX, maxX),
        y: getRandomInt(minY, maxY),
        h: getRandomInt(30, 90),
        w: getRandomInt(30, 130),
        t: terrain,
      });
    }
  }
  return { h: height, w: width, terrain: squares };
};

const StartGameButton: React.FC<{ enabled: boolean; onClick: () => void }> = ({
  enabled,
  onClick,
}) => {
  return (
    <div
      style={{
        marginTop: "30px",
        width: "70%",
        height: "30px",
        border: "2px solid black",
        backgroundColor: enabled ? "lightgreen" : "white",
        marginLeft: "auto",
        marginRight: "auto",
        textAlign: "center",
        paddingTop: "10px",
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      START
    </div>
  );
};

const TribeInfoBox: React.FC<{ tribe: Tribe }> = ({ tribe }) => {
  const text = `${tribe.name} is a really cool tribe. pick'em.`;
  const filterDegs = hslaDegs(tribe.color);
  return (
    <div
      style={{
        marginTop: "30px",
        width: "100%",
        height: "80px",
        border: "2px solid black",
        padding: "10px",
      }}
    >
      <span>{text}</span>
      <div style={{ display: "flex", flexDirection: "row", marginTop: "10px" }}>
        {tribe.deck
          .filter((e, i, s) => s.indexOf(e) === i)
          .map((card) => {
            return (
              <div key={keyString()} style={{ display: "flex", marginRight: "10px" }}>
                <span>{UnitTypes[card.unit.type]} </span>
                <div
                  style={{
                    height: "20px",
                    width: "15px",
                    marginLeft: "5px",
                    filter: `drop-shadow(1px 1px 1px black) hue-rotate(${filterDegs}deg)`,
                  }}
                >
                  <img
                    alt={UnitTypes[card.unit.type]}
                    src={card.unit.image}
                    style={{ height: "100%", width: "100%" }}
                  ></img>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

const TribeSelectionBox: React.FC<{
  tribe: Tribe;
  select: (tribe: Tribe) => void;
  selectedTribe?: Tribe;
}> = ({ tribe, select, selectedTribe }) => {
  const isSelected = selectedTribe?.name === tribe.name;
  return (
    <div
      onClick={(_) => {
        select(tribe);
      }}
      style={{
        width: "100px",
        height: "80px",
        border: "2px solid black",
        backgroundColor: isSelected ? tribe.color : "white",
        cursor: "pointer",
        padding: "10px",
        textAlign: "center",
      }}
    >
      <p
        style={{
          position: "relative",
          top: "30%",
          transform: "translateY(-50%)",
        }}
      >
        {tribe.name}
      </p>
    </div>
  );
};

export default IntroScreen;
