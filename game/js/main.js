// MAIN SCRIPT
"use strict";
$.ajaxSetup({cache: false});

let assets, game;

$(()=>{
    assets = new Assets(()=>{
        game = new Game();
    });
});


// DEV CHEAT CODE

const next = ()=>game.go_to_island(game.player.island_index+1);
