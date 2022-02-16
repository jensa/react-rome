import React, { useEffect, useState } from "react";
import BattleState, { AttackType, BattleCard, PatternPart, Unit, UnitTypes } from "../battleState";
import Button from "../button";
import EndTurnButton from "../components/turnBall";
import SceneState, { Scene } from "../sceneState";
import { getRandomInt, hasTag, keyString, posAdd, posEq, shuffleArray } from "../util";
import { BattleTerrainType } from "../utils/battleMapUtil";
import { unitName } from "../utils/cardUtils";
import useDidMountEffect from "../utils/useDidMountEffect";
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

enum Endstate {
  Won,
  Lost,
}

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
  playerHealth: number;
  enemyHealth: number;
  playerMaxHealth: number;
  enemyMaxHealth: number;
  endState?: Endstate;
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
  playerHealth: 10,
  enemyHealth: 10,
  playerMaxHealth: 10,
  enemyMaxHealth: 10,
};

export type Attack = {
  attacker: Unit;
  defender: Unit;
  type: AttackType;
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

  //end state logic
  useDidMountEffect(() => {
    if (state.endState === Endstate.Won) {
      defeatEnemy({ ...enemy, defeatedAt: new Date() });
      changeScene(Scene.Worldmap);
    } else {
      changeScene(Scene.Intro);
    }
  }, [state.endState]);

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
      const unoccupiedXPositions = Array.from(Array(gridSize.width).keys()).filter(
        (x) => occupiedXPositions.find((o) => o === x) === undefined
      );
      if (unoccupiedXPositions.length < 1) {
        energyLeft = 0;
      } else {
        const xPosition = unoccupiedXPositions[getRandomInt(0, unoccupiedXPositions.length)];
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

  const doMove = async (move: Move) => {
    const movedUnit = {
      ...move.unit,
      pos: move.pos,
    };
    move.unit.pos = move.pos;
    setState((prev) => {
      const newState = move.unit.enemy
        ? {
            enemyUnits: [...prev.enemyUnits.filter((p) => p.id !== movedUnit.id), movedUnit],
          }
        : {
            playerUnits: [...prev.playerUnits.filter((p) => p.id !== movedUnit.id), movedUnit],
          };
      return {
        ...prev,
        ...newState,
      };
    });
    await wait(turntimer);
  };

  const [accumulatedEnergy, setAccumulatedEnergy] = useState(0);

  const doAttack = async (attack: Attack) => {
    const typeOfAttack = attack.attacker.attackType;
    let damage = attack.attacker.damage;

    if (typeOfAttack === AttackType.Heal) {
      //reduce damage to max diff between current and max
      damage = -Math.min(
        Math.abs(damage),
        attack.defender.maxHealth - attack.defender.currentHealth
      );
    }

    const kill = damage >= attack.defender.currentHealth;
    const attackerFactionIsEnemy = attack.attacker.enemy;
    const defenderFactionIsEnemy = attack.defender.enemy;
    const attackerName =
      (attackerFactionIsEnemy ? "Enemy" : "Your") + " " + unitName(attack.attacker.type);
    const defenderName =
      (defenderFactionIsEnemy ? "Enemy" : "Your") + " " + unitName(attack.defender.type);
    const overlay = {
      type: OverlayType.Attack,
      value: { kill: kill, damage: damage },
      pos: attack.defender.pos,
    };
    if (typeOfAttack === AttackType.Steal) {
      const stealOverlay = {
        type: OverlayType.Attack,
        value: { kill: kill, damage: damage },
        pos: attack.defender.pos,
      };
      setAccumulatedEnergy((p) => p + 1);
      setState((prev) => {
        return {
          ...prev,
          overlays: [...prev.overlays, stealOverlay],
          battleLog: [
            ...prev.battleLog,
            {
              message: `${attackerName} steals ${damage} energy from ${
                defenderFactionIsEnemy ? "Enemy" : "You"
              }`,
            },
          ],
        };
      });
    } else if (!kill) {
      const newUnit = {
        ...attack.defender,
        currentHealth: attack.defender.currentHealth - damage,
      };
      setState((prev) => {
        const newState = defenderFactionIsEnemy
          ? { enemyUnits: [...prev.enemyUnits.filter((e) => e.id !== newUnit.id), newUnit] }
          : { playerUnits: [...prev.playerUnits.filter((e) => e.id !== newUnit.id), newUnit] };
        return {
          ...prev,
          ...newState,
          overlays: [...prev.overlays, overlay],
          battleLog: [
            ...prev.battleLog,
            {
              message: `${attackerName} ${AttackType[typeOfAttack]}s ${defenderName} for ${damage} hp`,
            },
          ],
        };
      });
    } else {
      setState((prev) => {
        const newState = defenderFactionIsEnemy
          ? { enemyUnits: [...prev.enemyUnits.filter((e) => e.id !== attack.defender.id)] }
          : { playerUnits: [...prev.playerUnits.filter((e) => e.id !== attack.defender.id)] };
        return {
          ...prev,
          ...newState,
          overlays: [...prev.overlays, overlay],
          battleLog: [
            ...prev.battleLog,
            {
              message: `${attackerName} ${AttackType[typeOfAttack]}ed and killed ${defenderName}`,
            },
          ],
        };
      });
    }
  };

  const attackFaction = (unit: Unit, enemyAttacking: boolean) => {
    setState((prev) => {
      const newHealthTotal = enemyAttacking
        ? {
            playerHealth: prev.playerHealth - unit.damage,
            enemyHealth: prev.enemyHealth,
          }
        : {
            enemyHealth: prev.enemyHealth - unit.damage,
            playerHealth: prev.playerHealth,
          };
      if (newHealthTotal.enemyHealth <= 0 || newHealthTotal.playerHealth <= 0) {
        //end the fight
        const endState = newHealthTotal.enemyHealth <= 0 ? Endstate.Won : Endstate.Lost;
        return { ...prev, ...newHealthTotal, endState: endState };
      } else {
        const attackedPlayerName = enemyAttacking ? "You" : "Enemy";
        const attackerName = (enemyAttacking ? "Enemy" : "Your") + " " + unitName(unit.type);
        return {
          ...prev,
          ...newHealthTotal,
          battleLog: [
            ...prev.battleLog,
            {
              message: `${attackerName} attacks ${attackedPlayerName} for ${unit.damage}`,
            },
          ],
        };
      }
    });
  };

  // this moves and attacks
  // "business logic" for damage to player lives here
  // doAttack has the rest of the logic, while
  const moveUnits = async (units: Unit[], enemy: boolean) => {
    const yMod = enemy ? 1 : -1;
    units.sort((a, b) => a.id - b.id);
    //for all units
    for (let i = 0; i < units.length; i++) {
      let unit = units[i];
      //loop move pattern
      for (let j = 0; j < unit.movePattern.length; j++) {
        const friendlyUnits = enemy ? state.enemyUnits : state.playerUnits;
        const unFriendlyUnits = enemy ? state.playerUnits : state.enemyUnits;
        const move = { x: unit.movePattern[j].x, y: unit.movePattern[j].y * yMod };
        const newPos = {
          x: unit.pos.x + move.x,
          y: unit.pos.y + move.y,
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
        const enemyUnitOnSpace = unFriendlyUnits.find((e) => posEq(attackPos, e.pos));
        const friendlyUnitOnSpace = friendlyUnits.find((e) => posEq(attackPos, e.pos));
        if (enemyUnitOnSpace && unit.attackType !== AttackType.Heal) {
          doAttack({
            attacker: unit,
            defender: enemyUnitOnSpace,
            type: unit.attackType,
          });
        } else if (friendlyUnitOnSpace && unit.attackType === AttackType.Heal) {
          doAttack({
            attacker: unit,
            defender: friendlyUnitOnSpace,
            type: unit.attackType,
          });
        } else if ((!enemy && attackPos.y < 0) || (enemy && attackPos.y > 5)) {
          attackFaction(unit, enemy);
        }
        //TODO maybe friendly fire for some? leave for now
      }
      await wait(turntimer);

      setState((prev) => {
        return {
          ...prev,
          overlays: prev.overlays.filter((o) => o.type !== OverlayType.Attack),
        };
      });
    }
  };

  const setDrawnCards = ([drawn, discard, deck]: BattleCard[][], enemy: boolean) => {
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
              message: "Not enough energy, " + card.energyRequired + " required",
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
        playerDiscard: [...prev.playerDiscard, card],
      };
    });
    selectCard(undefined);
  };

  const selectCard = (card?: BattleCard) => {
    const occupiedXPositions = [
      ...state.enemyUnits.filter((u) => u.pos.y === gridSize.height - 1).map((u) => u.pos.x),
      ...state.playerUnits.filter((u) => u.pos.y === gridSize.height - 1).map((u) => u.pos.x),
    ];
    const unoccupiedXPositions = Array.from(Array(gridSize.width).keys()).filter(
      (x) => occupiedXPositions.find((o) => o === x) === undefined
    );

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

  //here begins the game loop

  const [hasStarted, setHasStarted] = useState(false);
  const [hasMovedPlayerUnits, setHasMovedPlayerUnits] = useState("");
  const [hasDrawnCards, sethasDrawnCards] = useState("");
  const [hasPlacedEnemyUnits, setHasPlacedEnemyUnits] = useState("");
  const [hasMovedEnemyUnits, setHasMovedEnemyUnits] = useState("");

  // runs once on first render to start enemys turn
  useEffect(() => {
    if (!hasStarted) {
      setRunEnemyTurn(true);
      setHasStarted(true);
    }
  }, [setRunEnemyTurn, setHasStarted, hasStarted]);

  // this is the main game loop
  useDidMountEffect(() => {
    const doTurn = async () => {
      await moveUnits(state.playerUnits, false);
      setHasMovedPlayerUnits(keyString());
    };
    if (runEnemyTurn) {
      doTurn();
    }
    // eslint-disable-next-line
  }, [runEnemyTurn]);

  //draw new enemy cards
  useDidMountEffect(() => {
    const [newDrawn, newDiscard, newRemaining] = drawCards(
      [...state.enemyDiscard],
      [...state.enemyDrawn],
      [...state.enemyCards]
    );
    setDrawnCards([newDrawn, newDiscard, newRemaining], true);
    sethasDrawnCards(keyString());
  }, [hasMovedPlayerUnits, sethasDrawnCards]);

  // place enemy units
  useDidMountEffect(() => {
    const doAsync = async () => {
      await placeEnemyUnits(state.enemyDrawn);
      setHasPlacedEnemyUnits(keyString());
    };
    doAsync();
  }, [hasDrawnCards, setHasPlacedEnemyUnits]);

  // move enemy units
  useDidMountEffect(() => {
    const doAsync = async () => {
      await moveUnits(state.enemyUnits, true);
      setHasMovedEnemyUnits(keyString());
    };
    doAsync();
  }, [hasPlacedEnemyUnits, setHasMovedEnemyUnits]);

  // draw player cards, refill energy and pause the auto running
  useDidMountEffect(() => {
    const drawnPlayerCards = drawCards(
      [...state.playerDiscard],
      [...state.playerDrawn],
      [...state.playerCards]
    );
    setDrawnCards(drawnPlayerCards, false);
    setRunEnemyTurn(false);

    setState((prev) => {
      return { ...prev, playerEnergy: prev.playerEnergyMax + accumulatedEnergy };
    });
    setAccumulatedEnergy(0);
  }, [hasMovedEnemyUnits]);

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
        <div>
          {"Energy: " +
            state.enemyEnergy +
            "/" +
            state.enemyEnergyMax +
            " Health:" +
            state.enemyHealth +
            "/" +
            state.enemyMaxHealth}
        </div>
        <div />
        <div>
          {"Energy: " +
            state.playerEnergy +
            "/" +
            state.playerEnergyMax +
            " Health:" +
            state.playerHealth +
            "/" +
            state.playerMaxHealth}
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
        <div
          onClick={() => {
            setRunEnemyTurn(true);
          }}
          style={{ textAlign: "center", cursor: "pointer" }}
        >
          <span>End Turn</span>
          <EndTurnButton style={{ height: "50px", width: "30px" }} active={runEnemyTurn} />
        </div>

        <div />
      </div>
    </div>
  );
};

export default BattleScreen;
