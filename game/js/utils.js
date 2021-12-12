// console
const test_func_dist = (func, n)=>{
   let dist = {}
    for(let i = 0; i<n; i++){
      let result = func();
      if(!dist.hasOwnProperty(result)) dist[result]=0;
      dist[result]++;
   }
   console.log(dist);
}

// array2d
const new_array2d = (w, h, v) => Array.from({length:w},()=>Array.from({length:h},()=>v));
const copy_array2d = (arr) => arr.map((a)=>a.slice());
const map_array2d = (arr, func) => foreach_array2d(arr, (v, x, y)=>arr[x][y]=func(v, x, y));
const foreach_array2d = (arr, func) => arr.forEach((a, x)=>a.forEach((v, y) => func(v, x, y)));

// Numbers
const constrain = (v, min, max) => Math.max(Math.min(v, max), min);
const map_value = (v, start1, stop1, start2, stop2) => (v - start1) / (stop1 - start1) * (stop2 - start2) + start2;
const lerp = (start, stop, amt) => amt * (stop-start) + start;
// Text
const capitalize = (phrase)=>phrase.replace(/^\w/, c => c.toUpperCase());
const title = (phrase)=>phrase.replace(/\b\w/g, c => c.toUpperCase());

// Geometry
const distance_squared = (x, y)=> (2*x-1)**2 + (2*y-1)**2
const pos_is_in_rect = (x, y, width, height) => x >= 0 && x < width && y >= 0 && y < height
const pos_in_tileset = (w, i, tw, th) => {
  return {
    x:(i%(w/tw))*tw,
    y:~~(i/(w/tw))*(th||tw)
  };
};
const pos_to_index = (x, y, width) => y*width+x;
const calculate_max_scale = (w, h, maxw, maxh) => Math.max(1, Math.min(~~(maxw/w), ~~(maxh/h)));
const pos_to_direction = (x, y, width, height) => {
    let diag1 = (x) => x*(height/width);
    let diag2 = (x) => -x*(height/width)+height;
    if(y>=diag1(x) && y>=diag2(x)) return 'south';
    if(y>=diag1(x) && y<=diag2(x)) return 'west';
    if(y<=diag1(x) && y<=diag2(x)) return 'north';
    if(y<=diag1(x) && y>=diag2(x)) return 'east';
};
const move_to_direction = (x, y) => {
    if(x==0 && y>0)  return 'south';
    if(x<0  && y==0) return 'west';
    if(x==0 && y<0)  return 'north';
    if(x>0  && y==0) return 'east';
};
const direction_to_move = (dir) => {
    if(dir == 'south')  return  {x:0,  y:1};
    if(dir == 'west')  return  {x:-1, y:0};
    if(dir == 'north')    return  {x:0,  y:-1};
    if(dir == 'east') return  {x:1,  y:0};
};

// other

// from https://learnersbucket.com/examples/algorithms/flood-fill-algorithm-in-javascript/
const flood_fill = (array2d, x, y, value) => {
    const fill = (array2d, x, y, value, current) => {
        if(!pos_is_in_rect(x, y, array2d.length-1, array2d[x].length-1)) return;
        if(array2d[x][y] !== current) return;
         array2d[x][y] = value;
         //Fill in all four directions
         fill(array2d, x - 1, y, value, current);
         fill(array2d, x + 1, y, value, current);
         fill(array2d, x, y - 1, value, current);
         fill(array2d, x, y + 1, value, current);
    }
    //Get the input which needs to be replaced.
    const current = array2d[x][y];
    //If the value is same as the existing then return the original array2d.
    if(current === value) return array2d;
    //Other wise call the fill function which will fill in the existing array2d.
    fill(array2d, x, y, value, current);
    //Return the array2d once it is filled
    return array2d;
};
