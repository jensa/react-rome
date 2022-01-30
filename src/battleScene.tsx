import { useState } from "react";
import SceneState, { Scene } from "./sceneState";
import WorldState, { Map, Terrain, Tribe } from "./worldState";
import BattleState from "./battleState";
import Button from "./button";
import { ReactComponent as DeckGraphic } from "./svg/deck.svg";
import { ReactComponent as EnemyCardGraphic } from "./svg/cards/empty.svg";
import { ReactComponent as EmptyCardGraphic } from "./svg/cards/cardPosition.svg";
import TurnBall from "./components/turnBall";
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
        gridTemplateColumns: "1fr 6fr 2fr",
        padding: "30px",
        width: "100%",
      }}
    >
      <div
        style={{
          height: "90vh",
          display: "grid",
          gridTemplateRows: "1fr 1fr 1fr 1fr 1fr 1fr",
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
      <div style={{ display: "grid", gridTemplateRows: "1fr 4fr 1fr" }}>
        <EnemyCardDisplay
          cards={[1, undefined, 1, 1, undefined]}
          color={enemy.color}
        />
        <Board />
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
        <TurnBall
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
  return <div style={{ height: "100%" }}>Board</div>;
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
            <div style={{ height: "80px" }}>
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
            <div style={{ height: "80px" }}>
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
        height: "80px",
        width: "80px",
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
