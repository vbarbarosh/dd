(function () {
    const copy_icon = [
        '<svg class="copy-icon copy-icon-copy" viewBox="0 0 24 24" aria-hidden="true">',
        '<rect x="8" y="8" width="11" height="11" rx="2"></rect>',
        '<path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"></path>',
        '</svg>',
        '<svg class="copy-icon copy-icon-check" viewBox="0 0 24 24" aria-hidden="true">',
        '<path d="m5 12 4 4L19 6"></path>',
        '</svg>',
    ].join('');

    document.querySelectorAll('pre > code').forEach(function (code) {
        const pre = code.parentElement;
        if (pre.hasAttribute('data-no-copy') || pre.closest('.copy-snippet-wrap')) return;
        wrap_copyable(pre, code, 'copy-snippet-wrap');
    });

    document.querySelectorAll('.install-option > code').forEach(function (code) {
        wrap_copyable(code, code, 'copy-inline-wrap');
    });

    document.querySelectorAll('[data-copy-target]').forEach(function (button) {
        const target = document.querySelector(button.dataset.copyTarget);
        if (target) bind_copy(button, target);
    });

    function wrap_copyable(element, text_element, class_name)
    {
        const wrapper = document.createElement('div');
        const button = create_button();
        element.parentNode.insertBefore(wrapper, element);
        wrapper.className = class_name;
        wrapper.append(element, button);
        bind_copy(button, text_element);
    }

    function create_button()
    {
        const button = document.createElement('button');
        button.className = 'copy-icon-button';
        button.type = 'button';
        button.setAttribute('aria-label', 'Copy to clipboard');
        button.title = 'Copy to clipboard';
        button.innerHTML = copy_icon;
        return button;
    }

    function bind_copy(button, target)
    {
        button.addEventListener('click', async function () {
            try {
                await write_clipboard(target.textContent.trim());
                show_result(button, true);
            }
            catch (error) {
                show_result(button, false);
            }
        });
    }

    async function write_clipboard(value)
    {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(value);
            return;
        }
        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand('copy');
        textarea.remove();
        if (!copied) throw new Error('Copy command was rejected');
    }

    function show_result(button, copied)
    {
        clearTimeout(button.copy_timer);
        button.classList.toggle('copied', copied);
        button.classList.toggle('copy-failed', !copied);
        button.setAttribute('aria-label', copied ? 'Copied' : 'Could not copy');
        button.title = copied ? 'Copied' : 'Could not copy';
        button.copy_timer = setTimeout(function () {
            button.classList.remove('copied', 'copy-failed');
            button.setAttribute('aria-label', 'Copy to clipboard');
            button.title = 'Copy to clipboard';
        }, 1600);
    }
})();
