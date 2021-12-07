/**********************************************************************
This file defines World
**********************************************************************/


class World {
    constructor(seed){
        this.seed = seed;
        this.pot = Fdrandom.pot(this.seed);
        this.islands = []
    }

    get_island(index){
      if(index < 0) return undefined;
      let island = this.islands[index];
      if (island === undefined) {
        this.pot.repot()
        for (var i = 0; i < index; i++) {
          this.pot.ui32()
        }
        let island_seed = this.pot.ui32();
        island = new Island(index, island_seed);
        this.islands[index] = island;
      }
      return island
    }

    player_meet_poi(player){
      let island = this.get_island(player.island_index);
      return island.get_poi_at(player.x, player.y);
    }

    player_can_move(player, x, y){
      let island = this.get_island(player.island_index);
      let target_x = player.x + x;
      let target_y = player.y + y;
      return island.is_walkable(target_x, target_y);
    }

}
