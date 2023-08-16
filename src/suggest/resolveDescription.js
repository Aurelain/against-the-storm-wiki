import assert from 'assert/strict';
import checkPojo from '../utils/checkPojo.js';
import resolveDifficulty from './resolveDifficulty.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
const resolveDescription = (props, database) => {
    const {guids, texts} = database;
    const {m_Script, m_Name: locator, description} = props;

    const rawText = texts[description?.key];
    assert(rawText, `Cannot find text for "${locator}"!`);

    if (!rawText.includes('{')) {
        return rawText;
    }

    const script = guids[m_Script.guid];
    assert(script, `Cannot find script for "${locator}"!`);

    const scriptPath = script.shortPath;
    assert(script.descriptionBraces, `Expecting descriptionBraces in "${scriptPath}" @ "${locator}"!`);

    const resolvedText = rawText.replace(/\{\d}/g, (found) => {
        const nr = found.charAt(1);
        const resolvedName = script.descriptionBraces[nr];
        assert(resolvedName, `Cannot resolve nr "${nr}" @ "${locator}"!`);
        if (resolvedName in props) {
            return props[resolvedName];
        }
        switch (resolvedName) {
            case 'GetDifficultyName':
                return resolveDifficulty(props, database, locator);
            case 'GetBuildingsText':
                return getBuildingsText(props, database, locator);
            default:
                assert(resolvedName.includes('.'), `Unexpected deed variable "${resolvedName}" @ "${locator}"!`);
                return resolveValue(resolvedName, props, database, locator);
        }
    });
    assert(resolvedText, `Empty description @ "${locator}"!`);
    return resolvedText;
};

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
const getBuildingsText = (props, database, deedName) => {
    const {buildings} = props;
    assert(Array.isArray(buildings), `Expecting buildings array @ "${deedName}"!`);

    const {guids, texts} = database;
    let text = '';
    for (const buildingProps of buildings) {
        assert(checkPojo(buildingProps), `Expecting building props @ "${deedName}"!`);
        const {amount} = buildingProps;
        assert(amount > 0, `Unexpected building amount @ "${deedName}"!`);
        text += amount + ' x ';

        const buildingAsset = guids[buildingProps.building?.guid];
        assert(checkPojo(buildingAsset), `Expecting a building asset @ "${deedName}!`);
        const buildingName = texts[buildingAsset.displayName?.key];
        assert(buildingName, `Unexpected building name @ "${deedName}"!`);
        text += buildingName + ', ';
    }

    text = text.replace(/, $/, '');
    assert(text, `Empty buildings text @ "${deedName}"!`);
    return text;
};

/**
 *
 */
const resolveValue = (path, props, database, deedName) => {
    const {guids, texts} = database;
    let target = props;
    const parts = path.split('.');
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part in target) {
            target = target[part];
        } else {
            // Maybe this is a redirection to another asset (designated by a guid)
            const guid = target.guid || target.good.guid;
            if (!guid) {
                assert(false, `Dead-end resolving "${path}" @ "${deedName}"!`);
                return;
            }
            if (guids[guid] === target) {
                // pointing to itself, so not another asset
                assert(false, `Cannot resolve "${path}" @ "${deedName}"!`);
                return;
            }
            target = guids[guid];
            i--; // because we're trying again for the same property, but now with a different target
            assert(target, `Invalid guid in "${path}" @ "${deedName}"!`);
        }
    }
    assert(target !== undefined, `Invalid value for "${path}" @ "${deedName}"!`);
    if (target.key) {
        target = texts[target.key];
    }
    return target;
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default resolveDescription;
