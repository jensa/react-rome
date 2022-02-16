import cardImage_archerLeft from "../svg/cards/archer_left.svg";
import cardImage_archerRight from "../svg/cards/archer_right.svg";
import cardImage_berserk from "../svg/cards/berserk.svg";
import cardImage_catapult from "../svg/cards/catapult.svg";
import cardImage_footman from "../svg/cards/footman.svg";
import cardImage_healer from "../svg/cards/healer.svg";
import cardImage_knight from "../svg/cards/knight.svg";
import cardImage_mage from "../svg/cards/mage.svg";
import cardImage_thief from "../svg/cards/thief.svg";
import cardImage_defender from "../svg/cards/defender.svg";

import unitImage_archerLeft from "../svg/units/archer_left.svg";
import unitImage_archerRight from "../svg/units/archer_right.svg";
import unitImage_berserk from "../svg/units/berserk.svg";
import unitImage_catapult from "../svg/units/catapult.svg";
import unitImage_footman from "../svg/units/footman.svg";
import unitImage_healer from "../svg/units/healer.svg";
import unitImage_knight from "../svg/units/knight.svg";
import unitImage_mage from "../svg/units/mage.svg";
import unitImage_thief from "../svg/units/thief.svg";
import unitImage_defender from "../svg/units/defender.svg";
import { Card, UnitType, UnitTypes } from "../battleState";
import { getRandomInt, shuffleArray } from "../util";

type UnitsMap = {
  [key in UnitTypes]: UnitType;
};

const units: UnitsMap = {
  [UnitTypes.ArcherRight]: {
    type: UnitTypes.ArcherRight,
    image: unitImage_archerRight,
    movePattern: [{ y: 1, x: 0 }],
    attackPattern: [{ y: 2, x: 1 }],
    maxHealth: 2,
    damage: 1,
    tags: [],
  },
  [UnitTypes.ArcherLeft]: {
    type: UnitTypes.ArcherLeft,

    image: unitImage_archerLeft,
    movePattern: [{ y: 1, x: 0 }],
    attackPattern: [{ y: 2, x: -1 }],
    maxHealth: 2,
    damage: 1,
    tags: [],
  },
  [UnitTypes.Berserk]: {
    type: UnitTypes.Berserk,
    image: unitImage_berserk,
    movePattern: [
      { y: 1, x: 0 },
      { y: 1, x: 0 },
    ],
    attackPattern: [
      { y: 1, x: -1 },
      { y: 1, x: 0 },
      { y: 1, x: 1 },
    ],
    maxHealth: 2,
    damage: 1,
    tags: [],
  },
  [UnitTypes.Catapult]: {
    type: UnitTypes.Catapult,
    image: unitImage_catapult,
    movePattern: [{ y: 1, x: 0 }],
    attackPattern: [
      { y: 3, x: -1 },
      { y: 3, x: 0 },
      { y: 3, x: 1 },
    ],
    maxHealth: 1,
    damage: 2,
    tags: [],
  },
  [UnitTypes.Footman]: {
    type: UnitTypes.Footman,
    image: unitImage_footman,
    movePattern: [{ y: 1, x: 0 }],
    attackPattern: [{ y: 1, x: 0 }],
    maxHealth: 3,
    damage: 1,
    tags: [],
  },
  [UnitTypes.Healer]: {
    type: UnitTypes.Healer,
    image: unitImage_healer,
    movePattern: [{ y: 1, x: 0 }],
    attackPattern: [
      { y: 0, x: -1 },
      { y: 0, x: 1 },
      { y: 1, x: 0 },
      { y: -1, x: 0 },
    ],
    maxHealth: 1,
    damage: 0,
    tags: ["heal"],
  },
  [UnitTypes.Mage]: {
    type: UnitTypes.Mage,
    image: unitImage_mage,
    movePattern: [{ y: 1, x: 0 }],
    attackPattern: [
      { y: 2, x: 1 },
      { y: 2, x: 0 },
      { y: 2, x: -1 },
      { y: 3, x: 1 },
      { y: 3, x: 0 },
      { y: 3, x: -1 },
    ],
    maxHealth: 1,
    damage: 1,
    tags: [],
  },
  [UnitTypes.Knight]: {
    type: UnitTypes.Knight,
    image: unitImage_knight,
    movePattern: [
      { y: 1, x: 0 },
      { y: 1, x: 0 },
      { y: 1, x: 0 },
    ],
    attackPattern: [
      { y: 1, x: 0 },
      { y: 2, x: 0 },
    ],
    maxHealth: 2,
    damage: 2,
    tags: [],
  },
  [UnitTypes.Thief]: {
    type: UnitTypes.Thief,
    image: unitImage_thief,
    movePattern: [
      { y: 1, x: 0 },
      { y: 1, x: 0 },
    ],
    attackPattern: [
      { y: 1, x: 0 },
      { y: 2, x: 0 },
    ],
    maxHealth: 2,
    damage: 0,
    tags: ["passthrough", "thief"],
  },
  [UnitTypes.Defender]: {
    type: UnitTypes.Defender,
    image: unitImage_defender,
    movePattern: [{ y: 1, x: 0 }],
    attackPattern: [],
    maxHealth: 4,
    damage: 1,
    tags: [],
  },
};

const cardTypes: Card[] = [
  {
    unit: units[UnitTypes.ArcherRight],
    image: cardImage_archerRight,
    energyRequired: 1,
  },
  {
    unit: units[UnitTypes.ArcherLeft],
    image: cardImage_archerLeft,
    energyRequired: 1,
  },
  {
    unit: units[UnitTypes.Footman],
    image: cardImage_footman,
    energyRequired: 1,
  },
  {
    unit: units[UnitTypes.Defender],
    image: cardImage_defender,
    energyRequired: 1,
  },
  {
    unit: units[UnitTypes.Berserk],
    image: cardImage_berserk,
    energyRequired: 2,
  },
  {
    unit: units[UnitTypes.Catapult],
    image: cardImage_catapult,
    energyRequired: 2,
  },
  { unit: units[UnitTypes.Healer], image: cardImage_healer, energyRequired: 2 },
  { unit: units[UnitTypes.Thief], image: cardImage_thief, energyRequired: 2 },
  { unit: units[UnitTypes.Mage], image: cardImage_mage, energyRequired: 3 },
  { unit: units[UnitTypes.Knight], image: cardImage_knight, energyRequired: 3 },
];

const getCard = (type: UnitTypes) => {
  const card = cardTypes.find((c) => c.unit.type === type)!!;
  return { ...card, unit: { ...card.unit } };
};

const generateDeck: (types: number) => Card[] = (types) => {
  const shuffledTypes: Card[] = shuffleArray(
    cardTypes.map((c) => {
      return { ...c, unit: { ...c.unit } };
    })
  );

  const archeType = shuffledTypes.slice(types);
  const deckSize = 20; //dunno if this should be increased as types increase?
  return Array.from(Array(deckSize).keys()).map((i) => {
    return { ...archeType[getRandomInt(0, archeType.length)] };
  });
};

const unitName = (type: UnitTypes) => {
  return UnitTypes[type];
};
export { getCard, generateDeck, unitName };
