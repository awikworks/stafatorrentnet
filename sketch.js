let noises = [];
let currentNoise = null;
let noiseTimer = 0;
let noiseDuration = 0;

let effects = ['filter', 'distortion', 'reverb', 'delay'];
let currentEffect = null;
let lastFXUpdate = 0;
let fxUpdateInterval = 0;

let filter, distortion, reverb, delay;

let samples = [];
let sampleQueue = [];
let currentSample = null;
let lastSampleTime = 0;
let sampleChangeInterval = 0;

let glitchTime = 0;
let glitchDuration = 1000;

let bgImage;
let kodamImage;  // Gambar PNG dengan nama 'kodam.png'

let flashTimer = 0;
let flashDuration = 200;

let lastHeartbeat = 0;
let watchdogInterval = 10000; // 10 detik toleransi sebelum reload

// Variabel untuk font
let customFont;
let blinkState = true;  // Untuk mengatur kedipan teks
let blinkInterval = 500; // Interval kedipan dalam milidetik

// Variabel untuk restart otomatis
let lastRestartTime = 0;
let restartInterval = 180000; // 3 menit dalam milidetik

// Variabel untuk mengawasi peristiwa error
let lastErrorTime = 0;
let errorTimeout = 200000; // Timeout error dalam milidetik

function safeRun(fn, label = 'safeRun') {
  try {
    fn();
  } catch (e) {
    console.error(`[${label}]`, e);
    lastErrorTime = millis();
    handleError(e);  // Tangani kesalahan dengan pemulihan otomatis
  }
}

function handleError(error) {
  // Tangani kesalahan dan lakukan restart setelah timeout
  console.error("Error caught: ", error);
  setTimeout(() => {
    console.log("Error handling: Reloading...");
    location.reload();
  }, errorTimeout);
}

function preload() {
  bgImage = loadImage('SFN.jpg');
  kodamImage = loadImage('kodam.png');  // Memuat gambar PNG

  samples.push(loadSound('azizi.mp3'));
  samples.push(loadSound('skibidi.mp3'));
  samples.push(loadSound('mistika.mp3'));
  samples.push(loadSound('Biang.mp3'));
  samples.push(loadSound('Amatir.mp3'));
  samples.push(loadSound('warkop.mp3'));
  samples.push(loadSound('hart.mp3'));
  samples.push(loadSound('bunuh.mp3'));
  samples.push(loadSound('emosi.mp3'));

  // Memuat font
  customFont = loadFont('PressStart2P-Regular.ttf');
}

function shuffleSamples() {
  sampleQueue = shuffle([...samples]);
}

function setup() {
  createCanvas(1280, 720);
  userStartAudio();

  let types = ['white', 'pink', 'brown', 'blue', 'violet', 'grey'];
  types.forEach(type => {
    let n = new p5.Noise(type);
    n.start();
    n.amp(0);
    noises.push(n);
  });

  filter = new p5.LowPass();
  distortion = new p5.Distortion();
  reverb = new p5.Reverb();
  delay = new p5.Distortion();  // Menggunakan distortion untuk efek delay

  glitchTime = millis();
  lastFXUpdate = millis();
  fxUpdateInterval = random(6000, 10000);
  lastSampleTime = millis();
  sampleChangeInterval = random(10000, 20000);
  noiseDuration = random(4000, 8000);

  shuffleSamples();

  // Setup watchdog checker
  setInterval(() => {
    let timeSinceLastBeat = millis() - lastHeartbeat;
    console.log("Time since last heartbeat:", timeSinceLastBeat); // Debugging
    if (timeSinceLastBeat > watchdogInterval) {
      console.warn("Watchdog triggered: Reloading...");
      location.reload();  // Restart jika tidak ada heartbeat dalam waktu tertentu
    }
  }, 5000);

  // Setup timer untuk restart otomatis setelah 3 menit
  setInterval(() => {
    let timeSinceLastRestart = millis() - lastRestartTime;
    if (timeSinceLastRestart > restartInterval) {
      console.warn("Restarting program after 3 minutes...");
      restartProgram();
    }
  }, 5000);
}

function restartProgram() {
  // Reset semua variabel penting dan status
  noises.forEach(noise => noise.stop());
  samples.forEach(sample => sample.stop());

  glitchTime = millis();
  lastFXUpdate = millis();
  fxUpdateInterval = random(6000, 10000);
  lastSampleTime = millis();
  sampleChangeInterval = random(10000, 20000);
  noiseDuration = random(4000, 8000);

  shuffleSamples();
  
  // Me-reload halaman (hard restart)
  location.reload();  // Reload untuk memastikan aplikasi segar
}

