# 🛒 MarketConnect+

A full-stack B2B marketplace connecting vendors and suppliers through a centralized platform. It allows vendors to browse suppliers, explore products, manage carts, place orders, track purchases, and discover product recommendations. Suppliers can manage their products, process orders, and monitor business performance through dashboards.

---

## 📌 Features

✅ Vendor and supplier authentication and registration using JWT  
✅ Browse suppliers and explore their product listings  
✅ Add products to cart with quantity and unit management  
✅ Manage supplier-wise carts and place orders  
✅ View order history and cancel eligible orders  
✅ Manage product listings — add, edit, and delete products  
✅ Track and update order statuses: PLACED → ACCEPTED → DISPATCHED → DELIVERED  
✅ Personalized product recommendations based on previous purchases  
✅ Product rating and feedback system for delivered orders  
✅ Vendor and supplier dashboards for order management and analytics  
✅ Supplier sales reporting and performance insights  

---

## 🗂️ Project Structure

```text
major_project/
│
├── marketconnect-frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   ├── Dashboards/
│   │   │   └── Layout/
│   │   ├── context/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── marketconnect-backend/
│   ├── routes/
│   │   ├── middleware/
│   │   ├── auth.js
│   │   ├── items.js
│   │   ├── orders.js
│   │   ├── recommendation.js
│   │   ├── reports.js
│   │   ├── reviews.js
│   │   └── user.js
│   ├── db.js
│   ├── server.js
│   └── package.json
│
├── package.json
├── package-lock.json
└── README.md
```

---

## ⚙️ Installation

### ✅ Prerequisites

- Node.js and npm
- MySQL Server
- Git

---

### 🧪 Steps to Run Locally

**# 1. Clone the repository**

```bash
git clone https://github.com/arpitarungta/MarketConnect-Plus.git
cd MarketConnect-Plus
```

**# 2. Install root dependencies, if required**

```bash
npm install
```

**# 3. Set up the database**

- Start your MySQL server.
- Create the required MySQL database.
- Configure the database connection in the backend.
- Ensure the required tables are created before running the application.

**# 4. Install backend dependencies**

```bash
cd marketconnect-backend
npm install
```

Configure the required database credentials and environment variables before starting the backend.

**# 5. Start the backend**

Run the start command defined in `marketconnect-backend/package.json`.

**# 6. Install and start the frontend**

Open a separate terminal and run:

```bash
cd marketconnect-frontend
npm install
npm start
```

The React application normally runs at `http://localhost:3000`.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, JavaScript, HTML, CSS
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Authentication:** JSON Web Tokens (JWT)
- **Version Control:** Git and GitHub

## 🚀 Future Enhancements

- Deploy the frontend and backend to cloud platforms.
- Improve product recommendation capabilities.
- Enhance analytics and reporting features.
- Add automated testing and additional security measures.

---

*MarketConnect+ — Connecting vendors and suppliers through smarter B2B commerce.*
