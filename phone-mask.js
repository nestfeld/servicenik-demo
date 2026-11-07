// Shared phone behaviour for every local telephone field, including new dialogs.
(() => {
  const selector = 'input[type="tel"], input[autocomplete="tel"]';
  const pattern = String.raw`\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}`;

  function parse(value) {
    let digits = value.replace(/\D/g, '');
    const prefix = /^\s*\+7/.test(value) ||
      (/^[78]/.test(digits) && (digits.length > 10 || digits.length === 1));
    if (prefix) digits = digits.slice(1);
    return { digits: digits.slice(0, 10), prefix };
  }

  function format(digits) {
    if (!digits) return '';
    let value = '+7 (' + digits.slice(0, 3);
    if (digits.length > 3) value += ') ' + digits.slice(3, 6);
    if (digits.length > 6) value += '-' + digits.slice(6, 8);
    if (digits.length > 8) value += '-' + digits.slice(8, 10);
    return value;
  }

  function caretAfter(value, count) {
    if (!count) return Math.min(4, value.length);
    let seen = 0;
    for (let i = 4; i < value.length; i++) {
      if (/\d/.test(value[i]) && ++seen === count) return i + 1;
    }
    return value.length;
  }

  function prepare(input) {
    input.inputMode = 'tel';
    input.autocomplete = 'tel';
    input.placeholder = '+7 (___) ___-__-__';
    input.pattern = pattern;
    input.title = 'Введите номер полностью: +7 (999) 123-45-67';
  }

  function normalize(input, restoreCaret = true) {
    const raw = input.value;
    const cursor = input.selectionStart ?? raw.length;
    const { digits, prefix } = parse(raw);
    const count = Math.max(0, raw.slice(0, cursor).replace(/\D/g, '').length - Number(prefix));
    input.value = format(digits) || (prefix ? '+7 (' : '');
    if (restoreCaret && document.activeElement === input) {
      const position = caretAfter(input.value, count);
      input.setSelectionRange(position, position);
    }
  }

  document.querySelectorAll(selector).forEach(input => {
    prepare(input);
    if (input.value) normalize(input, false);
  });

  document.addEventListener('focusin', event => {
    if (event.target.matches(selector)) prepare(event.target);
  });
  document.addEventListener('input', event => {
    if (event.target.matches(selector) && !event.isComposing) normalize(event.target);
  });
  document.addEventListener('change', event => {
    if (event.target.matches(selector)) normalize(event.target, false);
  });
  document.addEventListener('focusout', event => {
    if (event.target.matches(selector) && !parse(event.target.value).digits) event.target.value = '';
  });

  // Backspace/Delete skip mask punctuation and remove the adjacent digit.
  document.addEventListener('beforeinput', event => {
    const input = event.target;
    if (!input.matches(selector) || !event.cancelable ||
        !['deleteContentBackward', 'deleteContentForward'].includes(event.inputType) ||
        input.selectionStart !== input.selectionEnd) return;
    const backward = event.inputType === 'deleteContentBackward';
    let index = input.selectionStart - Number(backward);
    const direction = backward ? -1 : 1;
    while (index >= 4 && index < input.value.length && !/\d/.test(input.value[index])) index += direction;
    if (index < 4 || index >= input.value.length) {
      if (backward && !parse(input.value).digits) {
        event.preventDefault();
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
      return;
    }
    event.preventDefault();
    const count = input.value.slice(4, index).replace(/\D/g, '').length;
    const digits = parse(input.value).digits;
    input.value = format(digits.slice(0, count) + digits.slice(count + 1));
    const position = caretAfter(input.value, count);
    input.setSelectionRange(position, position);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
})();
