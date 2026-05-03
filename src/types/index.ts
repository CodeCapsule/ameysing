// ============================================================
// Shared Types for AmeySing
// ============================================================

/** A karaoke song entry (from search results or local library). */
export interface Song {
  id: string;
  videoId: string;
  title: string;
  subtitle: string;
  thumb: string;
  duration?: string;
  /** Unique runtime ID assigned when added to the queue to allow duplicates. */
  uniqueId?: number;
}

/** A user connected to a karaoke room. */
export interface RoomUser {
  id: string;
  name: string;
  isHost: boolean;
}

/** Room permission settings controlled by the host. */
export interface RoomSettings {
  guestsCanAddSongs: boolean;
  guestsCanControlPlayer: boolean;
}
