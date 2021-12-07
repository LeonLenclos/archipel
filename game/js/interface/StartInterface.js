class StartInterface extends Interface {
    constructor(){
        super('start');
        this.start_popup = new PopUp();
    }

    create_content(){
        let options = [{txt:'new game',callback:()=>game.new_game()}];
        this.start_popup.open('start',options);
        this.start_popup.element.appendTo(this.container);
    }
}
