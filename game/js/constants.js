// TIME
const TICK_PER_SEC = 60;
const TURN_PER_SEC = 6;

// SIZE
const TILE_SIZE = 16;
const SCALE = 3;

// SEED
const WORLD_SEED = 2708944866

// PATH
const JSON_PATH = '../game/assets/json/%(name)s.json'
const PNG_PATH = '../game/assets/png/%(name)s.png'

// UTILS
const [NORTH,EAST,SOUTH,WEST] = [0,1,2,3];
const [PREV,NEXT,SUBMIT] = [0,1,2];

const KEYS = {
    'z':'up',
    'w':'down',
    'q':'left',
    'a':'left',
    's':'down',
    'd':'right',
    'ArrowDown':'down',
    'ArrowUp':'up',
    'ArrowLeft':'left',
    'ArrowRight':'right',
    ' ':'ok',
    'Enter':'ok',
};

const INTERACTION_KEYS = {
    'z':PREV,
    'w':PREV,
    'q':PREV,
    'a':PREV,
    's':NEXT,
    'd':NEXT,
    'ArrowDown':NEXT,
    'ArrowUp':PREV,
    'ArrowLeft':PREV,
    'ArrowRight':NEXT,
    'ArrowRight':NEXT,
    ' ':SUBMIT,
    'Enter':SUBMIT,
};
