const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const os = require('os');

const BASE = path.resolve(__dirname, '..');
const IMG = path.join(BASE, 'img');
const GREEN = '#1B3A2D';
const GOLD = '#C9A84C';
const WHITE = '#FFFFFF';
const GREY = '#6B8A7A';

function imgUrl(file) {
  return `file:///${IMG.replace(/\\/g, '/')}/${file}`;
}

function slideHTML({ counter, label, title, body, bg, titleSize = 68, cta }) {
  const isPhoto = !!bg;
  const bgCSS = isPhoto
    ? `background: url('${imgUrl(bg)}') center/cover no-repeat;`
    : `background: ${GREEN};`;

  const overlay = isPhoto
    ? `<div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.88) 0%,rgba(0,0,0,.35) 55%,rgba(0,0,0,.1) 100%);"></div>`
    : '';

  const labelHTML = label
    ? `<p style="font-size:11px;font-weight:700;letter-spacing:4px;color:${GOLD};text-transform:uppercase;margin-bottom:20px;">${label}</p>`
    : '';

  const ctaHTML = cta
    ? `<div style="display:inline-block;margin-top:28px;background:${GOLD};padding:14px 32px;font-size:18px;font-weight:700;letter-spacing:1px;color:#0D2218;text-transform:uppercase;">${cta}</div>`
    : '';

  return `<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;700;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{width:1080px;height:1080px;overflow:hidden;font-family:'Inter',sans-serif;}
.slide{position:relative;width:1080px;height:1080px;${bgCSS}display:flex;flex-direction:column;justify-content:flex-end;padding:72px;}
.counter{position:absolute;top:52px;left:72px;font-size:13px;color:${GREY};letter-spacing:1.5px;}
.handle{position:absolute;bottom:52px;right:72px;font-size:13px;color:${GREY};}
.content{position:relative;z-index:1;}
.label{font-size:11px;font-weight:700;letter-spacing:4px;color:${GOLD};text-transform:uppercase;margin-bottom:20px;}
.title{font-size:${titleSize}px;font-weight:900;color:${WHITE};line-height:1.04;letter-spacing:-.5px;text-transform:uppercase;}
.rule{width:36px;height:3px;background:${GOLD};margin:22px 0;}
.body{font-size:27px;font-weight:300;color:rgba(255,255,255,.92);line-height:1.55;}
</style>
</head><body>
<div class="slide">
  ${overlay}
  <span class="counter">${counter}</span>
  <div class="content">
    ${labelHTML}
    <p class="title">${title}</p>
    <div class="rule"></div>
    <p class="body">${body}</p>
    ${ctaHTML}
  </div>
  <span class="handle">@cesaraugustoo__</span>
</div>
</body></html>`;
}

