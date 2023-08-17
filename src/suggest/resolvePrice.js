import assert from 'assert/strict';
import getAsset from './getAsset.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
const resolvePrice = (props, database) => {
    const {price, m_Name: locator} = props;
    assert(price.length > 0, `Expecting price array @ "${locator}"!`);

    const currencies = {};
    for (const priceItem of price) {
        const {currency, amount} = priceItem;
        const currencyAsset = getAsset(currency, database);
        currencies[currencyAsset.m_Name] = amount;
    }

    return currencies;
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default resolvePrice;
