import assert from 'assert/strict';
import checkPojo from '../utils/checkPojo.js';
import getTitle from './getTitle.js';
import getAsset from './getAsset.js';
import {REWARD_AMOUNT, REWARD_BUILDING, REWARD_EFFECT, REWARD_GOOD, REWARD_PROPS, REWARD_TRADER} from '../CONFIG.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
const resolveReward = (props, database) => {
    const {guids} = database;
    const {rewards, m_Name: locator} = props;
    assert(rewards?.length === 1, `Expecting a single reward @ "${locator}"!`);

    const rewardAsset = guids[rewards[0].guid];
    assert(checkPojo(rewardAsset), `Expecting reward asset @ "${locator}"!`);

    for (const rewardProperty of REWARD_PROPS) {
        if (rewardProperty in rewardAsset) {
            switch (rewardProperty) {
                case REWARD_BUILDING:
                case REWARD_TRADER: {
                    const asset = getAsset(rewardAsset[rewardProperty], database);
                    const titleCase = rewardProperty.charAt(0).toUpperCase() + rewardProperty.substring(1);
                    return titleCase + ': [[' + getTitle(asset, database) + ']]';
                }
                case REWARD_EFFECT: {
                    const asset = getAsset(rewardAsset[rewardProperty], database);
                    const titleCase = rewardProperty.charAt(0).toUpperCase() + rewardProperty.substring(1);
                    // return titleCase + `: [[${getTitle(asset, database)}]] (${resolveDescription(asset, database)})`;
                    return titleCase + `: [[${getTitle(asset, database)}]]`;
                }
                case REWARD_AMOUNT: {
                    return 'Experience: ' + rewardAsset[rewardProperty];
                }
                case REWARD_GOOD: {
                    const goodAsset = getAsset(rewardAsset.good.good, database);
                    return 'Embarkation bonus: ' + rewardAsset.good.amount + ' ' + getTitle(goodAsset, database);
                }
                default:
                    throw new Error('Unhandled property name!');
            }
        }
    }
    assert(false, `No reward @ "${locator}"!`);
};
// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default resolveReward;
