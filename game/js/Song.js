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
    this.gamme = this.fondamentale+' '+this.pot.mixof(gammes)[0];
    this.gamme = Tonal.Scale.get(this.gamme).notes;
    //Prolongement de la gamme à octve inférieure et supérieure
    this.gamme_oct_inf = this.gamme.map(Tonal.Note.transposeBy("P-8"));
    this.gamme_oct_sup = this.gamme.map(Tonal.Note.transposeBy("P8"));
    this.gamme = this.gamme_oct_inf.concat(this.gamme.concat(this.gamme_oct_sup));

    // Motif de la mélodie
    let motifs = [1, 1/3, 2/3, 1/3, 2/3, 1/3, 2/3, 1/3];
    // Initialisation de la mélodie à la fondamentale
    this.motif = [true];
    this.melodie_1 = [7];
    this.current_note_index = 7

    // Mélodie des deux premières mesures
    for (var i = 1; i < motifs.length; i++) {
      this.motif[i]= this.pot.random() < motifs[i];
      if (this.motif[i]){
        this.interval = Math.floor(this.pot.gspill(1, 5))*(this.pot.rbit()*2-1);
        this.current_note_index = this.current_note_index+this.interval;
        this.current_note_index = constrain(this.current_note_index, 0, 20)
        this.melodie_1[i]= this.current_note_index;
      }
      else {
        this.melodie_1[i]=null;
      }
    }

    // Mélodie des deux dernières mesures
    this.melodie_2 = [];
    for (var i = 0; i < motifs.length; i++) {
      if (this.motif[i]){
        this.interval = Math.floor(this.pot.gspill(1, 5))*(this.pot.rbit()*2-1);
        this.current_note_index = this.current_note_index + this.interval;
        this.current_note_index = constrain(this.current_note_index, -7, 14)
        this.melodie_2[i]= this.current_note_index;
      }
      else {
        this.melodie_2[i]=null;
      }
    }

    this.melodie = this.melodie_1.concat(this.melodie_2);
    this.melodie_note = []
    for (var i = 0; i < this.melodie.length; i++) {
      if (this.melodie[i]){
        this.melodie_note[i] = this.gamme[this.melodie[i]]
      }
      else {
        this.melodie_note[i] = null;
      }
    }

    // ACCORDS
    this.motif_chords = [1,,,,1/3,,,,2/3,,,,1/3,,,1/6,];
    this.chords =[]

    for (var i = 0; i < this.motif_chords.length; i++) {
      this.motif_chords[i]= this.pot.random() < this.motif_chords[i];
      if (this.motif_chords[i] && this.melodie[i]){
        this.chords[i] = [this.gamme[this.melodie[i]],this.gamme[this.melodie[i]+2],this.gamme[this.melodie[i]+4]]
        if (Tonal.Note.octave(this.chords[i][2]) > 4) {
          this.chords[i] = this.chords[i].map(Tonal.Note.transposeBy("-8P"))
        }
      }
      else {
        this.chords[i]= null;
      }
    }


//Sequence qui combine notes de la mélodie et accords
  this.sequence = [];
  for (var i = 0; i < this.melodie.length; i++) {
    this.sequence[i] = {
      note:this.melodie_note[i],
      voice: this.chords[i],
    }
  }
}



  play(translate){
    const synth = new Tone.Synth().toDestination();
    //Diminution du volume des accords
    const vol = new Tone.Volume(-5).toDestination();
    const synth_chords = new Tone.PolySynth().connect(vol);
    //
    this.seq = new Tone.Sequence((time, step) => {
      if (step.note != 0){
        synth.triggerAttackRelease(step.note, '4n', time);
        if (step.voice != 0)
          {synth_chords.triggerAttackRelease(step.voice, '2n', time);}

      }
    }, this.sequence)

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
