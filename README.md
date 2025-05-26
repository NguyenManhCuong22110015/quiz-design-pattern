# Online Quiz Website

An interactive online quiz platform built with **React**, **Node.js (Express)**, and **MongoDB**. Users can take quizzes, track scores, and join real-time multiplayer quiz sessions. The system also applies **Generative AI** for quiz question suggestions and a basic chatbot for assistance.

## 🛠 Technologies Used  
- **Frontend:** React, Vite, Bootstrap CSS  
- **Backend:** Node.js, Express, MongoDB (Mongoose), WebSocket  
- **Authentication:** JWT  
- **Media Storage:** Cloudinary  
- **AI Integration:** Generative AI (for quiz question suggestions & chatbot)  

## ✨ Features  
- User authentication & authorization (JWT-based).  
- Create, manage, and play quizzes with multiple-choice questions.  
- AI-assisted quiz generation for question suggestions.  
- Basic chatbot for quiz-related queries.  
- Real-time multiplayer quiz sessions using WebSocket.  
- Leaderboard and performance tracking.  ( *comming soon* )
- Cloudinary integration for storing images.  
- Responsive UI built with React & Bootstrap CSS.  

## ⚡ Installation & Setup  

### 1️⃣ Clone the Repository  
```bash
git clone https://github.com/NMCuonG08/WEBMERN.git

```

### 2️⃣ Install Dependencies  

#### Backend  
```bash
cd backend
npm install
```

#### Frontend  
```bash
cd frontend
npm install
```

### 3️⃣ Setup Environment Variables  

Create a **.env** file in the `backend` directory based on `.env.example`:

#### `.env.example`  
```env
PORT=5000
MONGO_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/quiz_app
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
AI_API_KEY=your_ai_api_key
```

Copy `.env.example` to `.env` and fill in the actual values.

```bash
cp backend/.env backend/.env
```

### 4️⃣ Setup Database  
Ensure MongoDB is running locally or use a cloud database like MongoDB Atlas. If using MongoDB Atlas, update `MONGO_URI` in your `.env` file.  

To seed initial data, run:
```bash
cd backend
node seed.js
```
(This script should create necessary collections and sample data.)

### 5️⃣ Run the Project  

#### Backend  
```bash
cd backend
npm start
```

#### Frontend  
```bash
cd frontend
npm run dev
```

## 📸 Screenshots  


## 📌 Future Improvements  
- Enhance AI chatbot capabilities.  
- Add more quiz formats (e.g., drag & drop).  

## 🤝 Contribution  
Feel free to fork this repository, create a feature branch, and submit a pull request!  

## 📜 License  
This project is licensed under the MIT License.
