class Song {
  constructor(seed){
    this.seed = seed;
    this.pot = Fdrandom.pot(this.seed);

    // Init synth
    this.synth = new Tone.Synth().toDestination();
    //Diminution du volume des accords
    let chords_volume = new Tone.Volume(-5).toDestination();
    this.synth_chords = new Tone.PolySynth().connect(chords_volume);

    // Generate the song
    this.generate();
  }

  // Take a note index and return the note according to this.scale
  note_index_to_note(index){
    if(index != null) return this.scale[index];
    else return null;
  }


  // generate a pattern from a probability array
  generate_pattern(probabilities){
    return probabilities.map((prob)=> this.pot.random() < prob);
  }

  // generate an array of note index from a pattern, a min and a max
  generate_melody(pattern, min_index, max_index){
    // Set the first note to the fundamental if it is not already set to another note
    this.next_note_index = this.next_note_index || 7;
    return pattern.map((step)=>{
      if(step){
        let current_note_index = this.next_note_index;
        let next_interval = Math.floor(this.pot.gspill(1, 5))*(this.pot.rbit()*2-1);
        this.next_note_index += next_interval;
        this.next_note_index = constrain(this.next_note_index, min_index, max_index);
        return current_note_index;
      } else {
        return null;
      }
    });
  }

  // generate an array of chords from a pattern and a melody
  generate_chords(pattern, melody){
    return pattern.map((step, i)=>{
      if (step && melody[i]){
        let chord = [
          this.scale[melody[i]],
          this.scale[melody[i]+2],
          this.scale[melody[i]+4]
        ];
        if (Tonal.Note.octave(chord[2]) > 4) {
          chord = chord.map(Tonal.Note.transposeBy("-8P"));
        }
        return chord;
      }
      else {
        return null;
      }
    });
  }

  // generate the song
  generate(){

    //Fundamental selection
    let c4_chromatic = Tonal.Scale.get('c4 chromatic').notes;
    let c5_chromatic = Tonal.Scale.get('c5 chromatic').notes
    let possible_fundamentals = c4_chromatic.concat(c5_chromatic)
    this.fundamental = this.pot.mixof(possible_fundamentals)[0];

    //Scale selection
    let possible_scale_types = ['minor', 'major', 'melodic minor', 'harmonic minor', 'enigmatic'];
    let scale_type = this.pot.mixof(possible_scale_types)[0]
    let scale_name = this.fundamental + ' ' + scale_type;
    this.scale = Tonal.Scale.get(scale_name).notes;

    //Prolongement de la gamme à octve inférieure et supérieure
    let oct_inf = this.scale.map(Tonal.Note.transposeBy("P-8"));
    let oct_sup = this.scale.map(Tonal.Note.transposeBy("P8"));
    this.scale = oct_inf.concat(this.scale.concat(oct_sup));

    // Pattern
    let pattern_probabilities = [1, 1/3, 2/3, 1/3, 4/5, 1/3, 2/3, 1/3];

    let pattern = this.generate_pattern(pattern_probabilities);

    // Melody
    let melody_A = this.generate_melody(pattern, 0, 20);
    let melody_B = this.generate_melody(pattern, -7, 14);

    // CHORDS
    let chords_pattern_probabilities_A = [1,,,,1/3,,,,];
    let chords_pattern_probabilities_B = [2/3,,,,1/3,,,1/6,];
    let chords_pattern_A = this.generate_pattern(chords_pattern_probabilities_A);
    let chords_pattern_B = this.generate_pattern(chords_pattern_probabilities_B);
    let chords_A = this.generate_chords(chords_pattern_A, melody_A);
    let chords_B = this.generate_chords(chords_pattern_B, melody_B);

    // Sequence qui combine notes de la mélodie et accords
    this.melody = [].concat(melody_A, melody_B)
    this.chords = [].concat(chords_A, chords_B);

    let notes = this.melody.map((index)=>this.note_index_to_note(index))

    this.sequence = this.melody.map((step, i)=>{
      return {
        note:notes[i],
        voice:this.chords[i]
      }
    });

    this.tone_sequence = new Tone.Sequence((time, step) => {
      if (step.note != null){
        this.synth.triggerAttackRelease(step.note, '4n', time);
      }
      if (step.voice != null){
        this.synth_chords.triggerAttackRelease(step.voice, '2n', time);
      }
    }, this.sequence)

  }

  // play the song
  play(){
    this.tone_sequence.start();
  }

  // stop the song
  stop(){
    this.tone_sequence.stop();
  }

}
