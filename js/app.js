// ============================================================
// RECONSTRUÇÃO MASCULINA — app.js
// ============================================================

// ── 0. VIEWERS BADGE — contador flutuante ──
(function initViewersBadge() {
  var el = document.querySelector('.viewers-count');
  if (!el) return;
  var base = 38 + Math.floor(Math.random() * 18); // 38–55
  el.textContent = base;
  setInterval(function() {
    var delta = Math.random() < 0.5 ? -1 : 1;
    base = Math.max(28, Math.min(72, base + delta));
    el.textContent = base;
  }, 8000 + Math.random() * 7000);
})();

// ── 1. CINEMA GRAIN CANVAS — ruído analógico real (Deakins/Khondji) ──
(function initCinemaGrain() {
  var overlay = document.querySelector('.grain-overlay');
  if (!overlay) return;
  var c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  var ctx = c.getContext('2d');
  function render() {
    var d = ctx.createImageData(512, 512);
    for (var i = 0; i < d.data.length; i += 4) {
      var v = Math.random() * 255 | 0;
      d.data[i] = d.data[i+1] = d.data[i+2] = v;
      d.data[i+3] = 255;
    }
    ctx.putImageData(d, 0, 0);
    overlay.style.backgroundImage = 'url(' + c.toDataURL() + ')';
    overlay.style.backgroundSize = '512px 512px';
  }
  render();
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(render, 150);
  }
})();

// ── 2. EXIT INTENT POPUP ─────────────────────────────────────
(function () {
  let shown = false;

  function showPopup() {
    if (shown) return;
    shown = true;
    const overlay = document.getElementById('exit-popup');
    if (overlay) {
      overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  function hidePopup() {
    const overlay = document.getElementById('exit-popup');
    if (overlay) {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Desktop: mouse saindo pelo topo
    document.addEventListener('mouseleave', function (e) {
      if (e.clientY < 10) showPopup();
    });

    // Mobile: botão voltar / pausa no scroll (heurística simples)
    let lastScrollY = window.scrollY;
    let scrollUpCount = 0;
    window.addEventListener('scroll', function () {
      const currentY = window.scrollY;
      if (currentY < lastScrollY) {
        scrollUpCount++;
        if (scrollUpCount >= 3 && currentY < 200) showPopup();
      } else {
        scrollUpCount = 0;
      }
      lastScrollY = currentY;
    });

    // Fechar botões
    document.querySelectorAll('.popup-close, .popup-dismiss').forEach(function (btn) {
      btn.addEventListener('click', hidePopup);
    });

    // Fechar clicando fora
    const overlay = document.getElementById('exit-popup');
    if (overlay) {
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) hidePopup();
      });
    }
  });
})();

// ── 3. FAQ ACCORDION ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const item = btn.closest('.faq-item');
      const answer = item.querySelector('.faq-answer');
      const icon = btn.querySelector('.faq-icon');
      const isOpen = item.classList.contains('open');

      // Fechar todos
      document.querySelectorAll('.faq-item.open').forEach(function (openItem) {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-answer').style.maxHeight = '0';
        openItem.querySelector('.faq-icon').textContent = '+';
      });

      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        if (icon) icon.textContent = '−';
      }
    });
  });

  // Abrir o primeiro item por padrão
  const firstItem = document.querySelector('.faq-item');
  if (firstItem) {
    const firstAnswer = firstItem.querySelector('.faq-answer');
    const firstIcon = firstItem.querySelector('.faq-icon');
    firstItem.classList.add('open');
    firstAnswer.style.maxHeight = firstAnswer.scrollHeight + 'px';
    if (firstIcon) firstIcon.textContent = '−';
  }
});

// ── 4. META PIXEL — EVENTO NO CTA ────────────────────────────
// app.js está no final do body — DOM já disponível, executar direto
(function () {
  function fireInitiateCheckout() {
    if (typeof fbq === 'function') {
      fbq('track', 'InitiateCheckout', {
        content_name: 'Reconstrução Masculina',
        value: 297.00,
        currency: 'BRL'
      });
    }
  }

  // Todos os CTAs por classe
  document.querySelectorAll('.cta-btn, a[href*="kiwify"]').forEach(function (btn) {
    btn.addEventListener('click', fireInitiateCheckout);
  });

  // Fallback: DOMContentLoaded caso algum botão dinâmico ainda não exista
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.cta-btn, a[href*="kiwify"]').forEach(function (btn) {
      btn.removeEventListener('click', fireInitiateCheckout);
      btn.addEventListener('click', fireInitiateCheckout);
    });
  });
})();

