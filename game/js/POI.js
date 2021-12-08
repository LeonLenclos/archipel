class POI {
  constructor(type, seed){
    this.type = type;
    this.sprite = {
      boat:0,
      pnj:1,
      pearl:2,
    }[type]
    this.seed = seed;
    this.pot = Fdrandom.pot(this.seed);
  }

  generate_clue(island){
    let pearl = island.get_poi_by_type('pearl')[0]

    const get_cardinal_direction = ()=>{
      let size = island.map_data.size
      if (1-distance_squared(pearl.x/size, pearl.y/size)*size > 0) return 'center';
      return pos_to_direction(pearl.x, pearl.y, size, size);
    };

    const get_neighbour_pos = ()=>{
      let directions = [{x:-1,y:-1},{x:0,y:-1},{x:1,y:-1},
        {x:-1,y:0},            {x:1,y:0},
        {x:-1,y:1},{x:0,y:1},{x:1,y:1}];
        return directions.map((dir)=>{return {x:pearl.x+dir.x, y:pearl.y+dir.y}});
      };

      const get_decoration_types = (positions) =>{
        return positions.map((pos)=>island.map_data.decoration[pos.x][pos.y])
        .filter((deco)=>deco&&deco.type!=='hole');

      };

      const get_pnj_names = (positions) =>{
        return positions.map((pos)=>island.get_poi_at(pos.x, pos.y))
        .filter((poi)=>poi&&poi.seed!=this.seed&&poi.type=='pnj')
        .map((pnj)=>pnj.name);
      };

      const get_pnj_with_clue = () =>{
        let pnjs = island.get_poi_by_type('pnj');
        return pnjs.find((pnj)=>pnj.clue&&pnj.clue.name!='pnj_has_clue')
      };

      const contains_this = (positions) =>{
        return positions.find((pos)=>pos.x==this.x&&pos.y==this.y);
      }
      const contains_water = (positions) =>{
        return positions.find((pos)=>!island.map_data.landform[pos.x][pos.y]) !== undefined;
      }

      const contains_boat = (positions) =>{
        let boat = island.get_poi_by_type('boat')[0];
        return positions.find((pos)=>pos.x==boat.x&&pos.y==boat.y) !== undefined;
      }

      let clues = [
        {
          name:'near_this',
          validity_func:()=>contains_this(get_neighbour_pos()),
        },
        {
          name:'pnj_has_clue',
          validity_func:()=>get_pnj_with_clue(),
          detail_func:()=>get_pnj_with_clue().name,
        },
        {
          name:'near_pnj',
          validity_func:()=>get_pnj_names(get_neighbour_pos()).length>0,
          detail_func:()=>get_pnj_names(get_neighbour_pos())[0],
        },
        {
          name:'near_boat',
          validity_func:()=>contains_boat(get_neighbour_pos()),
        },
        {
          name:'near_water',
          validity_func:()=>contains_water(get_neighbour_pos()),
        },
        {
          name:'near_deco',
          validity_func:()=>get_decoration_types(get_neighbour_pos()).length>0,
          detail_func:()=>{
            let type = get_decoration_types(get_neighbour_pos())[0].type
            return game.t('deco', type)
          },
        },
        {
          name:'cardinal_direction',
          validity_func:()=>true,
          detail_func:()=>{
            let cardinal = get_cardinal_direction()
            return game.t('cardinal', cardinal)
          }
        },
      ];

      for (var clue of clues) {
        if(clue.validity_func()){
          let detail = clue.detail_func&&clue.detail_func();
          let trad = sprintf(game.t('pnj', 'clue', clue.name),{detail:detail});
          this.clue = {
            trad:trad,
            name:clue.name,
            detail:detail
          }
          break;
        }
      }
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
