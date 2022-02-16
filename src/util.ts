import { Unit } from "./battleState";
import { Coord } from "./worldState";

const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
};

const shuffleArray = (array: any[]) => {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};

const posEq = (a: Coord, b: Coord) => {
  return a.x === b.x && b.y === a.y;
};

const posAdd = (a: Coord, b: Coord, enemy: boolean) => {
  const yMod = enemy ? 1 : -1;
  return { x: a.x + b.x, y: a.y + b.y * yMod };
};

const hslaDegs = (color: string) => {
  return parseInt(color.slice(5, color.indexOf(",")));
};

const keyString = () => {
  // Public Domain/MIT
  var d = new Date().getTime(); //Timestamp
  var d2 =
    (typeof performance !== "undefined" &&
      performance.now &&
      performance.now() * 1000) ||
    0; //Time in microseconds since page-load or 0 if unsupported
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = Math.random() * 16; //random number between 0 and 16
    if (d > 0) {
      //Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      //Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
};

const enemyName = () => {
  const consonants = [
    "b",
    "c",
    "d",
    "f",
    "g",
    "h",
    "j",
    "k",
    "l",
    "m",
    "n",
    "p",
    "q",
    "r",
    "s",
    "t",
    "v",
    "w",
    "x",
    "z",
  ];
  const vocals = ["a", "e", "i", "o", "u", "y"];
  const length = getRandomInt(6, 12);
  let name = Array.from(Array(length).keys()).reduce((acc, i) => {
    const lastWasAVocal =
      vocals.find((v) => v === acc[acc.length - 1]) !== undefined;
    const twoConsonants =
      consonants.find((v) => v === acc[acc.length - 2]) !== undefined;
    const newLetter = lastWasAVocal
      ? consonants[getRandomInt(0, consonants.length)]
      : twoConsonants
      ? vocals[getRandomInt(0, vocals.length)]
      : consonants[getRandomInt(0, consonants.length)];
    return acc + newLetter;
  }, "");
  return name;
};

const hasTag = (u: Unit, tag: string) => {
  return u.tags?.find((t) => t === tag) !== undefined;
};

export {
  enemyName,
  getRandomInt,
  keyString,
  shuffleArray,
  posEq,
  hasTag,
  posAdd,
  hslaDegs
};
