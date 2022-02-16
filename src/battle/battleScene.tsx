import React, { useEffect, useState } from "react";
import BattleState, {
  BattleCard,
  PatternPart,
  Unit,
  UnitTypes,
} from "../battleState";
import Button from "../button";
import EndTurnButton from "../components/turnBall";
import SceneState, { Scene } from "../sceneState";
import { getRandomInt, hasTag, posAdd, posEq, shuffleArray } from "../util";
import { BattleTerrainType } from "../utils/battleMapUtil";
import { unitName } from "../utils/cardUtils";
import WorldState, { Coord } from "../worldState";
import BattleLog, { BattleLogEntry } from "./battleLog";
import Board from "./board";
import Deck from "./deck";
import drawCards from "./draw";
import EnemyCardDisplay from "./enemyCardDisplay";
import calculateMoveEffects, { Move } from "./moveLogic";
import PlayerCardDisplay from "./playerCardDisplay";
import TooltipWindow, { TooltipEntity } from "./tooltipWindow";

const turntimer = 500;

type BattleSceneState = {
  enemyEnergyMax: number;
  enemyEnergy: number;
  playerEnergyMax: number;
  playerEnergy: number;
  playerCards: BattleCard[];
  playerDrawn: BattleCard[];
  playerDiscard: BattleCard[];
  enemyCards: BattleCard[];
  enemyDrawn: BattleCard[];
  enemyDiscard: BattleCard[];
  battleLog: BattleLogEntry[];
  tooltip?: TooltipEntity;
  playerUnits: Unit[];
  enemyUnits: Unit[];
  overlays: Overlay[];
  idCounter: number;
  cardIdCounter: number;
  selectedCard?: BattleCard;
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
  overlays: [],
  idCounter: 0,
  cardIdCounter: 0,
};

export type Attack = {
  name: string;
  attacker: Unit;
  defender: Unit;
};

export enum OverlayType {
  AddUnit,
  AttackPattern,
  MovePattern,
  Attack,
}

