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

// --- 1. CARGA DE CONTENIDO ---
async function cargarPeliculas(url) {
    try {
        const res = await fetch(url, options);
        const data = await res.json();
        renderizar(data.results);
    } catch (e) { console.error("Error API:", e); }
}

function renderizar(lista) {
    contenedor.innerHTML = '';
    lista.forEach(item => {
        if (!item.poster_path) return;
        const nombre = item.title || item.name;
        const q = encodeURIComponent(nombre);
        
        const div = document.createElement('div');
        div.className = 'pelicula';
        div.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${item.poster_path}">
            <div class="info">
                <strong>${nombre}</strong>
                <div class="platform-links">
                    <button class="btn-stream netflix" onclick="openS(event, 'https://www.netflix.com/search?q=${q}')">Netflix</button>
                    <button class="btn-stream hbo" onclick="openS(event, 'https://www.max.com/search/${q}')">Max</button>
                    <button class="btn-stream prime" onclick="openS(event, 'https://www.amazon.com/s?k=${q}&i=instant-video')">Prime</button>
                    <button class="btn-stream crunchy" onclick="openS(event, 'https://www.crunchyroll.com/search?q=${q}')">Crunchy</button>
                    <button class="btn-stream pluto" onclick="openS(event, 'https://pluto.tv/search/details/movies/${q}')">Pluto</button>
                </div>
            </div>
        `;
        div.onclick = () => verTrailer(item.id, item.media_type || 'movie');
        contenedor.appendChild(div);
    });
}

function openS(e, url) {
    e.stopPropagation();
    window.open(url, '_blank');
}

// --- 2. BUSCADOR ---
buscador.addEventListener('input', (e) => {
    const val = e.target.value;
    if (val.length > 2) {
        cargarPeliculas(`https://api.themoviedb.org/3/search/multi?query=${val}&language=es-ES`);
    } else if (val.length === 0) {
        cargarPeliculas('https://api.themoviedb.org/3/trending/all/day?language=es-ES');
    }
});

// --- 3. TRAILERS ---
async function verTrailer(id, tipo) {
    const res = await fetch(`https://api.themoviedb.org/3/${tipo}/${id}/videos?language=es-ES`, options);
    const data = await res.json();
    const video = data.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    if (video) {
        trailerFrame.src = `https://www.youtube.com/embed/${video.key}?autoplay=1`;
        trailerModal.classList.add('active');
    } else { alert("Tráiler no disponible."); }
}

closeModal.onclick = () => { trailerModal.classList.remove('active'); trailerFrame.src = ''; };

// --- 4. ANIMACIÓN LIQUID GLASS ---
const canvas = document.getElementById('liquidCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.onresize = resize;
resize();

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.r = Math.random() * 100 + 60;
        this.color = Math.random() > 0.5 ? '#007bff' : '#6b8e23';
        this.vx = (Math.random() - 0.5) * 1.2;
        this.vy = (Math.random() - 0.5) * 1.2;
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.3;
        ctx.fill();
    }
}

for (let i = 0; i < 18; i++) particles.push(new Particle());

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => p.update());
    requestAnimationFrame(animate);
}

cargarPeliculas('https://api.themoviedb.org/3/trending/all/day?language=es-ES');
animate();
