const fs = require('fs');
const https = require('https');
const axios = require('axios');
const path = require('path');

/*
    Use this script when a new reprint set like History Pack is released
    to generate a JSON to compare the original card ID with the new collection ID.
    This JSON can be used in the main app for the translations
*/

const urlOptions = { httpsAgent: new https.Agent({ rejectUnauthorized: false }) };
const translatedCardsAPI = 'https://cards.fabtcg.com/api/search/v1/cards/?set_code=2HP&ordering=cards&language=es';
const getEnglishCardsAPI = (cardId) => `https://cards.fabtcg.com/api/search/v1/cards/?q=${cardId}&language=en`;

const folderName = 'collections';
const fileName = '2HP.json';
const filePath = path.join(__dirname, `/${folderName}/${fileName}`);

const createOutputFileIfNotExists = () => {
    if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
    }
    const outputFilePath = `./${folderName}/${fileName}`;
    if (!fs.existsSync(outputFilePath)) {
        fs.writeFile(outputFilePath, JSON.stringify({}, null, 2), () => {});
    }
}

const downloadJSON = async (url) => {
    try {
        const response = await axios.get(url, urlOptions);
        return response.data;
    } catch (error) {
        throw error;
    }
}

const readJSON = () => {
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        throw error;
    }
};

const writeJSON = (data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

const saveObjectToFile = (collectionMap) => {
    const dataFromJsonFile = readJSON();
    Object.assign(dataFromJsonFile, collectionMap);
    writeJSON(dataFromJsonFile);
};

const orderMapByName = (obj) => {
    const entries = Object.entries(obj);
    const sortedEntries = entries.sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

    return Object.fromEntries(sortedEntries);
  };

async function main() {
    try {
        let translatedCardsResponse = {
            next: translatedCardsAPI
        };
        let batchNumber = 1;

        createOutputFileIfNotExists();

        do {
            translatedCardsResponse = await downloadJSON(translatedCardsResponse.next);

            for (const translatedcard of translatedCardsResponse.results) {
                const cardId = translatedcard.card_id;

                if (!cardId) {
                    console.error('Error: Card ID not found in the JSON response');
                }

                const originalCardsResponse = await downloadJSON(getEnglishCardsAPI(cardId));

                let isMatchCards = false;
                const translatedCollection = path.basename(translatedcard.image.large).replace('ES_', '').replace('.webp', '');

                for (const originalCard of originalCardsResponse.results) {
                    
                    if (originalCard.card_id === cardId) {
                        const originalCollection = path.basename(originalCard.image.large).replace('.webp', '');

                        const collectionMap = {
                            [originalCollection]: translatedCollection
                        };

                        saveObjectToFile(collectionMap);
                        
                        isMatchCards = true;
                    }
                }

                if (!isMatchCards) {
                    console.error(`Error: Card ${translatedCollection} not found in the English JSON response`);
                }
            }

            console.log(`Finished batch number: ${batchNumber++}`);
        } while (translatedCardsResponse.next !== null);

        const orderedMap = orderMapByName(readJSON());
        writeJSON(orderedMap);

    } catch (error) {
        console.error('Error: ', error);
    }
}

main();