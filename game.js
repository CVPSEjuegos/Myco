const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ---- Jugador / parásito ----
let player = { x: 400, y: 300, size: 15, speed: 3, energy: 0, level: 1, color: '#8FBC8F' };

// ---- Niveles / especies ----
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

// ---- Escenario ----
let hosts = [];
let spores = [];
let hongo = {x:100,y:300};
let raton = {x:700,y:300,size:60};
let organs = [];

// ---- Inicializar órganos ----
function initOrgans(){
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

// ---- Animación inicial hongo ----
function startAnimation(){
  spores = [];
  for(let i=0;i<20;i++){
    spores.push({
      x: hongo.x,
      y: hongo.y,
      vx: (raton.x-hongo.x)/100 + Math.random()*0.5,
      vy: (raton.y-hongo.y)/100 + Math.random()*0.5,
      size: 3+Math.random()*2
    });
  }
  requestAnimationFrame(animationLoop);
}

function animationLoop(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawBackground();

  // Hongo
  ctx.beginPath();
  ctx.arc(hongo.x,hongo.y,30,0,Math.PI*2);
  ctx.fillStyle='red';
  ctx.fill();
  for(let i=0;i<10;i++){
    ctx.beginPath();
    ctx.arc(hongo.x+Math.random()*20-10,hongo.y+Math.random()*20-10,5,0,Math.PI*2);
    ctx.fillStyle='purple';
    ctx.fill();
  }

  // Ratón
  ctx.beginPath();
  ctx.arc(raton.x, raton.y, raton.size,0,Math.PI*2);
  ctx.fillStyle='brown';
  ctx.fill();

  // Spores
  spores.forEach(s=>{
    s.x+=s.vx; s.y+=s.vy;
    ctx.beginPath();
    ctx.arc(s.x,s.y,s.size,0,Math.PI*2);
    ctx.fillStyle=`hsl(${Math.random()*360},80%,50%)`;
    ctx.fill();
  });

  // Colisión spore-ratón
  let infected = spores.some(s=>{
    let dx = s.x-raton.x, dy = s.y-raton.y;
    return Math.sqrt(dx*dx+dy*dy)<raton.size;
  });

  if(infected){
    initOrgans();
    spawnHosts(3); // más hosts vivos
    gameLoop();
    return;
  }

  requestAnimationFrame(animationLoop);
}

// ---- Dibuja jugador vivo con tentáculos ----
function drawPlayer(){
  ctx.beginPath();
  const points = 6+Math.floor(player.energy/10);
  for(let i=0;i<points;i++){
    let angle=(i/points)*Math.PI*2;
    let radius=player.size+Math.sin(performance.now()/500+i)*5;
    let x=player.x+Math.cos(angle)*radius;
    let y=player.y+Math.sin(angle)*radius;
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.closePath();
  ctx.fillStyle = player.color;
  ctx.fill();
}

// ---- Dibuja órganos ----
function drawOrgans(){
  organs.forEach(o=>{
    ctx.beginPath();
    ctx.arc(o.x,o.y,o.size,0,Math.PI*2);
    ctx.fillStyle=o.eaten?player.color:'pink';
    ctx.fill();
  });
}

// ---- Dibuja hosts ----
function drawHosts(){
  hosts.forEach(h=>{
    h.x+=h.vx; h.y+=h.vy;
    if(h.x<0||h.x>canvas.width) h.vx*=-1;
    if(h.y<0||h.y>canvas.height) h.vy*=-1;
    ctx.beginPath();
    ctx.ellipse(h.x,h.y,h.size,h.size*0.6,0,0,Math.PI*2);
    ctx.fillStyle=h.infected?'#FF6347':h.color;
    ctx.fill();
    // ojos
    ctx.beginPath();
    ctx.arc(h.x+5,h.y-5,3,0,Math.PI*2);
    ctx.fillStyle='#000';
    ctx.fill();
  });
}

// ---- Background de alcantarilla ----
function drawBackground(){
  ctx.fillStyle='#1a1a1a';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle='#333';
  ctx.lineWidth=10;
  for(let i=0;i<5;i++){
    ctx.beginPath();
    ctx.moveTo(0,i*120);
    ctx.lineTo(canvas.width,i*120);
    ctx.stroke();
  }
  for(let i=0;i<5;i++){
    ctx.beginPath();
    ctx.ellipse(Math.random()*canvas.width,Math.random()*canvas.height,30,15,0,0,Math.PI*2);
    ctx.fillStyle='rgba(0,50,0,0.5)';
    ctx.fill();
  }
  for(let i=0;i<10;i++){
    ctx.fillStyle='#444';
    ctx.fillRect(Math.random()*canvas.width,Math.random()*canvas.height,10,10);
  }
}

// ---- Movimiento jugador ----
function updatePlayer(){
  if(keys['ArrowUp']||keys['w']) player.y-=player.speed;
  if(keys['ArrowDown']||keys['s']) player.y+=player.speed;
  if(keys['ArrowLeft']||keys['a']) player.x-=player.speed;
  if(keys['ArrowRight']||keys['d']) player.x+=player.speed;
  player.x=Math.max(player.size,Math.min(canvas.width-player.size,player.x));
  player.y=Math.max(player.size,Math.min(canvas.height-player.size,player.y));
}

// ---- Colisión jugador-orgános ----
function checkOrganCollision(){
  organs.forEach(o=>{
    let dx=player.x-o.x, dy=player.y-o.y;
    if(!o.eaten && Math.sqrt(dx*dx+dy*dy)<player.size+o.size){
      o.eaten=true;
      player.energy+=5;
      document.getElementById('energy').innerText=player.energy;
      evolvePlayer();
      saveGame();
      checkLevelUp();
    }
  });
}

// ---- Evolución ----
function evolvePlayer(){
  let newLevel=Math.floor(player.energy/20)+1;
  if(newLevel>player.level){
    player.level=newLevel;
    document.getElementById('level').innerText=player.level;
    player.color=`hsl(${Math.random()*360},80%,50%)`;
    player.speed+=0.5;
  }
}

// ---- Niveles ----
function checkLevelUp(){
  if(currentLevel<levels.length-1 && player.energy>=levels[currentLevel].energyRequired){
    currentLevel++;
    currentSpecies=levels[currentLevel].name;
    document.getElementById('species').innerText=currentSpecies;
    raton.size+=20;
    player.size=15;
    initOrgans();
  }
}

// ---- Guardado ----
function saveGame(){
  localStorage.setItem('hyphaeon',JSON.stringify({
    energy:player.energy,
    level:currentLevel,
    species:currentSpecies,
    size:player.size
  }));
}

function loadGame(){
  const data=JSON.parse(localStorage.getItem('hyphaeon'));
  if(data){
    player.energy=data.energy;
    currentLevel=data.level;
    currentSpecies=data.species;
    player.size=data.size;
    document.getElementById('energy').innerText=player.energy;
    document.getElementById('level').innerText=player.level;
    document.getElementById('species').innerText=playerSpecies;
    initOrgans();
  }
}

// ---- Loop del juego ----
function gameLoop(){
  drawBackground();
  updatePlayer();
  drawHosts();
  drawOrgans();
  drawPlayer();
  checkOrganCollision();
  requestAnimationFrame(gameLoop);
}

// ---- Inicializar partida ----
loadGame();
