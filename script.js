const TARGET = "SUNFLOWER";
const petalsEl = document.getElementById("petals");
let collected = [];
let currentScene = 1;
const totalScenes = 10;

// Render petals HUD
function renderPetals() {
  petalsEl.innerHTML = "";
  for (let i = 0; i < TARGET.length; i++) {
    const d = document.createElement("div");
    d.className = "petal" + (i < collected.length ? " on" : "");
    d.textContent = TARGET[i];
    petalsEl.appendChild(d);
  }
}
renderPetals();

// --- Background Music ---
const bgMusic = document.getElementById("bg-music");
let musicStarted = false;

// Play music after the first click/tap (browser-safe)
function startMusic() {
  if (!musicStarted && bgMusic) {
    bgMusic.volume = 0;
    bgMusic.play().then(() => {
      // Fade in smoothly
      const fade = setInterval(() => {
        if (bgMusic.volume < 0.4) bgMusic.volume += 0.02;
        else clearInterval(fade);
      }, 200);
    });
    musicStarted = true;
  }
}

// Trigger once at first interaction
window.addEventListener("click", startMusic, { once: true });
window.addEventListener("touchstart", startMusic, { once: true });


function nextScene() {
  document.querySelectorAll(".scene").forEach(s => s.classList.remove("active"));

  if (currentScene === totalScenes + 1) {
    // after collage → go to ending
    document.getElementById("ending").classList.add("active");
    return;
  }

  const s = document.getElementById(`scene${currentScene}`);
  if (s) {
    s.classList.add("active");
    setupScene(s);
  }
}


// Scene logic
function setupScene(scene) {
  const type = scene.dataset.type;
  const title = scene.dataset.title;
  const sub = scene.dataset.sub;
  const img = scene.dataset.img;

  // skip rebuilding HTML for collage
  if (type !== "collage") {
  scene.innerHTML = `
  ${img ? `<div class="bg" style="background-image:url('media/${img}')"></div>` : ""}
  <div class="veil"></div>
  ${
    scene.dataset.quote
      ? `<div class="quote-block">
           <div class="quote">${scene.dataset.quote}</div>
           ${
             scene.dataset.instruction
               ? `<div class="instruction">${scene.dataset.instruction}</div>`
               : ""
           }
         </div>`
      : ""
  }
`;




  }

  switch (type) {
    case "petal": return scenePetal(scene);
    case "light": return sceneLight(scene);
    case "smile": return sceneSmile(scene);
    case "candle": return sceneCandle(scene);
    case "smudge": return sceneSmudge(scene);
    case "heart": return sceneHeart(scene);
    case "food": return sceneFood(scene);
    case "reunion": return sceneReunion(scene);
    case "snow": return sceneSnow(scene);
    case "collage": return sceneCollage(scene);
  }
}



function collectAndNext(scene) {
  collected.push(TARGET[collected.length]);
  renderPetals();
  setTimeout(() => {
    scene.classList.remove("active");
    currentScene++;
    nextScene();
  }, 600);
}


/* Scene 1: Petal */
function scenePetal(scene) {
  const p = document.createElement("div");
  p.className = "petal-dot";
  p.style.left = "78%";
p.style.top = "72%";
  scene.appendChild(p);
  p.addEventListener("click", () => {
    p.remove();
    collectAndNext(scene);
  }, { once: true });
}

/* Scene 2: Floating light */
function sceneLight(scene) {
  const f = document.createElement("div");
  f.className = "firefly";
  f.style.left = "20%";
  f.style.top = "70%";
  scene.appendChild(f);
  f.animate(
    [
      { transform: "translate(0, 0)", opacity: 1 },
      { transform: "translate(420px, -220px)", opacity: 0.9 },
      { transform: "translate(250px, -280px)", opacity: 0.7 }
    ],
    { duration: 4000, iterations: Infinity, direction: "alternate", easing: "ease-in-out" }
  );
  f.addEventListener("click", () => { f.remove(); collectAndNext(scene); });
}

/* Scene 3: Smile taps */
/* Scene 3: Double-tap to capture */
function sceneSmile(scene) {
  // Clean any prior hotspots if you had them
  scene.querySelectorAll('.hotspot').forEach(h => h.remove());

  // Double-tap detector (works on desktop clicks & mobile taps)
  let lastTap = 0;
  const handleTap = () => {
    const now = Date.now();
    if (now - lastTap < 400) {
      // double-tap detected -> flash + collect
      const flash = document.createElement('div');
      flash.className = 'flash';
      scene.appendChild(flash);
      setTimeout(() => {
        flash.remove();
        collectAndNext(scene);
      }, 260);
    }
    lastTap = now;
  };

  // Use click for both desktop & mobile (works as tap)
  scene.addEventListener('click', handleTap);
}



