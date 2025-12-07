/**************** SPRITES ****************/
const IMG = {
  basket: "https://i.postimg.cc/cJT84gsq/Chat-GPT-Image-Nov-30-2025-11-24-28-PM.png",
  sparkle: "https://i.postimg.cc/zBCDX4wg/Chat-GPT-Image-Nov-30-2025-11-32-39-PM.png",
  items: [
    "https://i.postimg.cc/438T3Zq5/Pastel-Pink-Tube-Illustration.png",
    "https://i.postimg.cc/q76GNx5k/Chat-GPT-Image-Nov-30-2025-11-04-00-PM.png",
    "https://i.postimg.cc/MZ51KLpt/Chat-GPT-Image-Nov-30-2025-11-06-24-PM.png",
    "https://i.postimg.cc/6QCvsjPR/Chat-GPT-Image-Nov-30-2025-11-10-51-PM.png",
    "https://i.postimg.cc/jdCnqd1F/Chat-GPT-Image-Nov-30-2025-11-13-35-PM.png",
    "https://i.postimg.cc/pVcySMdY/Chat-GPT-Image-Nov-30-2025-11-15-19-PM.png",
    "https://i.postimg.cc/j2THDVG8/Chat-GPT-Image-Nov-30-2025-11-38-39-PM.png"
  ]
};

const SPR = { basket:null, sparkle:null, items:[] };
function loadImage(url){
  return new Promise(res=>{
    const i=new Image();
    i.src=url;
    i.onload=()=>res(i);
  });
}
async function loadSprites(){
  SPR.basket = await loadImage(IMG.basket);
  SPR.sparkle = await loadImage(IMG.sparkle);
  SPR.items = await Promise.all(IMG.items.map(loadImage));
}

/**************** DOM ****************/
const startScreen = document.getElementById("start-screen");
const gameScreen  = document.getElementById("game-screen");
const retryScreen = document.getElementById("retry-screen");
const hud = document.querySelector(".hud");
const doors = document.querySelector(".doors");

const startBtn = document.getElementById("start-btn");
const retryBtn = document.getElementById("retry-btn");
const homeBtn  = document.getElementById("home-btn");

const scoreEl = document.getElementById("score");
const finalScoreEl = document.getElementById("final-score");
const scoreList = document.getElementById("score-list");
const nameEntry = document.getElementById("name-entry");
const playerNameInput = document.getElementById("player-name");
const saveNameBtn = document.getElementById("save-name-btn");

const heartsEls = [
  document.getElementById("heart-1"),
  document.getElementById("heart-2"),
  document.getElementById("heart-3")
];

const canvas = document.getElementById("gameCanvas");
canvas.style.touchAction = "none";
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;

/**************** GAME STATE ****************/
let score = 0;
let lives = 3;
let running = false;
let items = [];
let sparkles = [];
let spawnRate = 0.015;

/**************** BASKET ****************/
const basket = {
  width: 80,
  height: 50,
  x: W/2 - 40,
  y: H - 90,
  speed: 8,
  left:false,
  right:false
};

/**************** INPUT ****************/
window.addEventListener("keydown", e=>{
  if(["ArrowLeft","a","A"].includes(e.key)) basket.left=true;
  if(["ArrowRight","d","D"].includes(e.key)) basket.right=true;
});
window.addEventListener("keyup", e=>{
  if(["ArrowLeft","a","A"].includes(e.key)) basket.left=false;
  if(["ArrowRight","d","D"].includes(e.key)) basket.right=false;
});
canvas.addEventListener("touchmove", e=>{
  const rect = canvas.getBoundingClientRect();
  const posX = e.touches[0].clientX - rect.left;
  basket.x = Math.max(0, Math.min(posX - basket.width/2, W - basket.width));
});

/**************** HUD ****************/
function updateScore(){ scoreEl.textContent = score; }
function updateHearts(){
  heartsEls.forEach((h,i)=>h.style.opacity = i < lives ? "1" : ".2");
}

