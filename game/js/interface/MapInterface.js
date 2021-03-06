class MapInterface extends Interface {
  constructor(){
    super('map');
    this.map_canvas = new MapCanvas();
    this.interaction_popup = new PopUp();
    this.island_name = $("<div/>", {id:"island_name"});
    this.pearls_count = $("<div/>", {id:"pearls_count"});

    this.cache = {}
    this.mouse_is_down = false;
    this.mouse_x = 0;
    this.mouse_y = 0;
  }

  create_content(){
    this.map_canvas.element.appendTo(this.container);
    this.map_canvas.fit_to_screen();
    this.map_canvas.element.mousemove((e)=>{
      // let rect = this.map_canvas.element.getBoundingClientRect();
      this.mouse_x=e.clientX - this.map_canvas.element.offset().left;
      this.mouse_y=e.clientY - this.map_canvas.element.offset().top;
    });
    this.map_canvas.element.mousedown(()=>this.mouse_is_down = true);
    $(document).mouseup(()=>this.mouse_is_down = false)
    $(document).mouseout(()=>this.mouse_is_down = false);

    this.interaction_popup.element.appendTo(this.container);
    this.island_name.appendTo(this.container);
    this.pearls_count.appendTo(this.container);
  }

  update_island_name(){
    this.island_name.empty()
    let map_data = game.get_player_island().map_data
    let flag = new FlagCanvas(map_data.flag, map_data.hsl);
    flag.draw();
    flag.element.appendTo(this.island_name);
    $("<div/>").text(game.get_player_island().name)
    .appendTo(this.island_name);
  }

  update_pearl_count(){
    this.pearls_count.empty()
    let pearls_count = game.player.pearls_found.size;
    let template = game.t('gui', pearls_count>1?'pearls_count':'pearl_count');
    let pearls_outerHTML = $('<span/>').text(pearls_count)
    .addClass('pearls')
    .prop('outerHTML');
    let html = sprintf(template,{pearls:pearls_outerHTML})
    this.pearls_count.html(html)
  }

  update_content(dt){
    this.map_canvas.set_cursor();

    let island_index = game.player.island_index;
    if(this.cache.island_index != island_index){
      this.cache.island_index = island_index
      this.update_island_name()
      this.map_canvas.map_cache = null;
      this.map_canvas.bg_cache = null;
    }

    let pearls_count = game.player.pearls_found.size;
    if(this.cache.pearls_count != pearls_count){
      this.cache.pearls_count = pearls_count
      this.update_pearl_count();
    }

    if(!this.interaction_popup.is_open){
      let mouse_rel_x = this.mouse_x/window.innerWidth;
      let mouse_rel_y = this.mouse_y/window.innerHeight;
      let cursor_pos = this.map_canvas.tile_at(mouse_rel_x, mouse_rel_y);
      if(this.mouse_is_down && game.player.path.length==0){
        game.set_player_target(cursor_pos.x, cursor_pos.y);
      }
      else{
        this.map_canvas.set_cursor(cursor_pos.x, cursor_pos.y);
      }
    }




    this.map_canvas.draw();
  }

  on_resize(){
    this.map_canvas.fit_to_screen();
    this.map_canvas.bg_cache = null;
  }


}


class MapCanvas extends Canvas {

  constructor(){
    super({id:'map_canvas'})
  }

  set_cursor(x, y){
    this.cursor_x = x;
    this.cursor_y = y;
  }

  tile_at(x, y){
    return{
      x:Math.floor((x*this.width-this.offset_x)/TILE_SIZE),//-this.offset_x),
      y:Math.floor((y*this.height-this.offset_y)/TILE_SIZE)//-this.offset_y)
    }
  }

  fit_to_screen(){
    let w = Math.floor(window.innerWidth/SCALE);
    let h = Math.floor(window.innerHeight/SCALE);
    this.resize(w, h);
  }

  clear_bg(ctx){
    for (let x=-1; x<=this.width/TILE_SIZE; x++){
      for (let y=-1; y<=this.height/TILE_SIZE; y++){
        this.render_tile('landform', 0, x+.5, y+.5, ctx, true);
      }
    }
  }

