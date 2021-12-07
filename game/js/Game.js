class Game {
  constructor(){
    // Interface
    this.interfaces = {
      'start' : new StartInterface(),
      'map' : new MapInterface(),
    };
    this.element = $('#game');

    // Handle keys
    this.pressed = [];
    $(document).keydown((e)=>{this.onkey(e)});
    $(document).keyup((e)=>{this.onkey(e, true)});

    // Start
    this.open('start');
    setInterval(()=>this.update(), 1000/TICK_PER_SEC);
  }


  onkey(ev, keyup) {
    if (ev.key in KEYS) {
      if(keyup) this.pressed = this.pressed.filter(k=>k!=KEYS[ev.key]);
      else if(!this.pressed.includes(KEYS[ev.key])){
        this.pressed.unshift(KEYS[ev.key]);
      }
      ev.preventDefault();
    }
  }

  request_turn(callback){
    // if busy return false, else return true and get busy for some ms
    if(this.busy) return false;
    this.busy = true;
    setTimeout(()=>{
      this.busy=false;
      callback && callback();
    }, 1000/TURN_PER_SEC);
    return true;
  }

  update() {
    //input
    if(this.pressed[0]){
      this.get_interface().input(this.pressed[0]);
    }

    if (this.player && this.player.path.length>0) {
      this.request_turn(()=>{
        if (this.player && this.player.path.length>0) {
          let step = this.player.path.shift();
          this.move_player(step[0]-this.player.x, step[1]-this.player.y, true);
        }
      })
    }

    //update interface
    this.get_interface().update();
  }

  get_interface(){
    return this.interfaces[this.active_interface];
  }

  get_map_data(){
    let island = this.get_player_island();
    return island.map_data;
  }

  get_player_island() {
    return this.world.get_island(this.player.island_index);
  }

  new_game(){
    // init and start a new game
    this.world = new World(WORLD_SEED);
    this.player = new Player();
    this.go_to_island(0);
    this.open('map');
  }

  go_to_island(index) {
    this.get_player_island().song.stop();

    let island = this.world.get_island(index);
    island.visited = true;
    this.player.island_index = index;
    this.player.x = island.map_data.size/2
    this.player.y = island.map_data.size/2
    this.move_player(0,0);

    island.song.play();
  }

  open(interface_id){
    this.active_interface = interface_id;
    this.get_interface().create();
  }

  set_player_target(x, y){
    let island = this.get_player_island()
    let p = this.player;
    if(p.path.length>0 && p.path[p.path.length-1][0]==x && p.path[p.path.length-1][1]==y){
      return;
    }
    let grid = new PF.Grid(island.map_data.size, island.map_data.size);
    foreach_array2d(island.map_data.main_island, (v, x, y)=>{
      grid.setWalkableAt(x, y, island.is_walkable(x, y));
    });
    let finder = new PF.AStarFinder();
    p.path = finder.findPath(p.x, p.y, x, y, grid);
    p.path.shift();
  }

  move_player(x, y, auto) {
    if(!auto) this.player.path = [];
    if (this.world.player_can_move(this.player, x, y)){
      this.player.move(x, y);
      this.close_interaction();
      let poi = this.world.player_meet_poi(this.player);
      if(poi) this.interact(poi);
    }
  }

  close_interaction(){
    this.player.interacting = false;
    this.get_player_island().pois.forEach(poi=>poi.interacting=false);
    this.interfaces.map.interaction_popup.close();
  }

  interact(poi){
    this.player.interacting = true;
    poi.interacting = true;
    let options = []
    switch (poi.type) {
      case 'boat':
        let connections = this.get_player_island().get_all_connections(this.world);
        options = connections.map((connection)=>{
          let index = this.player.island_index + connection;
          let island = this.world.get_island(index);
          return {
            index:index,
            txt:island.name,
            flag:island.visited?island.map_data.flag:0,
            hsl:island.map_data.hsl,
            callback:()=>{
              this.go_to_island(index);
              this.close_interaction();
            }
          };
        });
        break;
      case 'pnj':
        options = {
          txt:this.get_player_island().lang.talk(50,100),
          face:poi.face,
          hsl:this.get_map_data().hsl,
        };
      break;
    }
    this.interfaces.map.interaction_popup.open(poi.type, options);
  }
}