// ── 5. STICKY CTA — esconde/mostra conforme scroll ───────────
document.addEventListener('DOMContentLoaded', function () {
  const sticky = document.getElementById('sticky-cta');
  if (!sticky) return;

  const heroSection = document.getElementById('hero');

  window.addEventListener('scroll', function () {
    if (!heroSection) return;
    const heroBottom = heroSection.getBoundingClientRect().bottom;
    if (heroBottom < 0) {
      sticky.classList.add('visible');
    } else {
      sticky.classList.remove('visible');
    }
  });
});

// ── 7. REVEAL ANIMATION ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  // Adiciona classe reveal em todos os elementos de seção
  document.querySelectorAll(
    '#dor .dor-item, #mecanismo .etapa-card, #depoimentos .depoimento-card, ' +
    '#modulos .modulo-item, #modulos .bonus-item, #garantia .garantia-inner > *'
  ).forEach(function(el) {
    el.classList.add('reveal');
  });

  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach(function(el) {
      obs.observe(el);
    });
  } else {
    // Fallback: mostra tudo sem animação
    document.querySelectorAll('.reveal').forEach(function(el) {
      el.classList.add('visible');
    });
  }
});

// ── 8. SCROLL PROGRESS ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  bar.style.cssText = 'position:fixed;top:0;left:0;height:3px;background:var(--dourado);z-index:9999;width:0%;transition:width .1s;pointer-events:none;';
  document.body.appendChild(bar);

  window.addEventListener('scroll', function() {
    const scrolled = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const pct = maxScroll > 0 ? (scrolled / maxScroll) * 100 : 0;
    bar.style.width = pct + '%';
  }, { passive: true });
});

// ── 9. TIME-BASED POPUP (60s) ────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  let popupShown = sessionStorage.getItem('rm_popup_shown');
  if (!popupShown) {
    setTimeout(function() {
      const overlay = document.getElementById('exit-popup');
      const alreadyShown = sessionStorage.getItem('rm_popup_shown');
      if (overlay && !alreadyShown) {
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        sessionStorage.setItem('rm_popup_shown', '1');
      }
    }, 60000);
  }
});

// ── 10. SCROLL DEPTH TRACKING ────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  const tracked = { 25: false, 50: false, 75: false, 90: false };
  window.addEventListener('scroll', function() {
    const pct = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );
    Object.keys(tracked).forEach(function(depth) {
      if (!tracked[depth] && pct >= parseInt(depth)) {
        tracked[depth] = true;
        if (typeof fbq === 'function') {
          fbq('trackCustom', 'ScrollDepth', { depth: depth + '%', page: 'RM_landing' });
        }
      }
    });
  }, { passive: true });
});

// ── 11. PIXEL — ViewContent por seção (scroll tracking avançado) ──
document.addEventListener('DOMContentLoaded', function() {
  if (typeof fbq !== 'function') return;

  var sectionMap = {
    'mecanismo': 'Mecanismo_RECA',
    'modulos':   'Modulos_Conteudo',
    'oferta':    'Oferta_Preco',
    'depoimentos': 'Depoimentos',
    'garantia':  'Garantia',
    'preco-ancora': 'Ancoragem_Preco'
  };

  var fired = {};

  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          if (!fired[id] && sectionMap[id]) {
            fired[id] = true;
            fbq('trackCustom', 'SectionView', {
              section: sectionMap[id],
              page: 'RM_landing',
              content_name: 'Reconstrução Masculina',
              value: 297.00,
              currency: 'BRL'
            });
          }
        }
      });
    }, { threshold: 0.3 });

    Object.keys(sectionMap).forEach(function(id) {
      var el = document.getElementById(id);
      if (el) obs.observe(el);
    });
  }
});

// ── 12. YOUTUBE LITE PLAYER ──────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.yt-lite').forEach(function(el) {
    function activate() {
      if (el.classList.contains('yt-loaded')) return;
      var id = el.dataset.videoid;
      el.innerHTML = '<iframe src="https://www.youtube.com/embed/' + id +
        '?autoplay=1&rel=0&modestbranding=1" ' +
        'allow="autoplay; encrypted-media" allowfullscreen></iframe>';
      el.classList.add('yt-loaded');

      // Pixel: rastreia play do VSL
      if (typeof fbq === 'function') {
        fbq('trackCustom', 'VideoPlay', {
          content_name: 'VSL_Reconstrucao_Masculina',
          page: 'RM_landing'
        });
      }
    }

    el.addEventListener('click', activate);
    el.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
    });
  });
});

// ── 13. PIXEL — InitiateCheckout no sticky CTA ───────────────
document.addEventListener('DOMContentLoaded', function() {
  var stickyBtn = document.getElementById('sticky-cta-link');
  if (stickyBtn) {
    stickyBtn.addEventListener('click', function() {
      if (typeof fbq === 'function') {
        fbq('track', 'InitiateCheckout', {
          content_name: 'Reconstrução Masculina — Sticky CTA',
          value: 297.00,
          currency: 'BRL'
        });
      }
    });
  }
});
