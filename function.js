
const h1 = document.querySelector('h1');
const p  = document.querySelector('p');


const textoH1 = 'Hudson Henrique';
const textoP  = 'Bogarim Brito';


const velocidade   = 100;   
const velocidadeAp = 60;    
const pausaVisivel = 4000;  
const pausaVazio   = 500;   



function digitar(el, texto) {
    return new Promise(resolve => {
        let i = 0;
        el.classList.add('cursor');
        el.textContent = '';

        function loop() {
            if (i < texto.length) {
                el.textContent += texto[i];
                i++;
                setTimeout(loop, velocidade);
            } else {
                el.classList.remove('cursor');
                resolve();
            }
        }
        loop();
    });
}

function apagar(el) {
    return new Promise(resolve => {
        function loop() {
            if (el.textContent.length > 0) {
                el.textContent = el.textContent.slice(0, -1);
                setTimeout(loop, velocidadeAp);
            } else {
                resolve();
            }
        }
        loop();
    });
}

function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function ciclo() {
    while (true) {
        await digitar(h1, textoH1);
        await digitar(p, textoP);

        await esperar(pausaVisivel);

        // apaga os dois ao mesmo tempo
        await Promise.all([apagar(h1), apagar(p)]);

        await esperar(pausaVazio);
    }
}


function iniciarParticulas() {
    const canvas = document.getElementById('particulas');
    const ctx    = canvas.getContext('2d');
    const tela1  = document.getElementById('tela1');

    const QTD_PARTICULAS = 80;
    const DIST_CONEXAO   = 140;
    const VEL_MAX        = 0.5;
    const COR_PONTO      = 'rgba(0, 220, 110,';
    const COR_LINHA      = 'rgba(0, 220, 110,';

    function redimensionar() {
        canvas.width  = tela1.offsetWidth;
        canvas.height = tela1.offsetHeight;
    }
    redimensionar();
    window.addEventListener('resize', redimensionar);

    const particulas = Array.from({ length: QTD_PARTICULAS }, () => ({
        x:  Math.random() * canvas.width,
        y:  Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * VEL_MAX * 2,
        vy: (Math.random() - 0.5) * VEL_MAX * 2,
        r:  Math.random() * 1.5 + 1,
    }));

    function animar() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // mover
        for (const p of particulas) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        }

        // linhas
        for (let i = 0; i < particulas.length; i++) {
            for (let j = i + 1; j < particulas.length; j++) {
                const dx   = particulas[i].x - particulas[j].x;
                const dy   = particulas[i].y - particulas[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < DIST_CONEXAO) {
                    const alpha = (1 - dist / DIST_CONEXAO) * 0.35;
                    ctx.beginPath();
                    ctx.strokeStyle = COR_LINHA + alpha + ')';
                    ctx.lineWidth   = 0.8;
                    ctx.moveTo(particulas[i].x, particulas[i].y);
                    ctx.lineTo(particulas[j].x, particulas[j].y);
                    ctx.stroke();
                }
            }
        }

        // pontos
        for (const p of particulas) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = COR_PONTO + '0.7)';
            ctx.fill();
        }

        requestAnimationFrame(animar);
    }
    animar();
}


function iniciarOndas() {
    const canvas = document.getElementById('ondas');
    const ctx    = canvas.getContext('2d');
    const tela2  = document.getElementById('tela2');

    function redimensionar() {
        canvas.width  = tela2.offsetWidth;
        canvas.height = tela2.offsetHeight;
    }
    redimensionar();
    window.addEventListener('resize', redimensionar);

    const ondas = [
        { amp: 60,  freq: 0.008, vel: 0.018, fase: 0,    alpha: 0.10, largura: 2.5 },
        { amp: 45,  freq: 0.012, vel: 0.025, fase: 1.5,  alpha: 0.12, largura: 1.8 },
        { amp: 80,  freq: 0.005, vel: 0.012, fase: 3.0,  alpha: 0.07, largura: 3.5 },
        { amp: 30,  freq: 0.018, vel: 0.035, fase: 0.8,  alpha: 0.15, largura: 1.2 },
        { amp: 55,  freq: 0.010, vel: 0.020, fase: 4.2,  alpha: 0.09, largura: 2.0 },
    ];

    let tempo = 0;

    function animar() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        tempo += 1;

        const centroY = canvas.height / 2;

        for (const onda of ondas) {
            ctx.beginPath();

            // linha de cima (onda)
            for (let x = 0; x <= canvas.width; x += 2) {
                const y = centroY + Math.sin(x * onda.freq + tempo * onda.vel + onda.fase) * onda.amp;
                x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }

            ctx.strokeStyle = `rgba(0, 220, 110, ${onda.alpha})`;
            ctx.lineWidth   = onda.largura;
            ctx.stroke();
        }

        requestAnimationFrame(animar);
    }
    animar();
}



document.addEventListener('DOMContentLoaded', () => {
    ciclo();
    iniciarParticulas();
    iniciarOndas();

    const wrapper     = document.getElementById('wrapper');
    const dots        = Array.from(document.querySelectorAll('.dot'));
    const total       = document.querySelectorAll('.tela').length;
    const socialIcons = document.querySelector('.social-icons');
    let atual         = 0;
    let animando      = false;

    function mostrarIcons(delay = 0) {
        setTimeout(() => {
            socialIcons.classList.remove('visible');
            void socialIcons.offsetWidth; // força reflow para reiniciar a animação
            socialIcons.classList.add('visible');
        }, delay);
    }

    
    mostrarIcons(300);

    function irPara(index) {
        if (index < 0 || index >= total || animando) return;
        animando = true;
        atual = index;

        wrapper.style.transform = `translateY(-${atual * 100}vh)`;

        dots.forEach((d, i) => {
            d.classList.toggle('ativo', i === atual);
        });

       
        if (index === 0) mostrarIcons(400);

        setTimeout(() => { animando = false; }, 750);
    }

    // Scroll do mouse
    window.addEventListener('wheel', (e) => {
        if (e.deltaY > 0) irPara(atual + 1);
        else irPara(atual - 1);
    });

    
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            irPara(parseInt(dot.dataset.index));
        });
    });
});
