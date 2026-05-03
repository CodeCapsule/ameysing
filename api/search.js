import YouTube from 'youtube-sr';

export default async function handler(req, res) {
  // Add CORS headers for local testing just in case
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  let query = req.query.q || 'karaoke';
  
  if (!query.toLowerCase().includes('karaoke') && !query.toLowerCase().includes('instrumental') && !query.toLowerCase().includes('videoke')) {
    query += ' karaoke';
  }

  try {
    const results = await YouTube.default.search(query, { limit: 25, type: 'video', safeSearch: false });
    
    // Filter out compilation/viral garbage
    const badKeywords = /viral|funny|moment|fail|compilation|reaction|top 10|tiktok|vlog|challenge|live performance|interview|news|blind audition|got talent/i;
    
    const filteredResults = results.filter(v => {
      const title = v.title || '';
      const channel = v.channel?.name || '';
      return !badKeywords.test(title) && !channel.toLowerCase().includes('sing king') && !channel.toLowerCase().includes('karaoke version');
    });

    const videos = filteredResults.slice(0, 15).map(v => ({
      id: v.id,
      videoId: v.id,
      title: v.title || 'Untitled',
      subtitle: v.channel?.name || 'Unknown',
      thumb: v.thumbnail?.url || `https://img.youtube.com/vi/${v.id}/0.jpg`,
      duration: v.durationFormatted || '',
    }));
    
    res.status(200).json({ results: videos });
  } catch (error) {
    console.error('YouTube search error:', error);
    res.status(500).json({ error: 'Search failed', message: error.message });
  }
}
