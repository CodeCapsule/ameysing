import type { Song } from '../types';

// ============================================================
// Local fallback song library
// ============================================================
export const LOCAL_SONGS: Song[] = [
  // OPM Classics & Hits
  { id: 'FMS3_MKLECk', videoId: 'FMS3_MKLECk', title: 'Bakit Nga Ba Mahal Kita - (KARAOKE) Gigi De Lana', subtitle: 'Global KaraokeyTV', thumb: 'https://img.youtube.com/vi/FMS3_MKLECk/mqdefault.jpg' },
  { id: 'h6z5eM-tjmg', videoId: 'h6z5eM-tjmg', title: 'When I Met You / (KARAOKE) - APO Hiking Society', subtitle: 'Atomic Karaoke', thumb: 'https://img.youtube.com/vi/h6z5eM-tjmg/mqdefault.jpg' },
  { id: 'ZGUtHVzi1qI', videoId: 'ZGUtHVzi1qI', title: 'Pasilyo - SunKissed Lola (KARAOKE)', subtitle: 'Atomic Karaoke', thumb: 'https://img.youtube.com/vi/ZGUtHVzi1qI/mqdefault.jpg' },
  { id: 'MYSVMgRr6pw', videoId: 'MYSVMgRr6pw', title: 'Hallelujah - Bamboo (KARAOKE)', subtitle: 'Atomic Karaoke', thumb: 'https://img.youtube.com/vi/MYSVMgRr6pw/mqdefault.jpg' },
  { id: 'qLEMjOTGMQQ', videoId: 'qLEMjOTGMQQ', title: 'Tadhana - Up Dharma Down (KARAOKE)', subtitle: 'Karaoke PH', thumb: 'https://img.youtube.com/vi/qLEMjOTGMQQ/mqdefault.jpg' },
  { id: 'wJcONvMbSfk', videoId: 'wJcONvMbSfk', title: 'Pare Ko - Eraserheads (KARAOKE)', subtitle: 'Karaoke Republic', thumb: 'https://img.youtube.com/vi/wJcONvMbSfk/mqdefault.jpg' },
  { id: '4gBHujwMoZU', videoId: '4gBHujwMoZU', title: 'Narda - Kamikazee (KARAOKE)', subtitle: 'Karaoke Republic', thumb: 'https://img.youtube.com/vi/4gBHujwMoZU/mqdefault.jpg' },
  { id: 'gWAMRvpNHbk', videoId: 'gWAMRvpNHbk', title: 'Kahit Maputi Na Ang Buhok Ko (KARAOKE)', subtitle: 'Global KaraokeyTV', thumb: 'https://img.youtube.com/vi/gWAMRvpNHbk/mqdefault.jpg' },
  { id: 'Tp9PqMGTCX4', videoId: 'Tp9PqMGTCX4', title: 'Forevermore - Side A (KARAOKE)', subtitle: 'Karaoke Republic', thumb: 'https://img.youtube.com/vi/Tp9PqMGTCX4/mqdefault.jpg' },
  { id: 'pEk7cKQXBEE', videoId: 'pEk7cKQXBEE', title: 'Basang Basa Sa Ulan - Aegis (KARAOKE)', subtitle: 'Karaoke Republic', thumb: 'https://img.youtube.com/vi/pEk7cKQXBEE/mqdefault.jpg' },
  { id: 'y0g0A_rmTgY', videoId: 'y0g0A_rmTgY', title: 'Harana - Parokya Ni Edgar (KARAOKE)', subtitle: 'Karaoke Republic', thumb: 'https://img.youtube.com/vi/y0g0A_rmTgY/mqdefault.jpg' },
  { id: 'u8dbjOdJYfg', videoId: 'u8dbjOdJYfg', title: 'Ikaw - Yeng Constantino (KARAOKE)', subtitle: 'Karaoke PH', thumb: 'https://img.youtube.com/vi/u8dbjOdJYfg/mqdefault.jpg' },
  { id: 'vdm0nknSvPM', videoId: 'vdm0nknSvPM', title: 'Dadalhin - Regine Velasquez (KARAOKE)', subtitle: 'Karaoke Republic', thumb: 'https://img.youtube.com/vi/vdm0nknSvPM/mqdefault.jpg' },
  { id: 'QFOsRAjIVWE', videoId: 'QFOsRAjIVWE', title: 'Buwan - Juan Karlos (KARAOKE)', subtitle: 'Karaoke PH', thumb: 'https://img.youtube.com/vi/QFOsRAjIVWE/mqdefault.jpg' },
  { id: 'x_P-0I6sAck', videoId: 'x_P-0I6sAck', title: 'Araw-Araw - Ben&Ben (KARAOKE)', subtitle: 'Karaoke Covers', thumb: 'https://img.youtube.com/vi/x_P-0I6sAck/mqdefault.jpg' },
  { id: 'V0RCNL4_aPY', videoId: 'V0RCNL4_aPY', title: 'Makita Kang Muli - Sugarfree (KARAOKE)', subtitle: 'Karaoke Republic', thumb: 'https://img.youtube.com/vi/V0RCNL4_aPY/mqdefault.jpg' },
  { id: '5E2Bq-e_Y2w', videoId: '5E2Bq-e_Y2w', title: 'Jeepney - Sponge Cola (KARAOKE)', subtitle: 'Karaoke Republic', thumb: 'https://img.youtube.com/vi/5E2Bq-e_Y2w/mqdefault.jpg' },
  { id: 'h783-Kx1m40', videoId: 'h783-Kx1m40', title: 'Ang Huling El Bimbo - Eraserheads (KARAOKE)', subtitle: 'Atomic Karaoke', thumb: 'https://img.youtube.com/vi/h783-Kx1m40/mqdefault.jpg' },
  // International Hits
  { id: 'RgKAFK5djSk', videoId: 'RgKAFK5djSk', title: 'See You Again - Wiz Khalifa ft. Charlie Puth (KARAOKE)', subtitle: 'Karaoke Channel', thumb: 'https://img.youtube.com/vi/RgKAFK5djSk/mqdefault.jpg' },
  { id: 'dQw4w9WgXcQ', videoId: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up - Rick Astley (KARAOKE)', subtitle: 'Karaoke Hits', thumb: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { id: '450p7goxZqg', videoId: '450p7goxZqg', title: 'All Of Me - John Legend (KARAOKE)', subtitle: 'Karaoke Hits', thumb: 'https://img.youtube.com/vi/450p7goxZqg/mqdefault.jpg' },
  { id: 'YQHsXMglC9A', videoId: 'YQHsXMglC9A', title: 'Hello - Adele (KARAOKE)', subtitle: 'Karaoke Hits', thumb: 'https://img.youtube.com/vi/YQHsXMglC9A/mqdefault.jpg' },
  { id: 'bo_efYhYU2A', videoId: 'bo_efYhYU2A', title: 'My Way - Frank Sinatra (KARAOKE)', subtitle: 'Karaoke Channel', thumb: 'https://img.youtube.com/vi/bo_efYhYU2A/mqdefault.jpg' },
  { id: 'lp-EO5I60KA', videoId: 'lp-EO5I60KA', title: 'Bohemian Rhapsody - Queen (KARAOKE)', subtitle: 'Karaoke Channel', thumb: 'https://img.youtube.com/vi/lp-EO5I60KA/mqdefault.jpg' },
  { id: 'hTWKbfoikeg', videoId: 'hTWKbfoikeg', title: 'Somebody That I Used To Know - Gotye (KARAOKE)', subtitle: 'Karaoke Hits', thumb: 'https://img.youtube.com/vi/hTWKbfoikeg/mqdefault.jpg' },
  { id: 'CevxZvSJLk8', videoId: 'CevxZvSJLk8', title: 'Roar - Katy Perry (KARAOKE)', subtitle: 'Karaoke Hits', thumb: 'https://img.youtube.com/vi/CevxZvSJLk8/mqdefault.jpg' },
  { id: 'sENM2wA_FTg', videoId: 'sENM2wA_FTg', title: 'I Will Always Love You - Whitney Houston (KARAOKE)', subtitle: 'Karaoke Channel', thumb: 'https://img.youtube.com/vi/sENM2wA_FTg/mqdefault.jpg' },
  { id: 'kXYiU_JCYtU', videoId: 'kXYiU_JCYtU', title: 'Linkin Park - Numb (KARAOKE)', subtitle: 'Karaoke Channel', thumb: 'https://img.youtube.com/vi/kXYiU_JCYtU/mqdefault.jpg' },
  { id: 'hLQl3WQQoQ0', videoId: 'hLQl3WQQoQ0', title: 'Let It Go - Frozen (KARAOKE)', subtitle: 'Karaoke Hits', thumb: 'https://img.youtube.com/vi/hLQl3WQQoQ0/mqdefault.jpg' },
  { id: 'QDYfEBY9NM4', videoId: 'QDYfEBY9NM4', title: 'Thinking Out Loud - Ed Sheeran (KARAOKE)', subtitle: 'Karaoke Channel', thumb: 'https://img.youtube.com/vi/QDYfEBY9NM4/mqdefault.jpg' },
  { id: 'YBHQbu5rbdQ', videoId: 'YBHQbu5rbdQ', title: 'What Makes You Beautiful - One Direction (KARAOKE)', subtitle: 'Karaoke Hits', thumb: 'https://img.youtube.com/vi/YBHQbu5rbdQ/mqdefault.jpg' },
];

// ============================================================
// Bad keywords for filtering non-karaoke results
// ============================================================
const BAD_KEYWORDS =
  /viral|funny|moment|fail|compilation|reaction|top 10|tiktok|vlog|challenge|live performance|interview|news|blind audition|got talent/i;

/**
 * Search YouTube for karaoke videos via the backend proxy.
 * Falls back to the local library if the API fails.
 *
 * @returns [results, usedFallback]
 */
export async function searchKaraoke(
  query: string
): Promise<{ results: Song[]; usedFallback: boolean }> {
  // Direct YouTube URL detection
  const urlParams = new URLSearchParams(
    query.includes('?') ? query.split('?')[1] : ''
  );
  const directVideoId =
    urlParams.get('v') ||
    (query.includes('youtu.be/')
      ? query.split('youtu.be/')[1].split('?')[0]
      : null);

  if (directVideoId) {
    return {
      results: [
        {
          id: directVideoId,
          videoId: directVideoId,
          title: 'Direct Link Video',
          subtitle: 'YouTube URL',
          thumb: `https://img.youtube.com/vi/${directVideoId}/0.jpg`,
        },
      ],
      usedFallback: false,
    };
  }

  // Empty query → return local library
  if (!query.trim()) {
    return { results: LOCAL_SONGS, usedFallback: false };
  }

  // Enforce karaoke keyword
  let q = query.trim();
  if (
    !q.toLowerCase().includes('karaoke') &&
    !q.toLowerCase().includes('instrumental') &&
    !q.toLowerCase().includes('videoke')
  ) {
    q += ' karaoke';
  }

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error(`API responded with ${res.status}`);
    const data = (await res.json()) as { results?: Song[] };

    if (data.results && data.results.length > 0) {
      return { results: data.results, usedFallback: false };
    }
    throw new Error('No results from API');
  } catch {
    // Fallback: filter local library by query
    const normalised = q.toLowerCase().replace(' karaoke', '').trim();
    const filtered = LOCAL_SONGS.filter(
      (v) =>
        v.title.toLowerCase().includes(normalised) ||
        v.subtitle.toLowerCase().includes(normalised)
    );
    return {
      results: filtered.length > 0 ? filtered : LOCAL_SONGS.slice(0, 5),
      usedFallback: true,
    };
  }
}

export { BAD_KEYWORDS };
