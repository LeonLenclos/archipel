class Canvas {
    constructor(element_prop){
        this.element = $('<canvas>', element_prop);
        this.frame = $('<div>', {class:'canvas_frame'});
        this.frame.appendTo(this.element);
        this.ctx = this.element[0].getContext("2d");
        this.hsl = {hue:0,saturation:0,lightness:0};
    }

    resize(w, h){
      this.width = w;
      this.height = h;
      this.ctx.canvas.width = this.width;
      this.ctx.canvas.height = this.height;
    }


    set_hsl(hsl){
      this.hsl = hsl;
    }

    draw(dt){
        this.render && this.render(this.ctx, dt);
    }

    render_corner(ctx){
      let img = assets.png.corner;
      ctx.drawImage(img, 0, 5, 5, 5, 0, this.height-5, 5, 5);
      ctx.drawImage(img, 0, 0, 5, 5, 0, 0, 5, 5);
      ctx.drawImage(img, 5, 0, 5, 5, this.width-5, 0, 5, 5);
      ctx.drawImage(img, 5, 5, 5, 5, this.width-5, this.height-5, 5, 5);

    }

    filters(ctx){
      let img = ctx.getImageData(0,0,ctx.canvas.width,ctx.canvas.height);
      let hue = map_value(this.hsl.hue, 0,1,-180,180);
      let saturation = map_value(this.hsl.saturation, 0,1,-100,100);
      let lightness = map_value(this.hsl.lightness, 0,1,-100,100);
      img = ImageFilters.HSLAdjustment (img, hue, saturation, lightness);
      // img = ImageFilters.Oil (img, 2, 100)
      ctx.putImageData(img, 0, 0);
    }
}

class FlagCanvas extends Canvas {
  constructor(motif, hsl){
    super();
    this.motif=motif
    this.resize(24, 16);
    this.set_hsl(hsl)
  }

  render(ctx){
    let img = assets.png.flag;
    let spos = pos_in_tileset(img.width, this.motif, this.width, this.height);
    ctx.drawImage(img, spos.x, spos.y, this.width, this.height, 0, 0, this.width, this.height);
    this.filters(ctx);
  }
}

class FaceCanvas extends Canvas {
  constructor(face, hsl){
    super();
    this.face=face
    this.resize(TILE_SIZE, TILE_SIZE);
    this.set_hsl(hsl)
  }

  render(ctx){
    let img = assets.png.face;
    this.face.forEach((value, i) => {
      ctx.drawImage(img, value*TILE_SIZE, i*TILE_SIZE, TILE_SIZE, TILE_SIZE, 0, 0, TILE_SIZE, TILE_SIZE);
    });
    this.filters(ctx);
  }
}
