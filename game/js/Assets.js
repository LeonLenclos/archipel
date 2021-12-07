// cf https://stackoverflow.com/questions/14465177/multiple-ajax-calls-wait-for-last-one-to-load-then-execute

class Assets {

    constructor(call_back){
        this.asyncs = [];
        this.png = {};
        this.json = {};

        this.add_json('assets')
        .done((json)=>{this.load(json, call_back)})
    }

    load(list, call_back){
        list.png.forEach((png_name)=>{this.add_png(png_name)});
        list.json.forEach((json_name)=>{this.add_json(json_name)});
        this.when_finished(()=>{
            call_back();
        });
    }

    add_json(name){
        let url = sprintf(JSON_PATH, {name:name});
        let async = $.ajax({
            url:url,
            dataType: "json",
            async: true,

        })
        .done((data)=>{
            this.json[name] = data
        })
        .fail((jqXHR, textStatus, errorThrown)=>{
            console.log(sprintf("ERROR !! (loading : %(url)s)", {url:url}));
            console.log(textStatus, errorThrown)
        });
        this.asyncs.push(async);
        return async;
    }


    add_png(name) {
      let url = sprintf(PNG_PATH, {name:name});
        this.png[name] = $("<img />", {src:url})[0];
    }

    when_json_finished(call_back){
        $.when.apply($, this.asyncs)
        .then(call_back);
    }

    when_png_finished(call_back){
        let image_count = Object.keys(this.png).length;
        if(image_count == 0){
          call_back();
          return;
        }
        let images_loaded = 0;
        for(let key in this.png){
            this.png[key].onload = ()=>{
                images_loaded++;

                if(images_loaded == image_count){
                    call_back();
                }
            }
        }
    }

    when_finished(call_back){
        this.when_png_finished(()=>{
            this.when_json_finished(call_back);
        })
    }
}
