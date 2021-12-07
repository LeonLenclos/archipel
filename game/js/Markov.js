class Markov {

    constructor(n, max, samples){
      // Order (or length) of each ngram
      this.n = n;
      // What is the maximum amount we will generate?
      this.max = max;
      // each ngram is the key, a list of possible next elements are the values
      this.ngrams = {};

      samples.forEach((text) => {
        this.feed(text)
      });
    }

    feed(text) {
      // Discard this line if it's too short
      if (text.length < this.n) {
        return false;
      }

      // Store the first ngram of this line
      // var beginning = text.substring(0, this.n);
      // this.beginnings.push(beginning);
      this.add_ngram('START', text.charAt(0))
      // Now let's go through everything and create the dictionary
      for (var i = 1-this.n ; i < text.length - this.n; i++) {
        var gram = text.substring(i, i + this.n);
        var next = text.charAt(i + this.n);
        // Is this a new one?
        this.add_ngram(gram, next)
      }
      let end = text.substring(text.length-this.n)
      this.add_ngram(end, 'END')
    }

    add_ngram(gram, next){
      if (!this.ngrams.hasOwnProperty(gram)) {
        this.ngrams[gram] = [];
      }
      this.ngrams[gram].push(next);
    }
    // Generate a text from the information ngrams
    generate(fdrandom_pot) {
      let current = 'START'
      let output = []
      // Generate a new token max number of times
      for (let i = 0; i < this.max; i++) {
        if (this.ngrams.hasOwnProperty(current)) {
          let possible_next = this.ngrams[current];
          let next = fdrandom_pot.mixof(possible_next)[0];
          if(next == 'END'){
            break;
          }
          else {
            output += next;
            current = output.substring(output.length - this.n, output.length);
          }
        } else {
          break;
        }
      }
      return output;
    }
}
