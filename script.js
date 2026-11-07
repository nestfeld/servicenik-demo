// Keep the native select as the source of truth for contact filtering.
if (typeof Choices !== 'undefined') {
  new Choices('#city', {
    searchEnabled: false, shouldSort: false, allowHTML: false,
    itemSelectText: '', position: 'auto',
    labelId: 'city-label',
  });
}
const header = document.querySelector('.header');
const menu = document.querySelector('.menu-toggle');
const headerNavigation = document.querySelector('#header-navigation');
function setHeaderMenu(open) {
  header.classList.toggle('menu-open', open);
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  if (!open) header.querySelectorAll('details[open]').forEach(details => details.removeAttribute('open'));
}
menu.addEventListener('click', () => setHeaderMenu(!header.classList.contains('menu-open')));
headerNavigation.addEventListener('click', event => {
  if (event.target.closest('a')) setHeaderMenu(false);
});
document.addEventListener('click', event => {
  if (!header.contains(event.target)) {
    if (header.classList.contains('menu-open')) setHeaderMenu(false);
    header.querySelectorAll('details[open]').forEach(details => details.removeAttribute('open'));
  }
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (header.classList.contains('menu-open')) { setHeaderMenu(false); menu.focus(); }
  else header.querySelectorAll('details[open]').forEach(details => details.removeAttribute('open'));
});
window.matchMedia('(min-width:1280px)').addEventListener('change', event => {
  if (event.matches) setHeaderMenu(false);
});
let headerIsScrolled;
function updateHeaderElevation() {
  const scrolled = window.scrollY > 12;
  if (scrolled === headerIsScrolled) return;
  headerIsScrolled = scrolled;
  header.classList.toggle('is-scrolled', scrolled);
}
window.addEventListener('scroll', updateHeaderElevation, {passive:true});
updateHeaderElevation();
const contacts={'Анапа':{phone:'8 (999) 444-95-92',tel:'+79994449592',wa:'79184669700',tg:'anapa_servicenik'},'Краснодар':{phone:'8 (861) 238-70-81',tel:'+78612387081',wa:'79183909050',tg:'krd123servicenik'},'Новороссийск':{phone:'8 (861) 730 64 79',tel:'+78617306479',wa:'79881387040',tg:'nvrservicenik'}};
const contactDialog=document.querySelector('#contact-dialog');function showContacts(cityOverride){const city=cityOverride ?? document.querySelector('#city').value;document.querySelector('#contact-city').textContent=city;const entries=city?[[city,contacts[city]]]:Object.entries(contacts);document.querySelector('#contact-list').innerHTML=entries.map(([name,c])=>`<div class="contact-row"><strong>${name}</strong><a href="tel:${c.tel}">${c.phone}</a><div><a href="https://wa.me/${c.wa}" target="_blank" rel="noopener">WhatsApp</a> · <a href="https://t.me/${c.tg}" target="_blank" rel="noopener">Telegram</a></div></div>`).join('');contactDialog.showModal()}
document.querySelectorAll('[data-contact]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();showContacts()}));document.querySelectorAll('[data-video]').forEach(b=>b.addEventListener('click',()=>document.querySelector('#video-dialog').showModal()));document.querySelectorAll('dialog').forEach(d=>{d.querySelector('.dialog-close').addEventListener('click',()=>d.close());d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}})});
// Choices restores focus after selection; track input modality so that this
// programmatic focus does not leave a keyboard ring after a pointer action.
document.addEventListener('pointerdown', () => {
  document.documentElement.classList.remove('keyboard-navigation');
}, true);
document.addEventListener('keydown', event => {
  if (['Tab', 'ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Enter', ' '].includes(event.key)) {
    document.documentElement.classList.add('keyboard-navigation');
  }
}, true);
// Reveal only once; disconnect observation as soon as each card appears.
const repairCards = [...document.querySelectorAll('.process .step')];
const reduceRevealMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !reduceRevealMotion.matches) {
  const revealObserver = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting)
      .sort((a, b) => repairCards.indexOf(a.target) - repairCards.indexOf(b.target));
    visible.forEach((entry, index) => {
      entry.target.style.setProperty('--reveal-delay', `${index * 500}ms`);
      entry.target.classList.add('step-revealed');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  repairCards.forEach(card => {
    card.classList.add('step-reveal');
    revealObserver.observe(card);
  });
  reduceRevealMotion.addEventListener('change', event => {
    if (!event.matches) return;
    revealObserver.disconnect();
    repairCards.forEach(card => card.classList.remove('step-reveal'));
  });
}
