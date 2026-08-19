/**
 * Delivery Operations Dashboard Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    renderOperationsDashboard();
});

function renderOperationsDashboard() {
    const parcels = window.getParcels() || [];
    
    let pending = 0;
    let unassigned = 0;
    let assigned = 0;
    let active = 0;
    let completed = 0;
    
    const unassignedParcels = [];
    
    parcels.forEach(p => {
        const status = (p.status || '').toLowerCase();
        
        if (status.includes('deliver')) {
            completed++;
        } else if (status.includes('transit') || status.includes('process') || status.includes('pick') || status.includes('out')) {
            active++;
        } else if (status.includes('cancel')) {
            // Ignored for these metrics
        } else {
            // Pending/Booked
            pending++;
            if (p.assignedVehicleId) {
                assigned++;
            } else {
                unassigned++;
                unassignedParcels.push(p);
            }
        }
    });
    
    document.getElementById('opPending').textContent = pending;
    document.getElementById('opUnassigned').textContent = unassigned;
    document.getElementById('opAssigned').textContent = assigned;
    document.getElementById('opActive').textContent = active;
    document.getElementById('opCompleted').textContent = completed;
    
    const container = document.getElementById('pendingDeliveriesContainer');
    if (!container) return;
    
    if (unassignedParcels.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="bi bi-box2-heart fs-1 d-block mb-3"></i>
                <h5>All Caught Up!</h5>
                <p>There are no pending unassigned deliveries at this time.</p>
            </div>
        `;
        return;
    }
    
    let html = '<div class="row g-4">';
    unassignedParcels.forEach(p => {
        const pWeight = p.parcelWeight || 0;
        
        html += `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 border border-secondary border-opacity-25 shadow-sm rounded-4">
                    <div class="card-body p-4 d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span class="badge bg-warning text-dark px-3 py-2 rounded-pill">Unassigned</span>
                            <span class="text-muted small">${p.deliveryType || 'Standard'}</span>
                        </div>
                        <h5 class="fw-bold text-dark mb-1">${p.id || p.parcelId}</h5>
                        <p class="text-muted small mb-3"><i class="bi bi-person me-1"></i>${p.receiverName}</p>
                        
                        <div class="bg-light p-3 rounded-3 mb-4 mt-auto border">
                            <div class="d-flex justify-content-between mb-2">
                                <span class="small text-muted">Parcel Weight:</span>
                                <span class="small fw-semibold">${pWeight} kg</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span class="small text-muted">Req. Capacity:</span>
                                <span class="small fw-bold text-primary">${pWeight} kg</span>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span class="small text-muted">Vehicle Status:</span>
                                <span class="small fw-semibold text-danger">None</span>
                            </div>
                        </div>
                        
                        <div class="d-grid gap-2 mt-auto">
                            <button class="btn btn-primary rounded-pill fw-semibold" onclick="routeToAssignment('${p.id || p.parcelId}')">Assign Company Vehicle</button>
                            <button class="btn btn-outline-primary rounded-pill fw-semibold" onclick="routeToAssignment('${p.id || p.parcelId}')">Find Rental Vehicle</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

window.routeToAssignment = function(parcelId) {
    if (parcelId) {
        // Use existing mechanism to select parcel
        localStorage.setItem('swiftParcelSelectedId', parcelId);
    }
    window.location.href = 'delivery-assignment.html';
};
