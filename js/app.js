// ============================================================
// RECONSTRUÇÃO MASCULINA — app.js
// ============================================================

// ── 1. COUNTDOWN TIMER (24h persistido via localStorage) ────
(function () {
  const STORAGE_KEY = 'rm_deadline';
  const HOURS = 24;

  function getDeadline() {
    let stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const deadline = Date.now() + HOURS * 60 * 60 * 1000;
      localStorage.setItem(STORAGE_KEY, deadline);
      return deadline;
    }
    return parseInt(stored, 10);
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const deadline = getDeadline();
    const diff = Math.max(0, deadline - Date.now());

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    const el = document.getElementById('countdown');
    if (el) el.textContent = pad(h) + ':' + pad(m) + ':' + pad(s);

    if (diff === 0) {
      // Reset deadline ao zerar para manter urgência
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    tick();
    setInterval(tick, 1000);
  });
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
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.cta-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (typeof fbq === 'function') {
        fbq('track', 'InitiateCheckout', {
          content_name: 'Reconstrução Masculina',
          value: 297.00,
          currency: 'BRL'
        });
      }
    });
  });
});

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

// ── 6. DATA DINÂMICA NA BARRA DE URGÊNCIA ────────────────────
document.addEventListener('DOMContentLoaded', function () {
  const dateEl = document.getElementById('bonus-deadline');
  if (dateEl) {
    const now = new Date();
    now.setHours(now.getHours() + 24);
    const day = now.getDate();
    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    dateEl.textContent = day + ' de ' + months[now.getMonth()];
  }
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
