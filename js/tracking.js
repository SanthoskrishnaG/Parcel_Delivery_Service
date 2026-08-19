/**
 * SwiftParcel - Tracking Logic
 */

document.addEventListener('DOMContentLoaded', function() {
    const trackingForm = document.getElementById('trackingForm');
    const trackingInput = document.getElementById('trackingInput');
    const trackingResults = document.getElementById('trackingResults');
    const errorContainer = document.getElementById('errorContainer');
    const timelineContainer = document.getElementById('timelineContainer');

    // Define the timeline steps in order
    const TIMELINE_STEPS = [
        { id: 'booked', label: 'Booking Confirmed', icon: 'bi-clipboard-check', desc: 'Your booking has been received and confirmed.' },
        { id: 'picked_up', label: 'Parcel Picked Up', icon: 'bi-box-seam', desc: 'Our courier has picked up your parcel.' },
        { id: 'processing', label: 'Processing Center', icon: 'bi-building', desc: 'Parcel is being sorted at our facility.' },
        { id: 'transit', label: 'In Transit', icon: 'bi-truck', desc: 'Parcel is on its way to the destination city.' },
        { id: 'out_for_delivery', label: 'Out for Delivery', icon: 'bi-house-check', desc: 'Courier is out to deliver your parcel today.' },
        { id: 'delivered', label: 'Delivered', icon: 'bi-check2-circle', desc: 'Parcel has been successfully delivered.' }
    ];

    /**
     * Map a generic "status" string to a step index to show progress
     * For simulation purposes, we'll assign status based on booking status
     */
    function getStatusIndex(statusStr) {
        statusStr = statusStr.toLowerCase();
        if (statusStr === 'delivered') return 5;
        if (statusStr === 'out for delivery') return 4;
        if (statusStr === 'in transit') return 3;
        if (statusStr === 'processing') return 2;
        if (statusStr === 'picked up') return 1;
        return 0; // Booked / default
    }

    /**
     * Build the vertical timeline HTML based on current status index
     */
    function buildTimeline(parcel) {
        timelineContainer.innerHTML = '';
        
        const history = parcel.history || [];
        const currentStatus = parcel.status || 'Booked';
        let currentIndex = getStatusIndex(currentStatus);
        
        // Ensure index is valid
        currentIndex = Math.max(0, Math.min(currentIndex, TIMELINE_STEPS.length - 1));

        TIMELINE_STEPS.forEach((step, index) => {
            const isCompleted = index <= currentIndex;
            const isActive = index === currentIndex;
            const isPending = index > currentIndex;
            
            let statusClass = '';
            let iconClass = 'bg-light text-muted';
            
            if (isCompleted && !isActive) {
                statusClass = 'completed';
                iconClass = 'bg-success text-white border-success';
            } else if (isActive) {
                statusClass = 'active';
                iconClass = 'bg-primary text-white border-primary border-4 shadow';
            } else {
                statusClass = 'pending';
                iconClass = 'bg-white text-muted border-light border-3';
            }

            // Find history entry for this step
            let hEntry = history.find(h => getStatusIndex(h.status) === index);
            
            let timeText = '';
            let stepDesc = step.desc;
            if (hEntry) {
                timeText = `<small class="text-muted d-block mt-1"><i class="bi bi-clock me-1"></i> ${hEntry.date}, ${hEntry.time}</small>`;
                if (hEntry.desc) stepDesc = hEntry.desc;
            } else if (isCompleted) {
                // Fallback for old data without history
                timeText = `<small class="text-muted d-block mt-1"><i class="bi bi-clock me-1"></i> ${parcel.date || 'Updated recently'}</small>`;
            }

            // Create step HTML
            const stepDiv = document.createElement('div');
            stepDiv.className = `timeline-step ${statusClass} d-flex align-items-start position-relative`;
            
            stepDiv.innerHTML = `
                <div class="timeline-icon-wrapper rounded-circle d-flex align-items-center justify-content-center ${iconClass}" style="width: 48px; height: 48px; z-index: 2; flex-shrink: 0;">
                    <i class="bi ${step.icon} fs-5"></i>
                </div>
                <div class="timeline-content ms-4 pb-4 w-100">
                    <h5 class="fw-bold font-outfit mb-1 ${isActive ? 'text-primary' : (isCompleted ? 'text-success' : 'text-muted')}">${step.label}</h5>
                    <p class="text-muted small mb-0">${stepDesc}</p>
                    ${timeText}
                </div>
            `;
            
            timelineContainer.appendChild(stepDiv);
        });
    }

    /**
     * Display the tracking results
     */
    function displayTracking(parcel) {
        // Hide error, show results
        errorContainer.classList.add('d-none');
        trackingResults.classList.remove('d-none');
        
        // Populate fields
        document.getElementById('resParcelId').textContent = parcel.parcelId || parcel.trackingNumber;
        document.getElementById('resSender').textContent = parcel.sender || 'N/A';
        document.getElementById('resReceiver').textContent = parcel.receiver || 'N/A';
        document.getElementById('resBookingDate').textContent = parcel.date || 'N/A';
        document.getElementById('resEstDate').textContent = parcel.estDeliveryDate || 'TBD';
        document.getElementById('resDestination').textContent = parcel.destination || 'N/A';
        
        // Wait, if it's old data from before Segment 2 updates, handle fallbacks
        const parcelType = parcel.parcelType || 'Standard Package';
        document.getElementById('resType').textContent = parcelType;
        document.getElementById('resDeliveryType').textContent = parcel.deliveryType || 'Standard';

        // Setup badge
        const currentStatus = parcel.status || 'Booked';
        const badge = document.getElementById('resStatusBadge');
        
        let statusIndex = getStatusIndex(currentStatus);
        const finalStatus = TIMELINE_STEPS[statusIndex].label;

        // Update badge UI
        badge.innerHTML = `<i class="bi ${TIMELINE_STEPS[statusIndex].icon} me-1"></i> ${finalStatus}`;
        if (statusIndex === 5) {
            badge.className = 'badge bg-success px-3 py-2 rounded-pill fs-6';
        } else if (statusIndex === 0) {
            badge.className = 'badge bg-secondary px-3 py-2 rounded-pill fs-6';
        } else {
            badge.className = 'badge bg-primary px-3 py-2 rounded-pill fs-6';
        }

        // Build Timeline
        buildTimeline(parcel);
        
        // Smooth scroll to results
        trackingResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Handle Form Submission
    trackingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const query = trackingInput.value.trim().toUpperCase();
        if (!query) return;

        // Try to find the parcel using storage wrapper if available, else direct localStorage
        let parcel = null;
        if (typeof getParcelById === 'function') {
            // Because previous quick implementation used trackingNumber, check both
            let all = getParcels();
            parcel = all.find(p => p.parcelId === query || p.trackingNumber === query);
        }
        
        if (parcel) {
            displayTracking(parcel);
        } else {
            // Show error, hide results
            trackingResults.classList.add('d-none');
            errorContainer.classList.remove('d-none');
        }
    });

    // Check if there is a query in sessionStorage (from Quick Track on Homepage)
    const quickTrackQuery = sessionStorage.getItem('quickTrackQuery');
    if (quickTrackQuery) {
        trackingInput.value = quickTrackQuery;
        // Trigger submit
        trackingForm.dispatchEvent(new Event('submit'));
        // Clear it so it doesn't loop
        sessionStorage.removeItem('quickTrackQuery');
    }
});
