// ============================================================
// GERADOR DE CARROSSEIS DE VENDAS — RM + VV
// FLUX Pro (imagens) + Playwright (export PNG 1080x1080)
// ============================================================

const { chromium } = require('playwright');
const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');
const os    = require('os');

const FAL_API_KEY = '400657a5-0fc0-4296-bfa6-72d6351ec06e:c49380e283310cd8cb8c734af4b8d5bf';
const BASE        = path.resolve(__dirname, '..');
const IMG_BASE    = `${BASE.replace(/\\/g, '/')}/img`;
const CESAR_PHOTO = `file:///${IMG_BASE}/hero-cesar.jpg`;

const GREEN      = '#1B3A2D';
const GREEN_DARK = '#0D1A13';
const GOLD       = '#C9A84C';
const WHITE      = '#FFFFFF';
const GREY       = '#6B8A7A';
const GREY_LIGHT = 'rgba(255,255,255,0.85)';

// ── FLUX PRO ──────────────────────────────────────────────
async function gerarImagem(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      prompt,
      image_size: 'square_hd',
      num_inference_steps: 28,
      guidance_scale: 3.5,
      num_images: 1,
      safety_tolerance: '5'
    });
    const req = https.request({
      hostname: 'fal.run',
      path: '/fal-ai/flux-pro',
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.images?.[0]?.url) resolve(json.images[0].url);
          else reject(new Error('Sem imagem: ' + data.substring(0, 200)));
        } catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function baixarImagem(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const proto = url.startsWith('https') ? https : http;
    proto.get(url, res => {
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(dest); });
    }).on('error', reject);
  });
}

// ── FONTS & BASE STYLES ───────────────────────────────────
const FONTS = `<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">`;

const BASE_CSS = `
*{margin:0;padding:0;box-sizing:border-box;}
body{width:1080px;height:1080px;overflow:hidden;}
.slide{position:relative;width:1080px;height:1080px;background:${GREEN_DARK};display:flex;flex-direction:column;justify-content:flex-end;padding:72px;}
.counter{position:absolute;top:52px;left:72px;font-family:'Inter',sans-serif;font-size:13px;color:${GREY};letter-spacing:1.5px;}
.handle{position:absolute;bottom:52px;right:72px;font-family:'Inter',sans-serif;font-size:14px;color:${GOLD};letter-spacing:.05em;}
.content{position:relative;z-index:1;}
.label{font-family:'Inter',sans-serif;font-size:11px;font-weight:600;letter-spacing:4px;color:${GOLD};text-transform:uppercase;margin-bottom:16px;}
.headline{font-family:'Bebas Neue',sans-serif;color:${WHITE};line-height:1.0;letter-spacing:.02em;}
.rule{width:40px;height:3px;background:${GOLD};margin:20px 0;}
.body{font-family:'Inter',sans-serif;font-weight:300;color:${GREY_LIGHT};line-height:1.55;}
.overlay-bottom{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.90) 0%,rgba(0,0,0,.4) 50%,rgba(0,0,0,.05) 100%);}
.gold-bar{position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(to bottom,transparent,${GOLD},transparent);}
`;

// ── HTML BUILDERS ─────────────────────────────────────────

function wrapSlide(counter, content, handle = '@cesaraugustoo__', extra = '') {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONTS}
<style>${BASE_CSS}${extra}</style></head><body>
<div class="slide">
  <span class="counter">${counter}</span>
  ${content}
  <span class="handle">${handle}</span>
</div></body></html>`;
}

// Slide com imagem FLUX (full bleed)
function htmlFotoSlide({ counter, imgUrl, headline, body, titleSize = 78, handle }) {
  const bg = imgUrl.startsWith('file:') || imgUrl.startsWith('http')
    ? `url('${imgUrl}')`
    : `url('data:image/jpeg;base64,${imgUrl}')`;
  const extra = `.bg{position:absolute;inset:0;background:${bg} center/cover no-repeat;}`;
  return wrapSlide(counter, `
  <div class="bg"></div>
  <div class="overlay-bottom"></div>
  <div class="content">
    <p class="headline" style="font-size:${titleSize}px;">${headline}</p>
    <div class="rule"></div>
    <p class="body" style="font-size:26px;">${body}</p>
  </div>`, handle, extra);
}

// Slide de texto puro
function htmlTextoSlide({ counter, label, headline, body, titleSize = 76, handle }) {
  const labelHtml = label
    ? `<p class="label">${label}</p>`
    : '';
  return wrapSlide(counter, `
  <div class="gold-bar"></div>
  <div style="background:${GREEN};position:absolute;inset:0;"></div>
  <div class="content">
    ${labelHtml}
    <p class="headline" style="font-size:${titleSize}px;">${headline}</p>
    <div class="rule"></div>
    <p class="body" style="font-size:26px;">${body}</p>
  </div>`, handle);
}

// Slide de lista
function htmlListaSlide({ counter, label, headline, intro, bullets, titleSize = 72, handle }) {
  const labelHtml = label ? `<p class="label">${label}</p>` : '';
  const bulletItems = bullets.map(b =>
    `<div class="bullet"><span class="dot">▸</span><span>${b}</span></div>`
  ).join('');
  const extra = `
