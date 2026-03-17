// ============================================================
// CARROSSEIS DE VENDAS — RM + VV
// Mesmo padrão visual de rm-trafego-v1/v2 (Inter 900)
// FLUX Pro para imagens + Playwright para export 1080x1080
// ============================================================

const { chromium } = require('playwright');
const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');
const os    = require('os');

const FAL_API_KEY = '400657a5-0fc0-4296-bfa6-72d6351ec06e:c49380e283310cd8cb8c734af4b8d5bf';
const BASE     = path.resolve(__dirname, '..');
const IMG_BASE = BASE.replace(/\\/g, '/');

const GREEN = '#1B3A2D';
const GOLD  = '#C9A84C';
const WHITE = '#FFFFFF';
const GREY  = '#6B8A7A';

// ── FLUX ─────────────────────────────────────────────────
async function gerarImagem(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      prompt, image_size: 'square_hd',
      num_inference_steps: 28, guidance_scale: 3.5,
      num_images: 1, safety_tolerance: '5'
    });
    const req = https.request({
      hostname: 'fal.run', path: '/fal-ai/flux-pro', method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          if (j.images?.[0]?.url) resolve(j.images[0].url);
          else reject(new Error(d.substring(0, 300)));
        } catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

async function baixarImagem(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    (url.startsWith('https') ? https : http).get(url, res => {
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(dest); });
    }).on('error', reject);
  });
}

// ── MESMO HTML DO gerar.js ────────────────────────────────
function slideHTML({ counter, label, title, body, bg, titleSize = 68, cta }) {
  const isPhoto = !!bg;
  const bgCSS = isPhoto
    ? `background: url('${bg}') center/cover no-repeat;`
    : `background: ${GREEN};`;

  const overlay = isPhoto
    ? `<div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.88) 0%,rgba(0,0,0,.35) 55%,rgba(0,0,0,.1) 100%);"></div>`
    : '';

  const labelHTML = label
    ? `<p style="font-family:'Inter',sans-serif;font-size:11px;font-weight:700;letter-spacing:4px;color:${GOLD};text-transform:uppercase;margin-bottom:20px;">${label}</p>`
    : '';

  const ctaHTML = cta
    ? `<div style="display:inline-block;margin-top:28px;background:${GOLD};padding:14px 36px;font-family:'Inter',sans-serif;font-size:16px;font-weight:700;letter-spacing:2px;color:#0D2218;text-transform:uppercase;">${cta}</div>`
    : '';

  return `<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;700;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{width:1080px;height:1080px;overflow:hidden;font-family:'Inter',sans-serif;}
.slide{position:relative;width:1080px;height:1080px;${bgCSS}display:flex;flex-direction:column;justify-content:flex-end;padding:72px;}
</style>
</head><body>
<div class="slide">
  ${overlay}
  <span style="position:absolute;top:52px;left:72px;font-size:13px;color:${GREY};letter-spacing:1.5px;">${counter}</span>
  <div style="position:relative;z-index:1;">
    ${labelHTML}
    <p style="font-size:${titleSize}px;font-weight:900;color:${WHITE};line-height:1.04;letter-spacing:-.5px;text-transform:uppercase;">${title}</p>
    <div style="width:36px;height:3px;background:${GOLD};margin:22px 0;"></div>
    <p style="font-size:27px;font-weight:300;color:rgba(255,255,255,.92);line-height:1.55;">${body}</p>
    ${ctaHTML}
  </div>
  <span style="position:absolute;bottom:52px;right:72px;font-size:13px;color:${GREY};">@cesaraugustoo__</span>
</div>
</body></html>`;
}

