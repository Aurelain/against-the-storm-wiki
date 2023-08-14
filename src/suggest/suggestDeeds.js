import fs from 'fs';
import open from 'open';
import {OUTPUT_DIR} from '../CONFIG.js';
import generateWikiTable from '../utils/generateWikiTable.js';
import assert from 'assert/strict';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const PAGE_PATH = OUTPUT_DIR + '/Deeds.wiki';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
const suggestDeeds = (database) => {
    const deeds = collectDeeds(database);
    deeds.unshift([
        'Key', // hidden
        'Deed',
        'Objective',
    ]);
    const wikiMarkup = generateWikiTable(deeds);
    fs.writeFileSync(PAGE_PATH, wikiMarkup);
    open(PAGE_PATH);
};

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
const collectDeeds = ({assets, texts, guids}) => {
    const deeds = [];
    for (const key in assets) {
        const props = assets[key];
        if (props.isLegacy) {
            // "UniqueGoal_Phase5_WinWithVaults" (title "Ancient Vaults") is legacy
            continue;
        }
        if (props.order === 999) {
            // "[WE] Deed Win With Amber In Years" (title "Bankrupt Trade") has order 999
            continue;
        }
        if (!props.rewards?.length) {
            // "[WE] Deed Complete Trade Routes Of Value In Years" (title "Commenda Contract") has empty rewards
            continue;
        }
        if (key.includes('WIn')) {
            // We couldn't find a proper way to exclude "UniqueGoal_Phase2_WInGameWithResolve.asset"
            // (title "Victory Through Resolve"), so we resorted to this hack...
            continue;
        }
        // if (key === 'Deed Win Without Bonus Prestige') {
        // if (key === 'Deed Win Game With Trade Routes') {
        // if (key === 'Deed Win Without Camps') { // simple description
        // if (key === 'Deed Win With Lizards') {
        // if (key === 'Deed Year 1 Dangerous') { // difficulty parameter
        // if (key === 'Deed Win With Humans') {
        //     open('input/game/ExportedProject/Assets/MonoBehaviour/' + key + '.asset');
        // }
        if (props.hasOwnProperty('isAchiv')) {
            const title = texts[props.displayName.key];
            assert(title, `Invalid title for "${key}"!`);
            const description = generateDescription(props, texts);
            assert(description, `Invalid description for "${key}"!`);
            deeds.push({
                key,
                title,
                description,
            });
        }
    }
    console.log('Found ' + deeds.length + ' deeds.');
    deeds.sort(compareDeeds);
    return deeds;
};

/**
 *
 */
const generateDescription = (props, texts) => {
    return texts[props.description.key];
};

/**
 *
 */
const compareDeeds = (deed1, deed2) => {
    if (deed1.title > deed2.title) {
        return 1;
    } else {
        return -1;
    }
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default suggestDeeds;
