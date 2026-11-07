// Local demonstration: never submit visitor data to an unconnected service.
const repairForm = document.querySelector('#repair-form');
repairForm.addEventListener('submit', event => {
  event.preventDefault();
  const note = document.querySelector('#form-note');
  note.hidden = false;
  note.textContent = 'Данные не отправлены: это демонстрационная форма. Свяжитесь с сервисным центром по телефону или в мессенджере.';
  showContacts();
});
// Without JavaScript the form remains an explicit contact hand-off.
repairForm.removeAttribute('action');
const addressCity = document.querySelector('#addr-city-select');
const addressType = document.querySelector('#addr-type-select');
const addressRows = [...document.querySelectorAll('.address-table tbody tr')];
const addressList = document.querySelector('.address-table tbody');
addressList.id = 'address-rows';
const addressMore = document.createElement('button');
addressMore.type = 'button';
addressMore.className = 'address-more';
addressMore.setAttribute('aria-controls', 'address-rows');
document.querySelector('.address-scroll').after(addressMore);
document.querySelector('#locations').classList.add('has-mobile-addresses');
let addressesExpanded = false;

function updateAddressPreview() {
  const matching = addressRows.filter(row => !row.hidden);
  addressRows.forEach(row => row.classList.remove('mobile-address-extra'));
  if (!addressesExpanded) matching.slice(3).forEach(row => row.classList.add('mobile-address-extra'));
  addressMore.hidden = matching.length <= 3;
  addressMore.setAttribute('aria-expanded', String(addressesExpanded));
  const remaining = Math.max(0, matching.length - 3);
  const noun = remaining === 1 ? 'адрес' : remaining >= 2 && remaining <= 4 ? 'адреса' : 'адресов';
  addressMore.textContent = addressesExpanded ? 'Свернуть адреса' : `Показать ещё ${remaining} ${noun}`;
}
addressMore.addEventListener('click', () => {
  addressesExpanded = !addressesExpanded;
  updateAddressPreview();
});
function filterAddresses() {
  let visible = 0;
  addressRows.forEach(row => {
    row.hidden = !((addressCity.value === 'all' || row.dataset.city === addressCity.value) &&
      (addressType.value === 'all' || row.dataset.type === addressType.value));
    if (!row.hidden) visible++;
  });
  document.querySelector('#address-empty').hidden = visible > 0;
  addressesExpanded = false;
  updateAddressPreview();
}
updateAddressPreview();
addressCity.addEventListener('change', filterAddresses);
addressType.addEventListener('change', filterAddresses);
document.querySelectorAll('[data-claim]').forEach(button => {
  button.addEventListener('click', () => openSiteDialog(document.querySelector('#claim-dialog')));
});
document.querySelector('[data-cookie]').addEventListener('click', () => openSiteDialog(document.querySelector('#cookie-dialog')));
const reviewDialog = document.createElement('dialog');
reviewDialog.className = 'home-dialog';
reviewDialog.id = 'review-dialog';
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

document.querySelector('[data-review]').addEventListener('click', event => {
  event.preventDefault();
  openSiteDialog(reviewDialog);
});
document.querySelector('#video-dialog').addEventListener('close', () => {
  document.querySelector('#video-dialog video')?.pause();
});
