import assert from 'assert/strict';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
const resolveDifficulty = (props, database, locator) => {
    const {texts, guids} = database;
    const {minDifficulty} = props;
    assert(minDifficulty, `Expecting minDifficulty prop @ "${locator}"!`);

    const {guid} = minDifficulty;
    let difficultyAsset;
    if (!guid) {
        difficultyAsset = {
            displayName: {
                key: 'Biome_Difficulty_1',
            },
        };
    } else {
        difficultyAsset = guids[guid];
    }

    assert(difficultyAsset, `Expecting difficulty asset "${guid}" @ "${locator}"!`);

    const key = difficultyAsset.displayName?.key;
    assert(key, `Difficulty has no translation key @ "${locator}"!`);

    let value = texts[key];
    assert(value, `Difficulty has no translation wording @ "${locator}"!`);

    if (difficultyAsset.isAscension) {
        value += ' ' + (difficultyAsset.ascensionIndex + 1);
    }

    return value;
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default resolveDifficulty;
