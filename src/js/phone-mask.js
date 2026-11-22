const prefix = '+7 (';

function formatPhone(digits) {
  if (!digits) return '';

  const area = digits.slice(0, 3);
  const exchange = digits.slice(3, 6);
  const firstPair = digits.slice(6, 8);
  const lastPair = digits.slice(8, 10);

  return prefix + area + (area.length === 3 ? ')' : '')
    + (exchange ? ` ${exchange}` : '')
    + (firstPair ? `-${firstPair}` : '')
    + (lastPair ? `-${lastPair}` : '');
}

function updatePhone(input) {
  const { value, selectionStart } = input;
  if (value === '+' || value === '+7') return;

  const countryCode = value.match(/^\s*\+7/)?.[0].length ?? 0;
  let digits = value.slice(countryCode).replace(/\D/g, '');
  let digitsBeforeCaret = value.slice(countryCode, selectionStart).replace(/\D/g, '').length;

  if (!countryCode && /^[78]\d{10}$/.test(digits)) {
    digits = digits.slice(1);
    digitsBeforeCaret -= 1;
  }

  const formatted = formatPhone(digits);
  if (value === formatted) return;

  input.value = formatted;
  const caret = formatPhone(digits.slice(0, Math.max(0, digitsBeforeCaret))).length
    || (formatted ? prefix.length : 0);
  input.setSelectionRange(caret, caret);
}

function prepareEdit(event) {
  const input = event.currentTarget;
  const { value, selectionStart, selectionEnd } = input;
  if (!value.startsWith(prefix) || (selectionStart === 0 && selectionEnd === value.length)) return;
  if (!/^(insert|delete)/.test(event.inputType)) return;

  const start = Math.max(prefix.length, selectionStart);
  const end = Math.max(prefix.length, selectionEnd);

  // Delete a digit even when the caret is next to a mask separator.
  if (start === end && event.inputType === 'deleteContentBackward') {
    const digit = value.slice(prefix.length, start).search(/\d\D*$/);
    if (digit < 0) event.preventDefault();
    else input.setSelectionRange(prefix.length + digit, start);
  } else if (start === end && event.inputType === 'deleteContentForward') {
    const digit = value.slice(end).search(/\d/);
    if (digit >= 0) input.setSelectionRange(start, end + digit + 1);
    else event.preventDefault();
  } else if (start !== selectionStart) {
    input.setSelectionRange(start, end);
  }
}

export function initPhoneMasks() {
  document.querySelectorAll('input[type="tel"][name="phone"]').forEach((input) => {
    input.addEventListener('beforeinput', prepareEdit);
    input.addEventListener('input', () => updatePhone(input));
    input.addEventListener('blur', () => {
      if (input.value === '+' || input.value === '+7') input.value = '';
    });
    updatePhone(input);
  });
}
