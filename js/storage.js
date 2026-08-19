/**
 * SwiftParcel - Global Storage, History, Notifications, and Theme Manager
 */

const STORAGE_KEY = 'swiftParcelBookings';
const THEME_KEY = 'swiftParcelTheme';

// 1. Theme (Dark Mode) Manager
function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-bs-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-bs-theme', 'light');
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
    applyTheme(savedTheme);

    // Setup toggle button if it exists on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        const toggleBtn = document.getElementById('darkModeToggle');
        if (toggleBtn) {
            // Set initial icon
            toggleBtn.innerHTML = savedTheme === 'dark' ? '<i class="bi bi-sun-fill text-warning"></i>' : '<i class="bi bi-moon-stars-fill"></i>';
            
            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const current = localStorage.getItem(THEME_KEY) || 'light';
                const next = current === 'light' ? 'dark' : 'light';
                localStorage.setItem(THEME_KEY, next);
                applyTheme(next);
                
                // Update icon
                toggleBtn.innerHTML = next === 'dark' ? '<i class="bi bi-sun-fill text-warning"></i>' : '<i class="bi bi-moon-stars-fill"></i>';
            });
        }
    });
}
// Run theme initialization immediately to prevent flash
initTheme();

// 2. Global Toast Notification System
document.addEventListener('DOMContentLoaded', () => {
    // Inject Toast Container if not exists
    if (!document.getElementById('toastContainer')) {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        container.style.zIndex = '1055';
        document.body.appendChild(container);
    }
});

/**
 * Show a Bootstrap Toast Notification
 * @param {string} title 
 * @param {string} message 
 * @param {string} type 'success', 'danger', 'info', 'warning'
 */
window.showNotification = function(title, message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    let icon = 'bi-check-circle-fill';
    let colorClass = 'text-success';
    if (type === 'danger') { icon = 'bi-exclamation-triangle-fill'; colorClass = 'text-danger'; }
    else if (type === 'info') { icon = 'bi-info-circle-fill'; colorClass = 'text-info'; }
    else if (type === 'warning') { icon = 'bi-exclamation-circle-fill'; colorClass = 'text-warning'; }

    const toastId = 'toast-' + Date.now();
    const toastHTML = `
        <div id="${toastId}" class="toast border-0 shadow-sm" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header border-bottom-0 pb-0">
                <i class="bi ${icon} ${colorClass} me-2 fs-5"></i>
                <strong class="me-auto font-outfit ${colorClass}">${title}</strong>
                <small class="text-muted">Just now</small>
                <button type="button" class="btn-close shadow-none" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body pt-1 pb-3 px-4 text-muted small">
                ${message}
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', toastHTML);
    const toastElement = document.getElementById(toastId);
    const bsToast = new bootstrap.Toast(toastElement, { delay: 4000 });
    bsToast.show();
    
    // Cleanup DOM after hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
};

// 3. Storage and History CRUD
function getFormatTime() {
    return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function getFormatDate() {
    return new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

window.getParcels = function() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
};

window.getParcelById = function(id) {
    const parcels = window.getParcels();
    return parcels.find(p => p.parcelId === id || p.trackingNumber === id);
};

window.saveParcel = function(parcelData) {
    const parcels = window.getParcels();
    
    // Initialize history
    if (!parcelData.history) {
        parcelData.history = [];
    }
    
    // Add creation event to history
    parcelData.history.push({
        status: parcelData.status || 'Booked',
        date: getFormatDate(),
        time: getFormatTime(),
        desc: 'Your booking has been received and confirmed.'
    });

    parcels.push(parcelData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parcels));
    if(window.showNotification) window.showNotification('Booking Successful', `Parcel ${parcelData.parcelId} has been booked successfully.`);
    return true;
};

window.updateParcel = function(id, updates) {
    const parcels = window.getParcels();
    const index = parcels.findIndex(p => p.parcelId === id || p.trackingNumber === id);
    if (index === -1) return false;

    const parcel = parcels[index];
    const oldStatus = parcel.status;
    
    // Apply updates
    Object.assign(parcel, updates);

    // If status changed, push to history
    if (updates.status && updates.status !== oldStatus) {
        if (!parcel.history) parcel.history = [];
        
        let desc = 'Status updated.';
        if (updates.status === 'Picked Up') desc = 'Our courier has picked up your parcel.';
        else if (updates.status === 'Processing') desc = 'Parcel is being sorted at our facility.';
        else if (updates.status === 'In Transit') desc = 'Parcel is on its way to the destination city.';
        else if (updates.status === 'Out for Delivery') desc = 'Courier is out to deliver your parcel today.';
        else if (updates.status === 'Delivered') desc = 'Parcel has been successfully delivered.';
        
        parcel.history.push({
            status: updates.status,
            date: getFormatDate(),
            time: getFormatTime(),
            desc: desc
        });
        
        if (updates.status === 'Delivered') {
            if(window.showNotification) window.showNotification('Parcel Delivered', `Parcel ${id} has been delivered successfully.`, 'success');
        } else {
            if(window.showNotification) window.showNotification('Status Updated', `Parcel ${id} is now ${updates.status}.`, 'info');
        }
    } else {
        if(window.showNotification) window.showNotification('Parcel Updated', `Parcel ${id} details were modified.`, 'info');
    }

    parcels[index] = parcel;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parcels));
    return true;
};

window.deleteParcel = function(id) {
    const parcels = window.getParcels();
    const filtered = parcels.filter(p => p.parcelId !== id && p.trackingNumber !== id);
    if (filtered.length !== parcels.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        if(window.showNotification) window.showNotification('Parcel Deleted', `Parcel ${id} has been deleted.`, 'danger');
        return true;
    }
    return false;
};
