import fs from 'fs';
import open from 'open';
import {REWARD_AMOUNT, REWARD_BUILDING, REWARD_EFFECT, REWARD_GOOD, REWARD_TRADER, OUTPUT_DIR} from '../CONFIG.js';
import generateWikiTable from '../utils/generateWikiTable.js';
import resolveDescription from './resolveDescription.js';
import resolveDifficulty from './resolveDifficulty.js';
import resolveReward from './resolveReward.js';
import getTitle from './getTitle.js';
import getAsset from './getAsset.js';

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
        // if (key === 'Deed Win Scarlet Impossible.asset') {
        //     open('input/game/ExportedProject/Assets/MonoBehaviour/' + key);
        // }
        deeds.push({
            key,
            title: getTitle(props, database),
            description: resolveDescription(props, database),
            minDifficulty: resolveDifficulty(props, database, key),
            reward: resolveReward(props, database),
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
    return `
== Statistics ==
* Total number of deeds: ${stats.deeds}
** Experience rewards: ${stats.xp}
** Building rewards: ${stats.buildings}
** Effect rewards: ${stats.effects}
** Embarkation rewards: ${stats.embarkations}
** Trader rewards: ${stats.traders}
* Total experience points to be gained: ${stats.xpTotal}
* Achievements tied to deeds: ${stats.achievements} 
    `.trim();
};

/**
 *
 */
const computeStats = (deeds, database) => {
    let xp = 0;
    let buildings = 0;
    let effects = 0;
    let embarkations = 0;
    let traders = 0;
    let xpTotal = 0;
    let achievements = 0;
    for (const deed of deeds) {
        const {deedProps} = deed;
        const rewardAsset = getAsset(deedProps.rewards[0], database);
        if (REWARD_BUILDING in rewardAsset) {
            buildings++;
        } else if (REWARD_TRADER in rewardAsset) {
            traders++;
        } else if (REWARD_EFFECT in rewardAsset) {
            effects++;
        } else if (REWARD_AMOUNT in rewardAsset) {
            xp++;
            xpTotal += rewardAsset.amount;
        } else if (REWARD_GOOD in rewardAsset) {
            embarkations++;
        }
        if (deedProps.isAchiv) {
            achievements++;
        }
    }
    return {deeds: deeds.length, xp, buildings, effects, embarkations, traders, xpTotal, achievements};
};

/**
 *
 */
const prepareList = (deeds) => {
    const rows = [['Deed', 'Objective', 'Min. difficulty', 'Reward', 'Grants achievement']];
    for (const deed of deeds) {
        rows.push([deed.title, deed.description, deed.minDifficulty, deed.reward, deed.isAchiv]);
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
