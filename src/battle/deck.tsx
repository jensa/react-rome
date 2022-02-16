import React, { useState } from "react";
import { ReactComponent as DeckGraphic } from "../svg/deck.svg";

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

export default Deck;
