class Song {
    constructor(seed){
        this.seed = seed;
        this.pot = Fdrandom.pot(this.seed);
        this.generate();
    }
    generate(){

      //Sélection de la fondamentale
      this.fondamentale = Tonal.Scale.get('c4 chromatic').notes;
      this.fondamentale = this.fondamentale.concat(Tonal.Scale.get('c5 chromatic').notes);
      this.fondamentale = this.fondamentale[this.pot.irange(0,23)];
      //Sélection de la gamme
      let gammes = ['minor', 'major', 'melodic minor', 'harmonic minor', 'enigmatic'];
      console.log(this.fondamentale);
      this.gamme = this.fondamentale+' '+this.pot.mixof(gammes)[0];
      this.gamme = Tonal.Scale.get(this.gamme).notes
      //Prolongement de la gamme à octve inférieure et supérieure
      this.gamme_oct_inf = this.gamme.map(Tonal.Note.transposeBy("P-8"));
      this.gamme_oct_sup = this.gamme.map(Tonal.Note.transposeBy("P8"));
      this.gamme = this.gamme_oct_inf.concat(this.gamme.concat(this.gamme_oct_sup));

      let motifs = [1, 1/3, 2/3, 1/3, 2/3, 1/3, 2/3, 1/3];
      this.motif = [true];
      // Mélodie des deux premières mesures
      this.melodie_1 = [this.gamme[7]];
      this.current_note_index = 7
      for (var i = 1; i < motifs.length; i++) {
        this.motif[i]= this.pot.random() < motifs[i];
        if (this.motif[i]){
          this.interval = Math.floor(this.pot.gspill(1, 5))*(this.pot.rbit()*2-1);
          this.current_note_index = this.current_note_index+this.interval;
          this.melodie_1[i]= this.gamme[this.current_note_index];
        }
        else {
          this.melodie_1[i]=0;
        }
      }

      // Mélodie des deux dernières mesures
      this.melodie_2 = [];
      for (var i = 0; i < motifs.length; i++) {
        if (this.motif[i]){
          this.interval = Math.floor(this.pot.gspill(1, 5))*(this.pot.rbit()*2-1);
          this.current_note_index = this.current_note_index + this.interval;
          this.melodie_2[i]= this.gamme[this.current_note_index];
        }
        else {
          this.melodie_2[i]=0;
        }
      }
      this.melodie = this.melodie_1.concat(this.melodie_2);

      console.log(this.tempo);
      console.log(this.fondamentale);
      console.log(this.melodie);



    }
    play(translate){
      const synth = new Tone.Synth().toDestination();
      this.seq = new Tone.Sequence((time, note) => {
        if (note){
      	synth.triggerAttackRelease(note, 0.1, time);}
      	// subdivisions are given as subarrays
      }, this.melodie);
      this.seq.start();
      Tone.Transport.start();

    }

    stop(){
      if(this.seq){
        this.seq.stop();
        Tone.Transport.stop();
      }
    }
}
