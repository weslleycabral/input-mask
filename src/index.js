import IMask from 'imask';

/**
 * Input Mask
 * Attribute-driven masking library powered by iMask.
 *
 * Supported mask types:
 * - pattern
 * - date
 * - number
 * - currency
 * - regex
 *
 * Supported helper attributes:
 * - data-mask-lazy
 * - data-mask-placeholder-char
 * - data-mask-clear-incomplete
 * - data-mask-uppercase
 * - data-mask-lowercase
 * - data-mask-trim
 * - data-mask-raw
 * - data-mask-overwrite
 * - data-mask-skip-invalid
 * - data-mask-scale
 * - data-mask-min
 * - data-mask-max
 * - data-mask-signed
 * - data-mask-radix
 * - data-mask-thousands-separator
 * - data-mask-pad-fractional-zeros
 * - data-mask-normalize-zeros
 * - data-mask-date-format
 * - data-mask-date-min
 * - data-mask-date-max
 * - data-mask-autofix
 */

const MASK_SELECTOR = '[data-mask]';
const instances = new WeakMap();
const rawBindings = new WeakMap();
const mutedAttributeElements = new WeakSet();

/* ---------------------------------- */
/* Utils                              */
/* ---------------------------------- */

function hasAttr(el, name) {
    return el.hasAttribute(name);
}

function getAttr(el, name) {
    return el.getAttribute(name);
}

function parseBoolean(value, fallback = false) {
    if (value == null) return fallback;
    const normalized = String(value).trim().toLowerCase();

    if (normalized === 'true' || normalized === '1' || normalized === 'yes') return true;
    if (normalized === 'false' || normalized === '0' || normalized === 'no') return false;

    return fallback;
}

function parseInteger(value, fallback = 0) {
    if (value == null || value === '') return fallback;
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? fallback : parsed;
}

function parseNumber(value) {
    if (value == null || value === '') return undefined;
    const normalized = String(value).trim().replace(',', '.');
    const parsed = Number(normalized);
    return Number.isNaN(parsed) ? undefined : parsed;
}

function parseOverwrite(value) {
    if (value == null) return false;
    const normalized = String(value).trim().toLowerCase();

    if (normalized === 'shift') return 'shift';
    return parseBoolean(normalized, false);
}

function parseRegex(value) {
    if (!value) return null;

    const source = String(value).trim();

    // Supports:
    // ^\d*$
    // /^\d*$/
    // /^\d*$/i
    const match = source.match(/^\/(.+)\/([a-z]*)$/i);

    try {
        if (match) return new RegExp(match[1], match[2]);
        return new RegExp(source);
    } catch (error) {
        console.warn('[Input Mask] Invalid regex:', source, error);
        return null;
    }
}

function parseDateByFormat(value, format) {
    if (!value) return undefined;

    const safeValue = String(value).trim();

    if (!safeValue) return undefined;

    let day;
    let month;
    let year;

    if (format === 'dd/mm/yyyy') {
        const parts = safeValue.split('/');
        if (parts.length !== 3) return undefined;
        [day, month, year] = parts;
    } else if (format === 'mm/dd/yyyy') {
        const parts = safeValue.split('/');
        if (parts.length !== 3) return undefined;
        [month, day, year] = parts;
    } else if (format === 'yyyy-mm-dd') {
        const parts = safeValue.split('-');
        if (parts.length !== 3) return undefined;
        [year, month, day] = parts;
    } else {
        return undefined;
    }

    const d = Number(day);
    const m = Number(month);
    const y = Number(year);

    if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(y)) {
        return undefined;
    }

    const date = new Date(y, m - 1, d);

    // Strict validation to avoid JS date auto-correction.
    if (
        date.getFullYear() !== y ||
        date.getMonth() !== m - 1 ||
        date.getDate() !== d
    ) {
        return undefined;
    }

    return date;
}

function formatDateByFormat(date, format) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());

    if (format === 'dd/mm/yyyy') return `${day}/${month}/${year}`;
    if (format === 'mm/dd/yyyy') return `${month}/${day}/${year}`;
    if (format === 'yyyy-mm-dd') return `${year}-${month}-${day}`;

    return `${day}/${month}/${year}`;
}

function getDatePattern(format) {
    if (format === 'dd/mm/yyyy') return 'd{/}`m{/}`Y';
    if (format === 'mm/dd/yyyy') return 'm{/}`d{/}`Y';
    if (format === 'yyyy-mm-dd') return 'Y{-}`m{-}`d';

    return 'd{/}`m{/}`Y';
}

function getDateBlocks() {
    return {
        d: {
            mask: IMask.MaskedRange,
            from: 1,
            to: 31,
            maxLength: 2,
        },
        m: {
            mask: IMask.MaskedRange,
            from: 1,
            to: 12,
            maxLength: 2,
        },
        Y: {
            mask: IMask.MaskedRange,
            from: 1900,
            to: 9999,
        },
    };
}

