import { BattleCard, Card } from "../battleState";
import { shuffleArray } from "../util";

const drawCards = (
  discard: BattleCard[],
  drawn: BattleCard[],
  deck: BattleCard[]
) => {
  let newDiscard = [...discard, ...drawn.splice(0, drawn.length)];

  let newRemaining = deck;
  let newDrawn: BattleCard[] = [];
  if (deck.length < 5) {
    const cardsMissing = 5 - deck.length;
    const drawn = newRemaining.splice(0, deck.length);
    newRemaining = shuffleArray(newDiscard);
    newDrawn = [...drawn, ...newRemaining.splice(0, cardsMissing)];
  } else {
    newDrawn = newRemaining.splice(0, 5);
  }
  return [newDrawn, newDiscard, newRemaining];
};

export default drawCards;
