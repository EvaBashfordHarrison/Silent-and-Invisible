// reference: existing Avanka code
var capture;
var previousPixels;
var flow;
var step = 16; 
var uMotionGraph, vMotionGraph; // reference: existing Avanka code

// PARTICLE AND DATA 
let myParticleArray = []; // already drawn 
let flowParticleArray = [];  // flow particles (camera)

let aqiName;
let heading = "";

let diseases = [];
let needsNewHeadline = true;

let angle = 0;
let amplitude = 100;

// AQI api data 
let currentLocation = "Undefined"; // read if 'london' hasn't loaded 
let data; // to call the API later reference:  http://aqicn.org/
let aqiData;
let timeData;
let message = "Loading air quality...";
let pollutants = [];
let pm25Val;
let pm10Val
let o3Val
let n2Val
let so2Val
let carbMonoVal

let pressureVal;
let humidityVal;
let windVal;
let tempVal;

// ---- DESIGN SETUP 
// design elements 
let azeretFont;
let padding = 20;
let pm25Col; // red 
// text styling 
let h1; // updates later 
let h2 = 36
let h3 = 28
let h4 = 18;
let h5 = 12;

let mode = "start";
let startButton; 

// text to points arrays to be filled 
let textPoints = [];
let logoPoints = [];

// ---- start project 
function preload() {
  azeretFont = loadFont('public/fonts/AzeretMono-TRIAL-Light.ttf');
  azeretBold = loadFont('public/fonts/AzeretMono-TRIAL-Medium.ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 255);
  textFont(azeretFont);

  // reference: xxxxxx
  diseases = ['HEART DISEASE','LUNG CANCER','BRONCHITIS','ASTHMA','STROKE','CANCER', 'DEMENTIA','DEPRESSION','ANXIETY', 'DIABETES'];

  // AQI data load here 
  // let url = `https://api.waqi.info/feed/london/?token=${API_KEY}`;
  let url = '/air-quality'

    fetch(url)
    .then(res => res.json())
    .then(json => {
        data = json;
        aqiData = data.data.aqi; // returns int 
        currentLocation = data.data.city.name;
        timeData = data.data.time.s;

        pm25Val = data.data.iaqi.pm25.v; //pm2.5 
        pm10Val = data.data.iaqi.pm10.v; // pm10
        o3Val = data.data.iaqi.o3.v; //ozone 
        n2Val = data.data.iaqi.no2.v; // nitrogen
        so2Val = data.data.iaqi.so2.v; // sulphur dioxide 
        carbMonoVal = data.data.iaqi.co.v; // carbon monoxide 

        pressureVal = data.data.iaqi.p.v; // pressure 
        humidityVal = data.data.iaqi.h.v; // humidity 
        windVal = data.data.iaqi.w.v; // WIND SPEED 
        tempVal = data.data.iaqi.t.v; // temperature  

        // aqiName = getAqiName(data.data.aqi); 
        pollutantDataAll();
        // heading = updateHeadlineDisease();
        // updateTextPoints(heading);
    })
    .catch(err => console.error(err));

  pm25Col = random(320,360);
  o3Col = random(220,195);
  s2Col = random(170,85); 
  n2Col = random(40,19); 
  pm10Col = random(10,40);
  coCol = random(250,270);

  
  // camera input here 
  capture = createCapture(VIDEO);
  capture.hide();

  // new flow calculator -- reference: Avanka 
  flow = new FlowCalculator(step); // reference: existing Avanka code

  // reference: https://www.youtube.com/watch?v=eZHclqx2eJY // Patt Vira 
  // LOGO POINTS SETUP 
  let fs = 100;
  let fullString = 20 * (fs*0.75);
  let midX = fullString / 2; 
  let startLogoPoints = (width/2) - midX;
  
  logoPoints = azeretFont.textToPoints('SILENT AND INVISIBLE', startLogoPoints ,height / 2 - 200, fs, {sampleFactor: 0.1, sampleThreshold: 0.02});

  // buttons
  startButton = createButton('start');
  startButton.position(width / 2 - 24, height - 100);
  startButton.addClass('button');
  startButton.mousePressed(()=> {
    mode="play";
  })
}

function pollutantDataAll() {
  // reference for WHO guidelines https://www.c40knowledgehub.org/s/article/WHO-Air-Quality-Guidelines?language=en_US 
  pollutants = [ // the particles are bigger than the gasses 
    {name: "PM2.5", iaqi: pm25Val, totalAllowed: 15, col: pm25Col, diam: 5},
    {name: "PM10", iaqi: pm10Val, totalAllowed: 45, col: pm10Col, diam: 20},
    {name: "Ozone", iaqi: o3Val, totalAllowed: 100, col: o3Col, diam: 2},
    {name: "Nitrogen Dioxide", iaqi: n2Val, totalAllowed: 25, col: n2Col, diam: 2},
    {name: "Sulpher Dioxide", iaqi: so2Val, totalAllowed: 40, col: s2Col, diam: 2},
    {name: "Carbon Monoxide", iaqi: carbMonoVal, totalAllowed: 4, col: coCol, diam: 2},
  ].map(p => ({
  ...p, 
  percentage: (p.iaqi / p.totalAllowed) * 100,
}))
}

// helper function to reflect the number of particles created are a similar ratio to the data. 
function getPollutant() {
  let total = pollutants.reduce((sum, p) => sum + p.iaqi, 0); // reference: claude AI to debug my colour logic. 
  let r = random(total);
  let cumulative = 0;
  
  for (let p of pollutants) { // looping through all pollutants and adding them together, for a total of particles 
    cumulative += p.iaqi;
    if (r < cumulative) return p;
  }
  return pollutants[pollutants.length - 1];
}

function draw() {
    background("#a1cfe4"); // clear blue sky 

    // ----------- STARTER PAGE -------------
    if (mode==="start") {
      cursor();

      // --- opening text 
      noStroke();
      textAlign(CENTER);
      textSize(h5)
      textLeading(h4*1.4)
      let textBoxWidth = 600
      text('Welcome to Silent and Invisible, a web project raising awareness on harmful air quality in your city through users movement. \nThis app visualises the air you breathe. Watch real-time air quality data transform into moving particles—each one representing the concentration of pollutants around you. \n\nMove your body to activate the data. \n\nAre you within safe limits, or exceeding them? By combining data with simple visuals, this tool helps you stay informed, and highlight the risks for long term exposure. ', width / 2 - (textBoxWidth / 2), 400, textBoxWidth, height);
      
      // -- header logo 'silent and invisible'  
      for(let i = 0; i < logoPoints.length; i++) {

        // -- reference; p5js documentation website 
        let noiseLevel = 10;
        let noiseScale = 0.01;
        let nt = noiseScale * frameCount;

        let x = noiseLevel * noise(nt + i * 0.1);
        let y = noiseLevel * noise(nt + i * 0.1 + 500);

        let strokeCol = 300
        stroke(strokeCol, 0, 100, 50);
        strokeWeight(2 + sin(2) * 10);
        point(logoPoints[i].x + x, logoPoints[i].y + y)
      }
    
    // ------- AIR POLLUTION PAGE ---------
    } else if (mode=== "play") {
      noCursor();

      startButton.hide();
      
      // -- data loaded information 
      noStroke();
      textAlign(RIGHT);
      fill(50);
      textSize(h5)
      textFont(azeretFont);
      text(`Data from: ${timeData}`, width - padding, height - padding);
      text(`Location: ${currentLocation}`, width - padding, height - padding * 2)

      // --------- IF API DATA LOADED ?? ------------------------------------------
      if (data?.status === "ok") {

        // ------ DECLARE THE PARTICLE ARRAY HERE 
        for (let i = 0; i < myParticleArray.length; i++) {
          myParticleArray[i].magnet(textPoints);  // check magnetism first
          myParticleArray[i].move();
          myParticleArray[i].display();
        }

        // -------- IF THERE ARE TOO MANY PARTICLES... (RUNNING TOO SLOW) 
        if (myParticleArray.length > 1500) {
          myParticleArray.splice(0, 30); // remove oldest 30
          }

        // -------- DELETE A PARTICLE EVERY FRAME, KEEPS THE LAG LOW AND MAKES THE USER MOVE MORE 
        if (frameCount % 1 === 0) { // every 1 frame
            myParticleArray.splice(0,1);
        }


        // ---------- CAMERA FLOW DRAW reference: existing Avanka code
          capture.loadPixels();
          if (capture.pixels.length > 0) {
            if (previousPixels) {
              if (!same(previousPixels, capture.pixels, 4, width)) {
                // return; // skip flow calc on duplicate frame, but particles already drew
                flow.calculate(previousPixels, capture.pixels, capture.width, capture.height);
              }
            }
            previousPixels = copyImage(capture.pixels, previousPixels);


          if (flow.flow && flow.flow.u != 0 && flow.flow.v != 0) {
            noStroke();

          /// ---- here calls the flow zones
          flow.flow.zones.forEach(function (zone) {
            
            // --------- push new particles here 
            if (zone.u > 10 || zone.v > 10) {
              let pollutant = getPollutant();

              let col = pollutant.col;
              let diam = pollutant.diam;
              myParticleArray.push(
                new Particle(
                    map(zone.x, capture.width, 0, 0, width), // mapping the camera footage to be fs
                    map(zone.y, 0, capture.height, 0, height), // mapping the camera footage to be fs
                    random(-5, 5), // random speeds X
                    random(-5, 5), // random speeds Y,
                    col, 
                    diam,
                  ),
              );
            }
          });
        }
    } // -- FLOW END 
    
    // --- if there's no one interacting, delete all the data on the screen -- promotes user movement. Set to 3 so little movements doesn't jitter the screen. 
    if (myParticleArray.length > 3) {
        aqiDataInformation(60, 300); // only show when there are particles 
        needsNewHeadline = true; // generate new headline info when its at 0
    } else {
  
      if (needsNewHeadline) { // particles gone, generate new word 
        heading = updateHeadlineDisease(); // update random disease
        updateTextPoints(heading); // update random disease
        // needsNewHeadline = false; // done 
      }

      // text to make the user move if there are no particles on screen! 
      fill(0);
      textFont(azeretBold);
      textAlign(CENTER);
      textSize(h3);
      text('Move through the air to see the effects', width/2, height/2)
    }

  } // -- end 'if data ok, then'... 

  } else { // fail safe 
    fill(100);
    textAlign(LEFT);
    text('Page not loaded correctly', 100,100);
  }
} // -- DRAW END 

// --- flow reference: Avanka 
// usage: dst = copyImage(src, dst)
// based on http://jsperf.com/new-array-vs-splice-vs-slice/113 
function copyImage(src, dst) {
  var n = src.length;
  if (!dst || dst.length != n) {
    dst = new src.constructor(n);
  }
  while (n--) {
    dst[n] = src[n];
  }
  return dst;
}

function same(a1, a2, stride, n) {
  for (var i = 0; i < n; i += stride) {
    if (a1[i] != a2[i]) {
      return false;
    } 
  }
  return true;
}
// -- flow reference end 


// helper function to update the disease
function updateTextPoints(disease) { 

  h1 = 200;
  let bounds = azeretFont.textBounds(disease, 0, 0, h1);

  let x = width / 2 - bounds.w / 2;
  let y = height / 2 + bounds.h / 2;

  textPoints = azeretFont.textToPoints(disease,x,y,h1,{ sampleFactor: 0.1 });
}

function updateHeadlineDisease() {
  return random(diseases);
}

function aqiDataInformation(_y, _x2) {
  
  let lineHeightNum = 30;
  
  for (let i = 0; i < pollutants.length; i++) {
    textSize(h5);
    textAlign(LEFT)
    fill(255);
    noStroke();

    let p = pollutants[i];

    fill(255)
    ellipse(padding + padding / 2, _y + (lineHeightNum * i), pollutants[i].diam, pollutants[i].diam)

    noStroke();
    textFont(azeretFont);
    fill(255);
    text(`${p.name}: ${p.iaqi} µg/m³`, padding * 3, _y + (lineHeightNum * i)); // name and value text 
    text(`${p.percentage.toFixed(1)}%`, 300, _y + (lineHeightNum * i)); // percentage text 

    stroke(255);
    strokeWeight(0.5);
  }
}