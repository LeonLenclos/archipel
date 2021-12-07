class Lang {
    constructor(seed){
        this.seed = seed;
        this.pot = Fdrandom.pot(this.seed);
        let n_vowels = this.pot.irange(0, 10);
        this.vowels = this.pot.mixof(assets.json.lang.phonemes.vowels, [], n_vowels);
        let n_consonants = this.pot.irange(1, 20);
        this.consonants = this.pot.mixof(assets.json.lang.phonemes.consonants, [], n_consonants);
        this.probs = {
          starts_with_vowels:this.pot.f48(),
          ends_with_vowels:this.pot.f48(),
          min_phonemes:this.pot.irange(1,3),
          max_phonemes:this.pot.irange(4,10)
        }
    }

    generate_word(translate){
      this.pot.repot();
      translate = translate || this.pot.random();
      let word_seed = {lang:this.seed, translate:translate};
      let pot = Fdrandom.pot(word_seed);

      let n_phonemes = pot.irange(this.probs.min_phonemes, this.probs.max_phonemes);
      let phoneme_is_vowel = pot.f48()<this.probs.starts_with_vowels;
      let ends_with_vowel = pot.f48()<this.probs.ends_with_vowels;
      let phonemes= [];
      while(n_phonemes > 0 || phoneme_is_vowel != ends_with_vowel){
        if(phoneme_is_vowel) phonemes=phonemes.concat(this.pot.mixof(this.vowels));
        else phonemes=phonemes.concat(this.pot.mixof(this.consonants));
        phoneme_is_vowel = !phoneme_is_vowel;
        n_phonemes --;
      }
      return phonemes.join('');
    }
}
