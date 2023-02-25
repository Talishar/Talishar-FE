const rp = require('request-promise');
const fs = require('fs');

const url =
  'https://raw.githubusercontent.com/the-fab-cube/flesh-and-blood-cards/outsiders/json/english/card.json';
const outputFile = 'src/constants/cardList.ts';

rp(url)
  .then((jsonString) => {
    const cards = JSON.parse(jsonString);

    const data = cards.reduce((acc, card) => {
      const printing = card.printings[card.printings.length - 1];
      const name = card.name;
      const id = printing.id;

      if (!acc.has(name)) {
        acc.set(name, id);
      }

      return acc;
    }, new Map());

    const exportData = `export const CardList = new Map<string, string>(\n${indent(
      JSON.stringify([...data]),
      2
    )}\n);`;

    fs.mkdirSync('../src/constants', { recursive: true }); // create the constants directory if it doesn't exist
    fs.writeFileSync(outputFile, exportData);
  })
  .catch((err) => {
    console.error(err);
  });

function indent(str, spaces) {
  const padding = ' '.repeat(spaces);
  return str.replace(/^/gm, padding);
}
