type RNG = () => number

/* https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array */
export function arr_shuffle<A>(a: Array<A>, rng: RNG, b?: number, c?: number, d?: A) {
  c=a.length;while(c)b=rng()*c--|0,d=a[c],a[c]=a[b],a[b]=d;
  return a
}


