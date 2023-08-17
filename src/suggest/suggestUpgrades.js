import fs from 'fs';
import open from 'open';
import {OUTPUT_DIR} from '../CONFIG.js';
import generateWikiTable from '../utils/generateWikiTable.js';
import getTitle from '../shared/getTitle.js';
import resolvePrice from './resolvePrice.js';
import joinPrice from './joinPrice.js';
import resolveRewards from './resolveRewards.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const PAGE_PATH = OUTPUT_DIR + '/Upgrades.wiki';
const CATEGORY_COLORS = [
    // '#ffebee', // 1
    // '#ede7f6', // 2
    // '#e1f5fe', // 3
    // '#e8f5e9', // 4
    // '#fffde7', // 5
    // '#efebe9', // 6
    // '#eceff1', // 7
    '#C8E6C9', // 1
    '#F9D9DE', // 2
    '#D0ECEC', // 3
    '#E6E6FA', // 4
    '#FFE5B4', // 5
    '#C4E1FF', // 6
    '#FFF5E1', // 7
];

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
    wikiMarkup += editIntro() + '\n\n';
    wikiMarkup += editStats(upgrades, stats) + '\n\n';
    wikiMarkup += editList(upgrades, stats) + '\n\n';
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
        if (key === 'Monastery Level 01.asset') {
            open('input/game/ExportedProject/Assets/MonoBehaviour/' + key);
        }
        const title = getTitle(props, database);
        upgrades.push({
            key,
            category: title,
            title: title + ' ' + props.m_Name.match(/\d+/)[0],
            requiredLevel: props.requiredLevel,
            price: resolvePrice(props, database),
            reward: resolveRewards(props, database),
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
    for (const upgrade of upgrades) {
        const {category, requiredLevel, price} = upgrade;

        for (const key in price) {
            totalCostAll[key] = totalCostAll[key] || 0;
            totalCostAll[key] += price[key];
        }

        const totalCostOne = {};
        for (const upgrade2 of upgrades) {
            const category2 = upgrade2.category;
            const requiredLevel2 = upgrade2.requiredLevel;
            if (category === category2 && requiredLevel2 <= requiredLevel) {
                const currencies2 = upgrade2.price;
                for (const key in currencies2) {
                    totalCostOne[key] = totalCostOne[key] || 0;
                    totalCostOne[key] += currencies2[key];
                }
            }
        }
        totalCostEachUpgrade[upgrade.title] = totalCostOne;
    }

    return {
        totalCostAll,
        totalCostEachUpgrade,
    };
};

/**
 *
 */
const editIntro = () => {
    return `
The Scorched Queen has decided that the Smoldering City requires 7 new great work projects: the Obsidian Archives, the Monastery of the Vigilant Flame, the Pioneers' Gate, the First Dawn Headquarters, the Dim Square, the Brass Forge, and the Vanguard Spire.

From the Upgrades tab of the Smoldering City, you can spend [[Resources#Citadel Resources | Citadel Resources]] - such as [[File:Icon MetaResource FoodStockpiles.png|16px]] Food Stockpiles, [[File:Icon MetaResource Artifact.png|16px]] Artifacts, and [[File:Icon MetaResource Machinery.png|16px]] Machinery - to construct and upgrade these great works.  Each great work improves your Settlements' chances for survival in a particular way, and certain upgrade levels will unlock new game features.

== Overview ==
Each level of the great works grants:
* '''Obsidian Archives''' - Queen's Patience: -2% to the speed at which the Queen's Impatience grows per upgrade level (max. -34%)
* '''Monastery of the Vigilant Flame''' - Everlasting Flames: +2% to burning duration for all fuels burned in the Hearth per upgrade level (max. +18%)
* '''Pioneers' Gate''' - Villager Speed Increase: +2% increase to Villager walking speed per upgrade level (max. +20%)
* '''First Dawn Headquarters''' - Unforeseen Riches: +1% boost to the chance of obtaining bonus production yields per upgrade level (max. +10%)
* '''Dim Square''' - Quicker Trader Arrival: +3% bonus to trader arrival speed per upgrade level (max. +27%)
* '''Brass Forge''' - Production Speed Increase: +2% boost to global production speed per upgrade level (max. +18%)
* '''Vanguard Spire''' - Gathering Technique: +1 available charge to all resource deposits per upgrade level (max. +9)

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
const editStats = (upgrades, stats) => {
    return `
== Statistics ==
* Total number of upgrades: ${upgrades.length}
* Total cost of upgrades: ${joinPrice(stats.totalCostAll)}
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
        rows.push([
            upgrade.title, // Upgrade
            String(upgrade.requiredLevel).padStart(2, '0'), // Level
            joinPrice(upgrade.price), // Cost
            joinPrice(stats.totalCostEachUpgrade[upgrade.title]), // Cost
            upgrade.reward, // Reward
            ' ', // Total bonus
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
    const availableColors = CATEGORY_COLORS.slice();
    const categoryToColor = {};
    const styles = [];
    for (const upgrade of upgrades) {
        const {category} = upgrade;
        if (!categoryToColor[category]) {
            categoryToColor[category] = availableColors.shift();
        }
        styles.push(`background:${categoryToColor[category]}`);
    }
    return styles;
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default suggestUpgrades;
