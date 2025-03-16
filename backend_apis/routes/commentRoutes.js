import express from 'express';
import { tokens } from './authRoutes.js';
import { getYouTubeClient } from '../utils/oauthClient.js';
import logEvent from '../utils/logEvent.js';

const router = express.Router();

// API to Add a comment
router.post('/comment', async (req, res) => {
  try {
    const { videoId, commentText } = req.body;

    if (!videoId || !commentText) {
      return res.status(400).json({ message: 'videoId and commentText are required' });
    }
    const youtube = getYouTubeClient(tokens);
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

    const commentId = commentRes.data?.id;
    if (!commentId) {
      return res.status(500).json({ message: 'Failed to retrieve comment ID', response: commentRes.data });
    }
    res.json({ message: 'Comment posted!', commentId });

  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

//API to get all comments of a video
router.get('/comments/:videoId', async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) return res.status(400).json({ message: 'Video ID required' });
  if (!tokens) return res.status(401).json({ message: 'Not authenticated' });

  const youtube = getYouTubeClient(tokens);
  try {
    const response = await youtube.commentThreads.list({
      part: ['snippet'],
      videoId,
      maxResults: 20,
    });

    const comments = response.data.items.map(item => ({
      id: item.snippet.topLevelComment.id,
      text: item.snippet.topLevelComment.snippet.textDisplay,
    }));

    res.json(comments);
  } catch (err) {
    console.error('Fetch Comments Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// API to  Delete a comment
router.delete('/comment/:commentId', async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) return res.status(400).json({ message: 'Comment ID required' });

  if (!tokens) return res.status(401).json({ message: 'Not authenticated' });

  const youtube = getYouTubeClient(tokens);
  try {
    await youtube.comments.delete({ id: commentId });
    await logEvent('delete_comment', `Comment ${commentId} deleted`);
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Delete Comment Error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