// ── SCREENSHOT ────────────────────────────────────────────
async function screenshot(html, outPath, page) {
  const tmp = path.join(os.tmpdir(), `s-${Date.now()}.html`);
  fs.writeFileSync(tmp, html, 'utf8');
  await page.goto(`file:///${tmp.replace(/\\/g, '/')}`, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(700);
  await page.screenshot({ path: outPath, clip: { x:0, y:0, width:1080, height:1080 } });
  fs.unlinkSync(tmp);
}

// ── DADOS DOS CARROSSEIS ──────────────────────────────────

// foto local do César
const CESAR = `file:///${IMG_BASE}/img/hero-cesar.jpg`;

function rmSlides(imgs) { return [
  {
    bg: imgs.rm1, counter: '01 / 09', titleSize: 80,
    title: 'VOCÊ QUER CONSERTAR.<br>MAS NÃO SABE COMO.',
    body: 'Você errou. Ela sabe.<br>E o silêncio dentro de casa pesa mais do que qualquer briga.',
  },
  {
    counter: '02 / 09', titleSize: 76,
    title: 'VOCÊ TROCOU TUDO<br>POR NADA. E AGORA SABE.',
    body: 'Não foi falta de amor por ela.<br>Foi algo quebrado em você, antes do casamento.<br>O problema é que você ainda não sabe o que foi.',
  },
  {
    counter: '03 / 09', titleSize: 80,
    title: 'PEDIR PERDÃO NÃO É<br>O SUFICIENTE.',
    body: 'Você pediu desculpa. Ela continua distante.<br>Arrependimento sem mudança real<br>é só mais uma decepção.',
  },
  {
    bg: imgs.rm4, counter: '04 / 09', titleSize: 76,
    title: 'A TRAIÇÃO FOI SINTOMA.<br>A CAUSA ESTÁ EM VOCÊ.',
    body: 'Antes de reconstruir o casamento,<br>você precisa reconstruir o homem que virou isso.',
  },
  {
    bg: CESAR, counter: '05 / 09', titleSize: 60,
    label: 'QUEM É CÉSAR AUGUSTO',
    title: 'JÁ ACOMPANHEI MAIS DE<br>200 HOMENS NESSE PROCESSO.',
    body: 'Psicanalista. Casado. Especialista em homens que traíram.<br>Não vim te julgar. Vim te mostrar o caminho.',
  },
  {
    counter: '06 / 09', titleSize: 72,
    label: 'O CURSO',
    title: 'O QUE VOCÊ VAI APRENDER:',
    body: '▸ Por que você traiu, de verdade, e como nunca mais repetir<br>▸ Como reconquistar a confiança sem parecer desesperado<br>▸ Como lidar com a dor dela sem travar ou fugir',
  },
  {
    counter: '07 / 09', titleSize: 68,
    label: 'PROVA SOCIAL',
    title: 'MAIS DE 200 ALUNOS.<br>CASAMENTOS QUE VOLTARAM.',
    body: '"Minha esposa ia pedir o divórcio. Depois do curso,<br>ela pediu que a gente tentasse de novo."<br>Histórias reais. Resultados reais.',
  },
  {
    counter: '08 / 09', titleSize: 76,
    title: '7 DIAS DE GARANTIA.<br>SEM PERGUNTAS.',
    body: 'R$297 ou 12x de R$30,72. 1 ano de acesso.<br>Se não transformar sua visão em 7 dias,<br>devolvo cada centavo.',
  },
  {
    bg: imgs.rm9, counter: '09 / 09', titleSize: 88,
    title: 'O PRÓXIMO PASSO<br>DEPENDE SÓ DE VOCÊ.',
    body: 'Mais de 200 alunos já começaram.',
    cta: 'Clique no botão abaixo',
  },
];}

function vvSlides(imgs) { return [
  {
    bg: imgs.vv1, counter: '01 / 09', titleSize: 80,
    title: 'VOCÊ JÁ PROMETEU PARAR.<br>E VOLTOU.',
    body: 'Não é fraqueza. Não é falta de caráter.<br>É um ciclo que o seu cérebro aprendeu a repetir.<br>E tem como sair.',
  },
  {
    counter: '02 / 09', titleSize: 80,
    label: 'O CICLO',
    title: 'O CICLO QUE<br>NINGUÉM FALA.',
    body: 'Você assiste. Se sente mal. Jura que é a última vez.<br>Passa dias bem, aí recai de novo.<br>A vergonha aumenta. A autoestima cai. Repete.',
  },
  {
    counter: '03 / 09', titleSize: 74,
    title: 'FORÇA DE VONTADE<br>NÃO RESOLVE ISSO.',
    body: 'Pornografia ativa o mesmo sistema de recompensa da cocaína.<br>Lutar contra impulso com esforço puro<br>é brigar com o hardware errado.',
  },
  {
    bg: imgs.vv4, counter: '04 / 09', titleSize: 68,
    title: 'SEU CÉREBRO FOI<br>REPROGRAMADO SEM<br>VOCÊ PERCEBER.',
    body: 'Dopamina. Ciclo de recompensa. Gatilhos automáticos.<br>Não é fraqueza. É neurologia.<br>Entender o mecanismo é o primeiro passo.',
  },
  {
    bg: CESAR, counter: '05 / 09', titleSize: 66,
    label: 'QUEM É CÉSAR AUGUSTO',
    title: 'QUEM TE DÁ<br>ESSE MÉTODO.',
    body: 'Psicanalista. Especialista em saúde masculina.<br>+5 milhões de homens alcançados todo mês.<br>Sem julgamento. Sem sermão. Com método.',
  },
  {
    counter: '06 / 09', titleSize: 76,
    label: 'O MÉTODO',
    title: 'O QUE VOCÊ VAI APRENDER:',
    body: '▸ Como identificar e desativar seus gatilhos reais<br>▸ Como reconstituir a dopamina sem pornografia<br>▸ Como sair do ciclo sem depender de força de vontade',
  },
  {
    counter: '07 / 09', titleSize: 68,
    title: 'SEM EXPOSIÇÃO.<br>SEM JULGAMENTO.<br>NO SEU RITMO.',
    body: 'Você acessa pelo celular, onde quiser, quando quiser.<br>Ninguém fica sabendo. Nenhuma reunião de grupo.<br>Só você e o processo.',
  },
  {
    counter: '08 / 09', titleSize: 76,
    title: 'ACESSO IMEDIATO.<br>7 DIAS DE GARANTIA.',
    body: 'R$97. Pagamento único. Acesso pelo celular.<br>Não funcionou em 7 dias, devolvo tudo.<br>Sem burocracia.',
  },
  {
    bg: imgs.vv9, counter: '09 / 09', titleSize: 96,
    title: 'O PRÓXIMO PASSO<br>É SEU.',
    body: 'Você já sabe que o ciclo não para sozinho.',
    cta: 'Clique no botão abaixo',
  },
];}

// ── MAIN ─────────────────────────────────────────────────
async function main() {
  console.log('\n🎨 Gerando imagens FLUX...\n');

  const cache = path.join(__dirname, '_flux_cache');
  fs.mkdirSync(cache, { recursive: true });

  const prompts = {
    rm1: 'Cinematic close-up of a man hands resting on dark kitchen table, wedding ring clearly visible, cold blue morning light filtering through curtains, heavy silence mood, Deakins lighting, no faces, no text, photorealistic 8K',
    rm4: 'Cinematic wide shot man standing alone foggy lake at dawn, back to camera, dark jacket, wedding ring on left hand, mist over water, cold amber teal color grade, Lubezki natural light, no faces, no text, photorealistic 8K',
    rm9: 'Cinematic close-up man hand reaching forward wedding ring visible, warm golden hour light breaking through dark clouds, Khondji color grade deep shadows golden highlights, no faces, no text, decisive moment, photorealistic 8K',
    vv1: 'Cinematic close-up man hands gripping edge of bathroom sink knuckles tense, dim warm light from above deep shadows, quiet internal battle mood, desaturated tones slight amber cast, no faces, no text, Roger Deakins lighting photorealistic 8K',
    vv4: 'Cinematic dark room single beam of light cutting through dust from window, dramatic contrast, symbolic entrapment, chiaroscuro lighting, moody atmosphere, no faces, no text, photorealistic 8K',
    vv9: 'Cinematic man silhouette standing at end of long dark hallway, single bright doorway open ahead warm golden light flooding in, dramatic chiaroscuro, no face visible, desaturated blue shadows with warm amber light, Lubezki style, no text, photorealistic 8K',
  };

  const imgs = {};
  for (const [k, prompt] of Object.entries(prompts)) {
    const cached = path.join(cache, `${k}.jpg`);
    if (fs.existsSync(cached)) {
      imgs[k] = `file:///${cached.replace(/\\/g, '/')}`;
      console.log(`  ✓ ${k} (cache)`);
    } else {
      process.stdout.write(`  ⏳ ${k}... `);
      try {
        const url = await gerarImagem(prompt);
        await baixarImagem(url, cached);
        imgs[k] = `file:///${cached.replace(/\\/g, '/')}`;
        console.log('✓');
      } catch(e) {
        imgs[k] = null;
        console.log(`⚠ falhou: ${e.message.substring(0,80)}`);
      }
    }
  }

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width:1080, height:1080 } });
  const page = await ctx.newPage();

  async function gerarSet(slides, pasta) {
    const outDir = path.join(__dirname, pasta);
    fs.mkdirSync(outDir, { recursive: true });
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const html = slideHTML(slide);
      const num = String(i + 1).padStart(2, '0');
      const out = path.join(outDir, `slide-${num}.png`);
      await screenshot(html, out, page);
      console.log(`  ✓ ${pasta}/slide-${num}.png`);
    }
  }

  console.log('\n📐 RM Vendas...');
  await gerarSet(rmSlides(imgs), 'rm-vendas-v2');

  console.log('\n📐 VV Vendas...');
  await gerarSet(vvSlides(imgs), 'vv-vendas-v2');

  // Imagens estáticas
  console.log('\n🖼  Estáticas...');
  const estDir = path.join(__dirname, 'imagens-estaticas-v3');
  fs.mkdirSync(estDir, { recursive: true });

  const rmEst = slideHTML({
    bg: imgs.rm1, counter: '', titleSize: 88,
    title: 'VOCÊ QUER CONSERTAR.<br>MAS NÃO SABE COMO.',
    body: 'Curso Reconstrução Masculina. 200+ alunos.<br>7 dias de garantia.',
    cta: 'Reconstrução Masculina — Clique abaixo',
  });
  await screenshot(rmEst, path.join(estDir, 'rm-vendas-v2.png'), page);
  console.log('  ✓ rm-vendas-v2.png');

  const vvEst = slideHTML({
    bg: imgs.vv1, counter: '', titleSize: 84,
    title: 'VOCÊ JÁ PROMETEU PARAR.<br>E VOLTOU.',
    body: 'Método Vença o Vício. R$97. Acesso imediato.<br>7 dias de garantia.',
    cta: 'Vença o Vício — Clique abaixo',
  });
  await screenshot(vvEst, path.join(estDir, 'vv-vendas-v2.png'), page);
  console.log('  ✓ vv-vendas-v2.png');

  await browser.close();
  console.log('\n✅ Pronto!\n  rm-vendas-v2/  vv-vendas-v2/  imagens-estaticas-v3/\n');
}

main().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
