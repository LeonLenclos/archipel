class Game {
  constructor(){
    // Random
    this.pot = Fdrandom.pot()

    // Interface
    this.lang = 'en'
    this.interfaces = {
      'start' : new StartInterface(),
      'intro' : new IntroInterface(),
      'map' : new MapInterface(),
    };
    this.element = $('#game');
    // Start
    this.open('start');

    this.turn_countdown = 0.0
    this.last_timestamp = 0;
    const main_loop = (timestamp)=>{
        if (this.last_timestamp) {
          this.update(timestamp-this.last_timestamp);
        }
        this.last_timestamp = timestamp
        window.requestAnimationFrame(main_loop)
    }
    this.last_time = 0
    main_loop();
  }


  start(lang){
    this.lang = lang;
    // Music
    if(!OFFLINE) Tone.Transport.start();
    this.open('intro');
  }
  turn_update(dt){
    this.turn_countdown = 1000/TURN_PER_SEC
    this.player && this.player.turn_update();
  }

  update(dt) {
    this.turn_countdown -= dt;
    if(this.turn_countdown <= 0) this.turn_update(-this.turn_countdown);
    this.get_interface().update(dt);
  }

  t(){
      let args = Array.prototype.slice.call(arguments);
      let choices = args.reduce((p,c)=>{
        return p[c]
      }, assets.json.txt);
      return this.pot.mixof(choices[this.lang])[0]
  }

  get_song(){
    let island = this.get_player_island();
    if(island && !OFFLINE) return island.song
  }

  get_interface(){
    return this.interfaces[this.active_interface];
  }

  get_map_data(){
    return this.get_player_island().map_data;
  }

  get_player_island() {
    if(this.world) return this.world.get_island(this.player.island_index);
  }

  new_game(){
    // init and start a new game
    this.world = new World(WORLD_SEED);
    this.player = new Player();
    this.go_to_island(0);
    this.open('map');
  }

  go_to_island(index) {
    this.get_song() && this.get_song().stop('@1m');
    let island = this.world.get_island(index);
    this.player.visited_islands.add(index);
    this.player.island_index = index;
    this.player.x = island.map_data.size/2
    this.player.y = island.map_data.size/2
    this.move_player(0,0);
    this.get_song() && this.get_song().start('@1m');

  }

  open(interface_id){
    this.active_interface = interface_id;
    this.get_interface().create();
  }

  set_player_target(x, y){
    let island = this.get_player_island()
    let p = this.player;
    // if(p.path.length>0 && p.path[p.path.length-1][0]==x && p.path[p.path.length-1][1]==y){
    //   return;
    // }
    let grid = new PF.Grid(island.map_data.size, island.map_data.size);
    foreach_array2d(island.map_data.main_island, (v, x, y)=>{
      grid.setWalkableAt(x, y, island.is_walkable(x, y));
    });
    let finder = new PF.AStarFinder();
    p.path = finder.findPath(p.x, p.y, x, y, grid);
    p.path.shift();
  }

  move_player(x, y, auto) {
    // if(!auto) this.player.path = [];
    if (this.world.player_can_move(this.player, x, y)){
      this.player.move(x, y);
      this.close_interaction();
      let poi = this.world.player_meet_poi(this.player);

      if(poi){
        if(poi.type=='pearl'&&this.player.pearls_found.has(this.player.island_index)){
          return;
        } else{
          this.interact(poi);
        }
      }
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
            flag:island.map_data.flag,
            hsl:island.map_data.hsl,
            visited:this.player.visited_islands.has(index),
            pearl_found:this.player.pearls_found.has(index),
            callback:()=>{
              this.go_to_island(index);
              this.close_interaction();
            }
          };
        });
        break;

        case 'pnj':
          let trad = '';
          if (this.player.pearls_found.has(this.player.island_index)) {
            trad = this.t('pnj','casual');
          } else {
            trad = poi.clue.trad;
          }
          options = {
            trad:trad,
            txt:this.get_player_island().lang.translate(trad),
            name:poi.name,
            face:poi.face,
            hsl:this.get_map_data().hsl,
          };
        break;

        case 'pearl':

          options = {
            callback:()=>{
              this.player.pearls_found.add(this.player.island_index);
              this.close_interaction();
            },
            hsl:this.get_map_data().hsl,
          };
        break;
    }
    this.interfaces.map.interaction_popup.open(poi.type, options);
  }
}
