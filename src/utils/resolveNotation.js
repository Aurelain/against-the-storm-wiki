/**
 * Also see: https://stackoverflow.com/a/6394168/844393
 */
const resolveNotation = (notation, object) => {
    const parts = notation.split('.');
    let target = object;
    for (const propName of parts) {
        if (propName in target) {
            target = target[propName];
        } else {
            return undefined;
        }
    }
    return target;
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default resolveNotation;
