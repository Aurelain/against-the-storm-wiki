import assert from 'assert/strict';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
const decodeDescriptionBraces = (code, locator) => {
    const params = (code.match(/Description\b[^;]*GetText\((.*?)\);/) || [])[1];
    if (!params) {
        return;
    }
    const parts = params.split(',');
    if (parts.length < 2) {
        return;
    }
    const output = {};
    for (let i = 1; i < parts.length; i++) {
        let param = parts[i].trim();
        param = param.replace(/[()?]/g, '');

        // Some files mention an upper case property, when in fact it should be lowercase.
        // Example: `WinGamesWithGoodsGoalModel.cs` uses `.DisplayName`, when it should be `.displayName`
        param = param.replace(/\.([A-Z])/, (found) => found.toLowerCase());

        assert(param, `Invalid parameter in ${locator}!`);
        output[i - 1] = param;
    }
    return output;
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default decodeDescriptionBraces;
