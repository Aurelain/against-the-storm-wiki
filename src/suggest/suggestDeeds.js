import fs from 'fs';
import open from 'open';
import {OUTPUT_DIR} from '../CONFIG.js';
import generateWikiTable from '../utils/generateWikiTable.js';
import assert from 'assert/strict';
import resolveDeedDescription from './resolveDeedDescription.js';

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
const collectDeeds = (database) => {
    const {assets, texts} = database;
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
        // if (key === 'UniqueGoal_Phase1_WinGameNearFertileMeadows.asset') {
        //     open('input/game/ExportedProject/Assets/MonoBehaviour/' + key);
        // }
        if (props.hasOwnProperty('isAchiv')) {
            const title = texts[props.displayName?.key];
            assert(title, `Invalid title for "${key}"!`);

            deeds.push({
                key,
                title,
                description: resolveDeedDescription(props, database),
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