// ══════════════════════════════════════════
// CARROSSEL v1 — "Você Traiu. Ela Descobriu."
// ══════════════════════════════════════════
const v1 = [
  {
    counter: '01 / 10', bg: 'dor-noite.jpg', titleSize: 72,
    title: 'VOCÊ TRAIU.<br>ELA DESCOBRIU.<br>E AGORA VOCÊ NÃO SABE<br>MAIS QUEM VOCÊ É.',
    body: 'Esse carrossel foi feito pra você.<br>Lê até o final.',
  },
  {
    counter: '02 / 10', titleSize: 62,
    title: 'VOCÊ ESTÁ ACORDANDO ÀS 3H DA MANHÃ COM O ESTÔMAGO FECHADO.',
    body: 'A mensagem que ela viu rodando na cabeça.<br>A cara dela quando descobriu.<br>O choro que você nunca viu antes.',
  },
  {
    counter: '03 / 10', titleSize: 64,
    title: 'VOCÊ SENTE QUE DESTRUIU TUDO QUE LEVOU ANOS PRA CONSTRUIR.',
    body: 'A casa, o respeito, a confiança.<br>Ela olha pra você diferente agora.<br>E você não sabe se tem volta.',
  },
  {
    counter: '04 / 10', titleSize: 64,
    title: 'NÃO FOI PORQUE VOCÊ É MAL.<br>FOI PORQUE VOCÊ NUNCA SE CONHECEU.',
    body: 'Você nunca aprendeu a lidar com o vazio interno.<br>Com a pressão, a ansiedade, o medo de falhar.<br>Então fugiu. Mas fugiu de si mesmo.',
  },
  {
    counter: '05 / 10', titleSize: 62,
    title: 'O PROBLEMA NÃO É O QUE VOCÊ FEZ.<br>É O QUE TE LEVOU A FAZER.',
    body: 'A traição foi sintoma, não causa.<br>Enquanto você não entender a raiz, vai continuar em risco.<br>E ela sabe disso. Por isso ainda não confia.',
  },
  {
    counter: '06 / 10', titleSize: 64, label: 'A RAIZ',
    title: 'A RAIZ É MAIS FUNDA<br>DO QUE VOCÊ IMAGINA.',
    body: 'O que te faz trair não é fraqueza de caráter.<br>É uma ferida que você nunca tratou.',
  },
  {
    counter: '07 / 10', titleSize: 72,
    title: 'NINGUÉM TE OBRIGOU.<br>A ESCOLHA FOI SUA.',
    body: 'Isso dói. Mas é a única verdade que pode te libertar.<br>Homem que assume é homem que pode mudar.',
  },
  {
    counter: '08 / 10', titleSize: 58,
    title: 'SE VOCÊ NÃO TRATAR ISSO AGORA, UMA DE DUAS COISAS VAI ACONTECER.',
    body: 'Ou ela vai embora. Ou você vai repetir, mesmo jurando que não.<br>Não porque você é ruim. Porque você não teve a ajuda certa.',
  },
  {
    counter: '09 / 10', titleSize: 74,
    title: 'AINDA DÁ TEMPO.<br>SE VOCÊ AGIR AGORA.',
    body: 'Reconstrução não é apagar o que aconteceu.<br>É se tornar um homem diferente do que fez aquilo.',
  },
  {
    counter: '10 / 10', bg: 'hero-bg.jpg', titleSize: 80,
    title: 'RECONSTRUÇÃO<br>MASCULINA.',
    body: 'O curso para o homem que quer entender o que o<br>trouxe até aqui e se tornar outro homem.<br>Mais de 200 alunos · 7 dias de garantia.',
    cta: 'Clique no botão abaixo',
  },
];

// ══════════════════════════════════════════
// CARROSSEL v2 — "O Ciclo da Traição"
// ══════════════════════════════════════════
const v2 = [
  {
    counter: '01 / 10', bg: 'mecanismo-bg.jpg', titleSize: 80,
    title: 'VOCÊ TRAIU.<br>ELA DESCOBRIU.',
    body: 'E agora você não sabe mais quem você é.',
  },
  {
    counter: '02 / 10', titleSize: 62,
    title: 'VOCÊ QUER CONSERTAR.<br>MAS NÃO SABE POR ONDE COMEÇAR.',
    body: 'Cada conversa vira briga.<br>Cada silêncio dói mais do que a briga.<br>E o pior: você sente que está perdendo ela de novo.',
  },
  {
    counter: '03 / 10', titleSize: 66,
    title: 'ELA DISSE QUE PERDOOU.<br>MAS A CONFIANÇA SUMIU.',
    body: 'Você sente que ela ainda está lá.<br>Mas distante demais para alcançar.<br>E você não sabe o que fazer com isso.',
  },
  {
    counter: '04 / 10', titleSize: 66,
    title: 'NINGUÉM PODE SABER<br>O QUE VOCÊ FEZ.',
    body: 'Você carrega isso sozinho.<br>Não pode falar com amigos. Não pode falar com família.<br>E esse peso está te destruindo por dentro.',
  },
  {
    counter: '05 / 10', titleSize: 66,
    title: 'VOCÊ TEM MEDO DE SER<br>O MESMO HOMEM DE ANTES.',
    body: 'Por dentro você sabe que algo em você precisa mudar.<br>Mas não sabe o quê.',
  },
  {
    counter: '06 / 10', titleSize: 72,
    title: 'A TRAIÇÃO FOI SINTOMA.<br>NÃO CAUSA.',
    body: 'Enquanto você não entender o que te levou a trair,<br>o risco continua. Mesmo jurando que não vai repetir.',
  },
  {
    counter: '07 / 10', titleSize: 68,
    title: 'O HOMEM QUE TRAIU<br>NÃO ERA FORTE. ERA FRACO.',
    body: 'Não foi tesão. Não foi falta de amor.<br>Foi o ego de um homem que não se suportava.',
  },
  {
    counter: '08 / 10', titleSize: 60,
    title: 'ARREPENDIMENTO SEM ENTENDIMENTO<br>NÃO RECONSTRÓI NADA.',
    body: 'Chorar não reconstrói. Prometer não reconstrói.<br>Entender o que te trouxe até aqui, isso reconstrói.',
  },
  {
    counter: '09 / 10', titleSize: 68,
    title: '200 HOMENS JÁ<br>COMEÇARAM A RECONSTRUÇÃO.',
    body: 'Homens que estavam exatamente onde você está.<br>Que achavam que era tarde demais.<br>Que não sabiam por onde começar.',
  },
  {
    counter: '10 / 10', bg: 'hero-bg.jpg', titleSize: 62,
    title: 'EXISTE UM CAMINHO ENTRE O ARREPENDIMENTO E A RECONSTRUÇÃO.',
    body: 'Começa com honestidade. Não com promessa.<br>Mais de 200 alunos · 7 dias de garantia.',
    cta: 'Clique no botão abaixo',
  },
];

