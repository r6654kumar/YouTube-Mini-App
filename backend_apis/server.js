import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import commentRoutes from './routes/commentRoutes.js';

dotenv.config();
const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

const PORT = process.env.PORT || 5000;
const MONGODBURL = process.env.MONGODBURL;

//Connecting to MongoDB using mongoose
mongoose
  .connect(MONGODBURL)
  .then(() => {
    console.log("Successfully connected to database");
    app.listen(PORT, () => {
      console.log(`App is listening to port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(`Error:${error}`);
  });

//   //Setting up youtube API
//   const youtube = google.youtube({
//     version: 'v3',
//     auth: process.env.YOUTUBE_API_KEY
//   });

// Routes
app.use('/', authRoutes);
app.use('/api', videoRoutes);
app.use('/api', commentRoutes);


