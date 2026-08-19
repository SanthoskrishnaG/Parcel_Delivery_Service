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
    const availableVehicles = vehicles.filter(v => v.status === 'Available');
    
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
    
    let optionsHtml = '';
    availableVehicles.forEach(v => {
        optionsHtml += `<option value="${v.id}">${v.make} (${v.type}) - ${v.plate}</option>`;
    });
    
    panel.innerHTML = `
        <div class="text-start">
            <h5 class="fw-bold mb-3 border-bottom pb-2">Assign Vehicle</h5>
            <p class="small fw-semibold mb-1">Selected Parcel:</p>
            <p class="text-muted mb-4 border rounded p-2 bg-light">#${parcel.id || parcel.parcelId} - ${parcel.deliveryType}</p>
            
            <form id="assignForm">
                <div class="mb-4">
                    <label class="form-label small fw-semibold">Available Vehicles</label>
                    <select class="form-select rounded-3" id="vehicleSelect" required>
                        ${optionsHtml}
                    </select>
                </div>
                <button type="submit" class="btn btn-primary w-100 rounded-pill fw-semibold">Confirm Assignment</button>
            </form>
        </div>
    `;
    
    document.getElementById('assignForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const vId = document.getElementById('vehicleSelect').value;
        
        // Update Parcel
        window.updateParcel(selectedParcelId, {
            assignedVehicleId: vId,
            status: 'In Transit'
        });
        
        // Update Vehicle
        window.updateVehicle(vId, {
            status: 'In Delivery',
            assignedParcel: selectedParcelId
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
    });
}
