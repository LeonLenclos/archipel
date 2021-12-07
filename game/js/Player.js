/**********************************************************************
This file defines Player
**********************************************************************/


class Player {
    constructor(){
      this.x = 50;
      this.y = 50;
      this.island_index=0;
      this.path = [];
    }

    move(x, y){
      this.x += x;
      this.y += y;
    }

}
