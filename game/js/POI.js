class POI {
    constructor(type, seed){
        this.type = type;
        this.sprite = {boat:0,pnj:1}[type]
        this.seed = seed;
        this.pot = Fdrandom.pot(this.island_seed);
    }

    set_pos(x, y){
      this.x = x;
      this.y = y;
    }
}