export type Overlay = {
  pos: Coord;
  type: OverlayType;
  onClick?: (pos: Coord) => void;
  value?: any;
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
    enemyCards: [...shuffleArray(enemy.deck)].map((c) => {
      return { ...c, id: initialState.cardIdCounter++ };
    }),
    playerCards: [...shuffleArray(playerTribe.deck)].map((c) => {
      return { ...c, id: initialState.cardIdCounter++ };
    }),
  });

  const [runEnemyTurn, setRunEnemyTurn] = useState(false);

  const placeEnemyUnits = async (drawn: BattleCard[]) => {
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

      const occupiedXPositions = [
        ...state.enemyUnits.filter((u) => u.pos.y === 0).map((u) => u.pos.x),
        ...state.playerUnits.filter((u) => u.pos.y === 0).map((u) => u.pos.x),
        ...newOccupied,
      ];
      const unoccupiedXPositions = Array.from(
        Array(gridSize.width).keys()
      ).filter((x) => occupiedXPositions.find((o) => o === x) === undefined);
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
          enemy: true,
        };
        setState((prev) => {
          return {
            ...prev,
            enemyUnits: [...prev.enemyUnits, newUnit],
            enemyDrawn: prev.enemyDrawn.filter((d) => d.id != chosenCard.id),
            enemyDiscard: [...prev.enemyDiscard, chosenCard],
          };
        });
        newOccupied.push(xPosition);
        newEnemyUnits.push(newUnit);
        energyLeft -= chosenCard.energyRequired;
      }
      await wait(turntimer);
    }
    setState((prev) => {
      return {
        ...prev,
        idCounter: idCounter,
      };
    });
    return newEnemyUnits;
  };

  const tryMoveTo = async (
    unit: Unit,
    toPosition: Coord,
    move: PatternPart,
    friendlyUnits: Unit[],
    unfriendlyUnits: Unit[],
    destructive: boolean
  ) => {
    const enemyUnitOnSpace = unfriendlyUnits.find((e) =>
      posEq(toPosition, e.pos)
    );
    const friendlyUnitOnSpace = friendlyUnits.find((e) =>
      posEq(toPosition, e.pos)
    );

    let unitLayerOk = false;
    let terrainLayerOk = false;
    const sideEffects: (() => Promise<void>)[] = [];
    if (friendlyUnitOnSpace && destructive) {
      sideEffects.push(() =>
        doAttack({
          name: "push",
          attacker: unit,
          defender: friendlyUnitOnSpace,
        })
      );
    } else if (friendlyUnitOnSpace || enemyUnitOnSpace) {
      const affectedUnit = friendlyUnitOnSpace ?? enemyUnitOnSpace!!;

      if (hasTag(unit, "push") && !hasTag(affectedUnit, "sturdy")) {
        sideEffects.push(async () => {
          tryMoveTo(
            affectedUnit,
            { x: toPosition.x + move.x, y: toPosition.y + move.y },
            move,
            unfriendlyUnits,
            friendlyUnits,
            true
          );
          await wait(turntimer);
        });
        unitLayerOk = true;
      }
    } else {
      unitLayerOk = true;
    }
    const terrainTile = battleMap.terrainTiles.find((t) =>
      posEq(t.coord, toPosition)
    );
    if (
      !terrainTile ||
      terrainTile.terrain === BattleTerrainType.Mountain ||
      terrainTile.terrain === BattleTerrainType.Water
    ) {
      terrainLayerOk = false;
    }

    if (unitLayerOk) {
      sideEffects.forEach(async (s) => {
        await s();
      });
      const movedUnit = (unit = {
        ...unit,
        pos: toPosition,
      });
      setState((prev) => {
        return {
          ...prev,
          enemyUnits: [
            ...prev.enemyUnits.filter((p) => p.id !== unit.id),
            movedUnit,
          ],
        };
      });
      await wait(turntimer);
    }
    return terrainLayerOk;
  };

  const doMove = async (move: Move) => {
    const movedUnit = {
      ...move.unit,
      pos: move.pos,
    };
    move.unit.pos = move.pos;
    setState((prev) => {
      const newState = move.unit.enemy
        ? {
            enemyUnits: [
              ...prev.enemyUnits.filter((p) => p.id !== movedUnit.id),
              movedUnit,
            ],
          }
        : {
            playerUnits: [
              ...prev.playerUnits.filter((p) => p.id !== movedUnit.id),
              movedUnit,
            ],
          };
      return {
        ...prev,
        ...newState,
      };
    });
    await wait(turntimer);
  };

  const doAttack = async (attack: Attack) => {
    // check defense and offense? no

    const damage = attack.attacker.damage;
    const kill = damage >= attack.defender.currentHealth;
    const enemyAffected = attack.defender.enemy;
    const attackerName =
      (enemyAffected ? "Your" : "Enemy") + " " + unitName(attack.attacker.type);
    const defenderName =
      (enemyAffected ? "Enemy" : "Your") + " " + unitName(attack.defender.type);
    const overlay = {
      type: OverlayType.Attack,
      value: { kill: kill, damage: damage },
      pos: attack.defender.pos,
    };
    if (!kill) {
      const newUnit = {
        ...attack.defender,
        currentHealth: attack.defender.currentHealth - damage,
      };
      setState((prev) => {
        const newState = enemyAffected
          ? {
              enemyUnits: [
                ...prev.enemyUnits.filter((e) => e.id !== newUnit.id),
                newUnit,
              ],
            }
          : {
              playerUnits: [
                ...prev.playerUnits.filter((e) => e.id !== newUnit.id),
                newUnit,
              ],
            };
        return {
          ...prev,
          ...newState,
          overlays: [...prev.overlays, overlay],
          battleLog: [
            ...prev.battleLog,
            {
              message: `${attackerName} ${attack.name} ${defenderName} for ${damage}`,
            },
          ],
        };
      });
    } else {
      setState((prev) => {
        const newState = enemyAffected
          ? {
              enemyUnits: [
                ...prev.enemyUnits.filter((e) => e.id !== attack.defender.id),
              ],
            }
          : {
              playerUnits: [
                ...prev.playerUnits.filter((e) => e.id !== attack.defender.id),
              ],
            };
        return {
          ...prev,
          ...newState,
          overlays: [...prev.overlays, overlay],
          battleLog: [
            ...prev.battleLog,
            {
              message: `${attackerName} ${attack.name} and killed ${defenderName}`,
            },
          ],
        };
      });
    }
    await wait(turntimer);
    setState((prev) => {
      return {
        ...prev,
        overlays: prev.overlays.filter((o) => o.type !== OverlayType.Attack),
      };
    });
  };

  const moveUnits = async (units: Unit[], enemy: boolean) => {
    const yMod = enemy ? 1 : -1;
    //this should also handle attacking after move is done
    units.sort((a, b) => a.id - b.id);
    for (let i = 0; i < units.length; i++) {
      let unit = units[i];
      for (let j = 0; j < unit.movePattern.length; j++) {
        const friendlyUnits = enemy ? state.enemyUnits : state.playerUnits;
        const unFriendlyUnits = enemy ? state.playerUnits : state.enemyUnits;
        const move = unit.movePattern[j];
        const newPos = {
          x: unit.pos.x + move.x,
          y: unit.pos.y + move.y * yMod,
        };
        const moveEffects = calculateMoveEffects(
          unit,
          newPos,
          move,
          friendlyUnits,
          unFriendlyUnits,
          false
        );
        for (let g = 0; g < moveEffects.length; g++) {
          const effect = moveEffects[g];
          if (effect.move !== undefined) {
            await doMove(effect.move);
          } else if (effect.attack !== undefined) {
            await doAttack(effect.attack);
          }
        }
        if (moveEffects.length < 1) {
          break;
        }
      }
      for (let j = 0; j < unit.attackPattern.length; j++) {
        const friendlyUnits = enemy ? state.enemyUnits : state.playerUnits;
        const unFriendlyUnits = enemy ? state.playerUnits : state.enemyUnits;
        const attack = unit.attackPattern[j];
        const attackPos = {
          x: unit.pos.x + attack.x,
          y: unit.pos.y + attack.y * yMod,
        };
        const enemyUnitOnSpace = unFriendlyUnits.find((e) =>
          posEq(attackPos, e.pos)
        );
        const friendlyUnitOnSpace = friendlyUnits.find((e) =>
          posEq(attackPos, e.pos)
        );
        if (enemyUnitOnSpace) {
          await doAttack({
            name: "attacks",
            attacker: unit,
            defender: enemyUnitOnSpace,
          });
        }
        //TODO maybe friendly fire for some? leave for now
      }
    }
  };

  const setDrawnCards = (
    [drawn, discard, deck]: BattleCard[][],
    enemy: boolean
  ) => {
    const newState = enemy
      ? { enemyDrawn: drawn, enemyDiscard: discard, enemyCards: deck }
      : { playerDrawn: drawn, playerDiscard: discard, playerCards: deck };
    setState((prev) => {
      return {
        ...prev,
        ...newState,
      };
    });
  };

  const patternOverlaysForUnit = (unit: Unit) => {
    let currentPos = unit.pos;
    const moveOverlays = unit.movePattern.map((m) => {
      currentPos = posAdd(currentPos, m, unit.enemy);
      return {
        type: OverlayType.MovePattern,
        pos: { ...currentPos },
      };
    });
    const attackOverlays = unit.attackPattern.map((m) => {
      return {
        type: OverlayType.AttackPattern,
        pos: posAdd(currentPos, m, unit.enemy),
      };
    });

    return [...moveOverlays, ...attackOverlays];
  };

  const selectUnit = (unit?: Unit) => {
    const overlays: Overlay[] = [];
    //print out move pattern and attack pattern overlays
    if (unit) {
      overlays.push(...patternOverlaysForUnit(unit));
    }

    setState((prev) => {
      return {
        ...prev,
        tooltip: unit
          ? {
              description: "- " + unitName(unit.type) + " -",
              image: unit.image,
              color: unit.enemy ? enemy.color : playerTribe.color,
            }
          : undefined,
        overlays: overlays,
      };
    });
  };

  const placeUnitFromCard = (card: BattleCard, pos: Coord) => {
    setState((prev) => {
      const energyToSpend = state.playerEnergy;
      if (card.energyRequired > energyToSpend) {
        return {
          ...prev,
          battleLog: [
            ...prev.battleLog,
            {
              message:
                "Not enough energy, " + card.energyRequired + " required",
            },
          ],
        };
      }
      let idCounter = state.idCounter;
      const newUnit = {
        ...card.unit,
        id: idCounter++,
        currentHealth: card.unit.maxHealth,
        pos: pos,
        enemy: false,
      };

      const newEnergyLevel = energyToSpend - card.energyRequired;
      return {
        ...prev,
        idCounter: idCounter,
        playerUnits: [...prev.playerUnits, newUnit],
        playerEnergy: newEnergyLevel,
        playerDrawn: [...prev.playerDrawn.filter((c) => c.id !== card.id)],
      };
    });
    selectCard(undefined);
  };

  const selectCard = (card?: BattleCard) => {
    //TODO show a preview of the move/attack pattern?
    const occupiedXPositions = [
      ...state.enemyUnits
        .filter((u) => u.pos.y === gridSize.height - 1)
        .map((u) => u.pos.x),
      ...state.playerUnits
        .filter((u) => u.pos.y === gridSize.height - 1)
        .map((u) => u.pos.x),
    ];
    const unoccupiedXPositions = Array.from(
      Array(gridSize.width).keys()
    ).filter((x) => occupiedXPositions.find((o) => o === x) === undefined);

    const overlays: Overlay[] = [];
    if (card) {
      overlays.push(
        ...unoccupiedXPositions.map((pos) => {
          return {
            pos: { x: pos, y: gridSize.height - 1 },
            type: OverlayType.AddUnit,
            onClick: (position: Coord) => {
              placeUnitFromCard(card, position);
            },
          };
        })
      );
    }
    setState((prev) => {
      return {
        ...prev,
        tooltip: card
          ? {
              description:
                "" +
                UnitTypes[card.unit.type] +
                `: ${card.unit.maxHealth}hp, ${card.unit.damage}dmg, ${card.energyRequired} energy`,
              image: card.unit.image,
              color: playerTribe.color,
            }
          : undefined,
        selectedCard: card,
        overlays: overlays,
      };
    });
  };

  const [hasMovedPlayerUnits, setHasMovedPlayerUnits] = useState(false);
  const [hasDrawnCards, sethasDrawnCards] = useState(false);
  const [hasPlacedEnemyUnits, setHasPlacedEnemyUnits] = useState(false);
  const [hasMovedEnemyUnits, setHasMovedEnemyUnits] = useState(false);

  useEffect(() => {
    const [newDrawn, newDiscard, newRemaining] = drawCards(
      [...state.enemyDiscard],
      [...state.enemyDrawn],
      [...state.enemyCards]
    );
    setDrawnCards([newDrawn, newDiscard, newRemaining], true);
    sethasDrawnCards(true);
  }, [hasMovedPlayerUnits, sethasDrawnCards]);

  useEffect(() => {
    const [newDrawn, newDiscard, newRemaining] = drawCards(
      [...state.enemyDiscard],
      [...state.enemyDrawn],
      [...state.enemyCards]
    );
    setDrawnCards([newDrawn, newDiscard, newRemaining], true);
    sethasDrawnCards(true);
  }, [hasMovedPlayerUnits, sethasDrawnCards]);

  // this is the main game loop
  useEffect(() => {
    const doTurn = async () => {
      //return new state here, I guess
      //I think every function needs to return its new state
      await moveUnits(state.playerUnits, false);
      setHasMovedPlayerUnits(true);
      //here the state can have changed through multiple setState(), but we don't know how it changed

      const [newDrawn, newDiscard, newRemaining] = drawCards(
        [...state.enemyDiscard],
        [...state.enemyDrawn],
        [...state.enemyCards]
      );
      setDrawnCards([newDrawn, newDiscard, newRemaining], true);
      const newUnits = await placeEnemyUnits(newDrawn);

      //moveUnits really need ot return the moved units
      // keep a state copy and update it directly - is this the way?

      await moveUnits(newUnits, true);

      const drawnPlayerCards = drawCards(
        [...state.playerDiscard],
        [...state.playerDrawn],
        [...state.playerCards]
      );
      setDrawnCards(drawnPlayerCards, false);

      setRunEnemyTurn(false);
      setState((prev) => {
        return { ...prev, playerEnergy: prev.playerEnergyMax };
      });
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

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "10vw 70vw 20vw",
        padding: "5vh 5vw 5vh 5vw",
        width: "100%",
      }}
      onClick={() => {
        selectCard(undefined);
        selectUnit(undefined);
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
        <Deck fill={playerTribe.color} cardsLeft={state.playerCards.length} />
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
            overlays={state.overlays}
            unitColors={[playerTribe.color, enemy.color]}
            select={selectUnit}
          />
        )}
        <div />
        <PlayerCardDisplay
          cards={state.playerDrawn}
          color={playerTribe.color}
          select={selectCard}
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

export default BattleScreen;
