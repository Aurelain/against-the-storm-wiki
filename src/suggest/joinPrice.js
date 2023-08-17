import {CURRENCY_ARTIFACT, CURRENCY_FOOD, CURRENCY_MACHINERY} from '../CONFIG.js';
import assert from 'assert/strict';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
export const CURRENCY_META = {
    [CURRENCY_FOOD]: {
        icon: '[[File:Icon MetaResource FoodStockpiles.png|24px]]',
        label: 'Food',
    },
    [CURRENCY_MACHINERY]: {
        icon: '[[File:Icon MetaResource Machinery.png|24px]]',
        label: 'Machinery',
    },
    [CURRENCY_ARTIFACT]: {
        icon: '[[File:Icon MetaResource Artifact.png|24px]]',
        label: 'Artifacts',
    },
};

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
const joinPrice = (currencies) => {
    const textFragments = [];
    for (const currencyName in currencies) {
        assert(currencyName in CURRENCY_META, `Unexpected currency "${currencyName}"!`);
    }
    for (const key in CURRENCY_META) {
        if (key in currencies) {
            const amount = currencies[key];
            const {icon, label} = CURRENCY_META[key];
            textFragments.push(`${icon} ${amount} ${label}`);
        }
    }
    return textFragments.join(' + ');
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default joinPrice;
