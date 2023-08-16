import assert from 'assert/strict';
import resolveNotation from '../utils/resolveNotation.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
const resolveDeedDescription = (props, database) => {
    const {guids, texts} = database;
    const {m_Script, m_Name: deedName, description} = props;

    const rawText = texts[description?.key];
    console.log('-----------------------------------------');
    console.log('deedName:', deedName);
    console.log('t0:', rawText);
    assert(rawText, `Cannot find text for "${deedName}"!`);

    if (!rawText.includes('{')) {
        return rawText;
    }

    const script = guids[m_Script.guid];
    assert(script, `Cannot find script for "${deedName}"!`);

    const scriptPath = script.shortPath;
    console.log('scriptPath:', scriptPath);
    assert(script.deedNumbers, `Expecting deedNumbers in "${scriptPath}" @ "${deedName}"!`);
    console.log('script.deedNumbers:', script.deedNumbers);

    const resolvedText = rawText.replace(/\{\d}/g, (found) => {
        const nr = found.charAt(1);
        const resolvedName = script.deedNumbers[nr];
        assert(resolvedName, `Cannot resolve nr "${nr}" for "${deedName}"!`);
        if (resolvedName in props) {
            return props[resolvedName];
        }
        switch (resolvedName) {
            case 'GetDifficultyName':
                return getDifficultyName(props, deedName);
            case 'GetBuildingsText':
                return getBuildingsText(props, deedName);
            default:
                assert(resolvedName.includes('.'), `Unexpected deed variable "${resolvedName}" @ "${deedName}"!`);
                return resolveValue(resolvedName, props, database, deedName);
        }
    });

    console.log('t1:', resolvedText);
    console.log('scriptPath:', scriptPath);

    return resolvedText;
};

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
const getDifficultyName = (props) => {
    // TODO
    return '{GetDifficultyName}';
};

/**
 *
 */
const getBuildingsText = (props) => {
    // TODO
    return '{GetBuildingsText}';
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
export default resolveDeedDescription;
