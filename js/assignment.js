/**
 * Delivery Assignment Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('pendingParcelsList')) {
        renderPendingParcels();
    }
});

let selectedParcelId = null;

function renderPendingParcels() {
    const list = document.getElementById('pendingParcelsList');
    const parcels = window.getParcels() || [];
    
    // Only show parcels that are 'Booked' or 'Processing' or 'Picked Up' without a vehicle yet
    // For simplicity, we just filter those without an assigned vehicle and not Delivered/Cancelled
    const pending = parcels.filter(p => !p.assignedVehicleId && p.status !== 'Delivered' && p.status !== 'Cancelled');
    
    if (pending.length === 0) {
        list.innerHTML = `
            <div class="text-center text-muted p-4">
                <i class="bi bi-check-circle fs-1 mb-2"></i>
                <p>All parcels have been assigned vehicles.</p>
            </div>
        `;
        document.getElementById('assignmentPanel').innerHTML = `
            <div class="text-muted p-5">
                <i class="bi bi-box-seam fs-1 mb-3 d-block text-secondary"></i>
                <p>Select a parcel from the list to assign a vehicle.</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    pending.forEach(p => {
        const isSelected = selectedParcelId === (p.id || p.parcelId) ? 'border-primary bg-primary bg-opacity-10' : '';
        html += `
            <div class="card mb-3 shadow-sm rounded-3 cursor-pointer ${isSelected}" onclick="selectParcel('${p.id || p.parcelId}')" style="cursor:pointer;">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <h6 class="fw-bold mb-1">Parcel #${p.id || p.parcelId}</h6>
                        <span class="badge bg-warning text-dark">${p.deliveryType || 'Standard'}</span>
                    </div>
                    <p class="small text-muted mb-2">From: ${p.senderCity} &rarr; To: ${p.receiverCity}</p>
                    <p class="small text-muted mb-0">Weight: ${p.parcelWeight} kg | Type: ${p.parcelType}</p>
                </div>
            </div>
        `;
    });
    
    list.innerHTML = html;
}

window.selectParcel = function(parcelId) {
    selectedParcelId = parcelId;
    renderPendingParcels(); // to re-render selection highlight
    renderAssignmentPanel();
};

function renderAssignmentPanel() {
    const panel = document.getElementById('assignmentPanel');
    const shortageAlert = document.getElementById('shortageAlert');
    
    if (!selectedParcelId) return;
    
    const parcel = window.getParcelById(selectedParcelId);
    const vehicles = window.getVehicles() || [];
    const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE');
    
    if (availableVehicles.length === 0) {
        panel.innerHTML = `
            <div class="text-center text-danger p-4">
                <i class="bi bi-x-circle fs-1 mb-2"></i>
                <h5>Cannot Assign Parcel</h5>
                <p>There are no available vehicles in the fleet.</p>
            </div>
        `;
        shortageAlert.classList.remove('d-none');
        return;
    }
    
    shortageAlert.classList.add('d-none');
    
    let availableVehiclesHtml = '';
    let validVehicles = 0;
    const pWeight = parcel.parcelWeight || 0;
    
    availableVehicles.forEach(v => {
        // Only show vehicles with enough capacity for the parcel weight
        if (v.capacity >= pWeight) {
            availableVehiclesHtml += `
                <div class="card mb-3 border border-secondary border-opacity-25 shadow-sm rounded-3">
                    <div class="card-body p-3">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h6 class="fw-bold mb-0">${v.id}</h6>
                            <span class="badge bg-success rounded-pill">Available</span>
                        </div>
                        <p class="small text-muted mb-1">${v.type}</p>
                        <p class="small text-muted mb-3">Capacity: ${v.capacity} kg</p>
                        <button class="btn btn-primary btn-sm w-100 fw-semibold rounded-pill" onclick="assignVehicleToParcel('${v.id}')">Assign Vehicle</button>
                    </div>
                </div>
            `;
            validVehicles++;
        }
    });
    
    if (validVehicles === 0) {
        panel.innerHTML = `
            <div class="card border-danger border-opacity-25 shadow-sm rounded-4 mb-4">
                <div class="card-body p-5 text-center">
                    <i class="bi bi-exclamation-triangle-fill text-danger fs-1 mb-3 d-block"></i>
                    <h4 class="fw-bold text-danger mb-3">Vehicle Shortage</h4>
                    <p class="text-muted mb-4 px-md-4">There are currently no available company vehicles<br>with sufficient capacity for this delivery.</p>
                    
                    <div class="row justify-content-center mb-4 text-start">
                        <div class="col-sm-8 col-md-6">
                            <div class="bg-light p-3 rounded-3 border">
                                <p class="small text-muted mb-1">Parcel Weight:</p>
                                <p class="fw-bold mb-2">${pWeight} kg</p>
                                
                                <p class="small text-muted mb-1 text-primary">Required Capacity:</p>
                                <p class="fw-bold mb-2 text-primary">${pWeight} kg</p>
                                
                                <p class="small text-muted mb-1">Available Company Vehicles:</p>
                                <p class="fw-bold mb-0">0</p>
                            </div>
                        </div>
                    </div>
                    
                    <p class="fw-semibold mb-3">Would you like to hire a vehicle?</p>
                    <div class="d-flex justify-content-center gap-2">
                        <button class="btn btn-outline-secondary rounded-pill px-4" onclick="document.getElementById('assignmentPanel').innerHTML = ''">Cancel</button>
                        <a href="rental.html" class="btn btn-primary rounded-pill px-4 shadow-sm">Check Rental Vehicles</a>
                    </div>
                </div>
            </div>
        `;
        shortageAlert.classList.add('d-none'); // Hide the old generic alert since the panel is now inline
        return;
    }
    
    panel.innerHTML = `
        <div class="text-start">
            <h5 class="fw-bold mb-3 border-bottom pb-2">Assign Vehicle</h5>
            
            <div class="bg-light p-3 rounded-3 mb-4 border">
                <p class="small text-muted mb-1">Parcel ID:</p>
                <p class="fw-bold mb-2">${parcel.id || parcel.parcelId}</p>
                
                <p class="small text-muted mb-1">Receiver:</p>
                <p class="fw-bold mb-2">${parcel.receiverName || 'Unknown'}</p>
                
                <p class="small text-muted mb-1">Parcel Weight:</p>
                <p class="fw-bold mb-2">${pWeight} kg</p>
                
                <p class="small text-muted mb-1 text-primary">Required Vehicle Capacity:</p>
                <p class="fw-bold mb-0 text-primary">${pWeight} kg</p>
            </div>
            
            <h6 class="fw-bold mb-3">Available Vehicles</h6>
            <div style="max-height: 400px; overflow-y: auto;" class="pe-2">
                ${availableVehiclesHtml}
            </div>
        </div>
    `;
}

window.assignVehicleToParcel = function(vId) {
    if (!selectedParcelId) return;
    
    // Update Parcel
    window.updateParcel(selectedParcelId, {
        assignedVehicleId: vId,
        status: 'Vehicle assigned'
    });
    
    const vehicle = window.getVehicles().find(v => v.id === vId);
    
    // Update Vehicle
    window.updateVehicle(vId, {
        status: 'ASSIGNED',
        currentParcel: selectedParcelId,
        driver: vehicle.driver || 'Assigned'
    });
    
    if(window.showNotification) window.showNotification('Assignment Successful', `Parcel ${selectedParcelId} assigned to Vehicle ${vId}.`, 'success');
    
    selectedParcelId = null;
    renderPendingParcels();
    document.getElementById('assignmentPanel').innerHTML = `
        <div class="text-muted p-5">
            <i class="bi bi-box-seam fs-1 mb-3 d-block text-secondary"></i>
            <p>Select a parcel from the list to assign a vehicle.</p>
        </div>
    `;
};
