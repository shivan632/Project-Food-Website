document.addEventListener('DOMContentLoaded', () => {
    const widget = document.querySelector('#chatbot-widget');
    const messages = document.querySelector('#chat-messages');
    const form = document.querySelector('#chatbot-form');
    const input = document.querySelector('#chatbot-input');
    const typingIndicator = document.querySelector('#typing-indicator');
    const toggle = document.querySelector('#chatbot-toggle');
    const close = document.querySelector('#close-chatbot');

    if (!widget || !messages || !form || !input) return;

    function addMessage(role, text) {
        const message = document.createElement('div');
        message.className = `message ${role === 'user' ? 'user-message' : 'bot-message'}`;
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = text;
        message.appendChild(bubble);
        messages.appendChild(message);
        messages.scrollTop = messages.scrollHeight;
    }

    function getReply(message) {
        const normalized = message.toLowerCase();
        if (normalized.includes('menu') || normalized.includes('food')) return 'You can browse vegetarian dishes, drinks, and desserts from the Menu.';
        if (normalized.includes('delivery') || normalized.includes('time')) return 'We aim to deliver within 30 to 45 minutes.';
        if (normalized.includes('hour') || normalized.includes('open')) return 'Foodie Delight is open daily from 10:00 AM to 11:00 PM.';
        if (normalized.includes('cart') || normalized.includes('order')) return 'Add an item to your cart, then open Order to review and confirm it.';
        return 'I can help with our menu, delivery times, opening hours, and orders.';
    }

    function respond(message) {
        typingIndicator?.classList.add('is-visible');
        window.setTimeout(() => {
            typingIndicator?.classList.remove('is-visible');
            addMessage('model', getReply(message));
        }, 450);
    }

    function setOpen(isOpen) {
        widget.classList.toggle('is-open', isOpen);
        toggle?.setAttribute('aria-expanded', String(isOpen));
        if (isOpen) input.focus();
    }

    toggle?.addEventListener('click', () => setOpen(!widget.classList.contains('is-open')));
    close?.addEventListener('click', () => setOpen(false));
    document.querySelectorAll('.quick-question').forEach((button) => {
        button.addEventListener('click', () => {
            input.value = button.textContent;
            form.requestSubmit();
        });
    });
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const message = input.value.trim();
        if (!message) return;
        addMessage('user', message);
        input.value = '';
        respond(message);
    });
});