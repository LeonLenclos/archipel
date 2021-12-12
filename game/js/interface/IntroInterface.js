class IntroInterface extends Interface {
  constructor(){
    super('intro');
    this.intro_canvas = new IntroCanvas();
    this.txt = $("<div/>", {id:"intro_txt"});
    this.page_index = 0;
    this.song = new Song(0)
    this.song.start('@1m');
  }

  next(){
    this.page_index ++;
    if(this.page_index>2){
      this.song.stop('@1m');
      game.new_game();
    }
    else this.create();
  }

  create_content(){
    this.intro_canvas.element.appendTo(this.container);
    this.intro_canvas.resize(128,80)
    this.intro_canvas.render = this.intro_canvas.pages[this.page_index];

    this.txt.html(game.t('intro', this.page_index))

    this.intro_canvas.element.appendTo(this.container);
    this.txt.appendTo(this.container);
    let button = new Button('next',()=>this.next());
    button.element.appendTo(this.container);
  }

  update_content(dt){

    this.intro_canvas.draw(dt);
  }
}


class IntroCanvas extends Canvas {

  constructor(){
    super({id:'intro_canvas'})
    this.time = 0
    this.pages = [
      (ctx, dt)=>{
        this.set_hsl({hue:0.38,saturation:0.4,lightness:0.5})
        this.time += dt/1000 * 2;
        this.render_landform(ctx);
        this.render_corner(ctx);
        this.filters(ctx);
      },
      (ctx, dt)=>{
        this.set_hsl({hue:0.38,saturation:0.4,lightness:0.5})
        this.time += dt/1000 * 8;
        this.render_anim(ctx);
        this.render_corner(ctx);
        this.filters(ctx);
      },
      (ctx, dt)=>{
        this.set_hsl({hue:0.38,saturation:0.4,lightness:0.5})
        this.time += dt/1000 * 2;
        this.render_landform(ctx);
        this.render_boat(ctx);
        this.render_corner(ctx);
        this.filters(ctx);
      },
    ]
  }

get_boat_y(time){
  return Math.sin(time/4)+2
}

render_boat(ctx){
  this.render_tile('poi', 3, 3, this.get_boat_y(this.time), ctx, true);

}

  render_landform(ctx){
    noise.seed(9999);
    const noise_octave = (x, y, o, w) => w*((1+noise.simplex2(x*o,y*o))/2)
    const is_ground = (x, y)=>{
      x = x+Math.floor(this.time);

      let rx = x/16;
      let ry = y/10;
      let altitude = 0
      // noise
      // altitude += noise_octave(rx, ry, 8, 0.5)
      altitude += noise_octave(rx, ry, 2, 1)
      // altitude += noise_octave(rx, ry, 2, 0.2)
      if (y>this.get_boat_y(x-3)-0.6 && y<this.get_boat_y(x-3)+2) {
        altitude *= 0;
      }
      return altitude > 0.6;
    }

    foreach_array2d(new_array2d(16,10), (_, x, y)=>{
      let tile_idx = is_ground(x+1, y) * 1
      + is_ground(x, y+1) * 2
      + is_ground(x+1, y+1) * 4
      + is_ground(x, y)   * 8;
      this.render_tile('landform', tile_idx, x, y, ctx);
    });
  }

  render_anim(ctx){
    let frm = Math.floor(this.time%3);
    ctx.drawImage(assets.png['necklace_anim/'+frm], 0, 0);
  }

  render_tile(tileset, tile_idx, x, y, ctx, ignore_offser){
    let img = assets.png[tileset]
    let spos = pos_in_tileset(img.width, tile_idx, TILE_SIZE);

    let dx = x*TILE_SIZE;
    let dy = y*TILE_SIZE;
    if(!ignore_offser) dx-=(this.time%1)*TILE_SIZE
    // dy += this.offset_y;
    ctx.drawImage(img, spos.x, spos.y, TILE_SIZE, TILE_SIZE, Math.floor(dx), Math.floor(dy), TILE_SIZE, TILE_SIZE);
  }
}
