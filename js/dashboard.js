/**
 * SwiftParcel - Dashboard Logic
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // UI Elements
    const tableBody = document.getElementById('tableBody');
    const emptyState = document.getElementById('emptyState');
    
    const searchInput = document.getElementById('searchParcels');
    const filterStatus = document.getElementById('filterStatus');
    const filterDeliveryType = document.getElementById('filterDeliveryType');
    const filterDate = document.getElementById('filterDate');
    const filterPrice = document.getElementById('filterPrice');
    const sortParcels = document.getElementById('sortParcels');

    // Modals
    const viewModal = new bootstrap.Modal(document.getElementById('viewModal'));
    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));

    let currentParcels = []; // Holds the filtered data for rendering
    let parcelToDelete = null;

    /**
     * Load parcels from storage and render dashboard
     */
    function loadDashboard() {
        if (typeof getParcels !== 'function') return;
        const allParcels = getParcels();
        
        updateSummaryCards(allParcels);
        applyFiltersAndRender(allParcels);
    }

    /**
     * Calculate and update summary cards
     */
    function updateSummaryCards(parcels) {
        let total = parcels.length;
        let pending = 0;
        let transit = 0;
        let delivered = 0;
        let cancelled = 0;

        parcels.forEach(p => {
            const status = (p.status || '').toLowerCase();
            if (status.includes('deliver')) {
                delivered++;
            } else if (status.includes('cancel')) {
                cancelled++;
            } else if (status.includes('transit') || status.includes('process') || status.includes('pick')) {
                transit++;
            } else {
                pending++; // Booked / default
            }
        });

        document.getElementById('statTotal').textContent = total;
        document.getElementById('statPending').textContent = pending;
        document.getElementById('statTransit').textContent = transit;
        document.getElementById('statDelivered').textContent = delivered;
        document.getElementById('statCancelled').textContent = cancelled;
    }

    /**
     * Helper to get appropriate badge class for status
     */
    function getStatusBadgeClass(status) {
        status = (status || '').toLowerCase();
        if (status.includes('deliver')) return 'bg-success';
        if (status.includes('cancel')) return 'bg-danger';
        if (status.includes('transit') || status.includes('out')) return 'bg-primary';
        if (status.includes('process')) return 'bg-info';
        return 'bg-warning text-dark'; // Booked/Pending
    }

    /**
     * Render the table with given data
     */
    function renderTable(parcels) {
        tableBody.innerHTML = '';
        
        if (parcels.length === 0) {
            emptyState.classList.remove('d-none');
            document.getElementById('parcelsTable').parentElement.classList.add('d-none');
            return;
        }

        emptyState.classList.add('d-none');
        document.getElementById('parcelsTable').parentElement.classList.remove('d-none');

        // Reverse to show newest first conceptually
        parcels.slice().reverse().forEach(parcel => {
            const id = parcel.parcelId || parcel.trackingNumber || 'N/A';
            const status = parcel.status || 'Booked';
            const badgeClass = getStatusBadgeClass(status);
            
            // To support old mock data before form updates
            const weight = document.getElementById('parcelWeight') ? parcel.weight || '1' : parcel.weight || '-';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-4 py-3 fw-bold font-monospace text-primary">${id}</td>
                <td class="px-4 py-3 text-dark fw-medium">${parcel.receiver || 'N/A'}<br><small class="text-muted fw-normal">${parcel.destination || ''}</small></td>
                <td class="px-4 py-3 text-muted">${parcel.deliveryType || 'Standard'}</td>
                <td class="px-4 py-3 text-muted">${weight} kg</td>
                <td class="px-4 py-3"><span class="badge ${badgeClass} rounded-pill px-2 py-1 fw-medium">${status}</span></td>
                <td class="px-4 py-3 text-muted small">${parcel.date || 'N/A'}</td>
                <td class="px-4 py-3 text-muted small">${parcel.estDeliveryDate || 'N/A'}</td>
                <td class="px-4 py-3 fw-bold text-dark">${parcel.totalPrice ? parcel.totalPrice : '-'}</td>
                <td class="px-4 py-3 text-end">
                    <div class="dropdown">
                        <button class="btn btn-light btn-sm rounded-circle shadow-none border-0" type="button" data-bs-toggle="dropdown">
                            <i class="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end shadow border-0 rounded-3">
                            <li><a class="dropdown-item py-2 action-view" href="#" data-id="${id}"><i class="bi bi-eye text-primary me-2"></i> View</a></li>
                            <li><a class="dropdown-item py-2" href="tracking.html" onclick="sessionStorage.setItem('quickTrackQuery', '${id}')"><i class="bi bi-geo-alt text-info me-2"></i> Track</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item py-2 action-edit" href="#" data-id="${id}"><i class="bi bi-pencil text-warning me-2"></i> Edit Status</a></li>
                            <li><a class="dropdown-item py-2 action-print" href="#" data-id="${id}"><i class="bi bi-printer text-secondary me-2"></i> Print</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item py-2 text-danger action-delete" href="#" data-id="${id}"><i class="bi bi-trash me-2"></i> Delete</a></li>
                        </ul>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        attachActionListeners();
    }

    /**
     * Filter logic
     */
    function applyFiltersAndRender() {
        const query = searchInput.value.toLowerCase().trim();
        const fStatus = filterStatus.value.toLowerCase();
        const fDelivery = filterDeliveryType.value.toLowerCase();
        const fDate = filterDate.value;
        const fPrice = filterPrice.value;
        
        const allParcels = getParcels();
        
        const filtered = allParcels.filter(p => {
            // Text Search
            const id = (p.parcelId || p.trackingNumber || '').toLowerCase();
            const receiver = (p.receiver || '').toLowerCase();
            const destination = (p.destination || '').toLowerCase();
            const status = (p.status || '').toLowerCase();
            
            // To simulate phone/city we check receiver and destination strings
            const matchesSearch = !query || 
                                  id.includes(query) || 
                                  receiver.includes(query) || 
                                  destination.includes(query) || 
                                  status.includes(query);
                                  
            // Dropdowns
            const matchesStatus = fStatus === 'all' || status.includes(fStatus);
            const matchesDelivery = fDelivery === 'all' || (p.deliveryType || '').toLowerCase() === fDelivery;
            
            // Date Filter
            let matchesDate = true;
            if (fDate !== 'all' && p.date) {
                const bookingDate = new Date(p.date);
                const today = new Date();
                const diffTime = Math.abs(today - bookingDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (fDate === 'today' && diffDays > 1) matchesDate = false;
                if (fDate === 'week' && diffDays > 7) matchesDate = false;
                if (fDate === 'month' && diffDays > 30) matchesDate = false;
            }
            
            // Price Filter
            let matchesPrice = true;
            if (fPrice !== 'all' && p.totalPrice) {
                // totalPrice is like "$15.00", so strip $ and parse
                const price = parseFloat(p.totalPrice.replace(/[^0-9.-]+/g,""));
                if (fPrice === 'low' && price >= 50) matchesPrice = false;
                if (fPrice === 'medium' && (price < 50 || price > 100)) matchesPrice = false;
                if (fPrice === 'high' && price <= 100) matchesPrice = false;
            }

            return matchesSearch && matchesStatus && matchesDelivery && matchesDate && matchesPrice;
        });

        // Sorting
        const sortVal = sortParcels ? sortParcels.value : 'newest';
        filtered.sort((a, b) => {
            if (sortVal === 'newest') {
                return new Date(b.date || 0) - new Date(a.date || 0);
            } else if (sortVal === 'oldest') {
                return new Date(a.date || 0) - new Date(b.date || 0);
            } else if (sortVal === 'price-asc') {
                const pa = parseFloat((a.totalPrice || '0').replace(/[^0-9.-]+/g,""));
                const pb = parseFloat((b.totalPrice || '0').replace(/[^0-9.-]+/g,""));
                return pa - pb;
            } else if (sortVal === 'price-desc') {
                const pa = parseFloat((a.totalPrice || '0').replace(/[^0-9.-]+/g,""));
                const pb = parseFloat((b.totalPrice || '0').replace(/[^0-9.-]+/g,""));
                return pb - pa;
            } else if (sortVal === 'weight-asc') {
                return parseFloat(a.weight || 0) - parseFloat(b.weight || 0);
            } else if (sortVal === 'weight-desc') {
                return parseFloat(b.weight || 0) - parseFloat(a.weight || 0);
            } else if (sortVal === 'id-asc') {
                return (a.parcelId || '').localeCompare(b.parcelId || '');
            } else if (sortVal === 'id-desc') {
                return (b.parcelId || '').localeCompare(a.parcelId || '');
            }
            return 0;
        });

        // Reverse here so that renderTable's native reverse() puts it in our exact sorted order
        filtered.reverse();

        renderTable(filtered);
    }

    // Attach Search & Filter Listeners
    searchInput.addEventListener('input', applyFiltersAndRender);
    filterStatus.addEventListener('change', applyFiltersAndRender);
    filterDeliveryType.addEventListener('change', applyFiltersAndRender);
    filterDate.addEventListener('change', applyFiltersAndRender);
    filterPrice.addEventListener('change', applyFiltersAndRender);
    if (sortParcels) sortParcels.addEventListener('change', applyFiltersAndRender);

    /**
     * Attach click events to the action dropdown items dynamically
     */
    function attachActionListeners() {
        // View Action
        document.querySelectorAll('.action-view').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const id = this.getAttribute('data-id');
                const p = getParcelById(id);
                if (!p) return;

                document.getElementById('viewModalContent').innerHTML = `
                    <div class="row g-4">
                        <div class="col-12 text-center mb-2">
                            <h4 class="fw-bold text-primary font-monospace mb-0">${p.parcelId || p.trackingNumber}</h4>
                            <span class="badge ${getStatusBadgeClass(p.status)} mt-2">${p.status || 'Booked'}</span>
                        </div>
                        <div class="col-md-6 border-end-md" style="border-right: 1px solid #dee2e6;">
                            <h6 class="fw-bold font-outfit text-dark border-bottom pb-2 mb-3"><i class="bi bi-person-up text-primary me-2"></i>Sender</h6>
                            <p class="mb-1 text-muted small">Name: <span class="fw-medium text-dark">${p.sender || 'N/A'}</span></p>
                        </div>
                        <div class="col-md-6">
                            <h6 class="fw-bold font-outfit text-dark border-bottom pb-2 mb-3"><i class="bi bi-person-down text-success me-2"></i>Receiver</h6>
                            <p class="mb-1 text-muted small">Name: <span class="fw-medium text-dark">${p.receiver || 'N/A'}</span></p>
                            <p class="mb-1 text-muted small">Destination: <span class="fw-medium text-dark">${p.destination || 'N/A'}</span></p>
                        </div>
                        <div class="col-md-6 border-end-md" style="border-right: 1px solid #dee2e6;">
                            <h6 class="fw-bold font-outfit text-dark border-bottom pb-2 mb-3"><i class="bi bi-box-seam text-info me-2"></i>Parcel</h6>
                            <p class="mb-1 text-muted small">Type: <span class="fw-medium text-dark text-capitalize">${p.parcelType || 'Standard'}</span></p>
                            <p class="mb-1 text-muted small">Weight: <span class="fw-medium text-dark">${p.weight || '-'} kg</span></p>
                        </div>
                        <div class="col-md-6">
                            <h6 class="fw-bold font-outfit text-dark border-bottom pb-2 mb-3"><i class="bi bi-truck text-warning me-2"></i>Delivery</h6>
                            <p class="mb-1 text-muted small">Type: <span class="fw-medium text-dark">${p.deliveryType || 'Standard'}</span></p>
                            <p class="mb-1 text-muted small">Booking Date: <span class="fw-medium text-dark">${p.date || 'N/A'}</span></p>
                            <p class="mb-1 text-muted small">Expected: <span class="fw-medium text-dark">${p.estDeliveryDate || 'N/A'}</span></p>
                        </div>
                        <div class="col-12 mt-2">
                            <div class="bg-light p-3 rounded-3 d-flex justify-content-between align-items-center">
                                <h6 class="fw-bold font-outfit text-dark mb-0"><i class="bi bi-credit-card text-secondary me-2"></i>Payment Details</h6>
                                <span class="fw-bold text-success fs-5">${p.totalPrice || '-'}</span>
                            </div>
                        </div>
                    </div>
                `;
                
                document.getElementById('viewBtnTrack').onclick = () => {
                    sessionStorage.setItem('quickTrackQuery', id);
                    window.location.href = 'tracking.html';
                };
                
                viewModal.show();
            });
        });

        // Edit Action
        document.querySelectorAll('.action-edit').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const id = this.getAttribute('data-id');
                const p = getParcelById(id);
                if (!p) return;

                document.getElementById('editId').value = id;
                document.getElementById('editModalId').textContent = id;
                
                // Set selects
                const statusSelect = document.getElementById('editStatus');
                Array.from(statusSelect.options).forEach(opt => {
                    if (opt.value === p.status) opt.selected = true;
                });
                
                document.getElementById('editReceiver').value = p.receiver || '';
                document.getElementById('editDestination').value = p.destination || '';

                editModal.show();
            });
        });

        // Print Action
        document.querySelectorAll('.action-print').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                // Simple workaround for printing a single row nicely
                window.print();
            });
        });

        // Delete Action
        document.querySelectorAll('.action-delete').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                parcelToDelete = this.getAttribute('data-id');
                document.getElementById('deleteModalId').textContent = parcelToDelete;
                deleteModal.show();
            });
        });
    }

    // Save Edit Action
    document.getElementById('btnSaveEdit').addEventListener('click', function() {
        const id = document.getElementById('editId').value;
        const newStatus = document.getElementById('editStatus').value;
        const newReceiver = document.getElementById('editReceiver').value;
        const newDestination = document.getElementById('editDestination').value;
        
        if(updateParcel(id, {
            status: newStatus,
            receiver: newReceiver,
            destination: newDestination
        })) {
            editModal.hide();
            loadDashboard(); // Refresh
        }
    });

    // Confirm Delete Action
    document.getElementById('btnConfirmDelete').addEventListener('click', function() {
        if (parcelToDelete) {
            deleteParcel(parcelToDelete);
            parcelToDelete = null;
            deleteModal.hide();
            loadDashboard(); // Refresh
        }
    });

    // Init
    loadDashboard();
});
