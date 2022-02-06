import { getRandomInt, shuffleArray } from "../util";
import waterTerrain from "../png/terrainTiles/water.png";
import mountainTerrain from "../png/terrainTiles/mountain.png";
import forestTerrain from "../png/terrainTiles/forest.png";
import { Coord } from "../worldState";
import { BattleMap } from "../battleState";

const battleTerrainTiles = [waterTerrain, mountainTerrain, forestTerrain];

const generateBattlemap: () => BattleMap = () => {
  /*
  how this will work:
  every grid square has an element?
  work it out:
    all objects _on_ the grid (terrain, buildings, neutral units,
      enemy units, friendly units) have grid coordinates.
    for each grid coordinate, check the map of game objects and if found,
    call the game objects getElement() and put it into the square

    grid is 7x6 so there is 42 squares
    we want between... 8 - 15 terrain tiles. pick em at random and place them in an array
    these will be rendered first

    after that, render any buildings we want. Maybe leave this feature for now

    then any neutral units(?)

    then actual units

    then overlays (these need transparency and their onClick() needs to propagate, I think)
  */

  const terrainTilesCount = getRandomInt(8, 16);
  const terrainTiles = Array.from(Array(terrainTilesCount).keys()).map(
    (r) => battleTerrainTiles[getRandomInt(0, 3)]
  );
  const squares: Coord[] = [];
  // how to choose coordinates: just do it randomly? cant have any doubles
  for (let xi = 0; xi < 7; xi += 2) {
    for (let yi = 0; yi < 6; yi += 2) {
      squares.push(
        ...[
          { x: xi, y: yi },
          { x: xi, y: yi + 1 },
        ]
      );
      if (xi < 6) {
        squares.push(
          ...[
            { x: xi + 1, y: yi },
            { x: xi + 1, y: yi + 1 },
          ]
        );
      }
    }
  }
  shuffleArray(squares);
  const terrainTilesToDraw = terrainTiles.map((t, i) => {
    return { img: t, coord: squares[i] };
  });
  console.log(terrainTilesToDraw);

  return { terrainTiles: terrainTilesToDraw };
};

export default generateBattlemap;
