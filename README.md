# SwiftParcel - Parcel Delivery Service

![SwiftParcel](https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=1000)

SwiftParcel is a portfolio-quality, responsive web application simulating a modern parcel delivery service. 
This project is built **strictly as a frontend application** using pure web technologies without any backend frameworks or databases. It leverages `localStorage` to simulate a real-world booking and tracking database.

## 🚀 Features

- **Parcel Booking System**: A comprehensive booking form featuring dynamic price calculations based on weight, dimensions, delivery type, and extra options (fragile, insurance, COD).
- **Live Tracking System**: A dynamic, CSS-driven timeline that visually tracks a parcel through its lifecycle (Booked → Picked Up → Processing → In Transit → Delivered).
- **Interactive Dashboard**: A fully functional admin/customer dashboard featuring:
  - Live search by Parcel ID, Receiver, City, or Phone
  - Advanced filtering by Status, Delivery Type, Date, and Price
  - Live sorting logic
  - Real-time revenue and distribution analytics
  - Recent activity feed
- **Local Storage Database**: Full CRUD (Create, Read, Update, Delete) capabilities persisting entirely in the browser.
- **Dark Mode**: A seamless, flicker-free dark mode toggle that persists user preference.
- **Responsive Design**: Built heavily on Bootstrap 5 to guarantee flawless rendering across Mobile, Tablet, and Desktop displays.
- **Accessibility Hardened**: Keyboard-navigable, screen-reader ready with proper semantic HTML, ARIA labels, and explicit focus states.

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
├── index.html               # Landing page
├── pages/
│   ├── tracking.html        # Live parcel tracking
│   ├── booking.html         # Parcel booking form & price calculator
│   ├── dashboard.html       # Customer dashboard & analytics
│   ├── services.html        # Delivery services info
│   ├── about.html           # Company information
│   └── contact.html         # Contact form
│
├── css/
│   ├── style.css            # Core styles, animations, variables
│   └── responsive.css       # Custom media queries
│
├── js/
│   ├── main.js              # Global UI, Dark Mode, Navbar logic
│   ├── storage.js           # LocalStorage CRUD operations
│   ├── booking.js           # Booking form validation & pricing
│   ├── tracking.js          # Timeline rendering
│   └── dashboard.js         # Filtering, sorting, and analytics rendering
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
To instantly populate the application with a realistic dataset, navigate to the **Dashboard** (`pages/dashboard.html`) and click the **"Load Demo Data"** button at the top right. This will generate sample parcels in various stages of delivery to showcase the analytics and tracking timelines.

## 🎨 Design Philosophy

This project aims to break the "basic college assignment" mold by incorporating modern UI/UX trends:
- **Animations**: Soft `fade-in-up` cascading animations for elements as they enter the DOM.
- **Typography**: Paired Google Fonts (*Outfit* for bold headings, *Inter* for readable body text).
- **Micro-interactions**: Hover lifts on cards, scaled button hovers, and animated tracking timeline bars.

## 🛡️ License
This project is open-source and available under the MIT License.