// ══════════════════════════════════════════
// IMAGENS ESTÁTICAS 1:1
// ══════════════════════════════════════════
const estaticas = [
  {
    id: 'rm-estatica-v1',
    counter: '', bg: 'dor-noite.jpg', titleSize: 90,
    title: 'VOCÊ TRAIU.<br>ELA DESCOBRIU.',
    body: 'E agora você não sabe mais quem você é.<br>Existe um caminho. Clique abaixo.',
    cta: 'Reconstrução Masculina',
  },
  {
    id: 'rm-estatica-v2',
    counter: '', bg: 'mecanismo-bg.jpg', titleSize: 90,
    title: 'O CASAMENTO<br>NÃO ACABOU.',
    body: 'Mas vai acabar se você não entender o que te levou a trair.<br>Clique abaixo.',
    cta: 'Reconstrução Masculina',
  },
  {
    id: 'rm-estatica-v3',
    counter: '', titleSize: 76,
    title: 'A TRAIÇÃO FOI SINTOMA.<br>NÃO CAUSA.',
    body: 'Enquanto você não entender a raiz,<br>o risco continua. Mesmo jurando que não vai repetir.',
    cta: 'Reconstrução Masculina — Clique abaixo',
  },
];

async function generate(slides, outFolder, isStatica = false) {
  const outDir = path.join(__dirname, outFolder);
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1080, height: 1080 } });

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const content = slideHTML(slide);
    const tmpFile = path.join(os.tmpdir(), `slide-tmp-${Date.now()}.html`);
    fs.writeFileSync(tmpFile, content, 'utf8');

    const page = await context.newPage();
    await page.goto(`file:///${tmpFile.replace(/\\/g, '/')}`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(800);

    const num = isStatica ? slide.id : `slide-${String(i + 1).padStart(2, '0')}`;
    const outPath = path.join(outDir, `${num}.png`);
    await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: 1080, height: 1080 } });
    await page.close();
    fs.unlinkSync(tmpFile);
    console.log(`✓ ${outFolder}/${num}.png`);
  }

  await browser.close();
}

(async () => {
  console.log('\n📐 Gerando carrosseis 1080x1080...\n');

  console.log('▶ rm-trafego-v1...');
  await generate(v1, 'rm-trafego-v1');

  console.log('▶ rm-trafego-v2...');
  await generate(v2, 'rm-trafego-v2');

  console.log('▶ imagens estáticas RM...');
  await generate(estaticas, 'imagens-estaticas-v2', true);

  console.log('\n✅ Pronto! Todos os slides em 1080x1080.\n');
})();
