import assert from 'assert/strict';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
const translateDeedNumbers = (code, locator) => {
    const params = (code.match(/GetText\((.*?)\);/) || [])[1];
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
        param = param.replace('.DisplayName', '.displayName'); // needed by `WinGamesWithGoodsGoalModel.cs`
        assert(param, `Invalid parameter in ${locator}!`);
        output[i - 1] = param;
    }
    return output;
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default translateDeedNumbers;
