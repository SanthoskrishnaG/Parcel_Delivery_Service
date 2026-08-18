/**
 * SwiftParcel - Dynamic Price Calculator & Booking Logic
 */

document.addEventListener('DOMContentLoaded', function() {
    
    const bookingForm = document.getElementById('bookingForm');
    if (!bookingForm) return;

    // Pricing Constants
    const BASE_PRICE = 15.00;
    const WEIGHT_RATE_PER_KG = 2.50; // Over 1kg
    const DIMENSIONAL_DIVISOR = 5000;
    const DIMENSIONAL_RATE = 0.50; // Per unit of dimensional weight

    const DELIVERY_RATES = {
        'standard': 0.00,
        'express': 15.00,
        'sameday': 30.00
    };

    const OPTION_RATES = {
        'fragile': 5.00,
        'insurance': 10.00,
        'cod': 3.00
    };

    const INTER_CITY_FEE = 10.00;

    // DOM Elements - Inputs
    const senderCity = document.getElementById('senderCity');
    const receiverCity = document.getElementById('receiverCity');
    
    const parcelWeight = document.getElementById('parcelWeight');
    const parcelLength = document.getElementById('parcelLength');
    const parcelWidth = document.getElementById('parcelWidth');
    const parcelHeight = document.getElementById('parcelHeight');
    
    const deliveryTypeRadios = document.querySelectorAll('input[name="deliveryType"]');
    const optionCheckboxes = document.querySelectorAll('.price-trigger-checkbox');

    // DOM Elements - Display
    const elBase = document.getElementById('priceBase');
    const elWeight = document.getElementById('priceWeight');
    const elDelivery = document.getElementById('priceDelivery');
    const elLocation = document.getElementById('priceLocation');
    const elOptions = document.getElementById('priceOptions');
    const elTotal = document.getElementById('priceTotal');

    /**
     * Calculate and Update Prices
     */
    function calculatePrice() {
        let total = BASE_PRICE;

        // 1. Base Price
        elBase.textContent = BASE_PRICE.toFixed(2);

        // 2. Weight & Dimensional Charge
        let w = parseFloat(parcelWeight.value) || 0;
        let l = parseFloat(parcelLength.value) || 0;
        let wd = parseFloat(parcelWidth.value) || 0;
        let h = parseFloat(parcelHeight.value) || 0;

        let weightCharge = 0;
        if (w > 1) {
            weightCharge += (w - 1) * WEIGHT_RATE_PER_KG;
        }

        let dimensionalWeight = (l * wd * h) / DIMENSIONAL_DIVISOR;
        weightCharge += dimensionalWeight * DIMENSIONAL_RATE;

        elWeight.textContent = weightCharge.toFixed(2);
        total += weightCharge;

        // 3. Delivery Type Charge
        let deliveryCharge = 0;
        const selectedDelivery = document.querySelector('input[name="deliveryType"]:checked');
        if (selectedDelivery && DELIVERY_RATES[selectedDelivery.value] !== undefined) {
            deliveryCharge = DELIVERY_RATES[selectedDelivery.value];
        }
        elDelivery.textContent = deliveryCharge.toFixed(2);
        total += deliveryCharge;

        // 4. Distance/Location Charge (Simple Rule: Different City = Extra Fee)
        let locationCharge = 0;
        const sCity = senderCity.value.trim().toLowerCase();
        const rCity = receiverCity.value.trim().toLowerCase();
        
        if (sCity && rCity && sCity !== rCity) {
            locationCharge = INTER_CITY_FEE;
        }
        elLocation.textContent = locationCharge.toFixed(2);
        total += locationCharge;

        // 5. Additional Options
        let optionsCharge = 0;
        optionCheckboxes.forEach(cb => {
            if (cb.checked && OPTION_RATES[cb.value]) {
                optionsCharge += OPTION_RATES[cb.value];
            }
        });
        elOptions.textContent = optionsCharge.toFixed(2);
        total += optionsCharge;

        // Set Total
        elTotal.textContent = total.toFixed(2);
        
        // Add a small animation to total to show it updated
        elTotal.classList.add('text-success');
        elTotal.classList.remove('text-primary');
        setTimeout(() => {
            elTotal.classList.remove('text-success');
            elTotal.classList.add('text-primary');
        }, 300);
    }

    // Attach Event Listeners to all triggers
    const triggers = document.querySelectorAll('.price-trigger');
    triggers.forEach(el => {
        el.addEventListener('input', calculatePrice);
        el.addEventListener('change', calculatePrice);
    });

    deliveryTypeRadios.forEach(el => {
        el.addEventListener('change', calculatePrice);
    });

    optionCheckboxes.forEach(el => {
        el.addEventListener('change', calculatePrice);
    });

    // Special listener for sender city since it's not marked with price-trigger initially to avoid premature firing
    senderCity.addEventListener('input', calculatePrice);

    // Initial Calculation
    calculatePrice();

    // Handle Form Submission
    bookingForm.addEventListener('submit', function(event) {
        event.preventDefault();
        event.stopPropagation();

        if (!bookingForm.checkValidity()) {
            bookingForm.classList.add('was-validated');
            return;
        }

        // Form is valid - process booking simulation
        
        // Generate a random tracking number
        const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const trackingNum = `SP-${randomStr}-${randomNum}`;
        
        document.getElementById('generatedTrackingNumber').textContent = trackingNum;
        
        // Store the new tracking number in localStorage so it can be 'tracked' later
        // Just storing a simple object to simulate a database record
        const bookingData = {
            trackingNumber: trackingNum,
            status: 'Booked',
            date: new Date().toLocaleDateString(),
            sender: document.getElementById('senderName').value,
            receiver: document.getElementById('receiverName').value,
            destination: `${document.getElementById('receiverCity').value}, ${document.getElementById('receiverState').value}`
        };
        
        // Fetch existing bookings or create new array
        let existingBookings = JSON.parse(localStorage.getItem('swiftParcelBookings') || '[]');
        existingBookings.push(bookingData);
        localStorage.setItem('swiftParcelBookings', JSON.stringify(existingBookings));
        
        // Show success modal
        const successModal = new bootstrap.Modal(document.getElementById('bookingSuccessModal'));
        successModal.show();
        
        // Setup track now button
        document.getElementById('btnTrackNow').addEventListener('click', function() {
            sessionStorage.setItem('quickTrackQuery', trackingNum);
            window.location.href = 'tracking.html';
        });
    });

    // Handle Radio Card styling dynamically for older browsers that don't support :has
    deliveryTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            document.querySelectorAll('.radio-card').forEach(card => {
                card.style.borderColor = 'transparent';
                card.style.backgroundColor = 'var(--light-bg)';
                card.querySelector('i').classList.remove('text-primary');
            });
            
            if(this.checked) {
                const parent = this.closest('.radio-card');
                parent.style.borderColor = 'var(--primary-color)';
                parent.style.backgroundColor = 'rgba(67, 97, 238, 0.05)';
            }
        });
    });

    // Handle Checkbox styling dynamically
    optionCheckboxes.forEach(cb => {
        cb.addEventListener('change', function() {
            const parent = this.closest('.custom-checkbox');
            if(this.checked) {
                parent.style.borderColor = 'var(--primary-color)';
                parent.style.backgroundColor = 'rgba(67, 97, 238, 0.1)';
            } else {
                parent.style.borderColor = 'transparent';
                parent.style.backgroundColor = '#f8fafc'; // bg-light
            }
        });
    });
});
