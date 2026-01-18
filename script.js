const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiMGE0Y2RiMDU2YWRmYTE1MWI4MjdlOGJiOTQ4OTliNyIsIm5iZiI6MTc2ODc3MzExNC42MDA5OTk4LCJzdWIiOiI2OTZkNTVmYTEzZDUzZDRjMmVkY2I3Y2QiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.nqPqozB7lq6QDtQFClcCkKHR3nSw6tdtcBSR1wMv5oA';

const contenedor = document.getElementById('contenedor');
const buscador = document.getElementById('buscador');
const trailerModal = document.getElementById('trailerModal');
const trailerFrame = document.getElementById('trailerFrame');
const closeModal = document.getElementById('closeModal');

const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${TOKEN}`
    }
};

// 1. CARGAR DATOS DE API
async function cargarPeliculas(url) {
    const res = await fetch(url, options);
    const data = await res.json();
    renderizar(data.results);
}

function renderizar(lista) {
    contenedor.innerHTML = '';
    lista.forEach(item => {
        if (!item.poster_path) return;
        const div = document.createElement('div');
        div.className = 'pelicula';
        div.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${item.poster_path}">
            <div class="info">
                <strong>${item.title || item.name}</strong>
                <p class="voto">⭐ ${item.vote_average.toFixed(1)}</p>
            </div>
        `;
        div.onclick = () => verTrailer(item.id, item.media_type || 'movie');
        contenedor.appendChild(div);
    });
}

// 2. BUSCADOR
buscador.addEventListener('input', (e) => {
    const query = e.target.value;
    if (query.length > 2) {
        cargarPeliculas(`https://api.themoviedb.org/3/search/multi?query=${query}&language=es-ES`);
    } else {
        cargarPeliculas('https://api.themoviedb.org/3/trending/all/day?language=es-ES');
    }
});

// 3. TRAILERS
async function verTrailer(id, tipo) {
    const res = await fetch(`https://api.themoviedb.org/3/${tipo}/${id}/videos?language=es-ES`, options);
    const data = await res.json();
    const video = data.results.find(v => v.type === 'Trailer');
    if (video) {
        trailerFrame.src = `https://www.youtube.com/embed/${video.key}?autoplay=1`;
        trailerModal.classList.add('active');
    } else {
        alert("Tráiler no disponible.");
    }
}

closeModal.onclick = () => {
    trailerModal.classList.remove('active');
    trailerFrame.src = '';
};

// 4. ANIMACIÓN LIQUID GLASS (CANVAS)
const canvas = document.getElementById('liquidCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 100 + 50;
        this.color = Math.random() > 0.5 ? '#007bff' : '#6b8e23';
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

for (let i = 0; i < 15; i++) particles.push(new Particle());

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => p.update());
    requestAnimationFrame(animate);
}

cargarPeliculas('https://api.themoviedb.org/3/trending/all/day?language=es-ES');
animate();