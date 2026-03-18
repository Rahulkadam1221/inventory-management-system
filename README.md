# 🚀 Inventory Management System (MERN + 3D UI)

## 📌 Overview

The **Inventory Management System** is a modern web application designed for small businesses to efficiently manage inventory, process orders, and track sales.
It features a **role-based system (Admin & User)** along with an interactive **3D UI with smooth animations**, providing a premium and engaging user experience.

---

## ✨ Features

### 🔐 Authentication & Authorization

* Secure login & registration (JWT-based)
* Role-based access:

  * **Admin** → Full control
  * **User** → Limited access

---

### 📦 Inventory Management

* Add, update, delete products (Admin)
* View product list (User)
* Low stock indicators
* Search & filter functionality

---

### 🔄 Stock Management

* Add or reduce stock (Admin)
* Maintain stock history logs

---

### 🧾 Order Processing

* Users can place orders
* Admin can manage and update order status
* Track order lifecycle (Pending → Shipped → Delivered)

---

### 📊 Sales & Reporting

* Revenue tracking
* Sales analytics (Admin)
* Personal purchase history (User)
* Interactive charts

---

### 🔔 Notifications

* Low stock alerts (Admin)
* Order updates (User)
* Mark notifications as read

---

### 🎨 3D UI & Animations

* Scroll-based animations
* 3D tilt effects on cards
* Smooth transitions using Framer Motion & GSAP
* Interactive and responsive design

---

## 🛠️ Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* Framer Motion (animations)
* GSAP (scroll animations)
* Three.js (3D elements)

### Backend

* Node.js
* Express.js

### Database

* MongoDB (Mongoose)

### Authentication

* JWT (JSON Web Tokens)
* bcrypt (password hashing)

---

## 📁 Project Structure

```
inventory-management-system/
│
├── client/          # Frontend (React)
│   ├── src/
│   └── public/
│
├── server/          # Backend (Node + Express)
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── config/
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```
git clone https://github.com/YOUR_USERNAME/inventory-management-system.git
cd inventory-management-system
```

---

### 2️⃣ Backend Setup

```
cd server
npm install
```

Create `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Run backend:

```
npm start
```

---

### 3️⃣ Frontend Setup

```
cd client
npm install
```

Create `.env` file:

```
VITE_API_URL=http://localhost:5000
```

Run frontend:

```
npm run dev
```

---


## 🔐 Roles & Permissions

| Feature         | Admin | User    |
| --------------- | ----- | ------- |
| View Products   | ✅     | ✅       |
| Add/Edit/Delete | ✅     | ❌       |
| Manage Orders   | ✅     | ❌       |
| Place Orders    | ❌     | ✅       |
| View Reports    | ✅     | Limited |

---


## 🚀 Future Enhancements

* Real-time updates using Socket.io
* AI-based demand prediction
* Barcode scanning
* Multi-store support
* Payment gateway integration

---

## 🤝 Contributing

Contributions are welcome!
Feel free to fork the repo and submit a pull request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Rahul Kadam**

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
