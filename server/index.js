import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// CORS setup to allow credentials from Vite dev server
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
app.use(cors({
  origin: frontendUrl,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

const getOAuthClient = () => {
  return new google.auth.OAuth2(
    process.env.VITE_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'postmessage'
  );
};

app.post('/api/auth/google', async (req, res) => {
  try {
    const { code } = req.body;
    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    
    // Set tokens in HTTP-only cookies
    res.cookie('google_access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expiry_date ? tokens.expiry_date - Date.now() : 3600000,
    });
    
    if (tokens.refresh_token) {
      res.cookie('google_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error exchanging token:', error);
    res.status(500).json({ error: 'Failed to authenticate with Google' });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const { summary, description, start, end, timezone } = req.body;
    const accessToken = req.cookies.google_access_token;

    if (!accessToken) {
      return res.status(401).json({ error: 'Not authenticated with Google' });
    }

    const oauth2Client = getOAuthClient();
    oauth2Client.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = {
      summary,
      description: description + '\n\nCreated via FocusX',
      start: {
        dateTime: start,
        timeZone: timezone || 'UTC',
      },
      end: {
        dateTime: end,
        timeZone: timezone || 'UTC',
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    res.json({ success: true, event: response.data });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ error: 'Failed to create event in Google Calendar' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
