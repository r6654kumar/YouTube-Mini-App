import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

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

export { oauth2Client, SCOPES, getYouTubeClient };
