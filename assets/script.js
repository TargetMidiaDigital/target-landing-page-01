/* ============================================
   Target Midia Digital — Tráfego Pago
   script.js
   ============================================ */

const WEBHOOK_URL = 'https://primary-production-153c.up.railway.app/webhook/e79dc814-d81a-4b4e-9c95-e9204a104f54';

// ── Header scroll ─────────────────────────────
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
}, { passive: true });

// ── Smooth scroll ─────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    const offset = header.offsetHeight + 16;
    const top = t.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ── Reveal on scroll ──────────────────────────
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── FAQ accordion ─────────────────────────────
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});

// ── Modal ─────────────────────────────────────
const overlay = document.getElementById('modal-overlay');
const modalForm = document.getElementById('modal-form');

function openModal() {
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

document.querySelectorAll('[data-modal]').forEach(b => b.addEventListener('click', () => {
  if (typeof fbq === 'function') fbq('track', 'InitiateCheckout');
  openModal();
}));
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
document.getElementById('modal-close').addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ── Checkboxes plataformas ────────────────────
document.querySelectorAll('.form-check').forEach(label => {
  const input = label.querySelector('input');
  label.addEventListener('click', () => {
    setTimeout(() => {
      if (input.checked) label.classList.add('checked');
      else label.classList.remove('checked');
    }, 0);
  });
});

// ── De-para de valores (labels legíveis) ──────
const LABEL_MAP = {
  faturamento: {
    'ate-30k':       'Até R$ 30 mil/mês',
    '30k-50k':       'R$ 30 mil a R$ 50 mil/mês',
    '50k-100k':      'R$ 50 mil a R$ 100 mil/mês',
    '100k-250k':     'R$ 100 mil a R$ 250 mil/mês',
    '250k-500k':     'R$ 250 mil a R$ 500 mil/mês',
    'acima-500k':    'Acima de R$ 500 mil/mês'
  },
  investimento: {
    'nao-investe':   'Ainda não investe',
    'ate-5k':        'Até R$ 5 mil/mês',
    '5k-15k':        'R$ 5 mil a R$ 15 mil/mês',
    '15k-50k':       'R$ 15 mil a R$ 50 mil/mês',
    'acima-50k':     'Acima de R$ 50 mil/mês'
  },
  urgencia: {
    'agora':         'Imediata — até 30 dias',
    '3-meses':       'Planejando para os próximos 3 meses',
    'pesquisando':   'Ainda pesquisando opções'
  }
};

const label = (group, val) => (LABEL_MAP[group] && LABEL_MAP[group][val]) || val;

// ── Validação e envio ─────────────────────────
modalForm.addEventListener('submit', async e => {
  e.preventDefault();
  let valid = true;

  modalForm.querySelectorAll('[required]').forEach(field => {
    const group = field.closest('.form-group');
    if (!field.value.trim()) {
      group.classList.add('has-error');
      field.classList.add('error');
      valid = false;
    } else {
      group.classList.remove('has-error');
      field.classList.remove('error');
    }
  });

  if (!valid) return;

  const payload = {
    nome:           document.getElementById('f-nome').value.trim(),
    whatsapp:       document.getElementById('f-whatsapp').value.trim(),
    instagram:      document.getElementById('f-instagram').value.trim(),
    faturamento:    label('faturamento', document.getElementById('f-faturamento').value),
    investimento:   label('investimento', document.getElementById('f-investimento').value),
    urgencia:       label('urgencia', document.getElementById('f-urgencia').value),
    origem:         'landing-target-trafego-pago',
    timestamp:      new Date().toISOString()
  };

  const btn = modalForm.querySelector('.form-submit');
  btn.disabled = true;
  btn.textContent = 'Enviando...';

  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (_) { /* prossegue mesmo com falha */ }

  window.location.href = 'obrigado.html';
});

modalForm.querySelectorAll('input, select').forEach(f => {
  f.addEventListener('input', () => {
    f.classList.remove('error');
    f.closest('.form-group').classList.remove('has-error');
  });
});
