// Keep native modal semantics, focus trapping and focus restoration.
const closingDialogs = new WeakSet();
const dialogMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function openSiteDialog(dialog) {
  if (dialog.open) return;
  const heading = dialog.querySelector('h2');
  if (heading) {
    if (!heading.id) heading.id = `${dialog.id}-heading`;
    dialog.setAttribute('aria-labelledby', heading.id);
  }
  dialog.classList.remove('is-closing');
  dialog.showModal();
  if (!dialogMotion.matches) {
    dialog.animate([
      { opacity: 0, transform: 'translateY(16px) scale(.98)' },
      { opacity: 1, transform: 'translateY(0) scale(1)' },
    ], { duration: 230, easing: 'cubic-bezier(.2,.8,.2,1)' });
  }
}

async function closeSiteDialog(dialog) {
  if (!dialog.open || closingDialogs.has(dialog)) return;
  closingDialogs.add(dialog);
  dialog.classList.add('is-closing');
  try {
    if (!dialogMotion.matches) {
      await dialog.animate([
        { opacity: 1, transform: 'translateY(0) scale(1)' },
        { opacity: 0, transform: 'translateY(10px) scale(.985)' },
      ], { duration: 170, easing: 'ease-in', fill: 'forwards' }).finished;
    }
  } finally {
    dialog.close();
    dialog.getAnimations().forEach(animation => animation.cancel());
    dialog.classList.remove('is-closing');
    closingDialogs.delete(dialog);
  }
}

document.addEventListener('click', event => {
  const button = event.target.closest('.dialog-close, [data-close-cookie]');
  if (button?.closest('dialog')) {
    closeSiteDialog(button.closest('dialog'));
    return;
  }
  if (event.target instanceof HTMLDialogElement) {
    const bounds = event.target.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) {
      closeSiteDialog(event.target);
    }
  }
});
document.addEventListener('cancel', event => {
  if (event.target instanceof HTMLDialogElement) {
    event.preventDefault();
    closeSiteDialog(event.target);
  }
}, true);
