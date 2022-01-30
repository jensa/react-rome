const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
};

function keyString() {
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
}

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

export { enemyName, getRandomInt, keyString };