/**************** HIGH SCORES ****************/
function getHighScores() {
  try { return JSON.parse(localStorage.getItem("bbScores")) || []; }
  catch { return []; }
}
function saveHighScoreEntry(entry) {
  let scores = getHighScores();
  scores.push(entry);
  scores.sort((a,b)=>b.score - a.score);
  scores = scores.slice(0,5);
  localStorage.setItem("bbScores", JSON.stringify(scores));
}
function displayHighScores(){
  scoreList.innerHTML = "";
  getHighScores().forEach((e,i)=>{
    const li = document.createElement("li");
    li.textContent = `${i+1}. ${e.name} — ${e.score}`;
    scoreList.appendChild(li);
  });
}

/**************** GAME OBJECTS ****************/
function spawnItem(){
  const img = SPR.items[Math.floor(Math.random()*SPR.items.length)];
  let maxSpeed = 3 + (score/1000);
  items.push({ img, x:Math.random()*(W-48), y:-48, w:48, h:48, s:Math.min(maxSpeed,4)});
}
function hit(a,b){
  return !(a.x+a.w<b.x || a.x>b.x+b.width || a.y+a.h<b.y || a.y>b.y+b.height);
}
function makeSparkles(x,y){
  for(let i=0;i<6;i++) sparkles.push({
    x,y,size:18,opacity:1,
    angle:Math.random()*Math.PI*2,speed:2
  });
}

/**************** GAME LOOP ****************/
function update(){
  if(basket.left) basket.x = Math.max(0, basket.x - basket.speed);
  if(basket.right) basket.x = Math.min(W-basket.width, basket.x + basket.speed);

  if(Math.random() < spawnRate) spawnItem();

  items = items.filter(it=>{
    it.y += it.s;
    if(hit(it,basket)){ score+=10; updateScore(); makeSparkles(it.x,it.y); return false; }
    if(it.y>H){ lives--; updateHearts(); if(lives<=0){ endGame(); } return false; }
    return true;
  });

  sparkles = sparkles.filter(s=>{
    s.x+=Math.cos(s.angle)*s.speed;
    s.y+=Math.sin(s.angle)*s.speed;
    s.opacity-=0.03;
    return s.opacity>0;
  });
}

function draw(){
  ctx.clearRect(0,0,W,H);
  items.forEach(it=>ctx.drawImage(it.img,it.x,it.y,it.w,it.h));
  ctx.drawImage(SPR.basket,basket.x,basket.y,basket.width,basket.height);
  sparkles.forEach(s=>{
    ctx.save();
    ctx.globalAlpha=s.opacity;
    ctx.globalCompositeOperation="lighter";
    ctx.drawImage(SPR.sparkle,s.x,s.y,s.size,s.size);
    ctx.restore();
  });
  ctx.globalAlpha=1;
}

function loop(){
  if(!running) return;
  update(); draw();
  requestAnimationFrame(loop);
}

/**************** FLOW ****************/
async function startGame(){
  if(!SPR.items.length) await loadSprites();

  retryScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  score=0; lives=3; items=[]; sparkles=[];
  updateScore(); updateHearts();

  hud.style.display = "flex";
  nameEntry.classList.add("hidden");

  running = true;

  doors.classList.add("open");
  setTimeout(()=>{
    startScreen.classList.add("hidden");
    doors.classList.remove("open");
    loop();
  },900);
}

function endGame(){
  running=false;
  hud.style.display="none";

  finalScoreEl.textContent = score;
  gameScreen.classList.add("hidden");
  retryScreen.classList.remove("hidden");

  const prevScores = getHighScores();
  const qualifies = prevScores.length < 5 || score > prevScores[prevScores.length-1].score;

  displayHighScores();

  if(qualifies){
    nameEntry.classList.remove("hidden");
  }
}

/**************** BUTTONS ****************/
/************* MOUSE CONTROLS *************/
canvas.addEventListener("mousemove", (e) => {
  if (!running) return;
  const rect = canvas.getBoundingClientRect();
  const posX = e.clientX - rect.left;
  basket.x = Math.max(0, Math.min(posX - basket.width / 2, W - basket.width));
});

startBtn.onclick = startGame;
retryBtn.onclick = startGame;
homeBtn.onclick = ()=>{
  retryScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
  hud.style.display="none";
};

saveNameBtn.onclick = ()=>{
  let name = playerNameInput.value.trim() || "Boss";
  saveHighScoreEntry({name, score});
  displayHighScores();
  nameEntry.classList.add("hidden");
};

/* Initial state */
hud.style.display="none";
displayHighScores();
