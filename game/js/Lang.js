class Lang {
    constructor(seed){
        this.seed = seed;
        this.pot = Fdrandom.pot(this.seed);
        let n_vowels = this.pot.irange(0, 5);
        this.vowels = this.pot.mixof(assets.json.lang.phonemes.vowels, [], n_vowels);
        let n_consonants = this.pot.irange(1, 8);
        this.consonants = this.pot.mixof(assets.json.lang.phonemes.consonants, [], n_consonants);
        this.probs = {
          starts_with_vowels:this.pot.f48(),
          ends_with_vowels:this.pot.f48(),
          min_phonemes:this.pot.irange(1,2),
          max_phonemes:this.pot.irange(4,7)
        }
        this.proper_nouns = new Set();
    }

    generate_proper_noun(seed){
      let proper_noun = title(this.generate_word(seed));
      this.proper_nouns.add(proper_noun);
      return proper_noun;
    }

    generate_word(seed){
      // this.pot.repot();
      // translate = translate || this.pot.random();
      // let word_seed = {lang:this.seed, translate:translate};
      // let pot = Fdrandom.pot(word_seed);
      // this.pot.repot();
      let pot = Fdrandom.pot(seed);

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

    translate(sentence){
      let sep = /([ .:;?!~,`"&|()<>{}\[\]\r\n/\\]+)/
      let splited = sentence.split(sep);

      let translated = splited.map((token)=>{
          if(this.proper_nouns.has(token)) return token;
          if(token.match(sep)) return token;
          if(token.length <= 0) return token;
          return this.generate_word(token);
      })

      return translated.join('');
    }

    generate_phrase(seed, max_length){
      let pot = Fdrandom.pot(seed);
      let punctuation = pot.mixof(assets.json.lang.punctuation)[0];
      let phrase = punctuation
      while(true) {
        let word = this.generate_word(pot.random());
        if(word.length+phrase.length > max_length){
          break;
        }
        phrase = ' ' + word + phrase
      }
      return capitalize(phrase.trim());
    }

    talk(seed, max_length){
      let pot = Fdrandom.pot(seed);
      let speach = ""
      while(true) {
        let phrase_length = pot.gnorm(10, Math.min(100,max_length));
        let phrase = this.generate_phrase(pot.random(), phrase_length);
        if(phrase.length+speach.length > max_length){
          break;
        }
        speach = ' ' + phrase + speach
      }
      return speach.trim();
    }
}
