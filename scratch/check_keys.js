import YouTube from 'youtube-sr';

console.log('YouTube object keys:', Object.keys(YouTube));
if (YouTube.default) {
  console.log('YouTube.default keys:', Object.keys(YouTube.default));
}
