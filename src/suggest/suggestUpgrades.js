import fs from 'fs';
import open from 'open';
import {OUTPUT_DIR} from '../CONFIG.js';
import generateWikiTable from '../utils/generateWikiTable.js';
import getTitle from '../shared/getTitle.js';
import resolvePrice from './resolvePrice.js';
import joinPrice from './joinPrice.js';
import resolveRewards from './resolveRewards.js';
import formatBonus from '../utils/formatBonus.js';
import assert from 'assert/strict';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const PAGE_PATH = OUTPUT_DIR + '/Upgrades.wiki';
const CATEGORY_META = {
    'Brass Forge': {
        bonus: 'production speed',
        color: '#C8E6C9',
    },
    'Dim Square': {
        bonus: 'trader arrival speed',
        color: '#F9D9DE',
    },
    'First Dawn Headquarters': {
        bonus: 'chance for bonus production',
        color: '#D0ECEC',
    },
    'Monastery of the Vigilant Flame': {
        bonus: 'burning duration',
        color: '#E6E6FA',
    },
    'Obsidian Archive': {
        bonus: 'impatience growth speed',
        color: '#FFE5B4',
    },
    "Pioneers' Gate": {
        bonus: 'walking speed',
        color: '#C4E1FF',
    },
    'Vanguard Spire': {
        bonus: 'charges in resource deposits',
        color: '#FFF5E1',
    },
};

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
const suggestUpgrades = (database) => {
    const upgrades = collectUpgrades(database);
    const stats = computeStats(upgrades, database);

    let wikiMarkup = '';
    wikiMarkup += editIntro(stats) + '\n\n';
    wikiMarkup += editList(upgrades, stats) + '\n\n';
    wikiMarkup += editStats(upgrades, stats) + '\n\n';
    fs.writeFileSync(PAGE_PATH, wikiMarkup);

    open(PAGE_PATH);
};

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
const collectUpgrades = (database) => {
    const {assets} = database;
    const upgrades = [];
    for (const key in assets) {
        const props = assets[key];
        if (!props.requiredLevel) {
            continue;
        }
        // if (key === 'Monastery Level 01.asset') {
        //     open('input/game/ExportedProject/Assets/MonoBehaviour/' + key);
        // }
        const title = getTitle(props, database);
        upgrades.push({
            key,
            category: title,
            title: title + ' ' + props.m_Name.match(/\d+/)[0],
            requiredLevel: props.requiredLevel,
            price: resolvePrice(props, database),
            rewards: resolveRewards(props, database),
            upgradeProps: props,
        });
    }
    console.log('Found ' + upgrades.length + ' upgrades.');
    upgrades.sort(compareUpgrades);
    return upgrades;
};

/**
 *
 */
const compareUpgrades = (deed1, deed2) => {
    if (deed1.title > deed2.title) {
        return 1;
    } else {
        return -1;
    }
};

/**
 *
 */
const computeStats = (upgrades) => {
    const totalCostAll = {};
    const totalCostEachUpgrade = {};
    const totalBonusEachUpgrade = {};
    const categoryStats = {};
    for (const upgrade of upgrades) {
        const {category, requiredLevel, price} = upgrade;

        categoryStats[category] = categoryStats[category] || {step: 0, max: 0};

        for (const key in price) {
            totalCostAll[key] = totalCostAll[key] || 0;
            totalCostAll[key] += price[key];
        }

        const totalCostOne = {};
        let totalBonusOne = 0;
        for (const upgrade2 of upgrades) {
            const category2 = upgrade2.category;
            const requiredLevel2 = upgrade2.requiredLevel;
            if (category === category2 && requiredLevel2 <= requiredLevel) {
                const currencies2 = upgrade2.price;
                for (const key in currencies2) {
                    totalCostOne[key] = totalCostOne[key] || 0;
                    totalCostOne[key] += currencies2[key];
                }
                const step = upgrade2.rewards.types['Base Stat'];
                assert(step, `Unexpected base stat value "${step}"!`);
                totalBonusOne += step;
                categoryStats[category].step = step;
            }
        }

        totalCostEachUpgrade[upgrade.title] = totalCostOne;
        totalBonusEachUpgrade[upgrade.title] = totalBonusOne;
        if (Math.abs(categoryStats[category].max) < Math.abs(totalBonusOne)) {
            categoryStats[category].max = totalBonusOne;
        }
    }

    return {
        totalCostAll,
        totalCostEachUpgrade,
        totalBonusEachUpgrade,
        categoryStats,
    };
};

/**
 *
 */