function applyTextTransforms(value, el) {
    let nextValue = value;

    if (parseBoolean(getAttr(el, 'data-mask-trim'), false)) {
        nextValue = nextValue.trim();
    }

    const forceUppercase = parseBoolean(getAttr(el, 'data-mask-uppercase'), false);
    const forceLowercase = parseBoolean(getAttr(el, 'data-mask-lowercase'), false);

    // Uppercase wins if both are set.
    if (forceUppercase) nextValue = nextValue.toUpperCase();
    else if (forceLowercase) nextValue = nextValue.toLowerCase();

    return nextValue;
}

function createPrepare(el) {
    return (value) => applyTextTransforms(String(value), el);
}

function createPrepareChar(el) {
    return (char) => applyTextTransforms(String(char), el);
}

function toVisibleBooleanString(value) {
    return value ? 'true' : 'false';
}

function runWithMutedAttributes(el, callback) {
    mutedAttributeElements.add(el);

    try {
        callback();
    } finally {
        window.setTimeout(() => {
            mutedAttributeElements.delete(el);
        }, 0);
    }
}

/* ---------------------------------- */
/* Raw submit handling                */
/* ---------------------------------- */

function syncRawHiddenValue(input, mask) {
    const binding = rawBindings.get(input);
    if (!binding) return;

    binding.hidden.value = mask.unmaskedValue ?? '';
}

function setupRawSubmission(input, mask) {
    if (!parseBoolean(getAttr(input, 'data-mask-raw'), false)) return;
    if (rawBindings.has(input)) return;

    const form = input.form;
    const originalName = input.getAttribute('name');

    if (!form || !originalName) {
        console.warn(
            '[Input Mask] data-mask-raw requires the input to be inside a form and have a name attribute.',
            input
        );
        return;
    }

    const hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.name = originalName;
    hidden.value = mask.unmaskedValue ?? '';

    input.dataset.maskOriginalName = originalName;
    runWithMutedAttributes(input, () => {
        input.removeAttribute('name');
    });

    form.appendChild(hidden);
    rawBindings.set(input, { hidden, form });

    mask.on('accept', () => {
        syncRawHiddenValue(input, mask);
    });

    syncRawHiddenValue(input, mask);

    form.addEventListener('reset', () => {
        setTimeout(() => {
            if (instances.has(input)) {
                const instance = instances.get(input);
                syncRawHiddenValue(input, instance.mask);
            }
        }, 0);
    });
}

/* ---------------------------------- */
/* Mask option builders               */
/* ---------------------------------- */

function getCommonOptions(el) {
    const options = {};

    if (hasAttr(el, 'data-mask-lazy')) {
        options.lazy = parseBoolean(getAttr(el, 'data-mask-lazy'), true);
    }

    if (hasAttr(el, 'data-mask-placeholder-char')) {
        options.placeholderChar = getAttr(el, 'data-mask-placeholder-char');
    }

    if (hasAttr(el, 'data-mask-clear-incomplete')) {
        options.clearIncomplete = parseBoolean(getAttr(el, 'data-mask-clear-incomplete'), false);
    }

    if (hasAttr(el, 'data-mask-overwrite')) {
        options.overwrite = parseOverwrite(getAttr(el, 'data-mask-overwrite'));
    }

    if (hasAttr(el, 'data-mask-skip-invalid')) {
        options.skipInvalid = parseBoolean(getAttr(el, 'data-mask-skip-invalid'), true);
    }

    const needsTransform =
        hasAttr(el, 'data-mask-uppercase') ||
        hasAttr(el, 'data-mask-lowercase') ||
        hasAttr(el, 'data-mask-trim');

    if (needsTransform) {
        options.prepare = createPrepare(el);
        options.prepareChar = createPrepareChar(el);
    }

    return options;
}

function buildPatternOptions(el) {
    const pattern = getAttr(el, 'data-mask-pattern');

    if (!pattern) {
        console.warn('[Input Mask] Missing data-mask-pattern for pattern mask:', el);
        return null;
    }

    return {
        ...getCommonOptions(el),
        mask: pattern,
    };
}

function buildRegexOptions(el) {
    const regexString = getAttr(el, 'data-mask-regex');
    const regex = parseRegex(regexString);

    if (!regex) {
        console.warn('[Input Mask] Missing or invalid data-mask-regex for regex mask:', el);
        return null;
    }

    return {
        ...getCommonOptions(el),
        mask: regex,
    };
}

