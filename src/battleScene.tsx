import { useState } from "react";
import SceneState, { Scene } from "./sceneState";
import WorldState from "./worldState";
import BattleState, {
  BattleMap,
  Card,
  PatternPart,
  Unit,
  UnitTypes,
} from "./battleState";
import Button from "./button";
import { ReactComponent as DeckGraphic } from "./svg/deck.svg";
import { ReactComponent as EnemyCardGraphic } from "./svg/cards/empty.svg";
import { ReactComponent as EmptyCardGraphic } from "./svg/cards/cardPosition.svg";
import EndTurnButton from "./components/turnBall";
import { getRandomInt, keyString, shuffleArray } from "./util";
import { useEffect } from "react";
import { getJSDocTemplateTag } from "typescript";
import React from "react";

type BattleLogEntry = {
  unitId?: number;
  affectedUnitId?: number;
  move?: PatternPart[];
  attack?: PatternPart[];
  message?: string;
};

type BattleSceneState = {
  enemyEnergyMax: number;
  enemyEnergy: number;
  playerEnergyMax: number;
  playerEnergy: number;
  playerCards: Card[];
  playerDrawn: Card[];
  playerDiscard: Card[];
  enemyCards: Card[];
  enemyDrawn: Card[];
  enemyDiscard: Card[];
  battleLog: BattleLogEntry[];
  tooltip?: TooltipEntity;
  playerUnits: Unit[];
  enemyUnits: Unit[];
  idCounter: number;
};

const initialState: BattleSceneState = {
  enemyEnergyMax: 3,
  enemyEnergy: 3,
  playerEnergyMax: 3,
  playerEnergy: 3,
  playerCards: [],
  playerDrawn: [],
  playerDiscard: [],
  enemyCards: [],
  enemyDrawn: [],
  enemyDiscard: [],
  battleLog: [
    {
      message: "Battle started",
    },
  ],
  playerUnits: [],
  enemyUnits: [],
  idCounter: 0,
};

type TooltipEntity = {
  description: string;
  image?: string;
};

const gridSize = { width: 7, height: 6 };

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

