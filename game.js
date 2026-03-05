const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = {
  x: 400,
  y: 300,
  size: 15,
  speed: 3,
  energy: 0,
  level: 1,
  color: '#8FBC8F'
};

let keys = {};
let particles = [];
let hosts = []; // humanos u animales infectables

// Eventos de teclado
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

// Crear partículas de comida
function spawnParticles(count) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 5 + Math.random() * 5
    });
  }
}

// Crear hosts (humanos/animales)
function spawnHosts(count) {
  for (let i = 0; i < count; i++) {
    hosts.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 30,
      infected: false
    });
  }
}

// Dibujar jugador
function drawPlayer() {
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
  ctx.fillStyle = player.color;
  ctx.fill();
}

// Dibujar partículas
function drawParticles() {
  ctx.fillStyle = '#FFD700';
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Dibujar hosts
function drawHosts() {
  hosts.forEach(h => {
    ctx.beginPath();
    ctx.arc(h.x, h.y, h.size, 0, Math.PI * 2);
    ctx.fillStyle = h.infected ? '#FF6347' : '#00BFFF';
    ctx.fill();
  });
}

// Colisiones con partículas
function checkParticleCollision() {
  particles = particles.filter(p => {
    const dx = player.x - p.x;
    const dy = player.y - p.y;
    const distance = Math.sqrt(dx*dx + dy*dy);
    if (distance < player.size + p.size) {
      player.energy += 1;
      document.getElementById('energy').innerText = player.energy;
      player.size = 15 + player.energy * 0.5; 
      return false;
    }
    return true;
  });
}

// Colisiones con hosts
function checkHostCollision() {
  hosts.forEach(h => {
    const dx = player.x - h.x;
    const dy = player.y - h.y;
    const distance = Math.sqrt(dx*dx + dy*dy);
    if (distance < player.size + h.size && !h.infected) {
      h.infected = true; 
      player.energy += 5;
      document.getElementById('energy').innerText = player.energy;
      evolvePlayer();
    }
  });
}

// Movimiento del jugador
function updatePlayer() {
  if (keys['ArrowUp'] || keys['w']) player.y -= player.speed;
  if (keys['ArrowDown'] || keys['s']) player.y += player.speed;
  if (keys['ArrowLeft'] || keys['a']) player.x -= player.speed;
  if (keys['ArrowRight'] || keys['d']) player.x += player.speed;

  // Limites
  player.x = Math.max(player.size, Math.min(canvas.width - player.size, player.x));
  player.y = Math.max(player.size, Math.min(canvas.height - player.size, player.y));
}

// Evolución básica
function evolvePlayer() {
  const newLevel = Math.floor(player.energy / 20) + 1;
  if (newLevel > player.level) {
    player.level = newLevel;
    document.getElementById('level').innerText = player.level;
    player.color = `hsl(${Math.random()*360}, 80%, 50%)`; // cambia color para simbolizar evolución
    player.speed += 0.5; // aumenta velocidad al evolucionar
  }
}

// Loop principal
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updatePlayer();
  drawParticles();
  drawHosts();
  drawPlayer();
  checkParticleCollision();
  checkHostCollision();
  requestAnimationFrame(gameLoop);
}

// Iniciar juego
spawnParticles(30);
spawnHosts(5);
gameLoop();
