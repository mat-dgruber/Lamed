const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const cors = require("cors")({ origin: true });

admin.initializeApp();

// --- Helper function to parse YouTube's duration format ---
function parseISO8601Duration(durationString) {
  if (!durationString) return 0;
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = durationString.match(regex);
  if (!matches) return 0;
  const hours = parseInt(matches[1]) || 0;
  const minutes = parseInt(matches[2]) || 0;
  const seconds = parseInt(matches[3]) || 0;
  return (hours * 3600) + (minutes * 60) + seconds;
}

// --- Logic to fetch and process videos ---
async function getLatestYouTubeVideosLogic(apiKey, channelId, targetCount, initialFetchCount, shortVideoMaxDuration) {
  const searchApiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&maxResults=${initialFetchCount}&type=video&key=${apiKey}`;
  const searchResponse = await axios.get(searchApiUrl);
  const searchData = searchResponse.data;

  if (!searchData.items || searchData.items.length === 0) {
    return [];
  }

  const videoIds = searchData.items.map(item => item.id.videoId).join(',');
  const videosApiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIds}&key=${apiKey}&maxResults=${initialFetchCount}`;
  const videosResponse = await axios.get(videosApiUrl);
  const videosData = videosResponse.data;

  if (videosData.items && videosData.items.length > 0) {
    let longVideos = videosData.items
      .map(video => ({
        id: { videoId: video.id },
        snippet: video.snippet,
        durationInSeconds: parseISO8601Duration(video.contentDetails?.duration)
      }))
      .filter(video => video.durationInSeconds > shortVideoMaxDuration);

    if (longVideos.length > 0) {
      const originalOrderMap = new Map(searchData.items.map((item, index) => [item.id.videoId, index]));
      longVideos.sort((a, b) => originalOrderMap.get(a.id.videoId) - originalOrderMap.get(b.id.videoId));
      return longVideos.slice(0, targetCount);
    }
  }
  return [];
}


/**
 * Firebase Cloud Function to get latest YouTube videos.
 * This function acts as a secure API endpoint for the Angular app.
 * 
 * IMPORTANT: You must set the YouTube API key in your Firebase environment.
 * Run this command in your terminal:
 * firebase functions:config:set youtube.key="YOUR_YOUTUBE_API_KEY"
 */
exports.getvideos = functions.https.onRequest((request, response) => {
  // Use CORS to allow requests from your web app
  cors(request, response, async () => {
    // Reading constants from the original script
    const CHANNEL_ID = 'UC2PYvVmcJBLt9ymvBpnXO9A';
    const SHORT_VIDEO_MAX_DURATION = 61;
    const TARGET_COUNT = 13;
    const INITIAL_FETCH_COUNT = 30;

    // Securely get the API key from Firebase environment configuration
    const API_KEY = functions.config().youtube?.key;

    if (!API_KEY) {
      console.error("YouTube API key is not configured. Set it with 'firebase functions:config:set youtube.key=...'");
      response.status(500).send({ error: "Server configuration error: Missing API key." });
      return;
    }

    try {
      console.log("Fetching latest YouTube videos...");
      const finalVideos = await getLatestYouTubeVideosLogic(
        API_KEY,
        CHANNEL_ID,
        TARGET_COUNT,
        INITIAL_FETCH_COUNT,
        SHORT_VIDEO_MAX_DURATION
      );
      console.log(`Successfully fetched ${finalVideos.length} videos.`);
      response.status(200).send(finalVideos);
    } catch (error) {
      console.error("Error in getLatestYouTubeVideosLogic:", error.message);
      if (error.response) {
        console.error("YouTube API Response Error:", error.response.data);
      }
      response.status(500).send({ error: "Failed to fetch videos from YouTube.", details: error.message });
    }
  });
});
