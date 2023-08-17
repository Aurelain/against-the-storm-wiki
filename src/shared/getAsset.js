import assert from 'assert/strict';
import checkPojo from '../utils/checkPojo.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
const getAsset = (guidOrMeta, database) => {
    const guid = typeof guidOrMeta === 'string' ? guidOrMeta : guidOrMeta.guid;
    const asset = database.guids[guid];
    assert(checkPojo(asset), `Invalid asset @ "${guid}"!`);
    return asset;
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default getAsset;