/* Scene 4: Candle trail */
function sceneCandle(scene) {
  scene.innerHTML += `
    <div class="quiz">
      <p class="quiz-title">Answer these to rekindle the night ✨</p>
      <input type="text" id="q1" placeholder="Name of the place">
      <input type="text" id="q2" placeholder="Date (e.g. dd/mm/yyyy)">
      <input type="text" id="q3" placeholder="What did I drink?">
      <button id="submitQuiz">Submit</button>
      <p id="quizMsg"></p>
    </div>
  `;

  const answers = {
    q1: "rule 34",
    q2: "01/04/2023",
    q3: "gimlet"
  };

  document.getElementById('submitQuiz').onclick = () => {
    const q1 = document.getElementById('q1').value.trim().toLowerCase();
    const q2 = document.getElementById('q2').value.trim().toLowerCase();
    const q3 = document.getElementById('q3').value.trim().toLowerCase();

    if (q1 === answers.q1 && q2 === answers.q2 && q3 === answers.q3) {
      document.getElementById('quizMsg').textContent = "✨ Perfect memory. You lit the candle.";
      document.getElementById('quizMsg').style.color = "#ffd369";
      setTimeout(() => collectAndNext(scene), 1000);
    } else {
      document.getElementById('quizMsg').textContent = "Hmm... try again 🕯️";
      document.getElementById('quizMsg').style.color = "#ff7777";
    }
  };
}


/* Scene 5: Smudge press-hold */
function sceneSmudge(scene) {
  // Create the blurred overlay canvas
  const canvas = document.createElement('canvas');
  canvas.className = 'smudge-canvas';
  scene.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let drawing = false;
  let revealed = false;

  // Resize canvas to match scene
  const resizeCanvas = () => {
    canvas.width = scene.offsetWidth;
    canvas.height = scene.offsetHeight;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.filter = 'blur(12px)';
  };
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const clearCircle = (x, y) => {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 40, 0, Math.PI * 2);
    ctx.fill();
  };

  const handlePointerDown = e => {
    drawing = true;
    clearCircle(e.offsetX, e.offsetY);
  };

  const handlePointerMove = e => {
    if (!drawing) return;
    clearCircle(e.offsetX, e.offsetY);
  };

  const handlePointerUp = () => {
    drawing = false;
    // Check how much is cleared
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let cleared = 0;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 10) cleared++;
    }
    const clearedRatio = cleared / (canvas.width * canvas.height);
    if (clearedRatio > 0.2 && !revealed) {
      revealed = true;
      canvas.style.transition = 'opacity 1.2s ease';
      canvas.style.opacity = '0';
      setTimeout(() => {
        canvas.remove();
        collectAndNext(scene);
      }, 1200);
    }
  };

  canvas.addEventListener('pointerdown', handlePointerDown);
  canvas.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', handlePointerUp);
}