const BattleScreen: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  const enemy = BattleState((s) => s.enemy);
  const battleMap = BattleState((s) => s.battleMap);
  const changeScene = SceneState((s) => s.changeState);
  const defeatEnemy = WorldState((s) => s.addDefeatedEnemy);
  const playerTribe = WorldState((s) => s.playerTribe);

  const [state, setState] = useState<BattleSceneState>({
    ...initialState,
    enemyCards: [...shuffleArray(enemy.deck)],
    playerCards: [...shuffleArray(playerTribe.deck)],
  });

  const [runEnemyTurn, setRunEnemyTurn] = useState(false);

  const drawEnemyCards = () => {
    let newDiscard = [
      ...state.enemyDiscard,
      ...state.enemyDrawn.splice(0, state.enemyDrawn.length),
    ];
    let newRemaining = state.enemyCards;
    let newDrawn: Card[] = [];
    if (state.enemyCards.length < 5) {
      const cardsMissing = 5 - state.enemyCards.length;
      const drawn = newRemaining.splice(0, state.enemyCards.length);
      newRemaining = shuffleArray(newDiscard);
      newDrawn = [...drawn, ...newRemaining.splice(0, cardsMissing)];
    } else {
      newDrawn = newRemaining.splice(0, 5);
    }

    setState((prev) => {
      return {
        ...prev,
        enemyDrawn: newDrawn,
        enemyDiscard: newDiscard,
        enemyCards: newRemaining,
      };
    });
    return newDrawn;
  };

  const drawPlayerCards = () => {
    let newDiscard = [
      ...state.playerDiscard,
      ...state.playerDrawn.splice(0, state.playerDrawn.length),
    ];
    let newRemaining = state.playerCards;
    let newDrawn: Card[] = [];
    if (state.playerCards.length < 5) {
      const cardsMissing = 5 - state.playerCards.length;
      const drawn = newRemaining.splice(0, state.playerCards.length);
      newRemaining = shuffleArray(newDiscard);
      newDrawn = [...drawn, ...newRemaining.splice(0, cardsMissing)];
      //draw remaining cards
      //shuffle discard into cards
      //draw rest
    } else {
      newDrawn = newRemaining.splice(0, 5);
    }

    setState((prev) => {
      return {
        ...prev,
        playerDrawn: newDrawn,
        playerDiscard: newDiscard,
        playerCards: newRemaining,
      };
    });
  };

  const placeEnemyUnits = async (drawn: Card[]) => {
    let energyLeft = state.enemyEnergyMax;
    let idCounter = state.idCounter;
    let newDrawn = [...drawn];

    let newOccupied: number[] = [];
    let newEnemyUnits = [...state.enemyUnits];
    while (energyLeft > 0) {
      const drawIndex = getRandomInt(0, newDrawn.length);
      const chosenCard = newDrawn.splice(drawIndex, 1)[0];
      if (!chosenCard) {
        energyLeft = 0;
        continue;
      }
      if (chosenCard.energyRequired > energyLeft) {
        continue;
      }

      //find an unoccupied square
      // if none can be found, set energy to 0 (give up)
      // check enemy and player units, see if any of them are on enemys start squares {x:0-6, y:0}
      const occupiedXPositions = [
        ...state.enemyUnits.filter((u) => u.pos.y === 0).map((u) => u.pos.x),
        ...state.playerUnits.filter((u) => u.pos.y === 0).map((u) => u.pos.x),
        ...newOccupied,
      ];
      const unoccupiedXPositions = Array.from(Array(7).keys()).filter(
        (x) => occupiedXPositions.find((o) => o === x) === undefined
      );
      if (unoccupiedXPositions.length < 1) {
        energyLeft = 0;
      } else {
        const xPosition =
          unoccupiedXPositions[getRandomInt(0, unoccupiedXPositions.length)];
        const newUnit: Unit = {
          ...chosenCard.unit,
          id: idCounter++,
          currentHealth: chosenCard.unit.maxHealth,
          pos: { x: xPosition, y: 0 },
        };
        setState((prev) => {
          return { ...prev, enemyUnits: [...prev.enemyUnits, newUnit] };
        });
        newOccupied.push(xPosition);
        newEnemyUnits.push(newUnit);
        energyLeft -= chosenCard.energyRequired;
      }
      await wait(1000);
    }
    setState((prev) => {
      return {
        ...prev,
        enemyDiscard: [...prev.enemyDiscard, ...drawn],
        enemyUnits: [...newEnemyUnits],
        idCounter: idCounter,
      };
    });
    return newEnemyUnits;
  };

  const moveEnemyUnits = async (units: Unit[]) => {
    units.sort((a, b) => a.id - b.id);
    for (let i = 0; i < units.length; i++) {
      let unit = units[i];
      for (let j = 0; j < unit.movePattern.length; j++) {
        console.log(unit.id);
        const move = unit.movePattern[j];
        unit = {
          ...unit,
          pos: { x: unit.pos.x + move.x, y: unit.pos.y + move.y },
        };
        setState((prev) => {
          return {
            ...prev,
            enemyUnits: [
              ...prev.enemyUnits.filter((p) => p.id !== unit.id),
              unit,
            ],
          };
        });
        await wait(1000);
      }
    }
  };

  useEffect(() => {
    const doTurn = async () => {
      const newDrawn = drawEnemyCards();
      const newUnits = await placeEnemyUnits(newDrawn);
      await moveEnemyUnits(newUnits);
      drawPlayerCards();
      setRunEnemyTurn(false);
    };
    if (runEnemyTurn) {
      doTurn();
    }
    //fix this eventually, not sur ehwo game loop should actually work...
    // eslint-disable-next-line
  }, [runEnemyTurn]);

  useEffect(() => {
    setRunEnemyTurn(true);
  }, [setRunEnemyTurn]);
  /*
  battle prep: shuffle the enemys cards
  shuffle player cards

  state needed: 
  player/enemy cards
  player/enemy drawn cards
  player/enemy discarded cards

  player/enemy units

  overlays - how to handle? create overlays when selected?
  tooltip info - currently selected entity
  battle log - list of strings? or list of actions, like "{unitname, movePattern}" yes
  click order - unit, building, terrain

  turn order state:
    enemy card draw
    enemy unit placement
    END ENEMY TURN
    enemy moves in "placed" order - check end state conditions after each "interaction" (?)

    player card draw
    player unit placement
    END PLAYER TURN
    player moves in "placed order" - check end state conditions after each

  */

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
        <Deck fill={enemy.color} cardsLeft={state.enemyCards.length} />
        <div />
        <div>{"Energy: " + state.enemyEnergy + "/" + state.enemyEnergyMax}</div>
        <div />
        <div>
          {"Energy: " + state.playerEnergy + "/" + state.playerEnergyMax}
        </div>
        <Deck fill="lightgreen" cardsLeft={state.playerCards.length} />
      </div>
      <div
        style={{
          justifyContent: "center",
          display: "grid",
          gridTemplateRows: "10vh 5vh 60vh 5vh 10vh",
        }}
      >
        <EnemyCardDisplay
          cards={state.enemyDrawn.map((e) => (e ? 1 : undefined))}
          color={enemy.color}
        />
        <div />
        {true && (
          <Board
            battleMap={battleMap}
            enemyUnits={state.enemyUnits}
            playerUnits={state.playerUnits}
            select={(unit) =>
              setState((prev) => {
                return {
                  ...prev,
                  tooltip: {
                    description: "- " + UnitTypes[unit.type] + " -",
                    image: unit.image,
                  },
                };
              })
            }
          />
        )}
        <div />
        <PlayerCardDisplay
          cards={state.playerDrawn}
          color={"lightgreen"}
          select={(card) =>
            setState((prev) => {
              return {
                ...prev,
                tooltip: {
                  description: "- " + UnitTypes[card.unit.type] + " -",
                  image: card.unit.image,
                },
              };
            })
          }
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
        <TooltipWindow activeTooltip={state.tooltip} />
        <div />
        <BattleLog log={state.battleLog} />
        <div />
        <EndTurnButton
          onClick={() => {
            setRunEnemyTurn(true);
          }}
          style={{ height: "50px", width: "30px" }}
          active={runEnemyTurn}
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

