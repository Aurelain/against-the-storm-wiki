import fs from 'fs';
import yaml from 'js-yaml';
import assert from 'assert/strict';
import attemptSelfRun from '../utils/attemptSelfRun.js';
import {DATAMINE_DIR, DEBUG} from '../CONFIG.js';
import suggestDeeds from './suggestDeeds.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
const suggest = async () => {
    try {
        const assets = collectAssets();
        const database = {
            assets,
            texts: collectTexts(),
            guids: linkGuidsToAssets(assets),
        };
        // fs.writeFileSync('temp.json', JSON.stringify(database, null, 4));
        // fs.writeFileSync('guids.json', JSON.stringify(database.guids, null, 4));
        // fs.writeFileSync('assets.json', JSON.stringify(database.assets, null, 4));
        suggestDeeds(database);
    } catch (e) {
        console.log('Error:', e.message);
        DEBUG && console.log(e.stack);
    }
};

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
const collectTexts = () => {
    const filePath = DATAMINE_DIR + '/ExportedProject/Assets/Resources/texts/en.json';
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

/**
 *
 */
const collectAssets = () => {
    const assets = {};
    const dir = DATAMINE_DIR + '/ExportedProject/Assets/MonoBehaviour';
    const list = fs.readdirSync(dir);
    for (const file of list) {
        if (file.endsWith('.asset')) {
            const filePath = dir + '/' + file;
            let safe = fs.readFileSync(filePath, 'utf8');
            safe = safe.replace(/[\s\S]*?MonoBehaviour:/, '');
            const props = yaml.load(safe);
            const meta = fs.readFileSync(filePath + '.meta', 'utf8');
            const guid = (meta.match(/guid: (\w+)/) || [])[1];
            assert(guid, `Cannot find guid for ${file}!`);
            props.guid = guid;
            assets[file] = props;
        }
    }

    return assets;
};

/**
 *
 */
const linkGuidsToAssets = (assets) => {
    const guids = {};
    for (const key in assets) {
        const asset = assets[key];
        guids[asset.guid] = asset;
    }
    return guids;
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
attemptSelfRun(suggest);
export default suggest;
