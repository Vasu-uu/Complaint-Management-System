
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('complaintForm');
    const notification = document.getElementById('notification');
    const complaintsList = document.getElementById('complaintsList');
    const signOutBtn = document.getElementById('signOutBtn');

    signOutBtn.addEventListener('click', async () => {
        try {
            await fetch('/api/auth/signout', { method: 'POST' });
            window.location.href = '/signin.html';
        } catch (error) {
            showNotification('Failed to sign out.', 'error');
        }
    });

    const showNotification = (message, type) => {
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';
        setTimeout(() => { notification.style.display = 'none'; }, 4000);
    };

    const fetchUserComplaints = async () => {
        try {
            const response = await fetch('/api/user/complaints');
            if (response.status === 401) {
                window.location.href = '/signin.html';
                return;
            }
            if (!response.ok) throw new Error('Failed to fetch your complaints.');
            
            const complaints = await response.json();
            complaintsList.innerHTML = ''; 

            if (complaints.length === 0) {
                complaintsList.innerHTML = '<tr><td colspan="5">You have not logged any complaints yet.</td></tr>';
                return;
            }

            complaints.forEach(complaint => {
                const row = document.createElement('tr');
                const statusClass = complaint.Status.replace(/\s+/g, '-');
                const adminMessage = complaint.resolutionMessage ? `<p class="resolution-msg">"${complaint.resolutionMessage}"</p>` : 'No message yet';

                row.innerHTML = `
                    <td>${complaint.id.substring(0, 8)}...</td>
                    <td>${complaint.Category}</td>
                    <td>${new Date(complaint.submissionDate).toLocaleDateString()}</td>
                    <td><span class="status-badge status-${statusClass}">${complaint.Status}</span></td>
                    <td>${adminMessage}</td>
                `;
                complaintsList.appendChild(row);
            });
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            category: document.getElementById('category').value,
            description: document.getElementById('description').value,
        };

        try {
            const response = await fetch('/api/complaints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            
            showNotification('Complaint submitted successfully!', 'success');
            form.reset();
            fetchUserComplaints();
        } catch (error)
 {
            showNotification(error.message, 'error');
        }
    });

    fetchUserComplaints();
});
