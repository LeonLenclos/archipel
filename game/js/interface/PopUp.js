class PopUp {
  constructor(){
    this.element = $('<div>', {class:'popup'})
    this.element.hide();
  }

  open(type, options){
    this.is_open = true;
    this.selected=0;
    this.buttons = [];

    this.element.empty();

    switch (type) {
      case 'pnj': this.create_content_pnj(options); break;
      case 'boat': this.create_content_boat(options); break;
      case 'pearl': this.create_content_pearl(options); break;
      default:
      options.forEach(option => {
        let button = new Button(option.txt, option.callback, option.disabled);
        button.element.appendTo(this.element)
        this.buttons.push(button);
      });
    }

    this.element.show();

  }

  create_content_pnj(options){
    let dialog = $('<div/>')
    dialog.addClass('dialog');
    // pnj div
    let pnj = $('<div/>');
    pnj.addClass('pnj');
    let face = new FaceCanvas(options.face, options.hsl);
    face.draw();
    let name = $('<div/>')
    name.text(options.name);
    name.addClass('name');
    // txt div
    let txt = $('<div/>');
    txt.addClass('txt');
    let original = $('<div/>')
    original.text(options.txt);
    original.addClass('original');
    let trad = $('<div/>')
    trad.text(options.trad);
    trad.addClass('trad');
    // structure
    dialog.appendTo(this.element);
    pnj.appendTo(dialog);
    txt.appendTo(dialog);
    face.element.appendTo(pnj);
    name.appendTo(pnj);
    original.appendTo(txt);
    trad.appendTo(txt);
    let close_button = new Button(game.t('button', 'ok'), ()=>this.close())
    close_button.element.appendTo(this.element)
    this.buttons.push(close_button);
  }

  create_content_boat(options){
    options.forEach(option => {
      let button = new Button(option.txt, option.callback, option.disabled);
      button.element.empty();
      button.element.addClass('connection')
      let flag = new FlagCanvas(option.flag, option.hsl);
      flag.draw();
      let infos = $('<div/>').addClass('island_infos');
      let name = $('<div/>').addClass('island_name');
      name.text(option.txt);
      let visited = $('<div/>');
      if(option.visited){
        if (option.pearl_found) visited.html(game.t("gui", "pearl_found"));
        else visited.html(game.t("gui", "visited"));
      }
      else visited.html(game.t("gui", "not_visited"));
      flag.element.appendTo(button.element);
      infos.appendTo(button.element)
      button.element.appendTo(this.element)
      name.appendTo(infos);
      visited.appendTo(infos);
      this.buttons.push(button);
    });
    let close_button = new Button(game.t('button', 'cancel'), ()=>this.close())
    close_button.element.appendTo(this.element)
    this.buttons.push(close_button);
  }

  create_content_pearl(options){
    let take_button = new Button(game.t('button', 'take_pearl'), options.callback)
    take_button.element.appendTo(this.element)
    this.buttons.push(take_button);
    let close_button = new Button(game.t('button', 'leave_pearl'), ()=>this.close())
    close_button.element.appendTo(this.element)
    this.buttons.push(close_button);
  }

  close(){
    this.is_open = false;
    this.element.hide();
  }

  update_content(){
  }

}


class Button??{
  constructor(text, callback, disabled){
    this.disabled = disabled;
    this.callback = callback;
    this.element = $('<button/>', {class:'button'})
    .html(text)
    .attr("disabled",disabled);
    if(!this.disabled) {
      this.element.click(this.callback);
  }
}
}
