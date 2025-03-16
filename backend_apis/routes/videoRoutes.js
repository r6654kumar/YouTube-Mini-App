import express from 'express';
import { tokens } from './authRoutes.js';
import { getYouTubeClient } from '../utils/oauthClient.js';
import logEvent from '../utils/logEvent.js';

const router = express.Router();

//Api to fetch the video details
router.get('/videos', async (req, res) => {
  if (!tokens) return res.status(401).json({ message: 'Not authenticated' });

  const youtube = getYouTubeClient(tokens);

  try {
    const channelRes = await youtube.channels.list({
      part: 'contentDetails',
      mine: true
    });

    const items = channelRes.data.items;

    if (!items || items.length === 0) {
      await logEvent('fetch_videos', 'No channel data found');
      return res.json([]); 
    }

    const uploadsPlaylistId = items[0].contentDetails.relatedPlaylists.uploads;

    const videosRes = await youtube.playlistItems.list({
      part: 'snippet',
      playlistId: uploadsPlaylistId,
      maxResults: 10
    });

    const videoItems = videosRes.data.items;

    const videos = videoItems && videoItems.length > 0
      ? videoItems.map(item => ({
          videoId: item.snippet.resourceId.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
        }))
      : [];

    await logEvent('fetch_videos', `Fetched ${videos.length} uploaded videos`);
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



//API to update video title
router.post('/update-title', async (req, res) => {
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

export default router;
