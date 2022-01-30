import { useState } from "react";
import SceneState, { Scene } from "./sceneState";
import WorldState, { Map, Terrain, Tribe } from "./worldState";
import BattleState from "./battleState";
import Button from "./button";
import { ReactComponent as DeckGraphic } from "./svg/deck.svg";
import { ReactComponent as EnemyCardGraphic } from "./svg/cards/empty.svg";
import { ReactComponent as EmptyCardGraphic } from "./svg/cards/cardPosition.svg";
import EndTurnButton from "./components/turnBall";
import { keyString } from "./util";

const neededEnemyState = {
  energyMax: 3,
  energy: 3,
};
const neededPlayerState = {
  energyMax: 3,
  energy: 3,
};

const BattleScreen: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  const enemy = BattleState((s) => s.enemy);
  const changeScene = SceneState((s) => s.changeState);
  const defeatEnemy = WorldState((s) => s.addDefeatedEnemy);
  const [enemyCards, setEnemyCards] = useState([]);
  const [playerCards, setPlayerCards] = useState([]);
  const [enemyEnergy, setEnemyEnergy] = useState(neededEnemyState.energy);
  const [playerEnergy, setPlayerEnergy] = useState(neededPlayerState.energy);

  const [inputLocked, setInputLocked] = useState(false);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "10vw 70vw 20vw",
        padding: "5vh 5vw 5vh 5vw",
        width: "100%",
      }}
    >
      <div
        style={{
          height: "90vh",
          display: "grid",
          gridTemplateRows: "10vh 20vh 15vh 15vh 20vh 10vh",
        }}
      >
        <Deck fill={enemy.color} cardsLeft={enemyCards.length} />
        <div />
        <div>{"Energy: " + enemyEnergy + "/" + neededEnemyState.energyMax}</div>
        <div />
        <div>
          {"Energy: " + playerEnergy + "/" + neededPlayerState.energyMax}
        </div>
        <Deck fill="lightgreen" cardsLeft={playerCards.length} />
      </div>
      <div
        style={{
          justifyContent: "center",
          display: "grid",
          gridTemplateRows: "10vh 5vh 60vh 5vh 10vh",
        }}
      >
        <EnemyCardDisplay
          cards={[1, undefined, 1, 1, undefined]}
          color={enemy.color}
        />
        <div />
        <Board />
        <div />
        <EnemyCardDisplay
          cards={[1, undefined, 1, 1, undefined]}
          color={"lightgreen"}
        />
      </div>
      <div
        style={{
          height: "90vh",
          paddingRight: "30px",
          paddingLeft: "30px",
          display: "grid",
          gridTemplateRows: "20vh 5vh 35vh 5vh 10vh 5vh 1vh",
        }}
      >
        <TooltipWindow />
        <div />
        <BattleLog />
        <div />
        <EndTurnButton
          onClick={() => {
            setInputLocked(!inputLocked);
          }}
          style={{ height: "50px", width: "30px" }}
          active={inputLocked}
        />
        <div />
        <Button
          title="Win fight"
          style={{ width: "100%" }}
          onClick={() => {
            defeatEnemy({ ...enemy, defeatedAt: new Date() });
            changeScene(Scene.Worldmap);
          }}
        />
      </div>
    </div>
  );
};

const Board: React.FC<{}> = ({}) => {
  const boardMatrix: number[][] = [];
  /*
  how this will work:
  every grid square has an element?
  work it out:
    all objects _on_ the grid (terrain, buildings, neutral units,
      enemy units, friendly units) have grid coordinates.
    for each grid coordinate, check the map of game objects and if found,
    call the game objects getElement() and put it into the square

  */

  return (
    <div
      style={{
        height: "60.2vh",
        width: "70.2vh",
        backgroundSize: "10vh 10vh",
        backgroundImage: `repeating-linear-gradient(#ccc 0 1px, transparent 1px 100%),
  repeating-linear-gradient(90deg, #ccc 0 1px, transparent 1px 100%)`,
      }}
    ></div>
  );
};

const EnemyCardDisplay: React.FC<{
  color: string;
  cards: (number | undefined)[];
  style?: React.CSSProperties;
}> = ({ color, cards, style }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
        ...style,
      }}
    >
      {cards.map((c) => {
        if (c) {
          return (
            <div style={{ height: "100%" }}>
              <EnemyCardGraphic
                style={{
                  width: "100%",
                  height: "100%",
                  cursor: "pointer",
                }}
                key={keyString()}
                fill={color}
              />
            </div>
          );
        } else {
          return (
            <div style={{ height: "100%" }}>
              <EmptyCardGraphic
                style={{
                  width: "100%",
                  height: "100%",
                }}
                key={keyString()}
              />
            </div>
          );
        }
      })}
    </div>
  );
};

const BattleLog: React.FC<{
  style?: React.CSSProperties;
}> = ({ style }) => {
  const logItems = [
    { key: keyString(), log: "This is a log" },
    { key: keyString(), log: "Log number 2" },
  ];
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        border: "1px dotted black",
        overflow: "scroll",
        paddingLeft: "5px",
        paddingRight: "5px",
        ...style,
      }}
    >
      {logItems.map((l) => (
        <p style={{ borderBottom: "1px solid black" }} key={l.key}>
          {l.log}
        </p>
      ))}
    </div>
  );
};

const TooltipWindow: React.FC<{
  style?: React.CSSProperties;
}> = ({ style }) => {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        border: "1px dashed black",
        padding: "5px",
        ...style,
      }}
    >
      Tooltip window
    </div>
  );
};

const Deck: React.FC<{
  cardsLeft: number;
  fill: string;
  style?: React.CSSProperties;
}> = ({ cardsLeft, fill, style }) => {
  const [showCardsLeft, setShowCardsLeft] = useState(false);
  return (
    <div
      style={{
        position: "relative",
        cursor: "pointer",
        height: "100%",
        width: "100%",
      }}
      onClick={() => setShowCardsLeft(!showCardsLeft)}
    >
      {showCardsLeft && (
        <div style={{ position: "absolute", top: "40%", left: "20%" }}>
          {cardsLeft}
        </div>
      )}
      <DeckGraphic style={{ height: "100%", width: "100%" }} fill={fill} />
    </div>
  );
};

export default BattleScreen;
