import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv'; 
import userRoutes from './routes/userRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import http from 'http';
import initWebSocket from './websocket.js';
import roomRoutes from './routes/roomQuizRoute.js';
import mediaRoutes from './routes/mediaRoute.js';
import categoryRoutes from './routes/categoryRoute.js';
import session  from "express-session";
import connectMongoDBSession  from "connect-mongodb-session";
import jwt from "jsonwebtoken";
import quizRoutes from './routes/quizzRoutes.js';
import passport from 'passport';
import google from './authentication/google.js';
import authRoutes from './routes/authRoute.js';
import facebook from './authentication/facebook.js';
import resultRoutes from './routes/resultRoute.js';
import commentRoutes from './routes/commentRoute.js';
import chatbotRoutes from './routes/chatbotRoute.js'
import rateLimit from 'express-rate-limit';

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 5, // tối đa 5 request
  message: {
    error: 'Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MongoDBStore = connectMongoDBSession(session); 
const store = new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection: "sessions",
});



app.use(cors({
    origin: [ process.env.FRONTEND_API,'https://webmern-nmcuong08s-projects.vercel.app', "https://webmern.vercel.app","http://192.168.100.217:5173" ,
        "http://192.168.56.1:5000"
    ], 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    optionsSuccessStatus: 200
}));


const server = http.createServer(app);


const wss = initWebSocket(server);


mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));
    app.use(session({
        secret: process.env.SESSION_SECRET || 'your_session_secret',
        resave: false,
        saveUninitialized: false,
        store: store,
        cookie: {
          secure: process.env.NODE_ENV === 'production',
          maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
      }));
      
      // Initialize Passport
      app.use(passport.initialize());
      app.use(passport.session());
      
app.use(google.initialize());
app.use(google.session());
app.use(facebook.initialize());
app.use(facebook.session());
app.use('/auth', authRoutes);

app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/results', resultRoutes);
app.use("/api/comments", commentRoutes)
app.use('/api/chatbot', aiLimiter,chatbotRoutes )

server.listen(PORT, '0.0.0.0' ,() => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`WebSocket server is ready`);
});
