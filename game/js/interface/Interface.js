class Interface {
    constructor(interface_id){
        this.id = interface_id;
        this.busy = false;
        $(window).resize(()=> this.on_resize && this.on_resize());
    }

    create(){
        $('#game').empty();
        this.container = $('<div>');
        this.container.attr('id', this.id);
        this.container.addClass('interface');
        this.container.appendTo($('#game'));
        this.create_content();

    }

    input(action){
        if(this['on_'+action] && game.request_turn()){
            this['on_'+action]();
        }
    }

    update(){
        this.update_content && this.update_content();
    }
}
