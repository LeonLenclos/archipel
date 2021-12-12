class StartInterface extends Interface {
    constructor(){
        super('start');
        this.start_popup = new PopUp();
    }

    create_content(){
      let options = assets.json.txt.language.map((option) => {
        return {
          txt:option.txt,
          callback:()=>{
            game.start(option.lang);
          }
        };
      });
      this.start_popup.open('start',options);
      this.start_popup.element.appendTo(this.container);
    }
}
