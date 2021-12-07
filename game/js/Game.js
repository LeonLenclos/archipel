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
    this.turn = 0;
    this.go_to_island(0);
    this.open('map');
  }

  go_to_island(index) {
    this.get_player_island().song.stop();

    let island = this.world.get_island(index);
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

  move_player(x, y) {
    this.player.direction = move_to_direction(x, y);
    if (this.world.walkable(this.player, x, y)){
      this.turn ++;
      this.player.move(x, y);
      this.player.interacting = false;
      this.get_player_island().pois.forEach(poi=>poi.interacting=false);
      let poi = this.world.player_meet_poi(this.player);
      if(poi) this.interact(poi);
    }
  }

  interact(poi){
    this.player.interacting = true;
    poi.interacting = true;
    let popup = this.interfaces.map.interaction_popup
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
          callback:()=>{
            this.go_to_island(index);
            popup.close();
          }
        };
      });
      break;
      case 'pnj':
      options = []
      break;
      default:

    }
    popup.open(poi.type, options);
  }
}