.bullet{display:flex;gap:16px;align-items:flex-start;margin-bottom:18px;font-family:'Inter',sans-serif;font-weight:300;font-size:24px;color:${GREY_LIGHT};line-height:1.4;}
.dot{color:${GOLD};flex-shrink:0;font-size:20px;margin-top:3px;}
`;
  return wrapSlide(counter, `
  <div class="gold-bar"></div>
  <div style="background:${GREEN};position:absolute;inset:0;"></div>
  <div class="content">
    ${labelHtml}
    <p class="headline" style="font-size:${titleSize}px;">${headline}</p>
    <div class="rule"></div>
    ${intro ? `<p class="body" style="font-size:24px;margin-bottom:20px;">${intro}</p>` : ''}
    <div class="bullets">${bulletItems}</div>
  </div>`, handle, extra);
}

// Slide de autoridade (foto do César)
function htmlAutoridadeSlide({ counter, headline, bio, titleSize = 66, handle, photoUrl }) {
  const extra = `.bg{position:absolute;inset:0;background:url('${photoUrl}') center 15%/cover no-repeat;}.overlay-auth{position:absolute;inset:0;background:linear-gradient(to right,rgba(0,0,0,.92) 45%,rgba(0,0,0,.3) 100%);}`;
  return wrapSlide(counter, `
  <div class="bg"></div>
  <div class="overlay-auth"></div>
  <div class="content" style="max-width:560px;">
    <p class="label">QUEM É CÉSAR AUGUSTO</p>
    <p class="headline" style="font-size:${titleSize}px;">${headline}</p>
    <div class="rule"></div>
    <p class="body" style="font-size:25px;">${bio}</p>
  </div>`, handle, extra);
}

// Slide de oferta
function htmlOfertaSlide({ counter, headline, preco, parcela, garantia, acesso, handle }) {
  const extra = `
.preco-big{font-family:'Bebas Neue',sans-serif;font-size:110px;color:${GOLD};line-height:1;letter-spacing:.02em;}
.preco-label{font-family:'Inter',sans-serif;font-size:18px;color:${GREY};margin-top:-8px;margin-bottom:20px;}
.badge{display:inline-flex;gap:24px;margin-top:20px;}
.badge-item{font-family:'Inter',sans-serif;font-size:20px;font-weight:400;color:${GREY_LIGHT};display:flex;align-items:center;gap:8px;}
.badge-item span{color:${GOLD};}
`;
  return wrapSlide(counter, `
  <div class="gold-bar"></div>
  <div style="background:${GREEN};position:absolute;inset:0;"></div>
  <div class="content">
    <p class="headline" style="font-size:72px;">${headline}</p>
    <div class="rule"></div>
    <p class="preco-big">${preco}</p>
    <p class="preco-label">${parcela}</p>
    <div class="badge">
      <div class="badge-item"><span>✓</span>${garantia}</div>
      <div class="badge-item"><span>✓</span>${acesso}</div>
    </div>
  </div>`, handle, extra);
}

// Imagem estática (sem counter, sem handle de slide)
function htmlEstatica({ imgUrl, headline, sub, cta, titleSize = 96 }) {
  const bg = `url('${imgUrl}')`;
  const extra = `.bg{position:absolute;inset:0;background:${bg} center/cover no-repeat;}.cta-bar{display:inline-block;background:${GOLD};padding:14px 28px;font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:2px;color:#0a1a10;margin-top:24px;text-transform:uppercase;}`;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONTS}
<style>${BASE_CSS}${extra}</style></head><body>
<div class="slide">
  <div class="bg"></div>
  <div class="overlay-bottom"></div>
  <div class="content">
    <p class="headline" style="font-size:${titleSize}px;">${headline}</p>
    <div class="rule"></div>
    <p class="body" style="font-size:28px;">${sub}</p>
    <div class="cta-bar">${cta}</div>
  </div>
  <span class="handle">@cesaraugustoo__</span>
</div></body></html>`;
}

// ── SCREENSHOT ────────────────────────────────────────────
async function screenshot(html, outPath, page) {
  const tmp = path.join(os.tmpdir(), `slide-${Date.now()}.html`);
  fs.writeFileSync(tmp, html, 'utf8');
  await page.goto(`file:///${tmp.replace(/\\/g, '/')}`, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(700);
  await page.screenshot({ path: outPath, clip: { x:0, y:0, width:1080, height:1080 } });
  fs.unlinkSync(tmp);
}

