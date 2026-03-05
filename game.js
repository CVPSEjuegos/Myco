const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ---- Jugador / parásito ----
let player = {
  x: 400,
  y: 300,
  size: 15,
  speed: 3,
  energy: 0,
  level: 1,
  color: '#8FBC8F'
};

// ---- Especies y Niveles ----
const levels = [
  {name: "Ratón", energyRequired: 50, organsCount: 6},
  {name: "Conejo", energyRequired: 150, organsCount: 8},
  {name: "Humano", energyRequired: 400, organsCount: 12},
  {name: "Depredador Final", energyRequired: 1000, organsCount: 16}
];

let currentLevel = 0;
let currentSpecies = levels[currentLevel].name;

// ---- Movimiento ----
let keys = {};
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

// ---- Partículas / Spores ----
let spores = [];
let hongo = {x: 100, y: 300};
let raton = {x: 700, y: 300, size: 60};
let organs = [];

// ---- Inicializa órganos del ratón ----
function initOrgans() {
  organs = [];
  for(let i=0;i<levels[currentLevel].organsCount;i++){
    organs.push({
      x: raton.x + Math.random()*40 - 20,
      y: raton.y + Math.random()*40 - 20,
      size: 10 + Math.random()*10,
      eaten: false
    });
  }
}

// ---- Animación inicial del hongo ----
function startAnimation() {
  spores = [];
  for(let i=0;i<20;i++){
    spores.push({
      x: hongo.x,
      y: hongo.y,
      vx: (raton.x - hongo.x)/100 + Math.random()*0.5,
      vy: (raton.y - hongo.y)/100 + Math.random()*0.5,
      size: 3 + Math.random()*2
    });
  }
  requestAnimationFrame(animationLoop);
}

function animationLoop() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Dibujar hongo
  ctx.beginPath();
  ctx.arc(hongo.x, hongo.y, 30,0,Math.PI*2);
  ctx.fillStyle = 'red';
  ctx.fill();
  // puntos morados
  for(let i=0;i<10;i++){
    ctx.beginPath();
    ctx.arc(hongo.x + Math.random()*20-10, hongo.y + Math.random()*20-10, 5,0,Math.PI*2);
    ctx.fillStyle = 'purple';
    ctx.fill();
  }

  // Dibujar ratón
  ctx.beginPath();
  ctx.arc(raton.x, raton.y, raton.size,0,Math.PI*2);
  ctx.fillStyle = 'brown';
  ctx.fill();

  // Dibujar spores
  spores.forEach(s=>{
    s.x += s.vx;
    s.y += s.vy;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size,0,Math.PI*2);
    ctx.fillStyle = `hsl(${Math.random()*360},80%,50%)`;
    ctx.fill();
  });

  // Revisar colisión spores-ratón
  let infected = spores.some(s=>{
    let dx = s.x - raton.x;
    let dy = s.y - raton.y;
    return Math.sqrt(dx*dx + dy*dy) < raton.size;
  });

  if(infected){
    initOrgans(); // iniciar órganos
    gameLoop(); // empezar juego dentro del ratón
    return;
  }

  requestAnimationFrame(animationLoop);
}

// ---- Dibuja jugador con apéndices ----
function drawPlayer() {
  // Cuerpo principal
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.size,0,Math.PI*2);
  ctx.fillStyle = player.color;
  ctx.fill();

  // Apéndices
  let numBlasts = Math.floor(player.energy / 10);
  for(let i=0;i<numBlasts;i++){
    let angle = (i/numBlasts)*Math.PI*2 + performance.now()/1000;
    let length = player.size + 10 + Math.sin(performance.now()/500 + i)*5;
    let endX = player.x + Math.cos(angle)*length;
    let endY = player.y + Math.sin(angle)*length;
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = player.color;
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

// ---- Dibuja órganos ----
function drawOrgans(){
  organs.forEach(o=>{
    ctx.beginPath();
    ctx.arc(o.x, o.y, o.size,0,Math.PI*2);
    ctx.fillStyle = o.eaten ? player.color : 'pink';
    ctx.fill();
  });
}

// ---- Movimiento jugador ----
function updatePlayer(){
  if(keys['ArrowUp'] || keys['w']) player.y -= player.speed;
  if(keys['ArrowDown'] || keys['s']) player.y += player.speed;
  if(keys['ArrowLeft'] || keys['a']) player.x -= player.speed;
  if(keys['ArrowRight'] || keys['d']) player.x += player.speed;

  // Limites canvas
  player.x = Math.max(player.size, Math.min(canvas.width - player.size, player.x));
  player.y = Math.max(player.size, Math.min(canvas.height - player.size, player.y));
}

// ---- Colisión jugador-orgános ----
function checkOrganCollision(){
  organs.forEach(o=>{
    let dx = player.x - o.x;
    let dy = player.y - o.y;
    if(!o.eaten && Math.sqrt(dx*dx+dy*dy)<player.size+o.size){
      o.eaten = true;
      player.energy += 5;
      document.getElementById('energy').innerText = player.energy;
      evolvePlayer();
      saveGame();
      checkLevelUp();
    }
  });
}

// ---- Evolución ----
function evolvePlayer(){
  let newLevel = Math.floor(player.energy / 20) + 1;
  if(newLevel > player.level){
    player.level = newLevel;
    document.getElementById('level').innerText = player.level;
    player.color = `hsl(${Math.random()*360},80%,50%)`;
    player.speed += 0.5;
  }
}

// ---- Niveles ----
function checkLevelUp(){
  if(currentLevel<levels.length-1 && player.energy >= levels[currentLevel].energyRequired){
    currentLevel++;
    currentSpecies = levels[currentLevel].name;
    document.getElementById('species').innerText = currentSpecies;
    raton.size += 20; // nuevo huésped más grande
    player.size = 15; // reset tamaño relativo
    initOrgans();
  }
}

// ---- Guardado ----
function saveGame(){
  localStorage.setItem('hyphaeon',JSON.stringify({
    energy: player.energy,
    level: currentLevel,
    species: currentSpecies,
    size: player.size
  }));
}

function loadGame(){
  const data = JSON.parse(localStorage.getItem('hyphaeon'));
  if(data){
    player.energy = data.energy;
    currentLevel = data.level;
    currentSpecies = data.species;
    player.size = data.size;
    document.getElementById('energy').innerText = player.energy;
    document.getElementById('level').innerText = player.level;
    document.getElementById('species').innerText = player.species;
    initOrgans();
  }
}

// ---- Loop del juego ----
function gameLoop(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  updatePlayer();
  drawOrgans();
  drawPlayer();
  checkOrganCollision();
  requestAnimationFrame(gameLoop);
}

// ---- Cargar partida al inicio ----
loadGame();
