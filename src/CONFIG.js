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
export const WIKI = __dirname + '/../input/wiki';

/**
 * Directory where we store assets extracted (data-mined) from the game.
 */
export const GAME = __dirname + '/../input/game';

/**
 * A flag for verbosity.
 */
export const DEBUG = true;