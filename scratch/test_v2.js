import { YouTube } from 'youtube-sr';

async function test() {
  try {
    console.log('Searching for "karaoke" via YouTube.search...');
    const results = await YouTube.search('karaoke', { limit: 5, type: 'video' });
    console.log('Results found:', results.length);
  } catch (err) {
    console.error('Search failed:', err);
  }
}

test();
