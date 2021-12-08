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
      this.previous_pos=[]
    }


    move(x, y){
      this.previous_pos.push({x:this.x,y:this.y})
      this.x += x;
      this.y += y;
    }

}
