# The Grove Live Market
**A Comprehensive Multi-Tier E-Commerce & Wholesale Platform**

This is a robust, React-based web application designed to handle complex multi-vendor workflows, seamlessly connecting **Wholesalers**, **Retailers**, and **End-Consumers** within a single, dynamic platform.


<img width="629" height="379" alt="image" src="https://github.com/user-attachments/assets/29100332-d8f4-49ea-abbe-b0ca3e19b6cd" />
## Features
### Multi-Role Ecosystem
The platform uses Role-Based Access Control (RBAC) to serve three distinct types of users, each with their own dedicated dashboards and toolsets:

#### 1. End-Consumers (Customers)
* **Browsing & Discovery:** View products, filter by price (using interactive price sliders), and view detailed product pages.
* **Shopping Cart:** Persistent cart management powered by React Context.
* **Checkout & Payments:** Secure, integrated checkout using **Stripe**.
* **User Profile:** Manage personal details, track order history, and manage delivery addresses with an interactive GeoPicker map.

#### 2. Retailers
* **Retail Dashboard:** A dedicated hub for retail operations.
* **Inventory Management:** Track stock levels, add new retail products, and manage existing listings.
* **Order Fulfillment:** View and process incoming customer orders.
* **B2B Purchasing:** Access the Wholesale Market to restock inventory directly from Wholesalers.
* **Feedback System:** Monitor and respond to customer reviews.

#### 3. Wholesalers
* **Wholesale Dashboard:** High-level overview of bulk sales and metrics.
* **Bulk Inventory Management:** List products in bulk quantities for retailers.
* **B2B Order Processing:** Manage bulk orders from retailers and track historical sales data.

### Core System Features
* **Multi-Step Registration Flow:** Tailored onboarding steps depending on the user's role (Customer vs. Business).
* **Authentication & Authorization:** Secure login system with protected routes ensuring users only access their authorized dashboards.
* **Interactive Maps:** Integrated geolocation and map picking for accurate delivery addresses.
* **Local Database Simulation:** A robust local database utility (`*DB.ts`) that handles complex relational data (Inventory, Orders, Feedback, Carts) entirely in the frontend for seamless demonstration and testing without a live backend.

---

## The Tech Stack

This project is built using modern, fast, and scalable frontend technologies.

**Frontend Core:**
* **React 18:** Component-based UI rendering.
* **Vite:** Blazing fast build tool and development server.
* **TypeScript & JavaScript (ES6+):** Type-safe logic and components combined with flexible JS.
* **CSS / UI:** Custom CSS (`index.css`) with modular component styling.

**State Management & Data:**
* **React Context API:** Handles global state for Authentication (`AuthContext`) and Shopping Cart (`CartContext`).
* **Mock Backend / Local DB:** Custom-built TypeScript classes managing IndexedDB/Local Storage to simulate backend queries (`AdressDB`, `CartDB`, `FeedbackDB`, `InventoryDB`, `OrderDB`, `productsDB`).

**Integrations:**
* **Stripe:** End-to-end payment processing (`StripePaymentForm`, `PaymentReturn`).
* **Geolocation APIs:** Mapping functionalities for address selection.