const editIntro = (stats) => {
    const {categoryStats} = stats;
    const obsidanStep = formatBonus(categoryStats['Obsidian Archive'].step);
    const obsidanMax = formatBonus(categoryStats['Obsidian Archive'].max);
    const brassStep = formatBonus(categoryStats['Brass Forge'].step);
    const brassMax = formatBonus(categoryStats['Brass Forge'].max);
    const dimStep = formatBonus(categoryStats['Dim Square'].step);
    const dimMax = formatBonus(categoryStats['Dim Square'].max);
    const headquartersStep = formatBonus(categoryStats['First Dawn Headquarters'].step);
    const headquartersMax = formatBonus(categoryStats['First Dawn Headquarters'].max);
    const monasteryStep = formatBonus(categoryStats['Monastery of the Vigilant Flame'].step);
    const monasteryMax = formatBonus(categoryStats['Monastery of the Vigilant Flame'].max);
    const pioneersStep = formatBonus(categoryStats["Pioneers' Gate"].step);
    const pioneersMax = formatBonus(categoryStats["Pioneers' Gate"].max);
    const vanguardStep = formatBonus(categoryStats['Vanguard Spire'].step);
    const vanguardMax = formatBonus(categoryStats['Vanguard Spire'].max);

    return `
The Scorched Queen has decided that the Smoldering City requires 7 new great work projects: the Obsidian Archives, the Monastery of the Vigilant Flame, the Pioneers' Gate, the First Dawn Headquarters, the Dim Square, the Brass Forge, and the Vanguard Spire.

From the Upgrades tab of the Smoldering City, you can spend [[Resources#Citadel Resources | Citadel Resources]] ([[File:Icon MetaResource FoodStockpiles.png|16px]] Food Stockpiles, [[File:Icon MetaResource Machinery.png|16px]] Machinery and [[File:Icon MetaResource Artifact.png|16px]] Artifacts) to construct and upgrade these great works.  Each great work improves your Settlements' chances for survival in a particular way, and certain upgrade levels will unlock new game features.

== Overview ==
Each level of the great works grants:
* '''Obsidian Archives''' - Queen's Patience: ${obsidanStep} to the speed at which the Queen's Impatience grows per upgrade level (max. ${obsidanMax})
* '''Monastery of the Vigilant Flame''' - Everlasting Flames: ${monasteryStep} to burning duration for all fuels burned in the Hearth per upgrade level (max. ${monasteryMax})
* '''Pioneers' Gate''' - Villager Speed Increase: ${pioneersStep} increase to Villager walking speed per upgrade level (max. ${pioneersMax})
* '''First Dawn Headquarters''' - Unforeseen Riches: ${headquartersStep} boost to the chance of obtaining bonus production yields per upgrade level (max. ${headquartersMax})
* '''Dim Square''' - Quicker Trader Arrival: ${dimStep} bonus to trader arrival speed per upgrade level (max. ${dimMax})
* '''Brass Forge''' - Production Speed Increase: ${brassStep} boost to global production speed per upgrade level (max. ${brassMax})
* '''Vanguard Spire''' - Gathering Technique: ${vanguardStep} available charge to all resource deposits per upgrade level (max. ${vanguardMax})

Other rewards include:
* '''Obsidian Archives''' - increases the Citadel Resource rewards for completing a Settlement, and unlocks many new game features such as Consumption Control, Rainpunk Engines, rival Viceroys, [[Royal Expeditions]], [[Timed Orders]], [[Training Expeditions]]
* '''Monastery of the Vigilant Flame''' - increases your [[Cornerstone]] pool and reroll chances
* '''Pioneers' Gate''' - increases your Embarkation points, and extends the vision of your Settlements and your Embarkation range
* '''First Dawn Headquarters''' - adds new Embarkation choices and increases your Embarkation points
* '''Dim Square''' - allows and increases the number of [[Trade Routes]], and improves the cost and availability of [[Perks]]/Blueprints from [[Traders]]
* '''Brass Forge''' - allows [[Hearth]] upgrades, and increases worker and building capacities
* '''Vanguard Spire''' - adds race-specific [[Housing]] to your [[Essential Buildings]] and improves your Caravan choices and Newcomers
`.trim();
};

/**
 *
 */
const editList = (upgrades, stats) => {
    const rows = [['Upgrade', 'Level', 'Cost', 'Total cost', 'Reward', 'Total bonus']];
    const styles = generateStyles(upgrades);
    styles.unshift(''); // no special style for the header
    for (const upgrade of upgrades) {
        const {category} = upgrade;
        const prettyBonus = formatBonus(stats.totalBonusEachUpgrade[upgrade.title]);
        rows.push([
            upgrade.title, // Upgrade
            String(upgrade.requiredLevel).padStart(2, '0'), // Level
            joinPrice(upgrade.price, true), // Cost
            joinPrice(stats.totalCostEachUpgrade[upgrade.title], true), // Total cost
            upgrade.rewards.text, // Reward
            prettyBonus + ' ' + CATEGORY_META[category].bonus, // Total bonus
        ]);
    }
    return `
== List of Upgrades ==
${generateWikiTable(rows, styles)}
    `.trim();
};

/**
 *
 */
const generateStyles = (upgrades) => {
    const styles = [];
    for (const upgrade of upgrades) {
        const {category} = upgrade;
        styles.push(`background:${CATEGORY_META[category].color}`);
    }
    return styles;
};

/**
 *
 */
const editStats = (upgrades, stats) => {
    return `
* Total number of upgrades: ${upgrades.length}
* Total cost of upgrades: ${joinPrice(stats.totalCostAll)}
    `.trim();
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default suggestUpgrades;
