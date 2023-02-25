const rp = require('request-promise');
const fs = require('fs');

const url =
  'https://raw.githubusercontent.com/the-fab-cube/flesh-and-blood-cards/outsiders/json/english/card.json';
const outputFile = 'src/constants/cardList.json';

rp(url)
  .then((jsonString) => {
    const cards = JSON.parse(jsonString);

    const data = cards.reduce((acc, card) => {
      const printing = card.printings[card.printings.length - 1];
      const name = card.name;
      const id = printing.id;

      if (!acc[name]) {
        acc[name] = id;
      }

      return acc;
    }, {});

    fs.mkdirSync('../src/constants', { recursive: true }); // create the constants directory if it doesn't exist
    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
    console.log('written card list to file');
  })
  .catch((err) => {
    console.error(err);
  });
