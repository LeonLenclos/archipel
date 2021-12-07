class POI {
    constructor(type, seed){
        this.type = type;
        this.sprite = {boat:0,pnj:1}[type]
        this.seed = seed;
        this.pot = Fdrandom.pot(this.seed);
    }

    get face(){
        this.pot.repot();
        return Array.from({length:4}, ()=>this.pot.irange(0,9));
    }

    set_pos(x, y){
      this.x = x;
      this.y = y;
    }
}
