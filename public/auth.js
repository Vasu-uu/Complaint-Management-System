document.addEventListener('DOMContentLoaded', () => {
    const signInForm = document.getElementById('signInForm');
    const signInNotification = document.getElementById('signInNotification');
    
    const signUpForm = document.getElementById('signUpForm');
    const signUpNotification = document.getElementById('signUpNotification');

    // --- Helper Function ---
    const showNotification = (element, message, type) => {
        if (!element) return;
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
                window.location.href = '/admin.html';
            } else {
                window.location.href = '/user-dashboard.html';
            }

        } catch (error) {
            showNotification(signInNotification, error.message, 'error');
        }
    };
    
    // --- Sign-Up Handler ---
    const handleSignUp = async (fullName, email, password) => {
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, email, password }),
            });
            
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'An unknown error occurred.');
            }
            
            showNotification(signUpNotification, 'Account created! Redirecting to sign-in...', 'success');
            setTimeout(() => {
                window.location.href = '/'; // Redirect to sign-in page
            }, 2000);

        } catch (error) {
            showNotification(signUpNotification, error.message, 'error');
        }
    };


    // --- Form Event Listeners ---
    if (signInForm) {
        signInForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            handleSignIn(email, password);
        });
    }
    
    if (signUpForm) {
        signUpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                showNotification(signUpNotification, 'Passwords do not match.', 'error');
                return;
            }
            if (password.length < 6) {
                 showNotification(signUpNotification, 'Password must be at least 6 characters.', 'error');
                return;
            }

            handleSignUp(fullName, email, password);
        });
    }
});