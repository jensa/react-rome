const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
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

export { enemyName, getRandomInt };
