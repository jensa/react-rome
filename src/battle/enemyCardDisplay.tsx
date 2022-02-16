import React from "react";
import { keyString } from "../util";
import { ReactComponent as EmptyCardGraphic } from "../svg/cards/cardPosition.svg";
import { ReactComponent as EnemyCardGraphic } from "../svg/cards/empty.svg";

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

export default EnemyCardDisplay;
