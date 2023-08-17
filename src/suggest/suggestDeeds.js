import fs from 'fs';
import open from 'open';
import {OUTPUT_DIR} from '../CONFIG.js';
import generateWikiTable from '../utils/generateWikiTable.js';
import resolveDescription from './resolveDescription.js';
import resolveDifficulty from './resolveDifficulty.js';
import resolveRewards from './resolveRewards.js';
import getTitle from '../shared/getTitle.js';
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

    let wikiMarkup = '';
    wikiMarkup += prepareIntro() + '\n\n';
    wikiMarkup += prepareStats(deeds, database) + '\n\n';
    wikiMarkup += prepareList(deeds) + '\n\n';
    fs.writeFileSync(PAGE_PATH, wikiMarkup);

    // open(PAGE_PATH);
};

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
const collectDeeds = (database) => {
    const {assets} = database;
    const deeds = [];
    for (const key in assets) {
        const props = assets[key];
        if (!props.hasOwnProperty('isAchiv')) {
            continue;
        }
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
        // if (key === 'ScalingGoal_Phase5_TradeGoods.asset') {
        //     open('input/game/ExportedProject/Assets/MonoBehaviour/' + key);
        // }
        deeds.push({
            key,
            title: getTitle(props, database),
            description: resolveDescription(props, database),
            minDifficulty: resolveDifficulty(props, database, key),
            rewards: resolveRewards(props, database),
            isAchiv: props.isAchiv ? 'yes' : 'no',
            deedProps: props,
        });
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

/**
 *
 */
const prepareIntro = () => {
    return `
Deeds are tasks from the [[Smoldering City]] what will grant either 50 Experience Points or a permanent bonus when completed.
Some of them require playing on a certain minimal difficulty. Some of them will grant an Achievement.
`.trim();
};

/**
 *
 */
const prepareStats = (deeds, database) => {
    const stats = computeStats(deeds, database);

    let list = '';
    for (const type in stats.rewardTypes) {
        list += `** ${type} rewards: ${stats.rewardTypes[type]}\n`;
    }
    list = list.trim();

    return `
== Statistics ==
* Total number of deeds: ${deeds.length}
${list}
* Total experience points to be gained: ${stats.xpTotal}
* Achievements tied to deeds: ${stats.achievements} 
    `.trim();
};

/**
 *
 */
const computeStats = (deeds) => {
    let xpTotal = 0;
    let achievements = 0;
    const rewardTypes = {};
    for (const deed of deeds) {
        const {deedProps, rewards} = deed;
        for (const type in rewards.types) {
            rewardTypes[type] = rewardTypes[type] || 0;
            rewardTypes[type]++;
            if (type === 'Experience') {
                xpTotal += Number(rewards.text.match(/\d+/)[0]);
            }
        }
        if (deedProps.isAchiv) {
            achievements++;
        }
    }
    assert(xpTotal > 0, `Unexpected xpTotal!`);
    assert(achievements > 0, `Unexpected achievements count!`);
    return {rewardTypes, xpTotal, achievements};
};

/**
 *
 */
const prepareList = (deeds) => {
    const rows = [
        [
            // 'Guid', // hidden
            'Deed',
            'Objective',
            'Min. difficulty',
            'Reward',
            'Grants achievement',
        ],
    ];
    for (const deed of deeds) {
        rows.push([
            // deed.deedProps.guid, // Guid, hidden
            deed.title,
            deed.description,
            deed.minDifficulty,
            deed.rewards.text,
            deed.isAchiv,
        ]);
    }
    return `
== List of Deeds ==
${generateWikiTable(rows)}
    `.trim();
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default suggestDeeds;
