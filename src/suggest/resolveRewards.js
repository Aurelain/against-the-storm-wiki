import assert from 'assert/strict';
import getTitle from '../shared/getTitle.js';
import getAsset from '../shared/getAsset.js';
import {REWARD_AMOUNT, REWARD_BUILDING, REWARD_EFFECT, REWARD_GOOD, REWARD_PROPS, REWARD_TRADER} from '../CONFIG.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const SCRIPT_TO_LABEL = {
    'Eremite/Model/Meta/ExpMetaRewardModel.cs': 'Experience',
    'Eremite/Model/Meta/GlobalProductionSpeedMetaRewardModel.cs': 'Production speed',
};

const LABEL_TO_CUSTOM = {
    'Essential Buildings': 'Building', // the game's wording was bad (long and plural)
    'Embarkation Bonus': 'Embarkation', // the game's wording was bad (long)
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
        const {type, text} = resolveReward(rewardAsset, database, locator);
        rewardTypes[type] = rewardTypes[type] || 0;
        rewardTypes[type]++;
        rewardTexts.push(text);
    }

    return {
        types: rewardTypes,
        text: rewardTexts.join(', '),
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
                    return {
                        type: label,
                        text: `${label}: [[${getTitle(asset, database)}]]`,
                    };
                case REWARD_AMOUNT:
                    // const scriptPath = getScriptPath(rewardAsset, database);
                    return {
                        type: label,
                        text: `${label}: ${rewardAsset.amount}`,
                    };
                case REWARD_GOOD:
                    const goodAsset = getAsset(rewardAsset.good.good, database);
                    return {
                        type: label,
                        text: `${label}: ${rewardAsset.good.amount} [[${getTitle(goodAsset, database)}]]`,
                    };
                default:
                    throw new Error('Unhandled property name!'); // our coding error
            }
        }
    }

    assert(false, `No reward @ "${locator}"!`);
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default resolveRewards;
