document.addEventListener('DOMContentLoaded', () => {
    const signInForm = document.getElementById('signInForm');
    const signInNotification = document.getElementById('signInNotification');

    // --- Helper Function ---
    const showNotification = (element, message, type) => {
        element.textContent = message;
        element.className = `notification ${type}`;
        element.style.display = 'block';
        setTimeout(() => {
            element.style.display = 'none';
        }, 4000);
    };

    // --- Sign-In Handler ---
    const handleSignIn = async (email, password) => {
        try {
            const response = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'An unknown error occurred.');
            }

            if (data.role === 'admin') {
                // MODIFIED: Point to the new admin dashboard file
                window.location.href = '/admin.html';
            } else {
                window.location.href = '/user-dashboard.html';
            }

        } catch (error) {
            showNotification(signInNotification, error.message, 'error');
        }
    };

    // --- Form Event Listener ---
    signInForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        handleSignIn(email, password);
    });
});
