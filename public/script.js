document.addEventListener('DOMContentLoaded', () => {
    const notification = document.getElementById('notification');
    const complaintsList = document.getElementById('complaintsList');
    const historyList = document.getElementById('historyList');
    const signOutBtn = document.getElementById('signOutBtn');
    const tabs = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');
    const sortHistorySelect = document.getElementById('sortHistory');
    const sortActiveSelect = document.getElementById('sortActive');

    // --- Tab Navigation ---
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(item => item.classList.remove('active'));
            tab.classList.add('active');

            const targetTab = tab.getAttribute('data-tab');
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetTab) {
                    content.classList.add('active');
                }
            });

            if (targetTab === 'history') {
                fetchHistoryComplaints();
            } else {
                fetchActiveComplaints();
            }
        });
    });

    // --- Sign Out ---
    signOutBtn.addEventListener('click', async () => {
        try {
            await fetch('/api/auth/signout', { method: 'POST' });
            window.location.href = '/signin.html';
        } catch (error) {
            showNotification('Failed to sign out.', 'error');
        }
    });

    // --- Notifications ---
    const showNotification = (message, type) => {
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';
        setTimeout(() => { notification.style.display = 'none'; }, 4000);
    };

    // --- Data Fetching ---
    const fetchActiveComplaints = async (sortOrder = 'new') => {
        try {
            const response = await fetch(`/api/complaints/active?sort=${sortOrder}`);
            if (response.status === 401 || response.status === 403) {
                window.location.href = '/signin.html';
                return;
            }
            if (!response.ok) throw new Error('Failed to fetch active complaints.');
            
            const complaints = await response.json();
            complaintsList.innerHTML = ''; 

            if (complaints.length === 0) {
                complaintsList.innerHTML = '<tr><td colspan="6">No active complaints.</td></tr>';
                return;
            }

            complaints.forEach(complaint => {
                const row = document.createElement('tr');
                const statusClass = complaint.Status.replace(/\s+/g, '-');
                const resolutionMessage = complaint.resolutionMessage || '';

                row.innerHTML = `
                    <td>${complaint.id.substring(0, 8)}...</td>
                    <td>${complaint.fullName}</td>
                    <td>${complaint.Category}</td>
                    <td>${complaint.Description}</td>
                    <td><span class="status-badge status-${statusClass}">${complaint.Status}</span></td>
                    <td class="action-cell">
                        <div class="form-group">
                            <select id="status-${complaint.id}">
                                <option value="In Review" ${complaint.Status === 'In Review' || complaint.Status === 'Submitted' ? 'selected' : ''}>In Review</option>
                                <option value="Resolved">Resolved</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <textarea id="msg-${complaint.id}" rows="2" placeholder="Add resolution message...">${resolutionMessage}</textarea>
                        </div>
                        <button class="btn-update" onclick="updateStatus('${complaint.id}')">Update & Move if Resolved</button>
                    </td>
                `;
                complaintsList.appendChild(row);
            });
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    const fetchHistoryComplaints = async (sortOrder = 'new') => {
        try {
            const response = await fetch(`/api/complaints/history?sort=${sortOrder}`);
            if (!response.ok) throw new Error('Failed to fetch history.');
            
            const complaints = await response.json();
            historyList.innerHTML = ''; 

            if (complaints.length === 0) {
                historyList.innerHTML = '<tr><td colspan="7">No resolved complaints in history.</td></tr>';
                return;
            }

            complaints.forEach(complaint => {
                const row = document.createElement('tr');
                const statusClass = complaint.Status.replace(/\s+/g, '-');
                row.innerHTML = `
                    <td>${complaint.id.substring(0, 8)}...</td>
                    <td>${complaint.fullName}</td>
                    <td>${complaint.Category}</td>
                    <td>${complaint.Description}</td>
                    <td>${new Date(complaint.submissionDate).toLocaleDateString()}</td>
                    <td><span class="status-badge status-${statusClass}">${complaint.Status}</span></td>
                    <td>${complaint.resolutionMessage || 'N/A'}</td>
                `;
                historyList.appendChild(row);
            });
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };
    
    // --- Event Listeners for Sort Dropdowns ---
    sortHistorySelect.addEventListener('change', () => {
        fetchHistoryComplaints(sortHistorySelect.value);
    });

    sortActiveSelect.addEventListener('change', () => {
        fetchActiveComplaints(sortActiveSelect.value);
    });

    // --- Update Status Function---
    window.updateStatus = async (id) => {
        const resolutionMessage = document.getElementById(`msg-${id}`).value;
        const newStatus = document.getElementById(`status-${id}`).value;
        
        console.log(`[DEBUG] Attempting to update complaint ${id} to status: "${newStatus}"`);

        try {
            const response = await fetch(`/api/complaints/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, resolutionMessage }),
            });

            const data = await response.json();
            if (!response.ok) {
                console.error('[DEBUG] Update API call failed:', data.message);
                throw new Error(data.message);
            }
            
            console.log('[DEBUG] Update successful, now refreshing lists.');
            showNotification('Status updated successfully!', 'success');
            
            fetchActiveComplaints(sortActiveSelect.value);
            fetchHistoryComplaints(sortHistorySelect.value);

        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    fetchActiveComplaints();
});