/**
 * Vehicle Rental Service Simulation Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const rentalCatalog = document.getElementById('rentalCatalog');
    if (rentalCatalog) {
        renderRentalCatalog();
    }
});

const RENTAL_MOCK_DATA = [
    { type: 'Van', make: 'Renault Kangoo', pricePerDay: 45, image: 'bi-truck' },
    { type: 'Van', make: 'Peugeot Expert', pricePerDay: 55, image: 'bi-truck' },
    { type: 'Truck', make: 'Isuzu NQR', pricePerDay: 120, image: 'bi-truck-flatbed' },
    { type: 'Truck', make: 'Mitsubishi Fuso', pricePerDay: 135, image: 'bi-truck-flatbed' }
];

function renderRentalCatalog() {
    const catalog = document.getElementById('rentalCatalog');
    if (!catalog) return;

    let html = '';
    RENTAL_MOCK_DATA.forEach((v, index) => {
        html += `
            <div class="col-md-6 col-lg-3 mb-4">
                <div class="card h-100 border-0 shadow-sm rounded-4 text-center hover-lift">
                    <div class="card-body p-4 d-flex flex-column">
                        <div class="display-1 text-primary mb-3">
                            <i class="bi ${v.image}"></i>
                        </div>
                        <h5 class="fw-bold mb-1">${v.make}</h5>
                        <p class="text-muted small mb-3">${v.type}</p>
                        <h4 class="text-dark fw-bold mb-4">$${v.pricePerDay}<small class="text-muted fs-6">/day</small></h4>
                        
                        <div class="mt-auto">
                            <button class="btn btn-primary rounded-pill w-100 fw-semibold" onclick="openRentalModal(${index})">Hire Now</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    catalog.innerHTML = `<div class="row">${html}</div>`;
}

window.openRentalModal = function(index) {
    const vehicle = RENTAL_MOCK_DATA[index];
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
                            <i class="bi ${vehicle.image} fs-1 text-primary me-3"></i>
                            <div>
                                <h5 class="mb-0 fw-bold">${vehicle.make}</h5>
                                <p class="text-muted mb-0">${vehicle.type} - $${vehicle.pricePerDay}/day</p>
                            </div>
                        </div>
                        <form id="rentalForm">
                            <div class="mb-3">
                                <label class="form-label small fw-semibold text-muted">Rental Duration (Days)</label>
                                <input type="number" class="form-control rounded-3" id="rentalDays" value="1" min="1" max="30" required>
                            </div>
                            <div class="d-flex justify-content-between align-items-center bg-light p-3 rounded-3 mb-4">
                                <span class="fw-medium">Total Cost:</span>
                                <span class="fw-bold fs-4 text-primary" id="rentalTotal">$${vehicle.pricePerDay}</span>
                            </div>
                            <button type="submit" class="btn btn-primary w-100 rounded-pill fw-semibold py-2">Confirm Hire</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove old modal if exists
    const oldModal = document.getElementById('rentalModal');
    if (oldModal) oldModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const rentalModal = new bootstrap.Modal(document.getElementById('rentalModal'));
    
    const daysInput = document.getElementById('rentalDays');
    daysInput.addEventListener('input', (e) => {
        let days = parseInt(e.target.value) || 1;
        document.getElementById('rentalTotal').innerText = '$' + (days * vehicle.pricePerDay);
    });
    
    document.getElementById('rentalForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Generate a random plate and ID for the simulated rental
        const randomId = 'R-' + Math.floor(Math.random() * 9000 + 1000);
        const randomPlate = 'RN-' + Math.floor(Math.random() * 9000 + 1000);
        
        const newVehicle = {
            id: randomId,
            type: vehicle.type,
            registrationNumber: randomPlate,
            capacity: vehicle.type === 'Van' ? 500 : 5000,
            status: 'AVAILABLE',
            ownership: 'Rented',
            driver: 'Hired Driver',
            currentParcel: null,
            rentalId: 'RNT-' + Math.floor(Math.random() * 90000 + 10000)
        };
        
        window.saveVehicle(newVehicle);
        rentalModal.hide();
        
        if(window.showNotification) window.showNotification('Vehicle Hired', `${vehicle.make} successfully hired and added to Fleet.`, 'success');
        
        // Redirect to fleet dashboard
        setTimeout(() => {
            window.location.href = 'vehicles.html';
        }, 1500);
    });
    
    rentalModal.show();
};
