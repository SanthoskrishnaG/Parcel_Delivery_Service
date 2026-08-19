/**
 * Fleet Management Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // If we're on the fleet dashboard page
    const fleetList = document.getElementById('fleetList');
    if (fleetList) {
        renderFleetDashboard();
        
        // Listen for filter changes if we have filters
        const statusFilter = document.getElementById('statusFilter');
        if(statusFilter) {
            statusFilter.addEventListener('change', () => renderFleetDashboard(statusFilter.value));
        }
    }
});

function renderFleetDashboard(filterStatus = 'All') {
    const fleetList = document.getElementById('fleetList');
    if (!fleetList) return;

    let vehicles = window.getVehicles() || [];
    
    // Apply filters
    if (filterStatus !== 'All') {
        vehicles = vehicles.filter(v => v.status === filterStatus);
    }
    
    // Update summary stats
    updateFleetStats(vehicles);

    if (vehicles.length === 0) {
        fleetList.innerHTML = `
            <div class="p-5 text-center text-muted">
                <i class="bi bi-inbox fs-1 mb-3"></i>
                <h5>No Vehicles Found</h5>
                <p>No vehicles match the current criteria.</p>
            </div>
        `;
        return;
    }

    let html = '';
    vehicles.forEach(v => {
        let statusColor = 'bg-secondary';
        if(v.status === 'Available') statusColor = 'bg-success';
        else if(v.status === 'In Delivery') statusColor = 'bg-primary';
        else if(v.status === 'Maintenance') statusColor = 'bg-warning text-dark';
        else if(v.status === 'Rented') statusColor = 'bg-info text-dark';

        html += `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100 border-0 shadow-sm rounded-4">
                    <div class="card-body p-4">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="fw-bold mb-0">${v.id} (${v.type})</h5>
                            <span class="badge ${statusColor} rounded-pill">${v.status}</span>
                        </div>
                        <p class="text-muted small mb-2"><i class="bi bi-tag me-1"></i> Reg No: ${v.registrationNumber}</p>
                        <p class="text-muted small mb-2"><i class="bi bi-box-seam me-1"></i> Capacity: ${v.capacity} kg</p>
                        <p class="text-muted small mb-3"><i class="bi bi-person me-1"></i> Ownership: ${v.ownership}</p>
                        
                        ${v.status === 'In Delivery' ? `<p class="small text-primary fw-bold"><i class="bi bi-box-seam me-1"></i> Assigned: ${v.currentParcel}</p>` : ''}
                        
                        <div class="mt-3 pt-3 border-top d-flex justify-content-between gap-2">
                            ${v.status === 'Available' ? `<button class="btn btn-sm btn-outline-warning w-100" onclick="sendToMaintenance('${v.id}')">Maintenance</button>` : ''}
                            ${v.status === 'Maintenance' ? `<button class="btn btn-sm btn-outline-success w-100" onclick="markAvailable('${v.id}')">Mark Fixed</button>` : ''}
                            ${v.ownership === 'Rented' && v.status === 'Available' ? `<button class="btn btn-sm btn-outline-danger w-100" onclick="returnRental('${v.id}')">Return</button>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    fleetList.innerHTML = `<div class="row">${html}</div>`;
}

function updateFleetStats(vehicles) {
    const total = vehicles.length;
    const available = vehicles.filter(v => v.status === 'Available').length;
    const inDelivery = vehicles.filter(v => v.status === 'In Delivery').length;
    const maintenance = vehicles.filter(v => v.status === 'Maintenance').length;
    const rented = vehicles.filter(v => v.ownership === 'Rented').length;
    
    if(document.getElementById('statTotalVehicles')) document.getElementById('statTotalVehicles').innerText = total;
    if(document.getElementById('statAvailable')) document.getElementById('statAvailable').innerText = available;
    if(document.getElementById('statInDelivery')) document.getElementById('statInDelivery').innerText = inDelivery;
    if(document.getElementById('statMaintenance')) document.getElementById('statMaintenance').innerText = maintenance;
    if(document.getElementById('statRented')) document.getElementById('statRented').innerText = rented;
}

window.sendToMaintenance = function(id) {
    if(confirm('Send this vehicle to maintenance?')) {
        window.updateVehicle(id, { status: 'Maintenance' });
        if(window.showNotification) window.showNotification('Vehicle Updated', `Vehicle ${id} is now in Maintenance.`, 'warning');
        renderFleetDashboard();
    }
};

window.markAvailable = function(id) {
    if(confirm('Mark this vehicle as fixed and available?')) {
        window.updateVehicle(id, { status: 'Available' });
        if(window.showNotification) window.showNotification('Vehicle Updated', `Vehicle ${id} is now Available.`, 'success');
        renderFleetDashboard();
    }
};

window.returnRental = function(id) {
    if(confirm('Return this rented vehicle back to the rental company?')) {
        window.deleteVehicle(id);
        if(window.showNotification) window.showNotification('Vehicle Returned', `Rented vehicle ${id} has been returned.`, 'info');
        renderFleetDashboard();
    }
};