  render(ctx){
    this.offset_x = 0;
    this.offset_y = 0;
    let map_data = game.get_map_data()

    if(!this.bg_cache){
      this.bg_cache = document.createElement('canvas');
      this.bg_cache.width = this.element.width();
      this.bg_cache.height = this.element.height();
      let cache_ctx = this.bg_cache.getContext('2d');
      this.set_hsl(map_data.hsl);
      this.clear_bg(cache_ctx);
      this.filters(cache_ctx);
    }

    if(!this.map_cache){
      this.map_cache = document.createElement('canvas');
      this.map_cache.width = map_data.size*TILE_SIZE;
      this.map_cache.height = map_data.size*TILE_SIZE;
      let cache_ctx = this.map_cache.getContext('2d');
      this.set_hsl(map_data.hsl);
      this.render_landform(cache_ctx, map_data.landform);
      this.render_decoration(cache_ctx, map_data.decoration);
      this.filters(cache_ctx);
    }

    ctx.drawImage(this.bg_cache, 0, 0)
    let calculated_offset_x = Math.floor(this.width/2 - game.player.x*TILE_SIZE);
    let calculated_offset_y = Math.floor(this.height/2 - game.player.y*TILE_SIZE);
    this.last_offset_x = this.last_offset_x || calculated_offset_x;
    this.last_offset_y = this.last_offset_y || calculated_offset_y;
    this.last_offset_x = lerp(this.last_offset_x, calculated_offset_x, 0.3)
    this.last_offset_y = lerp(this.last_offset_y, calculated_offset_y, 0.3)
    this.offset_x = Math.floor(this.last_offset_x)
    this.offset_y = Math.floor(this.last_offset_y)
    ctx.drawImage(this.map_cache, this.offset_x, this.offset_y)
    this.render_pois(ctx, map_data.pois);
    this.render_player(ctx, game.player);
    this.render_corner(ctx);
  }

  render_bg(ctx){
    if (this.bg_cache) {
    }
    // ctx.drawImage(this.bg_cache, x, y);
    let map_data = game.get_map_data()
  }

  render_landform(ctx, landform){
    const is_ground = (x,y) => landform[constrain(x, 0, landform.length-1)][constrain(y, 0, landform[0].length-1)]
    foreach_array2d(landform, (v, x, y)=>{
      let tile_idx = is_ground(x+1, y) * 1
      + is_ground(x, y+1) * 2
      + is_ground(x+1, y+1) * 4
      + is_ground(x, y)   * 8;
      this.render_tile('landform', tile_idx, x+.5, y+.5, ctx);
    });
  }

  render_pois(ctx, pois){
    pois.forEach((poi) => {
      let sprite = poi.sprite * 4;
      if (poi.interacting) {
        sprite += constrain(game.player.interacting_since, 1,3);
      }
      this.render_tile('poi', sprite, poi.x, poi.y, ctx);
    });
  }

  render_decoration(ctx, decoration){
    foreach_array2d(decoration, (deco, x, y)=>{
      if (deco) {
        let tile_idx = deco.line*8 + deco.variation;
        this.render_tile('deco', tile_idx, x, y, ctx);
      }
    });
  }

  render_free_for_deco(ctx, free_for_deco){
    foreach_array2d(free_for_deco, (p, x, y)=>{
      if (p) {
        this.render_tile_rect(x, y, ctx);
      }
    });
  }

  render_player(ctx, player){
    if (!player.interacting){
      this.render_tile('player', 0, player.x, player.y, ctx);
    }
    if (player.path.length>0){
      let last_step = player.path[player.path.length-1]
      this.render_tile('player', 1, last_step[0], last_step[1], ctx);
    }
    else if(this.cursor_x&&this.cursor_y){
      this.render_tile('player', 2, this.cursor_x, this.cursor_y, ctx);
    }
    player.previous_pos.forEach((pos, i) => {
      let other_pos = [player].concat(player.previous_pos.slice(i+1))
      if (!other_pos.find((p)=>pos.x == p.x && pos.y == p.y)) {
        this.render_tile('player', 3+i, pos.x, pos.y, ctx)
      }
    });

  }

  render_tile_rect(x, y, ctx){
    ctx.fillStyle = "green";
    ctx.fillRect(x*TILE_SIZE+this.offset_x+1, y*TILE_SIZE+this.offset_y+1, TILE_SIZE-2, TILE_SIZE-2);
  }

  render_tile(tileset, tile_idx, x, y, ctx, ignore_offset){
    let img = assets.png[tileset]
    let spos = pos_in_tileset(img.width, tile_idx, TILE_SIZE);

    let dx = x*TILE_SIZE;
    let dy = y*TILE_SIZE;

    if(!ignore_offset){
      dx += this.offset_x;
      dy += this.offset_y;
    }
    ctx.drawImage(img, spos.x, spos.y, TILE_SIZE, TILE_SIZE, dx, dy, TILE_SIZE, TILE_SIZE);
  }
}
