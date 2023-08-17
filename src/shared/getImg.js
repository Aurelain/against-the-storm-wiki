// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const NAME_CONVERSIONS = {
    'Pack of Provisions': 'Provisions',
    Training: 'TrainingGear',
    Scroll: 'Scrolls',
    "Foragers'": 'Forager%27s_Camp_icon',
    "Trappers'": 'Trapper%27s_Camp_icon',
    "Herbalists'": 'Herbalist%27s_Camp_icon',
    Small: 'SmallFarm_icon',
    Plantation: 'Plantation_icon',
    Herb: 'HerbGarden_icon',
};
// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
const getImg = (name) => {
    const finalName = NAME_CONVERSIONS[name] || name;
    return `[[File:${finalName}.png|24px]]`;
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default getImg;