const https = require('https');
const fs = require('fs');
const path = require('path');

const FAL_API_KEY = '4d8ed20f-cbe5-48a7-9ae2-c708c8b6189e:f6aa36d11d1f4457da34b6655d3df5d8';

async function gerarImagem(prompt, filename) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      prompt,
      image_size: { width: 1920, height: 1080 },
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
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const url = JSON.parse(data).images[0].url;
          console.log(`[OK] ${filename}: ${url}`);
          // Download
          const file = fs.createWriteStream(path.join('img', filename));
          https.get(url, (r) => { r.pipe(file); file.on('finish', () => { file.close(); resolve(); }); });
        } catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  fs.mkdirSync('img', { recursive: true });

  await gerarImagem(
    'Cinematic photograph, extreme wide shot. A man 38 years old sitting alone at the edge of a bed in a dark bedroom at 3AM, hunched forward elbows on knees face buried in hands. Wedding ring visible on left hand. Only light source: faint blue glow from phone screen lying face-down on bed beside him. Pillow on other side untouched. Single diagonal strip of amber light across his back from streetlight through blinds. Deep shadows high contrast. Color palette: near-black deep forest green cold blue shadow. 35mm anamorphic film grain. No text no graphics. Roger Deakins Blade Runner 2049 color grading Conrad Hall Road to Perdition. Ultra-realistic photographic.',
    'dor-noite.jpg'
  );
  console.log('dor-noite.jpg gerada');

  await gerarImagem(
    'Cinematic wide shot dark environment abstract. Deep forest or industrial interior. A single narrow shaft of warm golden amber light piercing through near-total darkness from upper right hitting concrete floor. 90% of frame in deep shadow dark forest green and near-black tones. Long dramatic shadows. Heavy morning mist dust particles visible in light beam. No objects that identify specific location. Pure mood weight silence. Roger Deakins aesthetic anamorphic lens distortion deep focus. Film grain. No text no people.',
    'hero-bg.jpg'
  );
  console.log('hero-bg.jpg gerada');

  await gerarImagem(
    'Cinematic photograph dawn light 5:45AM. A man standing at a large window back to camera looking out. Medium wide shot. Plain white t-shirt dark pants. Posture is upright weight of decision visible. Through window: city suburb waking up soft morning light beginning at horizon. Room behind still in pre-dawn darkness. He holds phone loosely in one hand. Wedding ring catches first light from window. Darkness behind him light ahead standing at threshold. Emmanuel Lubezki The Revenant golden hour quality. Warm amber from window deep blue-green shadows in room. Film grain anamorphic 2.39:1. No text ultra-realistic.',
    'cta-final-bg.jpg'
  );
  console.log('cta-final-bg.jpg gerada');
}

main().catch(console.error);
