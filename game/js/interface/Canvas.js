class Canvas {
    constructor(element_prop){
        this.element = $('<canvas>', element_prop);
        this.ctx = this.element[0].getContext("2d");
        this.hsl = {hue:0,saturation:0,lightness:0};
    }

    resize(w, h){
      this.width = w;
      this.height = h;
      this.ctx.canvas.width = this.width*SCALE;
      this.ctx.canvas.height = this.height*SCALE;

    }


    set_hsl(hsl){
      this.hsl = hsl;
    }

    draw(){
        this.render && this.render(this.ctx);
        this.filters(this.ctx);
        this.ctx.canvas.style.transformOrigin = '0 0'; //SCALE from top left
        this.ctx.canvas.style.transform = sprintf('scale(%(scale)s)', {scale:SCALE});
    }




    filters(ctx){
      let img = ctx.getImageData(0,0,this.width,this.height);
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
    console.log(img, this.motif, spos)
    ctx.drawImage(img, spos.x, spos.y, this.width, this.height, 0, 0, this.width, this.height);
  }
}
