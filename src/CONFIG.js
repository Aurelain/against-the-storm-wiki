import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/**
 * The wiki url, pointing to /api.php
 */
export const ENDPOINT = 'https://hoodedhorse.com/wiki/Against_the_Storm/api.php';

/**
 * A file name (in the local OS file system) cannot contain some special characters, so we replace them.
 * Besides those, we're also replacing SPACE with UNDERSCORE.
 */
export const REPLACEMENTS = {
    '\\': '%5C',
    '/': '%2F',
    ':': '%3A',
    '*': '%2A', // Doesn't get encoded by `encodeURIComponent()`
    '?': '%3F',
    '"': '%22',
    '<': '%3C',
    '>': '%3E',
    '|': '%7C',
    ' ': '_', // Special treatment
};

/**
 * Installation directory, which should directly contain the Unity files.
 */
export const GAME_DIR = 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Against the Storm\\Against the Storm_Data';

/**
 * Directory where we store the downloaded pages.
 */
export const WIKI_DIR = __dirname + '../input/wiki';

/**
 * Directory where we store assets extracted (data-mined) from the game.
 */
export const DATAMINE_DIR = __dirname + '../input/game';

/**
 * Directory where we store the proposed wiki pages (which contain our suggestions).
 */
export const OUTPUT_DIR = __dirname + '../output';

/**
 * How many results the MediaWiki API should return for one request.
 */
export const API_LIMIT = 50;

// The names of the props that distinguish the Deed Reward type:
export const REWARD_BUILDING = 'building';
export const REWARD_TRADER = 'trader';
export const REWARD_EFFECT = 'effect';
export const REWARD_AMOUNT = 'amount';
export const REWARD_GOOD = 'good';
export const REWARD_PROPS = [REWARD_BUILDING, REWARD_TRADER, REWARD_EFFECT, REWARD_AMOUNT, REWARD_GOOD];

// The names (i.e. m_Name) of the assets that describe the currency:
export const CURRENCY_FOOD = 'Food Stockpiles';
export const CURRENCY_MACHINERY = 'Machinery';
export const CURRENCY_ARTIFACT = 'Artifacts';

/**
 * A flag for verbosity.
 */
export const DEBUG = true;
