(function () {
    'use strict';

    const CART_KEY = 'cart';

    function readCart() {
        try {
            const storedCart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
            return Array.isArray(storedCart) ? storedCart : [];
        } catch (error) {
            return [];
        }
    }

    function writeCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        window.dispatchEvent(new CustomEvent('foodie:cart-updated', { detail: { cart } }));
    }

    function getCartCount(cart) {
        return cart.reduce((total, item) => total + Math.max(0, Number(item.quantity) || 0), 0);
    }

    function updateCartBadges() {
        const count = getCartCount(readCart());
        document.querySelectorAll('[data-cart-count], #cart-count, .cart-count').forEach((badge) => {
            badge.textContent = count;
            badge.setAttribute('aria-label', `${count} items in cart`);
            badge.classList.remove('is-updated');
            void badge.offsetWidth;
            badge.classList.add('is-updated');
        });
    }

    function showToast(message, icon = 'fa-check-circle') {
        document.querySelector('.site-toast')?.remove();
        const toast = document.createElement('div');
        toast.className = 'site-toast';
        toast.setAttribute('role', 'status');
        toast.innerHTML = `<i class="fas ${icon}" aria-hidden="true"></i><span></span>`;
        toast.querySelector('span').textContent = message;
        document.body.appendChild(toast);
        window.setTimeout(() => {
            toast.classList.add('is-leaving');
            window.setTimeout(() => toast.remove(), 200);
        }, 2800);
    }

    function setTheme(theme) {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem('foodie-theme', theme);
        document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
            const isDark = theme === 'dark';
            button.setAttribute('aria-pressed', String(isDark));
            button.setAttribute('aria-label', isDark ? 'Use light theme' : 'Use dark theme');
            const icon = button.querySelector('i');
            if (icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        });
    }

    function initTheme() {
        const savedTheme = localStorage.getItem('foodie-theme');
        const preferredTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        setTheme(preferredTheme);
        document.querySelectorAll('#dark-mode-toggle, [data-theme-toggle]').forEach((button) => {
            button.dataset.themeToggle = '';
            button.addEventListener('click', () => {
                setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
            });
        });
    }

    function initMobileMenu() {
        const button = document.querySelector('#mobile-menu-button');
        const menu = document.querySelector('#mobile-menu');
        if (!button || !menu) return;
        button.setAttribute('aria-controls', 'mobile-menu');
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-label', 'Open navigation menu');
        button.addEventListener('click', () => {
            const isOpen = !menu.classList.contains('hidden');
            menu.classList.toggle('hidden', isOpen);
            button.setAttribute('aria-expanded', String(!isOpen));
            button.setAttribute('aria-label', isOpen ? 'Open navigation menu' : 'Close navigation menu');
        });
        menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
            menu.classList.add('hidden');
            button.setAttribute('aria-expanded', 'false');
            button.setAttribute('aria-label', 'Open navigation menu');
        }));
    }

    function initSearch() {
        document.querySelectorAll('input[placeholder*="Search dishes"]').forEach((input) => {
            input.addEventListener('input', () => {
                const query = input.value.trim().toLowerCase();
                document.querySelectorAll('[data-food-name], #menu .card-hover-effect').forEach((item) => {
                    const name = item.dataset.foodName || item.textContent;
                    item.hidden = query.length > 0 && !name.toLowerCase().includes(query);
                });
            });
        });
    }

    function initMenuFilters() {
        const menu = document.querySelector('#menu');
        if (!menu) return;
        const buttons = menu.querySelectorAll('button');
        const cards = menu.querySelectorAll('.card-hover-effect');
        buttons.forEach((button) => {
            if (!button.textContent.trim().match(/^(all|main dishes|drinks|desserts|vegitarian)$/i)) return;
            button.setAttribute('aria-pressed', button.textContent.trim().toLowerCase() === 'all' ? 'true' : 'false');
            button.addEventListener('click', () => {
                const filter = button.textContent.trim().toLowerCase();
                buttons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
                cards.forEach((card) => {
                    const content = card.textContent.toLowerCase();
                    const isDrink = /coffee|smoothie|tea/.test(content);
                    const isDessert = /toast|ice cream|cake|dessert|sweet/.test(content);
                    const matches = filter === 'all' ||
                        (filter === 'drinks' && isDrink) ||
                        (filter === 'desserts' && isDessert) ||
                        (filter === 'main dishes' && !isDrink && !isDessert) ||
                        (filter === 'vegitarian' && !isDrink && !isDessert);
                    card.hidden = !matches;
                });
            });
        });
    }

    function initHomepageCart() {
        document.querySelectorAll('.home-add-to-cart').forEach((button) => {
            button.addEventListener('click', () => {
                const card = button.closest('.card-hover-effect');
                if (!card) return;
                const name = card.querySelector('h3')?.textContent.trim() || 'Featured dish';
                const priceText = card.querySelector('.text-primary')?.textContent || '';
                const price = Number.parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
                const cart = readCart();
                const existing = cart.find((item) => item.id === name);
                if (existing) existing.quantity += 1;
                else cart.push({ id: name, name, price, quantity: 1 });
                writeCart(cart);
                showToast(`${name} added to your cart.`);
            });
        });
    }

    function initControlLabels() {
        document.querySelectorAll('.quantity-btn.minus, .minus').forEach((button) => {
            button.type = 'button';
            button.setAttribute('aria-label', 'Decrease quantity');
        });
        document.querySelectorAll('.quantity-btn.plus, .plus').forEach((button) => {
            button.type = 'button';
            button.setAttribute('aria-label', 'Increase quantity');
        });
        document.querySelectorAll('.fixed-btn').forEach((button) => {
            button.setAttribute('aria-label', 'Open shopping cart');
        });
        document.querySelectorAll('.close-chatbot').forEach((button) => {
            button.setAttribute('aria-label', 'Close chat assistant');
        });
    }

    function initReveal() {
        const elements = document.querySelectorAll('.motion-reveal');
        if (!('IntersectionObserver' in window)) {
            elements.forEach((element) => element.classList.add('is-visible'));
            return;
        }
        const observer = new IntersectionObserver((entries, currentObserver) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                currentObserver.unobserve(entry.target);
            });
        }, { threshold: 0.12 });
        elements.forEach((element) => observer.observe(element));
    }

    function initThreeScene() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !document.body) return;
        const start = () => {
            if (!window.THREE || document.querySelector('.three-scene')) return;
            const container = document.createElement('div');
            container.className = 'three-scene';
            container.setAttribute('aria-hidden', 'true');
            document.body.prepend(container);

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
            camera.position.z = 6;
            const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
            renderer.setSize(window.innerWidth, window.innerHeight);
            container.appendChild(renderer.domElement);

            const group = new THREE.Group();
            const material = new THREE.MeshStandardMaterial({ color: 0xd9573f, roughness: 0.42, metalness: 0.12 });
            const accent = new THREE.MeshStandardMaterial({ color: 0xf4c95d, roughness: 0.5, metalness: 0.08 });
            const plate = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.08, 16, 64), accent);
            const dish = new THREE.Mesh(new THREE.SphereGeometry(0.72, 32, 18), material);
            dish.scale.y = 0.32;
            const garnish = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 1), new THREE.MeshStandardMaterial({ color: 0x2f7d68 }));
            garnish.position.set(0.32, 0.24, 0.12);
            group.add(plate, dish, garnish);
            group.position.set(window.innerWidth < 700 ? 1.55 : 3.1, 1.6, -1);
            scene.add(group);
            scene.add(new THREE.AmbientLight(0xffffff, 1.7));
            const light = new THREE.PointLight(0xf4c95d, 2.5, 12);
            light.position.set(2, 3, 4);
            scene.add(light);

            const resize = () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
                group.position.x = window.innerWidth < 700 ? 1.55 : 3.1;
            };
            window.addEventListener('resize', resize);
            const animate = () => {
                group.rotation.y += 0.006;
                group.rotation.x = Math.sin(performance.now() * 0.0007) * 0.08;
                renderer.render(scene, camera);
                requestAnimationFrame(animate);
            };
            animate();
        };

        if (window.THREE) start();
        else {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
            script.onload = start;
            script.onerror = () => {};
            document.head.appendChild(script);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        updateCartBadges();
        initTheme();
        initMobileMenu();
        initSearch();
        initMenuFilters();
        initHomepageCart();
        initControlLabels();
        initReveal();
        initThreeScene();
    });

    window.addEventListener('storage', updateCartBadges);
    window.addEventListener('foodie:cart-updated', updateCartBadges);
    window.FoodieStore = { readCart, writeCart, getCartCount, updateCartBadges, showToast };
}());
