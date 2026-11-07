// Derive every mobile level from the existing navigation, including nested details.
(() => {
  const navigation = document.querySelector('#header-navigation');
  const header = navigation.closest('.header');
  const compact = window.matchMedia('(max-width:1279px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const surface = document.createElement('div');
  surface.className = 'mobile-nav';
  const panels = [];
  let stack = [];

  function entries(container) {
    return [...container.children].flatMap(child => {
      if (child.matches('a, details')) return [child];
      if (child.matches('summary, script, style')) return [];
      return entries(child);
    });
  }

  function arrow(back = false) {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${back ? 'M19 12H5m6-6-6 6 6 6' : 'm9 5 7 7-7 7'}"/></svg>`;
  }

  function makePanel(items, title, parent = null) {
    const panel = document.createElement('div');
    panel.className = 'mobile-nav-panel';
    panel.id = `mobile-nav-level-${panels.length}`;
    panel.hidden = true;
    panel.inert = true;
    const state = { panel, parent, trigger: null, scroll: 0, backButton: null };
    panels.push(state);
    if (parent) {
      const toolbar = document.createElement('div');
      toolbar.className = 'mobile-nav-toolbar';
      const back = document.createElement('button');
      back.type = 'button';
      back.className = 'mobile-nav-back';
      back.innerHTML = `${arrow(true)}<span>Назад</span>`;
      back.addEventListener('click', goBack);
      state.backButton = back;
      const heading = document.createElement('h2');
      heading.id = `${panel.id}-title`;
      heading.textContent = title;
      panel.setAttribute('aria-labelledby', heading.id);
      toolbar.append(back, heading);
      panel.append(toolbar);
    } else panel.setAttribute('aria-label', 'Главное меню');

    const list = document.createElement('div');
    list.className = 'mobile-nav-list';
    for (const item of items) {
      if (item.matches('.nav-addresses')) continue;
      if (item.matches('details')) {
        const summary = item.querySelector(':scope > summary');
        if (!summary) continue;
        const child = makePanel(entries(item), summary.textContent.trim(), state);
        const next = document.createElement('button');
        next.type = 'button';
        next.className = 'mobile-nav-next';
        next.setAttribute('aria-controls', child.panel.id);
        next.setAttribute('aria-expanded', 'false');
        const label = document.createElement('span');
        label.textContent = summary.textContent.trim();
        next.append(label);
        next.insertAdjacentHTML('beforeend', arrow());
        child.trigger = next;
        next.addEventListener('click', () => {
          state.scroll = panel.scrollTop;
          stack.push(child);
          show(child, 'forward');
        });
        list.append(next);
      } else {
        const link = item.cloneNode(true);
        link.removeAttribute('id');
        link.className = 'mobile-nav-link' + (item.classList.contains('nav-current') ? ' is-current' : '');
        list.append(link);
      }
    }
    panel.append(list);
    surface.append(panel);
    return state;
  }

  function show(state, direction, restoreFocus = null) {
    for (const item of panels) {
      const active = item === state;
      item.panel.hidden = !active;
      item.panel.inert = !active;
      if (item.trigger) item.trigger.setAttribute('aria-expanded', String(active));
    }
    state.panel.scrollTop = state.scroll;
    if (!reducedMotion.matches && direction) {
      state.panel.animate([
        { opacity: .3, transform: `translateX(${direction === 'forward' ? 28 : -20}px)` },
        { opacity: 1, transform: 'translateX(0)' },
      ], { duration: 190, easing: 'cubic-bezier(.2,.8,.2,1)' });
    }
    (restoreFocus || state.backButton || state.panel.querySelector('a,button'))?.focus({ preventScroll: true });
  }

  function goBack() {
    if (!compact.matches || stack.length <= 1) return false;
    const leaving = stack.pop();
    leaving.scroll = leaving.panel.scrollTop;
    show(stack.at(-1), 'back', leaving.trigger);
    return true;
  }

  const root = makePanel(entries(navigation), 'Меню');
  navigation.append(surface);
  stack = [root];
  root.panel.hidden = false;
  root.panel.inert = false;
  window.headerMenuLevels = { back: goBack };
  navigation.addEventListener('header-menu-change', event => {
    stack = [root];
    panels.forEach(item => { item.scroll = 0; });
    if (compact.matches && event.detail.open) show(root);
    else panels.forEach(item => {
      item.panel.hidden = item !== root;
      item.panel.inert = item !== root;
      item.trigger?.setAttribute('aria-expanded', 'false');
    });
  });

  // Keep keyboard navigation inside the open header; Escape goes back one level.
  document.addEventListener('keydown', event => {
    if (!compact.matches || !header.classList.contains('menu-open')) return;
    if (event.key === 'ArrowLeft' && navigation.contains(document.activeElement) && goBack()) event.preventDefault();
    if (event.key !== 'Tab') return;
    const controls = [...header.querySelectorAll('a[href],button,summary')]
      .filter(element => element.getClientRects().length && !element.closest('[inert]') && !element.disabled);
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });
})();