function buildNumberLikeOptions(el, type) {
    const options = {
        ...getCommonOptions(el),
        mask: Number,
    };

    if (hasAttr(el, 'data-mask-scale')) {
        options.scale = parseInteger(getAttr(el, 'data-mask-scale'), type === 'currency' ? 2 : 0);
    } else if (type === 'currency') {
        options.scale = 2;
    }

    if (hasAttr(el, 'data-mask-thousands-separator')) {
        options.thousandsSeparator = getAttr(el, 'data-mask-thousands-separator');
    } else if (type === 'currency') {
        options.thousandsSeparator = '.';
    }

    if (hasAttr(el, 'data-mask-radix')) {
        options.radix = getAttr(el, 'data-mask-radix');
    } else if (type === 'currency') {
        options.radix = ',';
    }

    if (options.radix === ',') {
        options.mapToRadix = ['.'];
    } else if (options.radix === '.') {
        options.mapToRadix = [','];
    }

    if (hasAttr(el, 'data-mask-signed')) {
        options.signed = parseBoolean(getAttr(el, 'data-mask-signed'), false);
    } else if (type === 'currency') {
        options.signed = false;
    }

    if (hasAttr(el, 'data-mask-pad-fractional-zeros')) {
        options.padFractionalZeros = parseBoolean(getAttr(el, 'data-mask-pad-fractional-zeros'), false);
    } else if (type === 'currency') {
        options.padFractionalZeros = true;
    }

    if (hasAttr(el, 'data-mask-normalize-zeros')) {
        options.normalizeZeros = parseBoolean(getAttr(el, 'data-mask-normalize-zeros'), true);
    } else if (type === 'currency') {
        options.normalizeZeros = true;
    }

    if (hasAttr(el, 'data-mask-min')) {
        const min = parseNumber(getAttr(el, 'data-mask-min'));
        if (min !== undefined) options.min = min;
    }

    if (hasAttr(el, 'data-mask-max')) {
        const max = parseNumber(getAttr(el, 'data-mask-max'));
        if (max !== undefined) options.max = max;
    }

    if (hasAttr(el, 'data-mask-autofix')) {
        options.autofix = parseBoolean(getAttr(el, 'data-mask-autofix'), false);
    }

    return options;
}

function buildDateOptions(el) {
    const format = getAttr(el, 'data-mask-date-format') || 'dd/mm/yyyy';

    const options = {
        ...getCommonOptions(el),
        mask: Date,
        pattern: getDatePattern(format),
        blocks: getDateBlocks(),
        format: (date) => formatDateByFormat(date, format),
        parse: (value) => parseDateByFormat(value, format),
    };

    // Accepts both generic and date-specific attributes.
    const minValue = getAttr(el, 'data-mask-date-min') || getAttr(el, 'data-mask-min');
    const maxValue = getAttr(el, 'data-mask-date-max') || getAttr(el, 'data-mask-max');

    if (minValue) {
        const parsedMin = parseDateByFormat(minValue, format);
        if (parsedMin) options.min = parsedMin;
    }

    if (maxValue) {
        const parsedMax = parseDateByFormat(maxValue, format);
        if (parsedMax) options.max = parsedMax;
    }

    if (hasAttr(el, 'data-mask-autofix')) {
        options.autofix = parseBoolean(getAttr(el, 'data-mask-autofix'), false);
    }

    return options;
}

function buildMaskOptions(el) {
    const type = (getAttr(el, 'data-mask') || '').trim().toLowerCase();

    if (!type) return null;

    if (type === 'pattern') return buildPatternOptions(el);
    if (type === 'regex') return buildRegexOptions(el);
    if (type === 'number') return buildNumberLikeOptions(el, 'number');
    if (type === 'currency') return buildNumberLikeOptions(el, 'currency');
    if (type === 'date') return buildDateOptions(el);

    console.warn(`[Input Mask] Unsupported data-mask type: "${type}"`, el);
    return null;
}

/* ---------------------------------- */
/* Lifecycle                          */
/* ---------------------------------- */

function initMaskElement(el) {
    if (!(el instanceof HTMLInputElement)) return;
    if (instances.has(el)) return;

    const options = buildMaskOptions(el);
    if (!options) return;

    try {
        const mask = IMask(el, options);
        const record = { el, mask, options };
        instances.set(el, record);

        setupRawSubmission(el, mask);

        el.dataset.maskReady = toVisibleBooleanString(true);
    } catch (error) {
        console.error('[Input Mask] Failed to initialize mask:', error, el);
    }
}

function destroyMaskElement(el) {
    const record = instances.get(el);
    if (!record) return;

    record.mask.destroy();
    instances.delete(el);

    const rawBinding = rawBindings.get(el);
    if (rawBinding) {
        rawBinding.hidden.remove();
        rawBindings.delete(el);

        const currentName = el.getAttribute('name');
        const originalName = currentName || el.dataset.maskOriginalName;
        if (originalName) {
            runWithMutedAttributes(el, () => {
                el.setAttribute('name', originalName);
            });
            delete el.dataset.maskOriginalName;
        }
    }

    delete el.dataset.maskReady;
}

