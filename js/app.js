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
