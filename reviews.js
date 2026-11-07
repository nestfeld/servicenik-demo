(() => {
  const section = document.querySelector('#reviews');
  const cards = [...section.querySelectorAll('.review-card')];
  const dots = [...section.querySelectorAll('[data-review-dot]')];
  let current = 1;
  let expanded = false;
  let returnFocus = null;
  function render(announce = true) {
    section.classList.toggle('is-expanded', expanded);
    cards.forEach((card, index) => {
      const position = (index - current + cards.length) % cards.length;
      const open = expanded && index === current;
      card.dataset.position = position === 0 ? 'center' : position === 1 ? 'right' : 'left';
      card.classList.toggle('is-open', open);
      card.querySelector('.review-open').hidden = open;
      card.querySelector('.review-open').setAttribute('aria-expanded', String(open));
      card.querySelector('.review-close').hidden = !open;
      card.querySelector('.review-body').tabIndex = open ? 0 : -1;
      dots[index].setAttribute('aria-current', String(index === current));
    });
    if (announce) section.querySelector('[data-review-status]').textContent = `Отзыв ${current + 1} из ${cards.length}: ${cards[current].querySelector('h3').textContent}${expanded ? ', раскрыт' : ''}`;
  }
  function select(index, open, trigger, focusCard = false) {
    // A selected card's opener becomes hidden; keep a valid return target.
    if (trigger) returnFocus = trigger;
    current = (index + cards.length) % cards.length;
    expanded = open;
    render();
    if (focusCard) cards[current].querySelector('.review-close').focus({preventScroll:true});
  }
  function close() {
    if (!expanded) return;
    const fallback = cards[current].querySelector('.review-open');
    expanded = false;
    render();
    (returnFocus?.isConnected && !returnFocus.hidden ? returnFocus : fallback).focus({preventScroll:true});
  }
  cards.forEach((card, index) => {
    const opener = card.querySelector('.review-open');
    card.querySelector('.review-close').addEventListener('click', close);
    card.addEventListener('click', event => {
      if (event.target.closest('a, .review-close') || (expanded && current === index)) return;
      select(index, true, opener, true);
    });
  });
  section.querySelectorAll('[data-review-step]').forEach(button => button.addEventListener('click', () => select(current + Number(button.dataset.reviewStep), true, button)));
  dots.forEach((button, index) => button.addEventListener('click', () => select(index, true, button)));
  section.addEventListener('click', event => {
    if (!event.target.closest('.review-card, button, a')) close();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && expanded) { event.preventDefault(); close(); }
  });
  section.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const inCard = event.target.closest('.review-card');
      select(current + (event.key === 'ArrowRight' ? 1 : -1), true, inCard ? null : event.target, !!inCard);
    }
  });
  const stage = section.querySelector('.reviews-stage');
  let start = null;
  let suppressClick = false;
  stage.addEventListener('touchstart', event => {
    start = event.touches.length === 1 ? {x:event.touches[0].clientX, y:event.touches[0].clientY} : null;
  }, {passive:true});
  stage.addEventListener('touchend', event => {
    if (!start || event.touches.length) { start = null; return; }
    const dx = event.changedTouches[0].clientX - start.x;
    const dy = event.changedTouches[0].clientY - start.y;
    start = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      suppressClick = true;
      select(current + (dx < 0 ? 1 : -1), expanded, null);
      // Never leave keyboard focus on a control hidden by a swipe.
      if (stage.contains(document.activeElement)) cards[current].querySelector(expanded ? '.review-close' : '.review-open').focus({preventScroll:true});
      setTimeout(() => { suppressClick = false; }, 400);
    }
  }, {passive:true});
  stage.addEventListener('touchcancel', () => { start = null; }, {passive:true});
  stage.addEventListener('click', event => {
    if (suppressClick) { event.preventDefault(); event.stopPropagation(); }
  }, true);
  render(false);
})();