// ── MAIN ──────────────────────────────────────────────────
async function main() {

  console.log('\n🎨 Gerando imagens FLUX...\n');

  // Gerar todas as imagens FLUX em paralelo
  const fluxPrompts = {
    rm1:   'Cinematic close-up of a man hands resting on a dark kitchen table, wedding ring clearly visible, cold morning light filtering through curtains, deep shadows, teal and amber tones, Deakins style, no faces, no text, photorealistic, emotional weight, 8K',
    rm4:   'Cinematic wide shot of a man standing alone at the edge of a foggy lake at dawn, back to camera, dark jacket, wedding ring on left hand, mist over water, cold amber teal color grade, Lubezki natural light, no faces, no text, introspective, photorealistic, 8K',
    rm9:   'Cinematic close-up of a man hand reaching forward with wedding ring clearly visible, warm golden hour light breaking through dark clouds, shallow depth of field, Khondji color grade, deep shadows with golden highlights, no faces, no text, decisive moment, photorealistic, 8K',
    vv1:   'Cinematic close-up of a man hands gripping edge of a bathroom sink, knuckles tense, dim warm light from above casting deep shadows, quiet internal battle, photorealistic, shallow depth of field, desaturated tones slight amber cast, no faces, no text, Roger Deakins lighting, 8K',
    vv4:   'Cinematic dark corridor with single window at the end, rays of light cutting through dust in a dark room, dramatic contrast, symbolic entrapment, moody atmosphere, chiaroscuro lighting, no faces, no text, photorealistic, 8K',
    vv9:   'Cinematic shot of a man standing alone at the end of a long dimly lit hallway, a single bright doorway open ahead, warm golden light flooding in from outside, silhouette from behind, dramatic chiaroscuro, no face visible, photorealistic, desaturated blue shadows with warm amber light, Lubezki style, no text, 8K',
  };

  const imgDir = path.join(__dirname, '_flux_cache');
  fs.mkdirSync(imgDir, { recursive: true });

  const imgs = {};
  const keys = Object.keys(fluxPrompts);

  for (const k of keys) {
    const cached = path.join(imgDir, `${k}.jpg`);
    if (fs.existsSync(cached)) {
      console.log(`  ✓ ${k} (cache)`);
      imgs[k] = `file:///${cached.replace(/\\/g, '/')}`;
    } else {
      console.log(`  ⏳ ${k} gerando...`);
      try {
        const url = await gerarImagem(fluxPrompts[k]);
        await baixarImagem(url, cached);
        imgs[k] = `file:///${cached.replace(/\\/g, '/')}`;
        console.log(`  ✓ ${k}`);
      } catch(e) {
        console.log(`  ⚠ ${k} falhou: ${e.message} — usando fallback verde`);
        imgs[k] = null;
      }
    }
  }

  // ── SLIDE DATA ──────────────────────────────────────────

  const RM_SLIDES = [
    {
      fn: htmlFotoSlide,
      args: {
        counter: '01 / 09', imgUrl: imgs.rm1, titleSize: 84,
        headline: 'VOCÊ QUER CONSERTAR.<br>MAS NÃO SABE COMO.',
        body: 'Você errou. Ela sabe. E o silêncio dentro de casa<br>pesa mais do que qualquer briga.'
      }
    },
    {
      fn: htmlTextoSlide,
      args: {
        counter: '02 / 09', titleSize: 76,
        headline: 'VOCÊ TROCOU TUDO POR NADA.<br>E AGORA SABE.',
        body: 'Não foi falta de amor por ela.<br>Foi algo quebrado em você, antes do casamento.<br>O problema é que você ainda não sabe o que foi.'
      }
    },
    {
      fn: htmlTextoSlide,
      args: {
        counter: '03 / 09', titleSize: 80,
        headline: 'PEDIR PERDÃO NÃO É<br>O SUFICIENTE.',
        body: 'Você pediu desculpa. Ela continua distante.<br>Arrependimento sem mudança real<br>é só mais uma decepção.'
      }
    },
    {
      fn: htmlFotoSlide,
      args: {
        counter: '04 / 09', imgUrl: imgs.rm4, titleSize: 78,
        headline: 'A TRAIÇÃO FOI SINTOMA.<br>A CAUSA ESTÁ EM VOCÊ.',
        body: 'Antes de reconstruir o casamento,<br>você precisa reconstruir o homem que virou isso.'
      }
    },
    {
      fn: htmlAutoridadeSlide,
      args: {
        counter: '05 / 09', photoUrl: CESAR_PHOTO, titleSize: 62,
        headline: 'JÁ ACOMPANHEI MAIS DE 200 HOMENS NESSE PROCESSO.',
        bio: 'César Augusto. Psicanalista. Casado.<br>Especialista em homens que traíram.<br>Não vim te julgar. Vim te mostrar o caminho.'
      }
    },
    {
      fn: htmlListaSlide,
      args: {
        counter: '06 / 09', label: 'O MÉTODO', titleSize: 80,
        headline: 'O QUE VOCÊ VAI APRENDER:',
        intro: 'Curso Reconstrução Masculina. Método passo a passo.',
        bullets: [
          'Por que você traiu, de verdade, e como isso nunca mais acontecer',
          'Como reconquistar a confiança da sua esposa sem parecer desesperado',
          'Como lidar com a dor dela sem travar ou fugir da conversa'
        ]
      }
    },
    {
      fn: htmlTextoSlide,
      args: {
        counter: '07 / 09', label: 'PROVA SOCIAL', titleSize: 72,
        headline: 'MAIS DE 200 ALUNOS.<br>HISTÓRIAS REAIS.',
        body: '"Minha esposa ia pedir o divórcio. Depois do curso,<br>ela pediu que a gente tentasse de novo."<br>Casamentos que estavam destruídos voltaram.'
      }
    },
    {
      fn: htmlOfertaSlide,
      args: {
        counter: '08 / 09',
        headline: '7 DIAS DE GARANTIA.<br>SEM PERGUNTAS.',
        preco: 'R$297',
        parcela: 'ou 12x de R$30,72',
        garantia: '7 dias de garantia',
        acesso: '1 ano de acesso'
      }
    },
    {
      fn: htmlFotoSlide,
      args: {
        counter: '09 / 09', imgUrl: imgs.rm9, titleSize: 96,
        headline: 'O PRÓXIMO PASSO<br>DEPENDE SÓ DE VOCÊ.',
        body: 'Clique no botão abaixo e comece hoje.'
      }
    },
  ];

  const VV_SLIDES = [
    {
      fn: htmlFotoSlide,
      args: {
        counter: '01 / 09', imgUrl: imgs.vv1, titleSize: 80,
        headline: 'VOCÊ JÁ PROMETEU PARAR.<br>E VOLTOU.',
        body: 'Não é fraqueza. Não é falta de caráter.<br>É um ciclo que o seu cérebro aprendeu a repetir.<br>E tem como sair.'
      }
    },
    {
      fn: htmlTextoSlide,
      args: {
        counter: '02 / 09', label: 'O CICLO', titleSize: 80,
        headline: 'O CICLO QUE<br>NINGUÉM FALA.',
        body: 'Você assiste. Se sente mal. Jura que é a última vez.<br>Passa dias bem, aí recai de novo.<br>A vergonha aumenta, a autoestima cai, e repete.'
      }
    },
    {
      fn: htmlTextoSlide,
      args: {
        counter: '03 / 09', titleSize: 74,
        headline: 'FORÇA DE VONTADE<br>NÃO RESOLVE ISSO.',
        body: 'Pornografia ativa o mesmo sistema de recompensa da cocaína.<br>Lutar contra impulso com esforço puro<br>é brigar com o hardware errado.'
      }
    },
    {
      fn: htmlFotoSlide,
      args: {
        counter: '04 / 09', imgUrl: imgs.vv4, titleSize: 72,
        headline: 'SEU CÉREBRO FOI REPROGRAMADO<br>SEM VOCÊ PERCEBER.',
        body: 'Dopamina. Ciclo de recompensa. Gatilhos automáticos.<br>Não é fraqueza. É neurologia.<br>Entender o mecanismo é o primeiro passo para sair.'
      }
    },
    {
      fn: htmlAutoridadeSlide,
      args: {
        counter: '05 / 09', photoUrl: CESAR_PHOTO, titleSize: 66,
        headline: 'QUEM TE DÁ<br>ESSE MÉTODO.',
        bio: 'César Augusto. Psicanalista.<br>Especialista em saúde masculina.<br>+5 milhões de homens alcançados todo mês. Sem julgamento.'
      }
    },
    {
      fn: htmlListaSlide,
      args: {
        counter: '06 / 09', label: 'O MÉTODO', titleSize: 80,
        headline: 'O QUE VOCÊ VAI APRENDER:',
        intro: 'Método Vença o Vício. Para reescrever o padrão.',
        bullets: [
          'Como identificar e desativar seus gatilhos reais',
          'Como reconstituir a dopamina sem pornografia',
          'Como sair do ciclo recaída-vergonha sem depender de força de vontade'
        ]
      }
    },
    {
      fn: htmlTextoSlide,
      args: {
        counter: '07 / 09', titleSize: 68,
        headline: 'SEM EXPOSIÇÃO.<br>SEM JULGAMENTO.<br>NO SEU RITMO.',
        body: 'Você acessa pelo celular, onde quiser, quando quiser.<br>Ninguém fica sabendo. Nenhuma reunião de grupo.<br>Só você e o processo.'
      }
    },
    {
      fn: htmlOfertaSlide,
      args: {
        counter: '08 / 09',
        headline: 'ACESSO IMEDIATO.<br>7 DIAS DE GARANTIA.',
        preco: 'R$97',
        parcela: 'pagamento único · acesso imediato',
        garantia: '7 dias de garantia',
        acesso: 'Acesso pelo celular'
      }
    },
    {
      fn: htmlFotoSlide,
      args: {
        counter: '09 / 09', imgUrl: imgs.vv9, titleSize: 96,
        headline: 'O PRÓXIMO PASSO<br>É SEU.',
        body: 'Você já sabe que o ciclo não para sozinho.<br>Clique no botão abaixo e comece hoje.'
      }
    },
  ];

  const RM_ESTATICA = {
    fn: htmlEstatica,
    args: {
      imgUrl: imgs.rm1,
      headline: 'VOCÊ QUER<br>CONSERTAR.<br>MAS NÃO SABE COMO.',
      sub: 'Curso Reconstrução Masculina. 200+ alunos.<br>7 dias de garantia. Clique abaixo.',
      cta: 'Reconstrução Masculina — Comece Agora',
      titleSize: 88
    }
  };

  const VV_ESTATICA = {
    fn: htmlEstatica,
    args: {
      imgUrl: imgs.vv1,
      headline: 'VOCÊ JÁ<br>PROMETEU PARAR.<br>E VOLTOU.',
      sub: 'Método Vença o Vício. R$97. Acesso imediato.<br>7 dias de garantia. Clique abaixo.',
      cta: 'Vença o Vício — Comece Agora',
      titleSize: 88
    }
  };

  // ── GERAR SLIDES ───────────────────────────────────────

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1080 } });
  const page = await ctx.newPage();

  async function gerarSet(slides, pasta) {
    const outDir = path.join(__dirname, pasta);
    fs.mkdirSync(outDir, { recursive: true });
    for (let i = 0; i < slides.length; i++) {
      const { fn, args } = slides[i];
      const html = fn(args);
      const num = String(i + 1).padStart(2, '0');
      const out = path.join(outDir, `slide-${num}.png`);
      await screenshot(html, out, page);
      console.log(`  ✓ ${pasta}/slide-${num}.png`);
    }
  }

  async function gerarEstatica(slide, outPath) {
    const { fn, args } = slide;
    const html = fn(args);
    await screenshot(html, outPath, page);
    console.log(`  ✓ ${outPath}`);
  }

  console.log('\n📐 Gerando carrossel RM Vendas...');
  await gerarSet(RM_SLIDES, 'rm-vendas-v1');

  console.log('\n📐 Gerando carrossel VV Vendas...');
  await gerarSet(VV_SLIDES, 'vv-vendas-v1');

  console.log('\n🖼  Gerando imagens estáticas...');
  const estaticasDir = path.join(__dirname, 'imagens-estaticas-v3');
  fs.mkdirSync(estaticasDir, { recursive: true });
  await gerarEstatica(RM_ESTATICA, path.join(estaticasDir, 'rm-vendas.png'));
  await gerarEstatica(VV_ESTATICA, path.join(estaticasDir, 'vv-vendas.png'));

  await browser.close();

  console.log('\n✅ Tudo pronto!\n');
  console.log('  rm-vendas-v1/     — carrossel RM (9 slides)');
  console.log('  vv-vendas-v1/     — carrossel VV (9 slides)');
  console.log('  imagens-estaticas-v3/  — estáticas RM + VV\n');
}

main().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
