class MapInterface extends Interface {
    constructor(){
        super('map');
        this.map_canvas = new MapCanvas();
        this.interaction_popup = new PopUp();

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
        // this.devbox.element.appendTo(this.container);
    }

    update_content(){
        if(!this.interaction_popup.is_open && this.mouse_is_down){
          let x = this.mouse_x/this.map_canvas.ctx.canvas.clientWidth
          let y = this.mouse_y/this.map_canvas.ctx.canvas.clientHeight
          let pos = this.map_canvas.tile_at(x, y)
          game.set_player_target(pos.x, pos.y)
        }
        this.map_canvas.draw();
    }

    on_resize(){
      this.map_canvas.fit_to_screen();
    }

    on_ok(){
      if (this.interaction_popup.is_open) this.interaction_popup.on_ok();
    }

    on_up(){
      if (this.interaction_popup.is_open) this.interaction_popup.on_up();
      else game.move_player(0, -1)
    }

    on_down(){
      if (this.interaction_popup.is_open) this.interaction_popup.on_down();
      else game.move_player(0, 1)
    }

    on_left(){
      if (this.interaction_popup.is_open) this.interaction_popup.on_left();
      else game.move_player(-1, 0)
    }

    on_right(){
      if (this.interaction_popup.is_open) this.interaction_popup.on_right();
      else game.move_player(1, 0)
    }
}


class MapCanvas extends Canvas {

    constructor(){
      super({id:'map_canvas'})
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
        this.clear_bg(ctx);
        this.offset_x = Math.floor(this.width/2 - game.player.x*TILE_SIZE);
        this.offset_y = Math.floor(this.height/2 - game.player.y*TILE_SIZE);
        let map_data = game.get_map_data()
        this.set_hsl(map_data.hsl);
        this.render_landform(ctx, map_data.landform);
        this.render_decoration(ctx, map_data.decoration);
        this.render_pois(ctx, map_data.pois);
        this.render_player(ctx, game.player);
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
        let sprite = poi.sprite;
        if (poi.interacting) {
          sprite += 2;
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
