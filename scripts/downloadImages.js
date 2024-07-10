const fs = require('fs');
const https = require('https');
const axios = require('axios');
const path = require('path');
const sharp = require('sharp');

/*
    Use this script when you need to download a card, a set or the whole language collection
    to download the imagen, resize it and create a square copy.
*/

const languagesList = ['en', 'es', 'fr', 'de', 'it', 'ja'];
const localeDictionary = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    ja: 'Japanese'
};

const urlOptions = { httpsAgent: new https.Agent({ rejectUnauthorized: false }) };

// API to retrieve all the existing cards by language
const composeInitialApiUrl = (locale) => `https://cards.fabtcg.com/api/search/v1/cards/?language=${locale}&limit=50&offset=0&ordering=cards`;

// API to retrieve a specific collection and language
// const composeInitialApiUrl = (locale) => `https://cards.fabtcg.com/api/search/v1/cards/set_code=EVO&language=${locale}`;

// API to retrieve a specific card by card code and language
// const composeInitialApiUrl = (locale) => `https://cards.fabtcg.com/api/search/v1/cards/?q=2HP532&language=${locale}`;

// API to retrieve a specific card by name, collection and language
// const composeInitialApiUrl = (locale) => `https://cards.fabtcg.com/api/search/v1/cards/?name=Teklo+Foundry+Heart&set_code=EVO&language=${locale}`;

const imagesFolder = 'images';

const createOutputFolderIfNotExists = (language, folderName) => {
    if (!fs.existsSync(imagesFolder)) {
        fs.mkdirSync(imagesFolder);
    }

    const languageFolder = `./${imagesFolder}/${folderName}`;

    if (!fs.existsSync(languageFolder)) {
        fs.mkdirSync(languageFolder);
    }
    
    const outputFilePath = `./${imagesFolder}/${folderName}/${localeDictionary[language]}/`;
    if (!fs.existsSync(outputFilePath)) {
        fs.mkdirSync(outputFilePath);
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

const downloadImage = async (url) => {
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'arraybuffer',
            httpsAgent: urlOptions.httpsAgent
        });
    
        return response.data;
    } catch (error) {
        throw console.log('Error downloading the image: ', error);
    }
};

const getFilePathsByImageName = (imageUrl, language) => {
    const imageName = path.basename(imageUrl).replace(`${language.toUpperCase()}_`, '').replace('-RF', '');
    return {
        cardImages: `./images/cardimages/${localeDictionary[language]}/${imageName}`,
        cardSquares: `./images/cardsquares/${localeDictionary[language]}/${imageName}`
    };
};

const saveCardImage = async (imageData, outputFilePath) => {
    await sharp(imageData).toFile(outputFilePath);
    console.log(`Image saved at: ${outputFilePath}`);
};

const resizeImage = async (imageData) => {
    return await sharp(imageData)
        .resize(450, 628, {
            fit: 'fill'
        })
        .toBuffer();
};

const CROP_TOP = { left: 0, top: 0, width: 450, height: 372 };
const CROP_BOTTOM = { left: 0, top: 550, width: 450, height: 78 };

const combineImages = async (imageBuffer, outputFilePath) => {
    const topBuffer = await sharp(imageBuffer)
        .extract(CROP_TOP)
        .toBuffer();
    const bottomBuffer = await sharp(imageBuffer)
        .extract(CROP_BOTTOM)
        .toBuffer();
    await sharp({
        create: {
            width: 450,
            height: 450,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 0 }
        }
    })
    .composite([
        { input: topBuffer, top: 0, left: 0 },
        { input: bottomBuffer, top: 373, left: 0 }
    ])
    .webp()
    .toFile(outputFilePath);
    console.log(`Cropped image saved at: ${outputFilePath}`);
}

async function main() {
    for (const language of languagesList) {
        console.log(`------------------------ Starting ${localeDictionary[language]} language ------------------------`)
        try {
            let data = {
                next: composeInitialApiUrl(language)
            };
            let batchNumber = 1;

            createOutputFolderIfNotExists(language, 'cardimages');
            createOutputFolderIfNotExists(language, 'cardsquares');

            do {
                data = await downloadJSON(composeInitialApiUrl(language));
                for (const card of data.results) {
                    const imageUrl = card.image.large;
                    if (!imageUrl) {
                        throw new Error('Image url not found in the JSON response');
                    }
            
                    const filepath = getFilePathsByImageName(imageUrl, language);
                    
                    if(!fs.existsSync(filepath.cardImages)) {
                        const imageData = await downloadImage(imageUrl);
                        const imageBuffer = await resizeImage(imageData);
                        await saveCardImage(imageBuffer, filepath.cardImages);
                        await combineImages(imageBuffer, filepath.cardSquares);
                    }
                }

                console.log(`Finished batch number: ${batchNumber++}`);
            } while (data.next !== null);
            console.log(`------------------------ Finished ${localeDictionary[language]} language ------------------------`)
        } catch (error) {
            console.error('Error: ', error);
        }
    }
}

main();


