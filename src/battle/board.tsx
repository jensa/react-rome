import React, { ReactElement } from "react";
import { BattleMap, Unit } from "../battleState";
import AddUnitOverlayGraphic from "../components/overlays/addUnitOverlayGraphic";
import AttackOverlayGraphic from "../components/overlays/AttackOverlayGraphic";
import MoveOverlayGraphic from "../components/overlays/MoveOverlayGraphic";
import { terrainImage } from "../utils/battleMapUtil";
import { Coord } from "../worldState";
import { Overlay, OverlayType } from "./battleScene";

const Board: React.FC<{
  battleMap: BattleMap;
  enemyUnits: Unit[];
  playerUnits: Unit[];
  overlays: Overlay[];
  unitColors: string[];
  select: (u: Unit) => void;
}> = ({
  battleMap,
  enemyUnits,
  playerUnits,
  overlays,
  unitColors: [playerColor, enemyColor],
  select,
}) => {
  return (
    <div
      style={{
        height: "60.2vh",
        width: "70.2vw",
        backgroundColor: "rgba(223, 200, 156, 0.88)",
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
              src={terrainImage(t.terrain)}
              style={{ width: "100%", height: "100%" }}
            ></img>
          </div>
        );
      })}
      {enemyUnits.map((unit) => {
        return (
          <UnitDisplay
            key={"enemy_location_of_" + unit.id}
            unit={unit}
            color={enemyColor}
            select={() => select(unit)}
          />
        );
      })}
      {playerUnits.map((unit) => {
        return (
          <UnitDisplay
            key={"player_location_of_" + unit.id}
            unit={unit}
            color={playerColor}
            select={() => select(unit)}
          />
        );
      })}
      {overlays.map((overlay) => {
        const click = overlay.onClick ?? (() => {});
        return (
          <SquareOverlay
            key={
              "overlay_at_" +
              overlay.pos.y +
              overlay.pos.x +
              "_of_type_" +
              overlay.type
            }
            onClick={click}
            pos={overlay.pos}
            type={overlay.type}
          />
        );
      })}
    </div>
  );
};

const UnitDisplay: React.FC<{ unit: Unit; color: string; select: () => void }> =
  ({ unit, color, select }) => {
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
          border: "1px dashed " + color,
        }}
        onClick={(e) => {
          e.stopPropagation();
          select();
        }}
      >
        <img
          alt={"" + unit.pos.x + unit.pos.y}
          src={unit.image}
          style={{ width: "100%", height: "100%" }}
        ></img>
        <span
          style={{
            position: "absolute",
            top: "7vh",
            left: "8vw",
            color: "rgba(184, 64, 64, 1)",
          }}
        >
          {unit.currentHealth}
        </span>
      </div>
    );
  };

const SquareOverlay: React.FC<{
  pos: Coord;
  type: OverlayType;
  onClick: (pos: Coord) => void;
}> = ({ pos, type, onClick }) => {
  const top = 10 * pos.y;
  const left = 10 * pos.x;

  let graphicChild = <div>{"no gfx"}</div>;
  if (type === OverlayType.AddUnit) {
    graphicChild = <AddUnitOverlayGraphic />;
  }
  if (type === OverlayType.MovePattern) {
    graphicChild = <MoveOverlayGraphic />;
  }
  if (type === OverlayType.AttackPattern) {
    graphicChild = <AttackOverlayGraphic />;
  }
  if (type === OverlayType.Attack) {
    graphicChild = <AttackOverlayGraphic />;
  }

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
      onClick={(e) => {
        e.stopPropagation();
        onClick(pos);
      }}
    >
      {graphicChild}
    </div>
  );
};

export default Board;
