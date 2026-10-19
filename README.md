# Marketplace Backend

This project is a dedicated **Backend API** built using Node.js, Express, and MongoDB. It strictly follows the **MVC (Model-View-Controller)** architectural pattern. My primary focus while building this was to ensure **clean, readable code**, **robust exception handling**, and **security** – exactly what you'd expect in a production-ready environment.

---

## 🎯 Project Overview

Based on the assignment requirements, the system supports two main roles: **Admin** and **Seller**. I have implemented authentication and authorization pipelines so that users can only perform actions permitted by their role.

### Key Features Developed:

1. **Admin Module:**
   - **Login API:** Authenticates the Admin and returns a JWT token.
   - **Create Seller API:** Allows an Admin to onboard new Sellers. (Passwords are securely hashed using `bcryptjs`).
   - **Seller Listing:** Implements pagination to efficiently list all registered sellers.

2. **Seller Module:**
   - **Seller Login API:** Authenticates the seller and issues a JWT for subsequent requests.
   - **Add Product API:** Authenticated sellers can add a product containing **multiple brands**. Includes file upload functionality via `multer` for brand images.
   - **Product Listing:** Returns paginated products specifically belonging to the authenticated seller.
   - **Delete Product API:** Secure deletion, ensuring sellers can only delete their _own_ products.
   - **View PDF API:** Dynamically generates a downloadable PDF file containing product and brand details, including total calculated prices, using `PDFKit`.

---

## 🏗️ Architecture & Coding Standards

To ensure the codebase is maintainable and scalable, I made the following technical decisions:

- **MVC Pattern:** The code is logically separated into `routes`, `controllers`, and `models`. This keeps the entry point (`server.js`) extremely clean.
- **Proper Exception Handling:** I implemented a **Global Error Handler** middleware. Instead of having repetitive `try-catch` blocks sending inconsistent responses, every error is passed down to a single handler that returns a standardized JSON structure with proper HTTP status codes.
- **Security First:**
  - Passwords are never stored in plain text; they are salted and hashed.
  - API routes are protected using a custom `authMiddleware` that verifies the JWT token and checks the user's `role`.
- **Validation:** Every controller handles validation gracefully and throws custom errors if required fields are missing.

---

## 🚀 How to Run the Project Locally

### 1. Prerequisites

- **Node.js** installed on your machine.
- **MongoDB** running locally (Port 27017) or a MongoDB Atlas URI.

### 2. Installation

Clone the repository and install the dependencies:

```bash
git clone <your-repo-link>
cd marketplace-backend
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory and add the following keys. (You can copy these exactly for testing):

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/marketplace_db
JWT_SECRET=super_secret_jwt_key_marketplace
DEFAULT_ADMIN_EMAIL=admin@marketplace.local
DEFAULT_ADMIN_PASSWORD=admin123
```

### 4. Start the Server

```bash
# For development with nodemon
npm run dev

# For production
npm start
```

_Note: Upon the very first start, the server automatically seeds a default Admin user (using the credentials in `.env`) so you don't have to manually insert an Admin into the database!_

---

## 🧪 How to Test the APIs (Postman Guide)

Testing APIs can sometimes be tedious, so here is a step-by-step guide to testing the flow easily using **Postman**:

### 1. Admin Flow

1. **Admin Login:**
   - `POST http://localhost:5000/api/admin/login`
   - **Body (JSON):** `{"email": "admin@marketplace.local", "password": "admin123"}`
   - _Action:_ Copy the `token` from the response.
2. **Create Seller:**
   - `POST http://localhost:5000/api/admin/sellers`
   - **Headers:** Add `Authorization: Bearer <ADMIN_TOKEN>`
   - **Body (JSON):** Provide `name`, `email`, `mobileNo`, `country`, `state`, `skills` (Array), and `password`.
3. **List Sellers:**
   - `GET http://localhost:5000/api/admin/sellers?page=1&limit=5`
   - **Headers:** Add `Authorization: Bearer <ADMIN_TOKEN>`

### 2. Seller Flow

1. **Seller Login:**
   - `POST http://localhost:5000/api/seller/login`
   - **Body (JSON):** Provide the email and password you used in the "Create Seller" step.
   - _Action:_ Copy the `token` from the response.
2. **Add Product (with Multiple Brands):**
   - `POST http://localhost:5000/api/products`
   - **Headers:** Add `Authorization: Bearer <SELLER_TOKEN>`
   - **Body (form-data):** Since this includes images, use `multipart/form-data`.
     - `name`: Text
     - `description`: Text
     - `brands[0][name]`: Text
     - `brands[0][detail]`: Text
     - `brands[0][price]`: Number
     - `brands[0][image]`: File (Upload an image)
     - _(Repeat `brands[1]...` for multiple brands)_
3. **List Products:**
   - `GET http://localhost:5000/api/products?page=1&limit=5`
   - **Headers:** Add `Authorization: Bearer <SELLER_TOKEN>`
4. **Delete Product:**
   - `DELETE http://localhost:5000/api/products/:productId`
   - **Headers:** Add `Authorization: Bearer <SELLER_TOKEN>`
5. **Download Product PDF:**
   - `GET http://localhost:5000/api/products/:productId/pdf`
   - **Headers:** Add `Authorization: Bearer <SELLER_TOKEN>`
   - _Result:_ Will download a formatted PDF with total price calculations.

---
