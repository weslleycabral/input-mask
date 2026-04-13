# InputMask

<div align="center">

![License](https://img.shields.io/badge/license-MIT-green)
![CDN](https://img.shields.io/badge/CDN-jsDelivr-blue)
![Status](https://img.shields.io/badge/status-stable-brightgreen)
![Javascript](https://img.shields.io/badge/language-javascript-yellow)

</div>

A lightweight library for applying input masks using HTML attributes only.

It was built to remove the usual complexity of input masking from frontend forms. Instead of wiring custom JavaScript, you add a script tag once and configure each field with attributes directly in HTML. That makes it especially useful for landing pages, marketing sites, internal tools, and no-code workflows.

Under the hood, this library uses [IMask](https://imask.js.org/) as its masking engine.

## Installation

### CDN (Recommended)

```html
<script defer src="https://cdn.jsdelivr.net/gh/weslleycabral/input-mask@v1.0.0/dist/input-mask.min.js"></script>
```

Once the script is loaded, you only need to add attributes to your `input` elements.

You do not need to write any JavaScript to initialize the library.

### Typical setup

The most common setup looks like this:

1. add the script tag to your page
2. publish or deploy the page
3. add `data-mask` attributes directly to your form fields

The library will initialize itself automatically when the page loads.

## How it works

The library automatically scans the page for inputs with the `data-mask` attribute and applies the matching mask.

Simple example:

```html
<input
  type="text"
  data-mask="pattern"
  data-mask-pattern="000.000.000-00"
>
```

## Quick start

If this is your first time using the library, start with one of these common field types.

### Phone number

```html
<input
  type="text"
  name="phone"
  placeholder="(00) 00000-0000"
  data-mask="pattern"
  data-mask-pattern="(00) 00000-0000"
  data-mask-raw="true"
>
```

### ZIP code

```html
<input
  type="text"
  name="zip"
  placeholder="00000-000"
  data-mask="pattern"
  data-mask-pattern="00000-000"
  data-mask-raw="true"
>
```

### Price field

```html
<input
  type="text"
  name="price"
  placeholder="0,00"
  data-mask="currency"
  data-mask-raw="true"
>
```

### Date of birth

```html
<input
  type="text"
  name="birth_date"
  placeholder="dd/mm/yyyy"
  data-mask="date"
  data-mask-date-format="dd/mm/yyyy"
>
```

## Supported mask types

The library currently supports:

- `pattern`
- `regex`
- `number`
- `currency`
- `date`

## `pattern` mask

Use `pattern` when you want a fixed visual format, such as phone numbers, tax IDs, ZIP codes, license plates, card numbers, or any other predictable structure.

### Attributes used with `pattern`

- `data-mask="pattern"`
- `data-mask-pattern`
- `data-mask-lazy`
- `data-mask-placeholder-char`
- `data-mask-clear-incomplete`
- `data-mask-uppercase`
- `data-mask-lowercase`
- `data-mask-trim`
- `data-mask-overwrite`
- `data-mask-skip-invalid`
- `data-mask-raw`

### Example: Tax ID

```html
<input
  type="text"
  name="tax_id"
  placeholder="000.000.000-00"
  data-mask="pattern"
  data-mask-pattern="000.000.000-00"
  data-mask-raw="true"
>
```

### Example: Credit card

```html
<input
  type="text"
  name="card_number"
  placeholder="0000 0000 0000 0000"
  data-mask="pattern"
  data-mask-pattern="0000 0000 0000 0000"
  data-mask-raw="true"
>
```

### Example: Phone number with a visible placeholder

```html
<input
  type="text"
  placeholder="(00) 00000-0000"
  data-mask="pattern"
  data-mask-pattern="(00) 00000-0000"
  data-mask-lazy="false"
  data-mask-placeholder-char="_"
>
```

### Example: License plate forced to uppercase

```html
<input
  type="text"
  placeholder="ABC1D23"
  data-mask="pattern"
  data-mask-pattern="aaa0a00"
  data-mask-uppercase="true"
  data-mask-trim="true"
>
```

### Example: Clear incomplete values

```html
<input
  type="text"
  placeholder="00000-000"
  data-mask="pattern"
  data-mask-pattern="00000-000"
  data-mask-clear-incomplete="true"
>
```

## `regex` mask

Use `regex` when you want to restrict what users can type based on a pattern, without forcing a fixed visual format.

### Attributes used with `regex`

- `data-mask="regex"`
- `data-mask-regex`
- `data-mask-lazy`
- `data-mask-placeholder-char`
- `data-mask-clear-incomplete`
- `data-mask-uppercase`
- `data-mask-lowercase`
- `data-mask-trim`
- `data-mask-overwrite`
- `data-mask-skip-invalid`
- `data-mask-raw`

### Example: Lowercase letters only

```html
<input
  type="text"
  data-mask="regex"
  data-mask-regex="/^[a-z]*$/"
>
```

### Example: Letters and numbers, forced to uppercase

```html
<input
  type="text"
  data-mask="regex"
  data-mask-regex="/^[a-z0-9]*$/i"
  data-mask-uppercase="true"
  data-mask-trim="true"
>
```

## `number` mask

Use `number` for general numeric fields such as quantities, percentages, counters, age, limits, or decimal values.

### Attributes used with `number`

- `data-mask="number"`
- `data-mask-scale`
- `data-mask-min`
- `data-mask-max`
- `data-mask-signed`
- `data-mask-radix`
- `data-mask-thousands-separator`
- `data-mask-pad-fractional-zeros`
- `data-mask-normalize-zeros`
- `data-mask-autofix`
- `data-mask-lazy`
- `data-mask-placeholder-char`
- `data-mask-clear-incomplete`
- `data-mask-uppercase`
- `data-mask-lowercase`
- `data-mask-trim`
- `data-mask-overwrite`
- `data-mask-skip-invalid`
- `data-mask-raw`

### Example: Integers only

```html
<input
  type="text"
  data-mask="number"
  data-mask-scale="0"
  data-mask-min="0"
  data-mask-max="999"
>
```

### Example: Decimal number using a comma

```html
<input
  type="text"
  data-mask="number"
  data-mask-scale="2"
  data-mask-radix=","
  data-mask-thousands-separator="."
  data-mask-normalize-zeros="true"
>
```

### Example: Allow negative values

```html
<input
  type="text"
  data-mask="number"
  data-mask-scale="2"
  data-mask-signed="true"
  data-mask-min="-9999"
  data-mask-max="9999"
>
```

## `currency` mask

Use `currency` when the field represents money. This type includes practical defaults for currency formatting, such as two decimal places, thousands separators, and zero normalization.

Default behavior for `currency`:

- `scale: 2`
- `thousandsSeparator: "."`
- `radix: ","`
- `signed: false`
- `padFractionalZeros: true`
- `normalizeZeros: true`

### Attributes used with `currency`

- `data-mask="currency"`
- `data-mask-scale`
- `data-mask-min`
- `data-mask-max`
- `data-mask-signed`
- `data-mask-radix`
- `data-mask-thousands-separator`
- `data-mask-pad-fractional-zeros`
- `data-mask-normalize-zeros`
- `data-mask-autofix`
- `data-mask-lazy`
- `data-mask-placeholder-char`
- `data-mask-clear-incomplete`
- `data-mask-uppercase`
- `data-mask-lowercase`
- `data-mask-trim`
- `data-mask-overwrite`
- `data-mask-skip-invalid`
- `data-mask-raw`

### Example: Standard money field

```html
<input
  type="text"
  name="amount"
  placeholder="0,00"
  data-mask="currency"
  data-mask-raw="true"
>
```

### Example: Currency with minimum and maximum limits

```html
<input
  type="text"
  data-mask="currency"
  data-mask-min="0"
  data-mask-max="100000"
  data-mask-autofix="true"
>
```

### Example: Currency with custom decimal settings

```html
<input
  type="text"
  data-mask="currency"
  data-mask-scale="3"
  data-mask-radix="."
  data-mask-thousands-separator=","
  data-mask-pad-fractional-zeros="false"
>
```

## `date` mask

Use `date` for formatted date inputs with built-in validation for day, month, and year.

Supported date formats:

- `dd/mm/yyyy`
- `mm/dd/yyyy`
- `yyyy-mm-dd`

### Attributes used with `date`

- `data-mask="date"`
- `data-mask-date-format`
- `data-mask-date-min`
- `data-mask-date-max`
- `data-mask-min`
- `data-mask-max`
- `data-mask-autofix`
- `data-mask-lazy`
- `data-mask-placeholder-char`
- `data-mask-clear-incomplete`
- `data-mask-uppercase`
- `data-mask-lowercase`
- `data-mask-trim`
- `data-mask-overwrite`
- `data-mask-skip-invalid`
- `data-mask-raw`

### Example: Day / month / year

```html
<input
  type="text"
  placeholder="dd/mm/yyyy"
  data-mask="date"
  data-mask-date-format="dd/mm/yyyy"
>
```

### Example: Date with auto-correction

```html
<input
  type="text"
  placeholder="dd/mm/yyyy"
  data-mask="date"
  data-mask-date-format="dd/mm/yyyy"
  data-mask-autofix="true"
>
```

### Example: Date with min and max range

```html
<input
  type="text"
  data-mask="date"
  data-mask-date-format="yyyy-mm-dd"
  data-mask-date-min="2024-01-01"
  data-mask-date-max="2026-12-31"
>
```

## Utility attributes

Some attributes can be used across multiple mask types to control typing behavior, formatting, and form submission.

### `data-mask-raw`

When `true`, the library submits the unmasked value instead of the formatted one.

Example:

```html
<form>
  <input
    type="text"
    name="phone"
    data-mask="pattern"
    data-mask-pattern="(00) 00000-0000"
    data-mask-raw="true"
  >
</form>
```

If the user types `(11) 99999-0000`, the submitted value will be `11999990000`.

This is especially useful when you want users to see a formatted value while your form receives a clean raw value.

### `data-mask-uppercase`, `data-mask-lowercase`, and `data-mask-trim`

These attributes help normalize text input:

```html
<input
  type="text"
  data-mask="regex"
  data-mask-regex="/^[a-z0-9]*$/i"
  data-mask-uppercase="true"
  data-mask-trim="true"
>
```

### `data-mask-lazy` and `data-mask-placeholder-char`

These attributes control how much of the mask is visually shown:

```html
<input
  type="text"
  data-mask="pattern"
  data-mask-pattern="00000-000"
  data-mask-lazy="false"
  data-mask-placeholder-char="_"
>
```

## Complete attribute reference

| Attribute | Accepted values | Description |
| --- | --- | --- |
| `data-mask` | `pattern`, `regex`, `number`, `currency`, `date` | Defines which mask type should be applied to the input. |
| `data-mask-pattern` | IMask pattern text such as `000.000.000-00` or `(00) 00000-0000` | Defines the fixed mask structure when `data-mask="pattern"`. |
| `data-mask-regex` | plain regex text or `/.../flags` syntax | Defines the allowed input pattern when `data-mask="regex"`. |
| `data-mask-lazy` | `true`, `false`, `1`, `0`, `yes`, `no` | Controls whether the mask is shown only while typing or remains visible. |
| `data-mask-placeholder-char` | any character such as `_` or `#` | Defines the placeholder character used by the mask. |
| `data-mask-clear-incomplete` | `true`, `false`, `1`, `0`, `yes`, `no` | Clears the field if the value is incomplete. |
| `data-mask-uppercase` | `true`, `false`, `1`, `0`, `yes`, `no` | Automatically converts typed text to uppercase. |
| `data-mask-lowercase` | `true`, `false`, `1`, `0`, `yes`, `no` | Automatically converts typed text to lowercase. |
| `data-mask-trim` | `true`, `false`, `1`, `0`, `yes`, `no` | Trims leading and trailing spaces from typed input. |
| `data-mask-raw` | `true`, `false`, `1`, `0`, `yes`, `no` | Makes the form submit the unmasked value by using a hidden input internally. |
| `data-mask-overwrite` | `true`, `false`, `shift` | Controls how newly typed characters replace existing ones. |
| `data-mask-skip-invalid` | `true`, `false`, `1`, `0`, `yes`, `no` | Skips invalid characters instead of blocking input. |
| `data-mask-scale` | integer such as `0`, `2`, `3` | Defines how many decimal places are allowed for `number` and `currency`. |
| `data-mask-min` | number or date in the configured format | Defines the minimum allowed value for numeric masks and can also be used with `date`. |
| `data-mask-max` | number or date in the configured format | Defines the maximum allowed value for numeric masks and can also be used with `date`. |
| `data-mask-signed` | `true`, `false`, `1`, `0`, `yes`, `no` | Allows negative values in `number` and `currency`. |
| `data-mask-radix` | `,`, `.`, or another decimal separator | Defines the decimal separator for numeric masks. |
| `data-mask-thousands-separator` | `.`, `,`, space, or another separator | Defines the thousands separator for `number` and `currency`. |
| `data-mask-pad-fractional-zeros` | `true`, `false`, `1`, `0`, `yes`, `no` | Pads decimal places with zeros in numeric masks. |
| `data-mask-normalize-zeros` | `true`, `false`, `1`, `0`, `yes`, `no` | Normalizes unnecessary zeros in numeric masks. |
| `data-mask-date-format` | `dd/mm/yyyy`, `mm/dd/yyyy`, `yyyy-mm-dd` | Defines the accepted and displayed format for the `date` mask. |
| `data-mask-date-min` | date in the same format defined by `data-mask-date-format` | Defines the minimum allowed date for `date`. |
| `data-mask-date-max` | date in the same format defined by `data-mask-date-format` | Defines the maximum allowed date for `date`. |
| `data-mask-autofix` | `true`, `false`, `1`, `0`, `yes`, `no` | Tries to automatically correct values outside the expected pattern for `number`, `currency`, and `date`. |

## Summary

If you want to use input masks without writing JavaScript, the flow is:

1. add the script via CDN with `defer`
2. choose the mask type with `data-mask`
3. configure the input directly in HTML with the matching attributes

That is the core purpose of this library: make input masking simple for people who want to work directly in HTML and move fast.
