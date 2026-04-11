/* @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { pathToFileURL } from 'node:url';

const modulePath = pathToFileURL(`${process.cwd()}/src/index.js`).href;
let activeInputMask = null;

async function flushDom() {
    await Promise.resolve();
    await new Promise((resolve) => {
        if (typeof window.requestAnimationFrame === 'function') {
            window.requestAnimationFrame(() => resolve());
            return;
        }

        setTimeout(resolve, 0);
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
    await Promise.resolve();
}

async function loadInputMask() {
    vi.resetModules();

    const inputMaskModule = await import(
        /* @vite-ignore */
        `${modulePath}?t=${Date.now()}-${Math.random()}`
    );

    await flushDom();
    inputMaskModule.default.stop();
    activeInputMask = inputMaskModule.default;

    return inputMaskModule;
}

function createPatternInput(attributes = {}) {
    const input = document.createElement('input');
    input.setAttribute('data-mask', 'pattern');
    input.setAttribute('data-mask-pattern', '000-000');

    Object.entries(attributes).forEach(([name, value]) => {
        input.setAttribute(name, value);
    });

    return input;
}

describe('InputMask mutation lifecycle', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    afterEach(() => {
        if (activeInputMask) {
            activeInputMask.stop();
            activeInputMask = null;
        }

        document.body.innerHTML = '';
    });

    it('initializes an existing masked input when started', async () => {
        const { default: InputMask } = await loadInputMask();
        const input = createPatternInput();

        document.body.appendChild(input);
        InputMask.start();

        expect(input.dataset.maskReady).toBe('true');
        expect(InputMask.getInstance(input)).not.toBeNull();
    });

    it('initializes masked inputs added after start', async () => {
        const { default: InputMask } = await loadInputMask();

        InputMask.start();

        const input = createPatternInput();
        document.body.appendChild(input);
        await flushDom();

        expect(input.dataset.maskReady).toBe('true');
        expect(InputMask.getInstance(input)).not.toBeNull();
    });

    it('destroys an instance when the input is removed from the DOM', async () => {
        const { default: InputMask } = await loadInputMask();
        const input = createPatternInput();

        document.body.appendChild(input);
        InputMask.start();

        expect(InputMask.getInstance(input)).not.toBeNull();

        input.remove();
        await flushDom();

        expect(InputMask.getInstance(input)).toBeNull();
        expect(input.dataset.maskReady).toBeUndefined();
    });

    it('recreates the mask when an observed attribute changes', async () => {
        const { default: InputMask } = await loadInputMask();
        const input = createPatternInput();

        document.body.appendChild(input);
        InputMask.start();

        const firstInstance = InputMask.getInstance(input);
        input.setAttribute('data-mask-pattern', '0000');
        await flushDom();

        const secondInstance = InputMask.getInstance(input);

        expect(firstInstance).not.toBeNull();
        expect(secondInstance).not.toBeNull();
        expect(secondInstance).not.toBe(firstInstance);
        expect(input.dataset.maskReady).toBe('true');
    });

    it('keeps raw hidden input in sync for form submission', async () => {
        const { default: InputMask } = await loadInputMask();
        const form = document.createElement('form');
        const input = createPatternInput({
            'data-mask-raw': 'true',
            name: 'document',
        });

        form.appendChild(input);
        document.body.appendChild(form);

        InputMask.scan(document);

        const instance = InputMask.getInstance(input);
        expect(instance).not.toBeNull();

        instance.mask.unmaskedValue = '123456';
        await flushDom();

        const hidden = form.querySelector('input[type="hidden"][name="document"]');

        expect(hidden).not.toBeNull();
        expect(hidden.value).toBe('123456');
        expect(input.hasAttribute('name')).toBe(false);
        expect(input.dataset.maskOriginalName).toBe('document');
    });

    it('rebuilds raw binding when the input name changes after a manual refresh', async () => {
        const { default: InputMask } = await loadInputMask();
        const form = document.createElement('form');
        const input = createPatternInput({
            'data-mask-raw': 'true',
            name: 'phone',
        });

        form.appendChild(input);
        document.body.appendChild(form);

        InputMask.scan(document);

        input.setAttribute('name', 'phone_full');
        InputMask.refresh(input);

        const hidden = form.querySelector('input[type="hidden"][name="phone_full"]');

        expect(hidden).not.toBeNull();
        expect(input.dataset.maskOriginalName).toBe('phone_full');
    });

    it('keeps raw binding stable when the name attribute changes under the observer', async () => {
        const { default: InputMask } = await loadInputMask();
        const form = document.createElement('form');
        const input = createPatternInput({
            'data-mask-raw': 'true',
            name: 'raw_field',
        });

        form.appendChild(input);
        document.body.appendChild(form);

        InputMask.start();
        await flushDom();

        input.setAttribute('name', 'raw_field_v2');
        await flushDom();

        const hidden = form.querySelector('input[type="hidden"][name="raw_field_v2"]');

        expect(hidden).not.toBeNull();
        expect(input.hasAttribute('name')).toBe(false);
        expect(input.dataset.maskOriginalName).toBe('raw_field_v2');
    });

    it('stop destroys masks and restores the original name for raw inputs', async () => {
        const { default: InputMask } = await loadInputMask();
        const form = document.createElement('form');
        const input = createPatternInput({
            'data-mask-raw': 'true',
            name: 'cpf',
        });

        form.appendChild(input);
        document.body.appendChild(form);

        InputMask.scan(document);
        InputMask.stop();

        expect(InputMask.getInstance(input)).toBeNull();
        expect(form.querySelector('input[type="hidden"]')).toBeNull();
        expect(input.getAttribute('name')).toBe('cpf');
        expect(input.dataset.maskReady).toBeUndefined();
    });

});
