import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import EventLog from './models/EventLog.js';
dotenv.config();
const app = express();
app.use(bodyParser.json());
import cors from 'cors';
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
const PORT = process.env.PORT || 5000;
const MONGODBURL=process.env.MONGODBURL;
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
const logEvent = async (eventType, details) => {
    const log = new EventLog({
      timestamp: new Date(),
      event_type: eventType,
      details
    });
    await log.save();
  };

//OAuth 

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );
const SCOPES = ['https://www.googleapis.com/auth/youtube.force-ssl'];

const getYouTubeClient = (tokens) => {
    oauth2Client.setCredentials(tokens);
    return google.youtube({ version: 'v3', auth: oauth2Client });
  };


  app.get('/auth', (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    });
    res.redirect(authUrl);
  });

  let tokens = null;
  app.get('/oauth2callback', async (req, res) => {
    const code = req.query.code;
    try {
      const { tokens: newTokens } = await oauth2Client.getToken(code);
      tokens = newTokens; 
      res.redirect('http://localhost:5173/auth/success'); 
    } catch (err) {
      res.status(500).send('OAuth2 Error: ' + err.message);
    }
  });

//Api to fetch the video details

app.get('/api/videos', async (req, res) => {
    if (!tokens) return res.status(401).json({ message: 'Not authenticated' });
    const youtube = getYouTubeClient(tokens);
    try {
      const channelRes = await youtube.channels.list({
        part: 'contentDetails',
        mine: true
      });
  
      const uploadsPlaylistId = channelRes.data.items[0].contentDetails.relatedPlaylists.uploads;
  
      const videosRes = await youtube.playlistItems.list({
        part: 'snippet',
        playlistId: uploadsPlaylistId,
        maxResults: 10
      });
  
      const videos = videosRes.data.items.map(item => ({
        videoId: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        description: item.snippet.description
      }));
  
      await logEvent('fetch_videos', `Fetched ${videos.length} uploaded videos`);
      res.json(videos);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  //API to update video title

  app.post('/api/update-title', async (req, res) => {
    const { videoId, newTitle } = req.body;
    if (!videoId || !newTitle) return res.status(400).json({ message: 'Video ID and new title required' });
  
    if (!tokens) return res.status(401).json({ message: 'Not authenticated' });
    const youtube = getYouTubeClient(tokens);
    try {
      const videoRes = await youtube.videos.list({
        part: 'snippet',
        id: videoId
      });
  
      if (!videoRes.data.items.length) return res.status(404).json({ message: 'Video not found' });
  
      const snippet = videoRes.data.items[0].snippet;
      snippet.title = newTitle;
  
      const updateRes = await youtube.videos.update({
        part: 'snippet',
        requestBody: {
          id: videoId,
          snippet
        }
      });
  
      await logEvent('update_title', `Video ${videoId} title updated to '${newTitle}'`);
      res.json({ message: 'Title updated successfully', updateRes });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // API to Add a comment
  app.post('/api/comment', async (req, res) => {
    const { videoId, commentText } = req.body;
    if (!videoId || !commentText) return res.status(400).json({ message: 'Video ID and comment text required' });
  
    if (!tokens) return res.status(401).json({ message: 'Not authenticated' });
    const youtube = getYouTubeClient(tokens);
    try {
      const commentRes = await youtube.commentThreads.insert({
        part: 'snippet',
        requestBody: {
          snippet: {
            videoId,
            topLevelComment: {
              snippet: {
                textOriginal: commentText
              }
            }
          }
        }
      });
  
      const commentId = commentRes.data.id;
      await logEvent('add_comment', `Comment ${commentId} added to video ${videoId}`);
      res.json({ message: 'Comment added successfully', commentId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // API to  Delete a comment
  app.delete('/api/comment', async (req, res) => {
    const { commentId } = req.body;
    if (!commentId) return res.status(400).json({ message: 'Comment ID required' });
  
    if (!tokens) return res.status(401).json({ message: 'Not authenticated' });
    const youtube = getYouTubeClient(tokens);
    try {
      await youtube.comments.delete({ id: commentId });
      await logEvent('delete_comment', `Comment ${commentId} deleted`);
      res.json({ message: 'Comment deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  