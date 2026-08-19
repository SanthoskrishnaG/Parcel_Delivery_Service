# ParcelFlow — Frontend Parcel Delivery & Fleet Management System

![ParcelFlow](https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=1000)

ParcelFlow is a portfolio-quality, responsive web application simulating a modern logistics management service. 
This project goes far beyond a simple tracking website by integrating three interconnected modules built **strictly as a frontend application** using pure web technologies (HTML, CSS, JavaScript, Bootstrap) without any backend frameworks or databases. It leverages `localStorage` to simulate a real-world enterprise database.

## 🚀 Three Interconnected Systems

### 1. Parcel Management 📦
**Booking → Tracking → Delivery**
- **Parcel Booking System**: A comprehensive booking form featuring dynamic price calculations based on weight, dimensions, delivery type, and extra options.
- **Live Tracking System**: A dynamic, CSS-driven timeline that visually tracks a parcel through its lifecycle.

### 2. Fleet Management 🚚
**Vehicles → Availability → Assignment → Delivery**
- **Company Fleet Operations**: A robust vehicle management dashboard. Track total vehicles, active deliveries, and maintenance status.
- **Smart Assignment Engine**: Automatically filters available vehicles that match the required capacity and prioritizes company-owned vehicles to minimize costs.
- **Dashboard Integration**: Real-time progress bars monitoring the active utilization of the company fleet vs rental fleet.

### 3. Vehicle Rental Management 🤝
**Vehicle shortage → Rental search → Hire → Assign → Return**
- **Simulated Partner Catalog**: When the company runs out of vehicles, browse the fictional "Friend's Vehicle Rental Service".
- **Intelligent Recommendations**: If a delivery exceeds available company capacity, the system automatically detects the shortage and recommends the smallest, most cost-effective rental vehicle.
- **Rental History & Analytics**: Monitor active rentals, track daily costs, and manage a persistent audit log of all rental returns.

## 🛠️ Technology Stack

- **HTML5** (Semantic structure)
- **CSS3** (Custom animations, glassmorphism, flexbox)
- **Vanilla JavaScript ES6+** (Modularized business logic, DOM manipulation)
- **Bootstrap 5.3** (Grid system, utility classes, UI components)
- **Bootstrap Icons**
- **Browser API** (`localStorage`, native browser printing)

## 📁 Project Structure

```
parcel-delivery-service/
│
├── index.html                     # Landing page
├── pages/
│   ├── tracking.html              # Live parcel tracking
│   ├── booking.html               # Parcel booking form & price calculator
│   ├── delivery-operations.html   # Mission control for unassigned deliveries
│   ├── dashboard.html             # Customer/Admin dashboard & fleet analytics
│   ├── fleet.html                 # Company fleet management
│   ├── rental.html                # Rental catalog and history
│   ├── services.html              # Delivery services info
│   ├── about.html                 # Company information
│   └── contact.html               # Contact form
│
├── css/
│   ├── style.css                  # Core styles, animations, variables
│   └── responsive.css             # Custom media queries
│
├── js/
│   ├── main.js                    # Global UI, Dark Mode, Navbar logic
│   ├── storage.js                 # LocalStorage CRUD operations
│   ├── booking.js                 # Booking form validation & pricing
│   ├── tracking.js                # Timeline rendering
│   ├── dashboard.js               # Filtering, sorting, and analytics rendering
│   ├── assignment.js              # Priority vehicle assignment logic
│   ├── fleet.js                   # Fleet management logic
│   ├── rental.js                  # Rental marketplace & return logic
│   └── delivery-operations.js     # Pending delivery workflow logic
│
└── README.md
```

## 💻 Getting Started

To run the project locally, you don't need any build tools or node modules.

1. Clone the repository:
   ```bash
   git clone https://github.com/YourUsername/Parcel_Delivery_Service.git
   ```
2. Navigate to the project directory:
   ```bash
   cd Parcel_Delivery_Service
   ```
3. Open `index.html` in your favorite web browser (Chrome, Firefox, Safari, Edge).

### Demo Data
To instantly populate the application with a realistic dataset (including parcels, vehicles, and active rentals), navigate to the **Dashboard** (`pages/dashboard.html`) and click the **"Load Demo Data"** button at the top right. 

## 🎨 Design Philosophy

This project aims to break the "basic college assignment" mold by incorporating modern UI/UX trends:
- **Animations**: Soft `fade-in-up` cascading animations for elements as they enter the DOM.
- **Typography**: Paired Google Fonts (*Outfit* for bold headings, *Inter* for readable body text).
- **Micro-interactions**: Hover lifts on cards, scaled button hovers, and animated tracking timeline bars.

## 🛡️ License
This project is open-source and available under the MIT License.
