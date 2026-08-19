/**
 * Vehicle Rental Service Simulation Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const rentalCatalog = document.getElementById('rentalCatalog');
    if (rentalCatalog) {
        renderRentalCatalog();
    }
});

function renderRentalCatalog() {
    const catalog = document.getElementById('rentalCatalog');
    if (!catalog) return;

    const rentals = window.getRentals().filter(r => r.availability === 'Available');
    
    if (rentals.length === 0) {
        catalog.innerHTML = `
            <div class="col-12 text-center text-muted p-5">
                <i class="bi bi-shop fs-1 mb-3 d-block text-secondary"></i>
                <p>No rental vehicles available at the moment.</p>
            </div>
        `;
        return;
    }

    let html = '';
    rentals.forEach((v) => {
        html += `
            <div class="col-md-6 col-lg-3 mb-4">
                <div class="card h-100 border border-secondary border-opacity-25 shadow-sm rounded-3">
                    <div class="card-body p-4 text-start d-flex flex-column">
                        <h6 class="fw-bold mb-3">${v.rentalId}</h6>
                        <p class="text-dark mb-1 fw-medium">${v.type}</p>
                        <p class="small text-muted mb-3 border-bottom pb-3">Capacity: ${v.capacity} kg</p>
                        
                        <p class="small text-muted mb-1">Daily Rate:</p>
                        <h5 class="text-dark fw-bold mb-3">₹${v.dailyRate}</h5>
                        
                        <p class="small fw-semibold text-success mb-3">${v.availability}</p>
                        
                        <div class="mt-auto">
                            <button class="btn btn-primary rounded-pill w-100 fw-semibold" onclick="openRentalModal('${v.rentalId}')">Hire Vehicle</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    catalog.innerHTML = `<div class="row">${html}</div>`;
}

window.openRentalModal = function(rentalId) {
    const vehicle = window.getRentals().find(r => r.rentalId === rentalId);
    if (!vehicle) return;
    
    const modalHtml = `
        <div class="modal fade" id="rentalModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg rounded-4">
                    <div class="modal-header border-bottom-0 pb-0">
                        <h5 class="modal-title fw-bold">Hire Vehicle</h5>
                        <button type="button" class="btn-close shadow-none" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4">
                        <div class="d-flex align-items-center mb-4">
                            <i class="bi bi-car-front fs-1 text-primary me-3"></i>
                            <div>
                                <h5 class="mb-0 fw-bold">${vehicle.rentalId}</h5>
                                <p class="text-muted mb-0">${vehicle.type} - ₹${vehicle.dailyRate}/day</p>
                            </div>
                        </div>
                        <form id="rentalForm">
                            <div class="row mb-3">
                                <div class="col-6">
                                    <label class="form-label small fw-semibold text-muted">Start Date</label>
                                    <input type="date" class="form-control rounded-3" id="rentalStartDate" required>
                                </div>
                                <div class="col-6">
                                    <label class="form-label small fw-semibold text-muted">End Date</label>
                                    <input type="date" class="form-control rounded-3" id="rentalEndDate" required>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center bg-light p-3 rounded-3 mb-4 border">
                                <span class="fw-medium">Total Cost:</span>
                                <span class="fw-bold fs-4 text-primary" id="rentalTotal">₹${vehicle.dailyRate}</span>
                            </div>
                            <button type="submit" class="btn btn-primary w-100 rounded-pill fw-semibold py-2">Confirm Hire</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const oldModal = document.getElementById('rentalModal');
    if (oldModal) oldModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const rentalModal = new bootstrap.Modal(document.getElementById('rentalModal'));
    
    const startDateInput = document.getElementById('rentalStartDate');
    const endDateInput = document.getElementById('rentalEndDate');
    
    // Default to today and tomorrow
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    startDateInput.valueAsDate = today;
    endDateInput.valueAsDate = tomorrow;
    
    function updateCost() {
        const start = new Date(startDateInput.value);
        const end = new Date(endDateInput.value);
        let days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        if (days < 1) days = 1;
        document.getElementById('rentalTotal').innerText = '₹' + (days * vehicle.dailyRate);
        return days;
    }
    
    startDateInput.addEventListener('change', updateCost);
    endDateInput.addEventListener('change', updateCost);
    
    // Initial cost calculation
    updateCost();
    
    document.getElementById('rentalForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const days = updateCost();
        const totalCost = days * vehicle.dailyRate;
        const parcelId = window.selectedParcelId || null;
        
        const newVehicle = {
            id: vehicle.rentalId + '-HIRED',
            type: vehicle.type,
            registrationNumber: vehicle.registrationNumber,
            capacity: vehicle.capacity,
            status: 'AVAILABLE',
            ownership: 'Rented',
            driver: 'Hired Driver',
            currentParcel: null,
            rentalId: vehicle.rentalId
        };
        
        const transaction = {
            rentalTransactionId: "RNT-" + new Date().toISOString().replace(/\D/g, '').slice(0, 14),
            vehicleId: vehicle.rentalId,
            parcelId: parcelId,
            startDate: startDateInput.value,
            endDate: endDateInput.value,
            dailyRate: vehicle.dailyRate,
            totalCost: totalCost,
            status: "ACTIVE"
        };
        
        window.saveVehicle(newVehicle);
        window.updateRental(vehicle.rentalId, { availability: 'Rented' });
        window.saveRentalTransaction(transaction);
        
        rentalModal.hide();
        
        if(window.showNotification) window.showNotification('Vehicle Hired', `${vehicle.rentalId} successfully hired and added to Fleet.`, 'success');
        
        // Redirect to fleet dashboard
        setTimeout(() => {
            window.location.href = 'vehicles.html';
        }, 1500);
    });
    
    rentalModal.show();
};