const Board: React.FC<{
  battleMap: BattleMap;
  enemyUnits: Unit[];
  playerUnits: Unit[];
  select: (u: Unit) => void;
}> = ({ battleMap, enemyUnits, playerUnits, select }) => {
  return (
    <div
      style={{
        height: "60.2vh",
        width: "70.2vw",
        backgroundColor: "rgba(192, 133, 18, 0.88)",
        backgroundSize: "10vw 10vh",
        backgroundImage: `repeating-linear-gradient(#ccc 0 1px, transparent 1px 100%),
  repeating-linear-gradient(90deg, #ccc 0 1px, transparent 1px 100%)`,
        position: "relative",
      }}
    >
      {battleMap.terrainTiles.map((t) => {
        const top = 10 * t.coord.y;
        const left = 10 * t.coord.x;
        return (
          <div
            key={"terrain_at_" + top + left}
            style={{
              position: "absolute",
              top: `${top}vh`,
              left: `${left}vw`,
              width: "10vw",
              height: "10vh",
            }}
          >
            <img
              alt={"" + t.coord.x + t.coord.y}
              src={t.img}
              style={{ width: "100%", height: "100%" }}
            ></img>
          </div>
        );
      })}
      {enemyUnits.map((unit) => {
        return (
          <EnemyUnit
            key={"location_of_" + unit.id}
            unit={unit}
            select={() => select(unit)}
          />
        );
      })}
      {playerUnits.map((unit) => {
        return (
          <PlayerUnit
            key={"location_of_" + unit.id}
            unit={unit}
            select={() => select(unit)}
          />
        );
      })}
    </div>
  );
};

const EnemyUnit: React.FC<{ unit: Unit; select: () => void }> = ({
  unit,
  select,
}) => {
  const top = 10 * unit.pos.y;
  const left = 10 * unit.pos.x;
  return (
    <div
      style={{
        position: "absolute",
        top: `${top}vh`,
        left: `${left}vw`,
        width: "10vw",
        height: "10vh",
        cursor: "pointer",
      }}
      onClick={select}
    >
      <img
        alt={"" + unit.pos.x + unit.pos.y}
        src={unit.image}
        style={{ width: "100%", height: "100%" }}
      ></img>
    </div>
  );
};

const PlayerUnit: React.FC<{ unit: Unit; select: () => void }> = ({
  unit,
  select,
}) => {
  const top = 10 * unit.pos.y;
  const left = 10 * unit.pos.x;
  return (
    <div
      key={"location_of_" + unit.id}
      style={{
        position: "absolute",
        top: `${top}vh`,
        left: `${left}vw`,
        width: "10vw",
        height: "10vh",
        cursor: "pointer",
      }}
      onClick={select}
    >
      <img
        alt={"" + unit.pos.x + unit.pos.y}
        src={unit.image}
        style={{ width: "100%", height: "100%" }}
      ></img>
    </div>
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
            <div style={{ height: "100%" }} key={keyString()}>
              <EnemyCardGraphic
                style={{
                  width: "100%",
                  height: "100%",
                  cursor: "pointer",
                }}
                fill={color}
              />
            </div>
          );
        } else {
          return (
            <div style={{ height: "100%" }} key={keyString()}>
              <EmptyCardGraphic
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>
          );
        }
      })}
    </div>
  );
};

const PlayerCardDisplay: React.FC<{
  color: string;
  cards: Card[];
  style?: React.CSSProperties;
  select: (c: Card) => void;
}> = ({ color, cards, style, select }) => {
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
            <div
              style={{ height: "100%" }}
              key={keyString()}
              onClick={() => select(c)}
            >
              <img
                alt={UnitTypes[c.unit.type]}
                src={c.image}
                style={{
                  width: "100%",
                  height: "100%",
                  cursor: "pointer",
                  border: "2px solid " + color,
                }}
              />
            </div>
          );
        } else {
          return (
            <div style={{ height: "100%" }} key={keyString()}>
              <EmptyCardGraphic
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>
          );
        }
      })}
    </div>
  );
};

const BattleLog: React.FC<{
  log: BattleLogEntry[];
  style?: React.CSSProperties;
}> = ({ log, style }) => {
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
      {log.map((l) => (
        <p style={{ borderBottom: "1px solid black" }} key={keyString()}>
          {l.message}
        </p>
      ))}
    </div>
  );
};

const TooltipWindow: React.FC<{
  style?: React.CSSProperties;
  activeTooltip?: TooltipEntity;
}> = ({ style, activeTooltip }) => {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        border: "1px dashed black",
        padding: "5px",
        ...style,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "20px",
      }}
    >
      {activeTooltip?.description && <span>{activeTooltip.description}</span>}
      {activeTooltip?.image && (
        <img
          style={{ height: "50px", width: "50px", marginTop: "30px" }}
          alt={activeTooltip.description}
          src={activeTooltip.image}
        />
      )}
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
