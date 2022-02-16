import { PatternPart, Unit } from "../battleState";
import { hasTag, posEq } from "../util";
import { Coord } from "../worldState";
import { Attack } from "./battleScene";

export type Move = {
  unit: Unit;
  pos: Coord;
};
export type MoveResult = {
  move?: Move;
  attack?: Attack;
};
/*
this function could just return a list of moves to be made in order
then the calling function would be responsible for changing the state
what things can happen from a move?
attacks - push - this feels like a core mechanic
is push an attack? if so, the list of moves must be moves and attacks

this function is recursive if it results in more moves (i.e a push) but will return the full list of moves and attacks
*/

const calculateMoveEffects = (
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
  const effects: MoveResult[] = [];
  if (friendlyUnitOnSpace && destructive) {
    effects.push({
      attack: {
        name: "pushed into",
        attacker: unit,
        defender: friendlyUnitOnSpace,
      },
    });
  } else if (friendlyUnitOnSpace || enemyUnitOnSpace) {
    const affectedUnit = friendlyUnitOnSpace ?? enemyUnitOnSpace!!;
    if (hasTag(unit, "push") && !hasTag(affectedUnit, "sturdy")) {
      //check buildings and terrain
      const sameTeam = friendlyUnitOnSpace !== undefined;
      const affectedFriendlies = sameTeam ? friendlyUnits : unfriendlyUnits;
      const affectedEnemies = sameTeam ? unfriendlyUnits : friendlyUnits;
      effects.push(
        ...calculateMoveEffects(
          affectedUnit,
          { x: toPosition.x + move.x, y: toPosition.y + move.y },
          move,
          affectedFriendlies,
          affectedEnemies,
          true
        )
      );
    }
  } else {
    unitLayerOk = true;
  }

  const gridLayerOk = toPosition.y >= 0 && toPosition.y < 6;

  if (unitLayerOk && gridLayerOk) {
    effects.push({ move: { unit: unit, pos: toPosition } });
  }
  return effects;
};

export default calculateMoveEffects;
