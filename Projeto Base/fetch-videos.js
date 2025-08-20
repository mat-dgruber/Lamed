// fetch-videos.js (CORRIGIDO)

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Suas constantes globais
const API_KEY = process.env.YOUTUBE_API_KEY; // A chave será lida dos segredos do GitHub
const CHANNEL_ID = 'UC2PYvVmcJBLt9ymvBpnXO9A';
const SHORT_VIDEO_MAX_DURATION = 61;
const outputPath = path.join(__dirname, 'public', 'videos.json');

// Sua função para converter a duração
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

// Sua função de busca, adaptada para axios
async function getLatestYouTubeVideosLogic(apiKey, channelId, targetCount, initialFetchCount, shortVideoMaxDuration) {
  const searchApiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&maxResults=${initialFetchCount}&type=video&key=${apiKey}`;
  const searchResponse = await axios.get(searchApiUrl);
  const searchData = searchResponse.data;

  if (!searchData.items || searchData.items.length === 0) return [];

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

// Função principal que executa a lógica e salva o arquivo
async function run() {
  console.log('Iniciando busca de vídeos do YouTube...');
  if (!API_KEY) throw new Error('Chave da API do YouTube não configurada!');

  try {
    const finalVideos = await getLatestYouTubeVideosLogic(API_KEY, CHANNEL_ID, 13, 30, SHORT_VIDEO_MAX_DURATION);
    fs.writeFileSync(outputPath, JSON.stringify(finalVideos, null, 2));
    console.log(`Sucesso! ${finalVideos.length} vídeos salvos em ${outputPath}`);
  } catch (error) {
    console.error('Erro no processo de busca de vídeos:', error.message);
    process.exit(1);
  }
}

run();