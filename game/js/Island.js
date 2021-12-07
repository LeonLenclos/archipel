const MAX_N_CONNECTION = 4
const MAX_DISTANCE_CONNECTION = 6

class Island {
    constructor(index, seed){
        this.index = index;
        this.seed = seed;
        this.pot = Fdrandom.pot(this.seed);
        this.generate_identity();
    }

    get map_data(){
      if (!this._map_data) this.generate_terrain();
      return this._map_data;
    }

    get_all_connections(world){
      let all_connections = this.connections.slice()
      // for (var i = his.index; i >= this.index-MAX_DISTANCE_CONNECTION; i--) {
      for (var i = 1; i <= MAX_DISTANCE_CONNECTION; i++) {
        let previous_island = world.get_island(this.index-i)
        if(previous_island && previous_island.connections.includes(i)){
          all_connections.push(-i)
        }
      }
      return all_connections;
    }

    get_poi_by_type(type){
        return this.pois.filter((poi)=>poi.type==type);
    }

    get_poi_at(x, y){
        return this.pois.filter((poi)=>poi.x==x&&poi.y==y)[0];
    }

    is_walkable(x, y){
      return this.map_data.landform[x]
          && this.map_data.landform[x][y]
          && !this.map_data.decoration[x][y];
    }

    generate_identity(){
      this.pot.repot();

      // LAND
      let land_seed = this.pot.ui32();
      this.lang = new Lang(land_seed);

      // SONG
      this.song = new Song(land_seed);

      // NAME
      // let markov_name = new Markov(2,20,["abatrup", "abacrop", "crupotrap of the crap"]);
      this.name = title(this.lang.generate_word('land'));

      // CONNECTIONS
      this.connections = [1]
      // let n_connections = (min, max)=> Math.floor(Math.sqrt(this.pot.ngrad(min,max**2)));
      let n_connections = (min, max)=> Math.floor(this.pot.ngrad(min,max));
      let dist_connection = (min, max)=> Math.floor(this.pot.ngrad(min,max));
      // Créer entre 0 et 4 connections dont les distances varient entre 2 et 4
      for (var i = 0; i < n_connections(0, MAX_N_CONNECTION); i++) {
        let distance = dist_connection(2, MAX_DISTANCE_CONNECTION);
        if(!this.connections.includes(distance)){
          this.connections.push(distance);
        }
      }
      //POIS
      this.pois = []
      const new_poi = (type)=>{
        let seed = this.pot.ui32();
        let poi = new POI(type, seed);
        this.pois.push(poi);
      };
      new_poi('boat');
      new_poi('pnj');
      new_poi('pnj');


      // RARITIES
      // PNJS

    }

    generate_terrain(){
      this.pot.repot();
      const noise_octave = (x, y, o, w) => w*((1+noise.simplex2(x*o,y*o))/2)

      // HSL
      let hsl = {};
      hsl.hue = this.pot.f48();
      hsl.saturation = this.pot.gnorm(0, .5);
      hsl.lightness = this.pot.gnorm(.5, .6);

      // FLAG
      let flag = this.pot.irange(1,11);

      // SIZE
      let size = Math.floor(this.pot.gnorm(8,40)/2)*2;

      // LAND FORM
      let landform = new_array2d(size, size, false);
      noise.seed(this.seed);
      let sealevel = this.pot.gnorm(0.1,0.5)
      let weights = [this.pot.f48(),this.pot.f48(),this.pot.f48()]
      let weights_sum = weights[0]+weights[1]+weights[2]

      const distance_squared = (x, y)=> (2*x-1)**2 + (2*y-1)**2

      map_array2d(landform, (v, x, y)=>{
        let rx = x/size;
        let ry = y/size;
        let altitude = 0
        // noise
        altitude += noise_octave(rx, ry, 8, weights[0]/weights_sum)
        altitude += noise_octave(rx, ry, 4, weights[1]/weights_sum)
        altitude += noise_octave(rx, ry, 2, weights[2]/weights_sum)
        // force ext to be sea
        altitude *= (1-distance_squared(rx,ry))
        // force center to be land
        altitude += Math.max((1-distance_squared(rx,ry)*size),0);
        return altitude > sealevel;
      });

      // GET MAIN ISLAND
      let main_island = copy_array2d(landform)
      // set sea to false and land to 2
      map_array2d(main_island, (tile)=>tile?2:false);
      // set main land to true
      flood_fill(main_island, size/2, size/2, true);
      // set other land to false
      map_array2d(main_island, (tile)=>tile==2?false:tile);

      // PLACE BOAT
      let boat_y = size/2;
      let boat_x = 0
      while (!main_island[boat_x][boat_y]) {
        // delete lands that are in the way of the boat
        if(landform[boat_x][boat_y]){
          flood_fill(landform, boat_x, boat_y, false);
        }
        boat_x += 1;
      }
      this.get_poi_by_type('boat')[0].set_pos(boat_x, boat_y);
      // PLACE POIS
      this.pois.filter(poi=>poi.type!='boat').forEach(poi => {
        let places = [];
        foreach_array2d(main_island, (is_ground, x, y)=>{
          if(is_ground && !this.get_poi_at(x, y)){
            places.push([x, y]);
          }
        });
        let place = this.pot.mixof(places)[0];
        poi.set_pos(place[0], place[1]);
      });


      // FIND PATH BETWEEN POIS
      let free_for_deco = copy_array2d(landform);
      let grid = new PF.Grid(size, size);
      foreach_array2d(main_island, (is_ground, x, y)=>grid.setWalkableAt(x, y, is_ground));
      let finder = new PF.BestFirstFinder({
        heuristic: (dx, dy)=> Math.max(dx, dy)*this.pot.ngrad()
      });
      let start_x = size/2;
      let start_y = size/2;
      this.pois.forEach(poi=>{
        let path = finder.findPath(start_x, start_y, poi.x, poi.y, grid.clone());
        free_for_deco[poi.x][poi.y] = false;
        path.forEach(pos => {free_for_deco[pos[0]][pos[1]] = false;});
        start_x = poi.x;
        start_y = poi.y;
      });

      // PLACE DECORATION
      let decoration_map = new_array2d(size, size);
      let decoration_density = this.pot.gnorm(0,1.5);
      while(decoration_density > 0.05){
        let element = this.pot.mixof(assets.json.deco)[0];
        let element_density = this.pot.gnorm(0, decoration_density);
        let element_seed = this.pot.ui32();
        let element_count = 0;
        noise.seed(element_seed);
        decoration_density -= element_density;
        map_array2d(decoration_map, (v, x, y)=>{
          if(free_for_deco[x][y]){
            let rx = x/size;
            let ry = y/size;
            let decorate = 0
            decorate += noise_octave(rx, ry, 8, 0.7)
            decorate += noise_octave(rx, ry, 2, 0.4)
            if(decorate > 1-element_density){
              element_count++;
              let variation = Math.floor(this.pot.ngrad(0,9));
              return {line:element.line, variation:variation};
            }
            return v;
          }
        });

      }


      this._map_data = {
        size:size,
        flag:flag,
        landform:landform,
        main_island:main_island,
        pois:this.pois,
        decoration:decoration_map,
        free_for_deco:free_for_deco,
        hsl:hsl,

      };
    }




}