function draw() {
  safeRun(() => {
    image(bgImage, 0, 0, width, height);

    if (millis() - glitchTime > glitchDuration) {
      glitchTime = millis();
      playRandomNoise();
    }

    if (millis() - lastFXUpdate > fxUpdateInterval) {
      safeRun(updateEffect, 'updateEffect');
      lastFXUpdate = millis();
      fxUpdateInterval = random(6000, 10000);
    }

    if (millis() - lastSampleTime > sampleChangeInterval) {
      safeRun(triggerRandomSample, 'triggerRandomSample');
      lastSampleTime = millis();
      sampleChangeInterval = random(10000, 20000);
    }

    if (currentNoise && millis() - noiseTimer > noiseDuration) {
      currentNoise.amp(0);
      currentNoise = null;
      noiseDuration = random(4000, 8000);
    }

    // Efek glitch pada PNG tanpa pergeseran posisi
    let isGlitching = millis() % 2000 < 500;  // Interval glitch
    if (isGlitching) {
      // Menambahkan sedikit efek glitch pada gambar (misalnya efek warna acak)
      tint(random(100, 255), random(100, 255), random(100, 255));  // Efek glitch warna
    } else {
      noTint();  // Kembali ke normal
    }

    // Menampilkan PNG di atas canvas dengan efek glitch
    image(kodamImage, width / 2 - kodamImage.width / 2, height / 2 - kodamImage.height / 2);

    let isFlashing = millis() - flashTimer < flashDuration;
    let debugAlpha = isFlashing ? 0 : 255;

    fill(0, 255, 0, debugAlpha);
    textFont(customFont);  // Set font ke "PressStart2P"
    textSize(16);
    textAlign(CENTER);

    let headerY = 50;
    text("~GENERATING_AZAB_STAFATORRENTNET~", width / 2, headerY);

    textSize(16);
    let lineSpacing = 20;
    text("fx " + currentEffect + ", ~" + (currentNoise ? currentNoise.getType() : 'none') + "~noise " + nf((millis() - noiseTimer) / 1000, 1, 2) + "hz", width / 2, headerY + lineSpacing);
    text("fx~int " + nf(fxUpdateInterval / 1000, 1, 2) + "s, smpl~int " + nf(sampleChangeInterval / 1000, 1, 2) + "s", width / 2, headerY + lineSpacing * 2);

    // Mengatur kedipan teks
    if (millis() % blinkInterval < blinkInterval / 2) {
      blinkState = true;
    } else {
      blinkState = false;
    }

    if (blinkState) {
      fill(0, 255, 0);
      textSize(35);
      text("AZAB PROMPTER", width / 2, height - 20);
    }
  }, 'draw');

  heartbeat(); // <- penting! panggil di akhir draw
}

function heartbeat() {
  lastHeartbeat = millis();
}

function playRandomNoise() {
  if (currentNoise) currentNoise.amp(0);
  currentNoise = random(noises);
  currentNoise.amp(random(1, 2));
  currentNoise.pan(random(-0.5, 0.5));
  noiseTimer = millis();
  flashTimer = millis();
}

function updateEffect() {
  currentEffect = random(effects);

  noises.concat(samples).forEach(source => {
    if (!source) return;
    source.disconnect();
    switch (currentEffect) {
      case 'filter':
        source.connect(filter);
        filter.freq(random(500, 1000));
        filter.res(random(1, 10));
        break;
      case 'distortion':
        source.connect(distortion);
        distortion.set(random(0.5, 1));
        break;
      case 'reverb':
        source.connect(reverb);
        reverb.set(random(2, 8), random(2, 8));
        break;
      case 'delay':
        source.connect(delay);
        delay.process(source, random(0.1, 0.5), random(0.5, 0.9), 1500);
        break;
    }
  });

  flashTimer = millis();
}

function triggerRandomSample() {
  if (currentSample?.isPlaying()) {
    currentSample.stop();
  }

  if (sampleQueue.length === 0) {
    shuffleSamples();
  }

  currentSample = sampleQueue.pop();
  if (!currentSample?.isLoaded()) return;

  currentSample.rate(random(0.85, 1.15));
  currentSample.setVolume(random(0.6, 1.5));
  currentSample.pan(random(-0.4, 0.4));
  currentSample.play();

  let sampleDuration = random(5000, 200000);
  setTimeout(() => {
    if (currentSample?.isPlaying()) {
      currentSample.stop();
    }
  }, sampleDuration);

  flashTimer = millis();
}

// Global error catcher (sync)
window.onerror = function (msg, url, lineNo, columnNo, error) {
  console.error("Caught error:", msg, "at", lineNo, ":", columnNo);
  setTimeout(() => {
    console.log("Reloading after error...");
    location.reload();
  }, 200000);
  return false;
};

// Global error catcher (async/unhandled promises)
window.addEventListener('unhandledrejection', function (event) {
  console.error("Unhandled rejection:", event.reason);
  setTimeout(() => {
    console.log("Reloading after unhandled rejection...");
    location.reload();
  }, 1000);
});
