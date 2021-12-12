/**********************************************************************
This file defines Player
**********************************************************************/


class Player {
  constructor(){
    this.x = 50;
    this.y = 50;
    this.island_index=0;
    this.visited_islands = new Set();
    this.pearls_found = new Set();
    this.path = [];
    this.previous_pos=[];
    this.interacting_since = 0;
  }


  turn_update(){
    this.previous_pos.push({x:this.x,y:this.y});
    if(this.previous_pos.length>3) this.previous_pos.shift();


    if(this.path.length>0){
      let step = this.path.shift();
      let x = step[0]-this.x;
      let y = step[1]-this.y;
      if (game.world.player_can_move(this, x, y)){
        this.move(x, y);
        game.close_interaction();
        let poi = game.world.player_meet_poi(this);

        if(poi){
          if(poi.type=='pearl'&&this.pearls_found.has(this.island_index)){

          } else{
            game.interact(poi);
          }
        }
      }
    }

    if(this.interacting) this.interacting_since++;
    else this.interacting_since = 0;

  }


  move(x, y){

    this.x += x;
    this.y += y;
  }

}
