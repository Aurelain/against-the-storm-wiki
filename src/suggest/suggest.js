import fs from 'fs';
import yaml from 'js-yaml';
import assert from 'assert/strict';
import attemptSelfRun from '../utils/attemptSelfRun.js';
import {DATAMINE_DIR, DEBUG} from '../CONFIG.js';
import suggestDeeds from './suggestDeeds.js';
import findFiles from '../utils/findFiles.js';
import decodeDescriptionBraces from './decodeDescriptionBraces.js';
import suggestUpgrades from './suggestUpgrades.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
const suggest = async () => {
    try {
        const assets = collectAssets();
        const scripts = collectScripts();
        const database = {
            assets,
            scripts,
            texts: collectTexts(),
            guids: linkGuids(assets, scripts),
        };
        // fs.writeFileSync('temp.json', JSON.stringify(database, null, 4));
        // fs.writeFileSync('guids.json', JSON.stringify(database.guids, null, 4));
        // fs.writeFileSync('assets.json', JSON.stringify(database.assets, null, 4));
        // fs.writeFileSync('scripts.json', JSON.stringify(database.scripts, null, 4));

        suggestDeeds(database);
        // suggestUpgrades(database);
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
const collectScripts = () => {
    const scripts = {};
    const dir = DATAMINE_DIR + '/ExportedProject/Assets/Scripts/Assembly-CSharp';
    const metaFiles = findFiles(dir, /\.meta$/);
    for (const metaFile of metaFiles) {
        const meta = fs.readFileSync(metaFile, 'utf8');
        const guid = (meta.match(/guid: (\w+)/) || [])[1];
        assert(guid, `Cannot find guid for ${metaFile}!`);
        let shortPath = metaFile.replace(/.*?Assembly-CSharp./, '');
        shortPath = shortPath.replace(/.meta$/, '');
        shortPath = shortPath.replace(/\\/g, '/');
        const script = {
            shortPath,
            guid,
        };

        // TODO maybe move this section to an "enrichment" phase
        const code = fs.readFileSync(metaFile.replace(/.meta$/, ''), 'utf8');
        const descriptionBraces = decodeDescriptionBraces(code, shortPath);
        if (descriptionBraces) {
            script.descriptionBraces = descriptionBraces;
        }

        scripts[shortPath] = script;
    }
    return scripts;
};

/**
 *
 */
const linkGuids = (assets, scripts) => {
    const guids = {};
    const bags = [assets, scripts];
    for (const bag of bags) {
        for (const key in bag) {
            const item = bag[key];
            guids[item.guid] = item;
        }
    }
    return guids;
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
attemptSelfRun(suggest);
export default suggest;
