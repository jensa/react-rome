import React from "react";
import { BattleCard, Card, UnitTypes } from "../battleState";
import { keyString } from "../util";
import { ReactComponent as EmptyCardGraphic } from "../svg/cards/cardPosition.svg";

const PlayerCardDisplay: React.FC<{
  color: string;
  cards: BattleCard[];
  style?: React.CSSProperties;
  select: (c: BattleCard) => void;
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
              onClick={(e) => {
                e.stopPropagation();
                select(c);
              }}
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

export default PlayerCardDisplay;
