import express from 'express';
import { oauth2Client, SCOPES } from '../utils/oauthClient.js';

const router = express.Router();

let tokens = null;

router.get('/auth', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  res.redirect(authUrl);
});

router.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  try {
    const { tokens: newTokens } = await oauth2Client.getToken(code);
    tokens = newTokens; 
    res.redirect('http://localhost:5173/auth/success'); 
  } catch (err) {
    res.status(500).send('OAuth2 Error: ' + err.message);
  }
});

export { tokens };
export default router;
