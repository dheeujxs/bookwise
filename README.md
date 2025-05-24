# 📚 BookWise

A full-featured book review and management application built with the **MERN stack** (MongoDB, Express, React, Node.js).  
Users can browse books, leave reviews with star ratings, and manage their favorites. Admins have extended capabilities for adding, editing, and deleting books, as well as managing user data and access.

🔗 **Live Link:** [https://bookwise-taupe.vercel.app/](https://bookwise-taupe.vercel.app/)

<br/>

![Screenshot](./Screenshot%202025-05-24%20231123.png)

---

## ✨ Features

### 🔐 User Authentication
- Secure user registration and login system  
- JWT for authorization  
- Bcrypt for password hashing  

### 📖 Book Listing with Reviews & Ratings
- Browse and search for books  
- Leave detailed reviews with star ratings  
- Read community reviews  

### 👤 User Profile Pages
- Personalized profile to track user activity  
- Manage and curate favorite book list  

### 🌲 Advanced Feature
- **Nested commenting system** using **Depth-First Search (DFS)** for efficient deletion of nested comments in review threads  

### 🛡️ User Roles & Permissions
- Distinction between normal users and admins  
- Admins can add, update, and delete book listings  
- Admin access to manage user data and roles (except master admin)  

---

## 🛠️ Technologies Used

### 🔹 Frontend
- React.js  
- **Recoil** for State Management  
- **Tailwind CSS**  
- **Shadcn UI**  
- React Hook Form  
- Tanstack Table  
- Lucide-React for Icons  

### 🔸 Backend
- Node.js  
- Express.js  
- MongoDB  
- Mongoose  
- Multer for file uploads  
- CORS  
- JWT  
- Bcrypt  

### 📦 Other Dependencies
- Axios  
- Zod for schema validation  
- React Router DOM  
- Cloudinary (optional for image uploads)

---

## ⚙️ Installation Guide

### 🔧 Requirements
- Node.js  
- MongoDB (local or MongoDB Atlas URL)

### 🧪 Setup Environment Variables
1. Rename `.env.example` to `.env` in both backend and frontend folders  
2. Add the following to backend `.env`:
   - `MONGO_URL`
   - `JWT_SECRET`
   - `CLOUD_NAME`
   - `CLOUD_API_KEY`
   - `CLOUD_API_SECRET`
   - `PORT`

> 🔁 *If not using Cloudinary, modify `/backend/middleware/upload.js` to use diskStorage instead of cloudStorage*

---

## 🚀 Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/dheeujxs/bookwise.git
cd bookwise

2. Install Backend Dependencies
bash
Copy
Edit
cd backend
npm install
3. Install Frontend Dependencies
bash
Copy
Edit
cd ../frontend
npm install
4. Run the Application
Start Backend:

bash
Copy
Edit
cd ../backend
node index.js
Start Frontend:

bash
Copy
Edit
cd ../frontend
npm run dev
Now open http://localhost:5173 in your browser 🚀

🙌 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.


