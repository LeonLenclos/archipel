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
      options.forEach(option => {
        let button = new Button(option.txt, option.callback, option.disabled);
        button.element.appendTo(this.element)
        this.buttons.push(button);
      });
      let close_button = new Button('QUIT', ()=>this.close())
      close_button.element.appendTo(this.element)
      this.buttons.push(close_button);
      this.element.show();
    }

    close(){
      this.is_open = false;
      this.element.hide();
    }

    update_content(){
    }


    move_selection(n){
        this.selected = constrain(this.selected+n, 0, this.buttons.length-1);
        this.update_selection();
    }

    update_selection(){
        this.buttons.forEach((o, i)=>o.select(i == this.selected));
    }

    on_down(){
        this.move_selection(+1);
    }

    on_up(){
        this.move_selection(-1);
    }

    on_left(){
        this.move_selection(-1);
    }

    on_down(){
        this.move_selection(-1);
    }

    on_ok(){
      let button = this.buttons[this.selected]
        if(!button.disabled)
            button.callback();
    }
}


class Button {
    constructor(text, callback, disabled){
        this.disabled = disabled;
        this.callback = callback;
        this.element = $('<button/>', {class:'button'})
        .html(text)
        .attr("disabled",disabled);
        if(!this.disabled) {
            this.element.click(()=>{
                if(game.request_turn()) this.callback();
            }
            );
        }
    }

    select(selected){
        if (selected) this.element.addClass('selected');
        else this.element.removeClass('selected');
    }
}