function refreshMaskElement(el) {
    destroyMaskElement(el);
    initMaskElement(el);
}

function scan(root = document) {
    const elements = root.querySelectorAll(MASK_SELECTOR);
    elements.forEach(initMaskElement);
}

function createObserver() {
    const pendingInit = new Set();
    const pendingDestroy = new Set();
    const pendingRefresh = new Set();
    let scheduled = false;

    const flush = () => {
        scheduled = false;

        pendingDestroy.forEach((el) => {
            pendingInit.delete(el);
            pendingRefresh.delete(el);
            destroyMaskElement(el);
        });

        pendingRefresh.forEach((el) => {
            pendingInit.delete(el);
            refreshMaskElement(el);
        });

        pendingInit.forEach((el) => {
            initMaskElement(el);
        });

        pendingDestroy.clear();
        pendingRefresh.clear();
        pendingInit.clear();
    };

    const scheduleFlush = () => {
        if (scheduled) return;
        scheduled = true;

        if ('requestAnimationFrame' in window) {
            window.requestAnimationFrame(() => flush());
            return;
        }

        window.setTimeout(flush, 0);
    };

    const queueInit = (el) => {
        if (!(el instanceof HTMLInputElement)) return;
        if (pendingDestroy.has(el) || pendingRefresh.has(el)) return;
        pendingInit.add(el);
    };

    const queueDestroy = (el) => {
        if (!(el instanceof HTMLInputElement)) return;
        pendingInit.delete(el);
        pendingRefresh.delete(el);
        pendingDestroy.add(el);
    };

    const queueRefresh = (el) => {
        if (!(el instanceof HTMLInputElement)) return;
        if (mutedAttributeElements.has(el)) return;
        if (pendingDestroy.has(el)) return;
        pendingInit.delete(el);
        pendingRefresh.add(el);
    };

    const queueTree = (node, action) => {
        if (!(node instanceof Element)) return;

        if (node.matches?.(MASK_SELECTOR)) {
            action(node);
        }

        if (!node.querySelectorAll) return;

        node.querySelectorAll(MASK_SELECTOR).forEach(action);
    };

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => queueTree(node, queueInit));
                mutation.removedNodes.forEach((node) => queueTree(node, queueDestroy));
            }

            if (mutation.type === 'attributes') {
                const target = mutation.target;
                if (target instanceof HTMLInputElement && target.matches(MASK_SELECTOR)) {
                    queueRefresh(target);
                }
            }
        }

        scheduleFlush();
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: [
            'data-mask',
            'data-mask-pattern',
            'data-mask-regex',
            'data-mask-lazy',
            'data-mask-placeholder-char',
            'data-mask-clear-incomplete',
            'data-mask-uppercase',
            'data-mask-lowercase',
            'data-mask-trim',
            'data-mask-raw',
            'data-mask-overwrite',
            'data-mask-skip-invalid',
            'data-mask-scale',
            'data-mask-min',
            'data-mask-max',
            'data-mask-signed',
            'data-mask-radix',
            'data-mask-thousands-separator',
            'data-mask-pad-fractional-zeros',
            'data-mask-normalize-zeros',
            'data-mask-date-format',
            'data-mask-date-min',
            'data-mask-date-max',
            'data-mask-autofix',
            'name',
        ],
    });

    return observer;
}

function runWhenBrowserIsReady(callback) {
    const start = () => {
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(() => callback(), { timeout: 300 });
            return;
        }

        window.setTimeout(callback, 0);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
        return;
    }

    start();
}

/* ---------------------------------- */
/* Public API                         */
/* ---------------------------------- */

let observer = null;
let started = false;

function start() {
    if (started) return;
    started = true;

    scan(document);
    observer = createObserver();
}

function stop() {
    if (observer) {
        observer.disconnect();
        observer = null;
    }

    document.querySelectorAll(MASK_SELECTOR).forEach(destroyMaskElement);
    started = false;
}

function init() {
    runWhenBrowserIsReady(start);
}

function getInstance(el) {
    return instances.get(el) || null;
}

const InputMask = {
    init,
    start,
    stop,
    scan,
    refresh: refreshMaskElement,
    destroy: destroyMaskElement,
    getInstance,
};

// Auto-init for CDN usage.
init();

// Optional global for IIFE/CDN builds.
if (typeof window !== 'undefined') {
    window.InputMask = InputMask;
}

export default InputMask;
export {
    init,
    start,
    stop,
    scan,
    refreshMaskElement as refresh,
    destroyMaskElement as destroy,
    getInstance,
};