/* Scene 6: Draw Heart */
function sceneHeart(scene) {
  const canvas = document.createElement("canvas");
  canvas.className = "heart-canvas";
  scene.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(255, 105, 180, 0.8)";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  let drawing = false;
  let points = [];
  let startTime = 0;

  function resizeCanvas() {
    canvas.width = scene.offsetWidth;
    canvas.height = scene.offsetHeight;
  }

  const getPos = e => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = e => {
    drawing = true;
    startTime = Date.now();
    points = [];
    ctx.beginPath();
    const { x, y } = getPos(e);
    ctx.moveTo(x, y);
    points.push([x, y]);
  };

  const draw = e => {
    if (!drawing) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    points.push([x, y]);
  };

  const endDraw = () => {
    if (!drawing) return;
    drawing = false;

    // heart validation
    const duration = (Date.now() - startTime) / 1000; // seconds
    if (isHeartLike(points, duration)) {
      const glow = document.createElement("div");
      glow.className = "heart-glow";
      scene.appendChild(glow);
      setTimeout(() => {
        glow.remove();
        collectAndNext(scene);
      }, 1000);
    } else {
      // reset canvas if too small / too short
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  function isHeartLike(pts, duration) {
    if (pts.length < 100) return false; // enough points
    if (duration < 2) return false; // must take time to draw
    const xs = pts.map(p => p[0]);
    const ys = pts.map(p => p[1]);
    const width = Math.max(...xs) - Math.min(...xs);
    const height = Math.max(...ys) - Math.min(...ys);
    if (width < 100 || height < 80) return false; // must be heart-sized
    return true;
  }

  canvas.addEventListener("pointerdown", startDraw);
  canvas.addEventListener("pointermove", draw);
  window.addEventListener("pointerup", endDraw);
}



/* Scene 7: Food tap */
function sceneFood(scene) {
  // Create overlay container
  const wrap = document.createElement("div");
  wrap.className = "cheese-wrap";
  wrap.innerHTML = `
    <div class="cheese-line"></div>
    <div class="cheese-handle">🧀</div>
    <p class="hold-text">Hold to remember the stretch</p>
  `;
  scene.appendChild(wrap);

  const line = wrap.querySelector(".cheese-line");
  const handle = wrap.querySelector(".cheese-handle");
  const text = wrap.querySelector(".hold-text");

  let holding = false;
  let timer;

  const startHold = () => {
    holding = true;
    line.classList.add("stretching");
    handle.classList.add("stretching");
    text.textContent = "Hold… keep it going 🧡";

    timer = setTimeout(() => {
      // success!
      line.classList.add("melted");
      handle.classList.add("melted");
      text.textContent = "Perfect stretch ✨";
      setTimeout(() => collectAndNext(scene), 1000);
    }, 2000); // must hold 2 seconds
  };

  const endHold = () => {
    if (!holding) return;
    holding = false;
    clearTimeout(timer);
    line.classList.remove("stretching");
    handle.classList.remove("stretching");
    text.textContent = "Try again 😅";
  };

  handle.addEventListener("pointerdown", startHold);
  handle.addEventListener("pointerup", endHold);
  handle.addEventListener("pointerleave", endHold);
  handle.addEventListener("touchstart", e => { e.preventDefault(); startHold(); });
  handle.addEventListener("touchend", endHold);
}

/* Scene 8: Simple tap to continue */
function sceneReunion(scene) {
  scene.addEventListener("click", () => collectAndNext(scene), { once: true });
}

/* Scene 9: Snow video */
/* Scene 9: Snow video */
/* Scene 9: Snow video with snowfall effect */
/* Scene 9: Snow video + snowfall effect */
function sceneSnow(scene) {
  let advanced = false;
  const advance = () => {
    if (advanced) return;
    advanced = true;
    collectAndNext(scene);
  };

  // Background video (optional)
  const videoSrc = scene.dataset.video;
  if (videoSrc) {
    const vid = document.createElement("video");
    vid.className = "bg-video";
    vid.src = `media/${videoSrc}`;
    vid.autoplay = true;
    vid.loop = false;
    vid.muted = true;
    vid.playsInline = true;
    scene.appendChild(vid);
    vid.onended = advance; // call ONCE via guard
  }

  // Soft white fade near the end
  const fade = document.createElement("div");
  fade.style.position = "absolute";
  fade.style.inset = "0";
  fade.style.background = "rgba(255,255,255,0)";
  fade.style.transition = "background 2s ease";
  fade.style.zIndex = "25";
  scene.appendChild(fade);
  setTimeout(() => (fade.style.background = "rgba(255,255,255,1)"), 8000);

  // Snowfall overlay (CSS-driven)
  const snow = document.createElement("div");
  snow.className = "snowfall";
  scene.appendChild(snow);
  for (let i = 0; i < 80; i++) {
    const flake = document.createElement("span");
    const size = 2 + Math.random() * 4;      // 2–6px
    flake.style.width = `${size}px`;
    flake.style.height = `${size}px`;
    flake.style.left = `${Math.random() * 100}%`;
    flake.style.animationDuration = `${8 + Math.random() * 8}s`;
    flake.style.animationDelay = `${Math.random() * 5}s`;
    snow.appendChild(flake);
  }

  // Safety timer (in case the video can't end on iOS, etc.)
  setTimeout(advance, 10000);
}


/* Scene 10: Collage finale */
function sceneCollage(scene) {

    if (bgMusic) {
  const fadeOut = setInterval(() => {
    if (bgMusic.volume > 0.02) bgMusic.volume -= 0.02;
    else {
      bgMusic.pause();
      clearInterval(fadeOut);
    }
  }, 200);
}

  const collage = scene.querySelector('.collage');
  const message = scene.querySelector('.final-message');

  // add the images
  const images = [
    "1_sunflower.jpeg", "2_college.jpeg", "3_fav.jpeg",
    "4_tigeryaki.jpeg", "5_nightdate.jpeg", "6_funny.jpeg",
    "7_bangalore.jpeg", "8_normal.jpeg", "9_snow.jpeg"
  ];

  images.forEach(src => {
    const img = document.createElement('img');
    img.src = `media/${src}`;
    collage.appendChild(img);
  });

  // animate zoom for cinematic feel
  collage.style.animation = "slowZoom 30s ease forwards";

  // fade in text after 2s
  setTimeout(() => {
    message.style.opacity = 1;
  }, 2000);
}


// Start
nextScene();
