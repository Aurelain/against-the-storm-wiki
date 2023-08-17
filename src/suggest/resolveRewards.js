import assert from 'assert/strict';
import getTitle from '../shared/getTitle.js';
import getAsset from '../shared/getAsset.js';
import {REWARD_AMOUNT, REWARD_BUILDING, REWARD_EFFECT, REWARD_GOOD, REWARD_PROPS, REWARD_TRADER} from '../CONFIG.js';
import getImg from '../shared/getImg.js';
import formatBonus from '../utils/formatBonus.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const LABEL_TO_CUSTOM = {
    'Essential Buildings': 'Building', // the game's wording was bad (long and plural)
    'Embarkation Bonus': 'Embarkation', // the game's wording was bad (long)
};

const HIDDEN_LABELS = {
    'Base Stat': true, // needed by the `Upgrades` page, but not inside the text
};

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
const resolveRewards = (asset, database) => {
    const {rewards, m_Name: locator} = asset;
    assert(rewards?.length > 0, `Expecting at least one reward @ "${locator}"!`);

    const rewardTypes = {};
    const rewardTexts = [];
    for (const rewardMeta of rewards) {
        const rewardAsset = getAsset(rewardMeta, database);
        const {type, text, amount} = resolveReward(rewardAsset, database, locator);
        rewardTypes[type] = rewardTypes[type] || 0;
        rewardTypes[type] += amount || 1;
        if (text) {
            rewardTexts.push(text);
        }
    }

    return {
        types: rewardTypes,
        text: rewardTexts.join('<br/>'),
    };
};

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
const resolveReward = (rewardAsset, database, locator) => {
    const labelAsset = getAsset(rewardAsset.label, database);
    const title = getTitle(labelAsset, database);
    const label = LABEL_TO_CUSTOM[title] || title;

    for (const rewardProperty of REWARD_PROPS) {
        if (rewardProperty in rewardAsset) {
            switch (rewardProperty) {
                case REWARD_BUILDING:
                case REWARD_TRADER:
                case REWARD_EFFECT:
                    const asset = getAsset(rewardAsset[rewardProperty], database);
                    const targetTitle = getTitle(asset, database);
                    let value;
                    if (label === 'Embarkation') {
                        value = getImg(targetTitle.split(' ')[0]) + ' [[' + targetTitle + ']]';
                    } else {
                        value = '[[' + targetTitle + ']]';
                    }
                    return {
                        type: label,
                        text: `${label}: ${value}`,
                    };
                case REWARD_AMOUNT:
                    // const scriptPath = getScriptPath(rewardAsset, database);
                    const {amount} = rewardAsset;
                    if (label in HIDDEN_LABELS) {
                        // Needed by the `Upgrades` page
                        return {
                            type: label,
                            amount,
                        };
                    }
                    return {
                        type: label,
                        text: `${label}: ${formatBonus(rewardAsset.amount)}`,
                        amount,
                    };
                case REWARD_GOOD:
                    const goodAsset = getAsset(rewardAsset.good.good, database);
                    const goodTitle = getTitle(goodAsset, database);
                    return {
                        type: label,
                        text: `${label}: ${getImg(goodTitle)} ${rewardAsset.good.amount} [[${goodTitle}]]`,
                    };
                default:
                    throw new Error('Unhandled property name!'); // our coding error
            }
        }
    }

    // If we got here, we're dealing with a special kind of reward, that doesn't redirect to someplace else and doesn't
    // have an amount. We'll just use its display name.
    let value = getTitle(rewardAsset, database);
    if (value.startsWith(label + ' - ')) {
        // Example: "House Upgrades: House Upgrades - Foxes"
        value = value.substring((label + ' - ').length);
    }
    return {
        type: label,
        text: `${label}: ${value}`,
    };
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default resolveRewards;
