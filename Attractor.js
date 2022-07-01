// Attractor
var x = 0.1;
var y = 0.1;

var a = -2.3983540752995394;
var b = -1.8137134453341095;
var c = 0.010788338377923257;
var d = 1.0113015602664608;
var xmax = -100.0;
var xmin = 100.0;
var ymax = -100.0;
var ymin = 100.0;
var xRange = 1.0;
var yRange = 1.0;
var nTouched = 0;
var nMaxed = 0;
var bufferSize = 0;
var savedBuffer = null;
var dataView = null;
var decPixelTime = 0;
var decPixelDataViewTime = 0;
var calculateTime = 0;


export class AttractorObj {
  constructor(randomize, width, height) {
    //this.x = 0.1;
    //this.y = 0.1;
   
    this.width = width;
    this.iters = 0;
    this.loopCount = 0;
    this.height = height;
    nTouched = 0;
    nMaxed = 0;
    if (randomize) {
      a = 3.0 * (Math.random() * 2.0 - 1.0);
      b = 3.0 * (Math.random() * 2.0 - 1.0);
      c = Math.random() * 2.0 - 1.0 + 0.5;
      d = Math.random() * 2.0 - 1.0 + 0.5;
    } else { 
      a = -2.3983540752995394;
      b = -1.8137134453341095;
      c = 0.010788338377923257;
      d = 1.0113015602664608;
    }
    xmax = -100.0;
    xmin = 100.0;
    ymax = -100.0;
    ymin = 100.0;
    xRange = 1.0;
    yRange = 1.0;

    if ( bufferSize != (width*height*4)) {
      bufferSize = width * height * 4;
      this.data = new Uint8ClampedArray(width * height * 4); // RGBA
      this.data.fill(255);
      savedBuffer = this.data;
      dataView =  new DataView(this.data.buffer);
    /* eslint-disable no-console */
      console.log ( "New AttractorObj allocating ", bufferSize );
    /* eslint-enable no-console */
    } else {
      this.data = savedBuffer;
          /* eslint-disable no-console */
          // console.log ( "Initializing bytes ", bufferSize );
          /* eslint-enable no-console */
      this.data.fill(255);
    }
  }
  getn_touched() {
    return nTouched;
  }
  getn_maxed() {
    return nMaxed;
  }
  calculate_frame(budget, firstFrame, nFirstFrames) {
    let startTime = performance.now();
    let msElapsed = 0;
    let loopCount = 0;
    if (firstFrame) {
      x = 0.1;
      y = 0.1;
      while (this.iters < nFirstFrames) {
        this.iters++;
        loopCount++;
        [x, y] = this.iteratePoint(x, y);
        if (x < xmin) xmin = x;
        if (x > xmax) xmax = x;
        if (y < ymin) ymin = y;
        if (y > ymax) ymax = y;
      }
      xRange = xmax - xmin;
      yRange = ymax - ymin;
     
      

    } else {
     
      while (msElapsed < budget) {
        this.iters++;
        loopCount++;
        [x, y] = this.iteratePoint(x, y);
        this.decPixel(this.pixelx(x), this.pixely(y));
        if ((loopCount & 0x3f) == 0) {
          msElapsed = performance.now() - startTime;
        }
      
      }
     
   }
    return loopCount; //
  }

  iteratePoint(x, y) {
    return [Math.sin(y * b) -
      c * Math.sin(x * b), Math.sin(x * a) +
      d * Math.cos(y * a)];
  }
  pixelx(x) {
    let px = Math.floor(((x - xmin) / xRange) * this.width);
    // if ((px < 0) || (px > this.width)) console.log(" bad x " + px + " " + x);
    px = px < 0 ? 0 : px;
    px = px > this.width - 1 ? this.width - 1 : px;
    return px;
  }
  pixely(y) {
    let py = Math.floor(((y - ymin) / yRange) * this.height);
    // if ((px < 0) || (px > this.width)) console.log(" bad x " + px + " " + x);
    py = py < 0 ? 0 : py;
    py = py > this.height - 1 ? this.height - 1 : py;
    return py;
  }

  decPixel(x, y) {
   
    let i = (y * this.width + x) * 4;
    if (this.data[i] == 255) {
      nTouched++;
    }
    if (this.data[i] == 1) {
      nMaxed++;
    }
    if (this.data[i] > 0) {
      this.data[i] -= 1;
      this.data[i + 1] -= 1;
      this.data[i + 2] -= 1;
    }
   
  }
 
  free_pixels() { 
    // only needed in the Rust module
  }
}
