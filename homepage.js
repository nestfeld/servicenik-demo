// Local demonstration: never submit visitor data to an unconnected service.
const repairForm = document.querySelector('#repair-form');
repairForm.addEventListener('submit', event => {
  event.preventDefault();
  const note = document.querySelector('#form-note');
  note.textContent = 'Данные не отправлены: это демонстрационная форма. Свяжитесь с сервисным центром по телефону или в мессенджере.';
  showContacts(repairForm.elements['request-city'].value);
});
// Without JavaScript the form remains an explicit contact hand-off.
repairForm.removeAttribute('action');
const addressCity = document.querySelector('#addr-city-select');
const addressType = document.querySelector('#addr-type-select');
const addressRows = [...document.querySelectorAll('.address-table tbody tr')];
function filterAddresses() {
  let visible = 0;
  addressRows.forEach(row => {
    row.hidden = !((addressCity.value === 'all' || row.dataset.city === addressCity.value) &&
      (addressType.value === 'all' || row.dataset.type === addressType.value));
    if (!row.hidden) visible++;
  });
  document.querySelector('#address-empty').hidden = visible > 0;
}
addressCity.addEventListener('change', filterAddresses);
addressType.addEventListener('change', filterAddresses);
document.querySelectorAll('[data-claim]').forEach(button => {
  button.addEventListener('click', () => document.querySelector('#claim-dialog').showModal());
});
document.querySelector('[data-cookie]').addEventListener('click', () => document.querySelector('#cookie-dialog').showModal());
document.querySelector('[data-close-cookie]').addEventListener('click', () => document.querySelector('#cookie-dialog').close());
document.querySelectorAll('.home-dialog').forEach(dialog => {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
});
document.querySelector('[data-map]').addEventListener('click', event => {
  const map = document.createElement('iframe');
  map.title = 'Карта сервисных центров';
  map.src = 'https://yandex.ru/map-widget/v1/?ll=38.3084855%2C44.929307&z=8';
  map.referrerPolicy = 'no-referrer';
  event.currentTarget.replaceWith(map);
});
const reviewDialog = document.createElement('dialog');
reviewDialog.className = 'home-dialog';
reviewDialog.setAttribute('aria-label', 'Оставить отзыв');
reviewDialog.innerHTML = '<button class="dialog-close" aria-label="Закрыть">×</button><h2>Оставить отзыв</h2><div class="review-branches"></div>';
document.querySelectorAll('.client-review').forEach(review => {
  const link = document.createElement('a');
  link.href = review.querySelector('a').href;
  link.textContent = review.querySelector('header p').textContent;
  link.target = '_blank';
  link.rel = 'noopener';
  reviewDialog.querySelector('.review-branches').append(link);
});
document.body.append(reviewDialog);
reviewDialog.querySelector('.dialog-close').addEventListener('click', () => reviewDialog.close());
document.querySelector('[data-review]').addEventListener('click', event => {
  event.preventDefault();
  reviewDialog.showModal();
});
document.querySelector('#video-dialog').addEventListener('close', () => {
  document.querySelector('#video-dialog video')?.pause();
});
