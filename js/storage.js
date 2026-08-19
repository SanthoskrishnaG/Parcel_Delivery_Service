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

function generateDemoData() {
    const demoParcels = [
        { id: 'PDS10001', senderName: 'Alice Smith', senderPhone: '1234567890', senderEmail: 'alice@example.com', senderAddress: '123 Tech Ave', senderCity: 'New York', senderState: 'NY', senderPincode: '10001', receiverName: 'Bob Johnson', receiverPhone: '0987654321', receiverEmail: 'bob@example.com', receiverAddress: '456 Market St', receiverCity: 'San Francisco', receiverState: 'CA', receiverPincode: '94103', parcelType: 'Electronics', parcelWeight: 2, parcelLength: 20, parcelWidth: 20, parcelHeight: 15, deliveryType: 'Express', options: ['optFragile'], price: 45.00, status: 'DELIVERED', bookingDate: new Date(Date.now() - 5*86400000).toISOString(), expectedDate: new Date(Date.now() - 2*86400000).toISOString(), history: [{status: 'BOOKED', timestamp: new Date(Date.now() - 5*86400000).toISOString()}, {status: 'PICKED UP', timestamp: new Date(Date.now() - 4.5*86400000).toISOString()}, {status: 'PROCESSING', timestamp: new Date(Date.now() - 4*86400000).toISOString()}, {status: 'IN TRANSIT', timestamp: new Date(Date.now() - 3*86400000).toISOString()}, {status: 'OUT FOR DELIVERY', timestamp: new Date(Date.now() - 2.5*86400000).toISOString()}, {status: 'DELIVERED', timestamp: new Date(Date.now() - 2*86400000).toISOString()}] },
        { id: 'PDS10002', senderName: 'Charlie Brown', senderPhone: '5551234567', senderEmail: 'charlie@example.com', senderAddress: '789 Oak Ln', senderCity: 'Chicago', senderState: 'IL', senderPincode: '60601', receiverName: 'Diana Prince', receiverPhone: '5559876543', receiverEmail: 'diana@example.com', receiverAddress: '321 Amazon Way', receiverCity: 'Seattle', receiverState: 'WA', receiverPincode: '98109', parcelType: 'Documents', parcelWeight: 0.5, parcelLength: 30, parcelWidth: 20, parcelHeight: 2, deliveryType: 'Standard', options: [], price: 15.00, status: 'IN TRANSIT', bookingDate: new Date(Date.now() - 2*86400000).toISOString(), expectedDate: new Date(Date.now() + 2*86400000).toISOString(), history: [{status: 'BOOKED', timestamp: new Date(Date.now() - 2*86400000).toISOString()}, {status: 'PICKED UP', timestamp: new Date(Date.now() - 1.5*86400000).toISOString()}, {status: 'PROCESSING', timestamp: new Date(Date.now() - 1*86400000).toISOString()}, {status: 'IN TRANSIT', timestamp: new Date(Date.now() - 0.5*86400000).toISOString()}] },
        { id: 'PDS10003', senderName: 'Eve Davis', senderPhone: '4445556666', senderEmail: 'eve@example.com', senderAddress: '555 Pine St', senderCity: 'Austin', senderState: 'TX', senderPincode: '73301', receiverName: 'Frank Miller', receiverPhone: '7778889999', receiverEmail: 'frank@example.com', receiverAddress: '777 Cedar Blvd', receiverCity: 'Denver', receiverState: 'CO', receiverPincode: '80201', parcelType: 'Clothing', parcelWeight: 3, parcelLength: 40, parcelWidth: 30, parcelHeight: 10, deliveryType: 'Same Day', options: ['optInsurance'], price: 85.00, status: 'PROCESSING', bookingDate: new Date(Date.now() - 0.2*86400000).toISOString(), expectedDate: new Date(Date.now() + 0.1*86400000).toISOString(), history: [{status: 'BOOKED', timestamp: new Date(Date.now() - 0.2*86400000).toISOString()}, {status: 'PICKED UP', timestamp: new Date(Date.now() - 0.15*86400000).toISOString()}, {status: 'PROCESSING', timestamp: new Date(Date.now() - 0.05*86400000).toISOString()}] },
        { id: 'PDS10004', senderName: 'Grace Lee', senderPhone: '2223334444', senderEmail: 'grace@example.com', senderAddress: '888 Maple Rd', senderCity: 'Boston', senderState: 'MA', senderPincode: '02108', receiverName: 'Harry Potter', receiverPhone: '9990001111', receiverEmail: 'harry@example.com', receiverAddress: '4 Privet Dr', receiverCity: 'London', receiverState: 'UK', receiverPincode: '12345', parcelType: 'Gifts', parcelWeight: 1.5, parcelLength: 25, parcelWidth: 25, parcelHeight: 25, deliveryType: 'Standard', options: ['optFragile'], price: 30.00, status: 'PICKED UP', bookingDate: new Date(Date.now() - 1*86400000).toISOString(), expectedDate: new Date(Date.now() + 4*86400000).toISOString(), history: [{status: 'BOOKED', timestamp: new Date(Date.now() - 1*86400000).toISOString()}, {status: 'PICKED UP', timestamp: new Date(Date.now() - 0.5*86400000).toISOString()}] },
        { id: 'PDS10005', senderName: 'Ivy Clark', senderPhone: '6667778888', senderEmail: 'ivy@example.com', senderAddress: '999 Elm St', senderCity: 'Miami', senderState: 'FL', senderPincode: '33101', receiverName: 'Jack Reacher', receiverPhone: '1112223333', receiverEmail: 'jack@example.com', receiverAddress: 'Motel 6', receiverCity: 'Las Vegas', receiverState: 'NV', receiverPincode: '89101', parcelType: 'Tools', parcelWeight: 8, parcelLength: 50, parcelWidth: 40, parcelHeight: 30, deliveryType: 'Express', options: ['optCod'], price: 120.00, status: 'BOOKED', bookingDate: new Date().toISOString(), expectedDate: new Date(Date.now() + 2*86400000).toISOString(), history: [{status: 'BOOKED', timestamp: new Date().toISOString()}] }
    ];
    let parcels = getParcels();
    demoParcels.forEach(p => {
        if (!parcels.find(existing => existing.id === p.id)) {
            parcels.push(p);
        }
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parcels));
}

