document.addEventListener('DOMContentLoaded', () => {
    const profile = JSON.parse(localStorage.getItem('foodie-profile') || '{}');
    const profileForm = document.querySelector('#profile-form');
    const settingsForm = document.querySelector('#settings-form');
    const nameInput = document.querySelector('#profile-name');
    const emailInput = document.querySelector('#profile-email');
    const phoneInput = document.querySelector('#profile-phone');
    const cityInput = document.querySelector('#profile-city');
    const addressInput = document.querySelector('#profile-address');
    const avatar = document.querySelector('[data-profile-avatar]');
    const displayName = document.querySelector('[data-profile-name]');
    const displayEmail = document.querySelector('[data-profile-email]');

    function updateProfileView() {
        const name = profile.name || 'Foodie Guest';
        const email = profile.email || localStorage.getItem('userEmail') || 'guest@foodiedelight.example';
        if (nameInput) nameInput.value = profile.name || '';
        if (emailInput) emailInput.value = email;
        if (phoneInput) phoneInput.value = profile.phone || '';
        if (cityInput) cityInput.value = profile.city || '';
        if (addressInput) addressInput.value = profile.address || '';
        if (avatar) avatar.textContent = name.charAt(0).toUpperCase();
        if (displayName) displayName.textContent = name;
        if (displayEmail) displayEmail.textContent = email;
    }

    profileForm?.addEventListener('submit', (event) => {
        event.preventDefault();
        profile.name = nameInput.value.trim();
        profile.email = emailInput.value.trim();
        profile.phone = phoneInput.value.trim();
        profile.city = cityInput.value.trim();
        profile.address = addressInput.value.trim();
        localStorage.setItem('foodie-profile', JSON.stringify(profile));
        updateProfileView();
        window.FoodieStore?.showToast('Profile details saved.');
    });

    settingsForm?.addEventListener('change', (event) => {
        const control = event.target;
        if (!control.dataset.preference) return;
        if (control.dataset.preference === 'theme') {
            localStorage.setItem('foodie-theme', control.checked ? 'dark' : 'light');
            document.documentElement.dataset.theme = control.checked ? 'dark' : 'light';
        } else {
            localStorage.setItem(`foodie-${control.dataset.preference}`, control.checked ? 'enabled' : 'disabled');
        }
        window.FoodieStore?.showToast('Setting updated.', 'fa-sliders');
    });

    document.querySelectorAll('[data-preference]').forEach((control) => {
        if (control.dataset.preference === 'theme') {
            control.checked = localStorage.getItem('foodie-theme') === 'dark';
        } else {
            control.checked = localStorage.getItem(`foodie-${control.dataset.preference}`) !== 'disabled';
        }
    });

    document.querySelector('[data-clear-data]')?.addEventListener('click', () => {
        localStorage.removeItem('foodie-profile');
        localStorage.removeItem('foodie-notifications');
        localStorage.removeItem('foodie-location');
        localStorage.removeItem('foodie-motion');
        window.location.reload();
    });

    document.querySelector('[data-logout]')?.addEventListener('click', () => {
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'login.html';
    });

    updateProfileView();
});