// 4. Vehicle Management Storage (Fleet & Rental)
const VEHICLES_KEY = 'swiftParcelVehicles';

window.getVehicles = function() {
    return JSON.parse(localStorage.getItem(VEHICLES_KEY) || '[]');
};

window.saveVehicle = function(vehicleData) {
    const vehicles = window.getVehicles();
    vehicles.push(vehicleData);
    localStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicles));
    return true;
};

window.updateVehicle = function(id, updates) {
    const vehicles = window.getVehicles();
    const index = vehicles.findIndex(v => v.id === id);
    if (index === -1) return false;
    
    Object.assign(vehicles[index], updates);
    localStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicles));
    return true;
};

window.deleteVehicle = function(id) {
    const vehicles = window.getVehicles();
    const filtered = vehicles.filter(v => v.id !== id);
    if (filtered.length !== vehicles.length) {
        localStorage.setItem(VEHICLES_KEY, JSON.stringify(filtered));
        return true;
    }
    return false;
};

window.generateDemoVehicles = function() {
    const demoVehicles = [
        { id: 'BIKE-001', registrationNumber: 'TN-38-BK-0001', type: 'Bike', capacity: 20, status: 'Available', ownership: 'Company', driver: 'John Doe', currentParcel: null, rentalId: null },
        { id: 'BIKE-002', registrationNumber: 'TN-38-BK-0002', type: 'Bike', capacity: 20, status: 'Available', ownership: 'Company', driver: 'Jane Smith', currentParcel: null, rentalId: null },
        { id: 'SCOOTER-001', registrationNumber: 'TN-38-SC-0001', type: 'Scooter', capacity: 30, status: 'Available', ownership: 'Company', driver: 'Mike Ross', currentParcel: null, rentalId: null },
        { id: 'VAN-001', registrationNumber: 'TN-38-VN-0001', type: 'Van', capacity: 500, status: 'Available', ownership: 'Company', driver: 'Harvey Specter', currentParcel: null, rentalId: null },
        { id: 'VAN-002', registrationNumber: 'TN-38-VN-0002', type: 'Van', capacity: 500, status: 'In Delivery', ownership: 'Company', driver: 'Louis Litt', currentParcel: 'PDS10002', rentalId: null },
        { id: 'TRUCK-001', registrationNumber: 'TN-38-TR-0001', type: 'Truck', capacity: 5000, status: 'Maintenance', ownership: 'Company', driver: null, currentParcel: null, rentalId: null }
    ];
    let vehicles = window.getVehicles();
    if (vehicles.length === 0) {
        localStorage.setItem(VEHICLES_KEY, JSON.stringify(demoVehicles));
    }
};

// Generate demo vehicles automatically for simulation
window.generateDemoVehicles();
