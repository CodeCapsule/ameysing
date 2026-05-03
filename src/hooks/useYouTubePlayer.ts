import { useState, useEffect, useRef, useCallback } from 'react';
import type { Song } from '../types';

interface UseYouTubePlayerOptions {
  currentSong: Song | null;
  onSongEnd: () => void;
  onVideoError: () => void;
}

interface UseYouTubePlayerReturn {
  ytContainerRef: React.RefObject<HTMLDivElement>;
  isPlaying: boolean;
  volume: number;
  /** Call with no args to toggle, or pass a boolean to force play/pause. */
  togglePlayPause: (force?: boolean) => void;
  setVolume: (vol: number) => void;
}

/** Declare the YT global injected by the YouTube IFrame API. */
declare global {
  interface Window {
    YT: {
      Player: new (
        el: string | HTMLElement,
        opts: Record<string, unknown>
      ) => YTPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  setVolume: (v: number) => void;
  destroy: () => void;
}

/**
 * Manages the YouTube IFrame player lifecycle.
 * Loads the IFrame API script once, creates/destroys the player
 * when the current song changes, and exposes play/pause controls.
 */
export function useYouTubePlayer({
  currentSong,
  onSongEnd,
  onVideoError,
}: UseYouTubePlayerOptions): UseYouTubePlayerReturn {
  const ytPlayerRef = useRef<YTPlayer | null>(null);
  const ytContainerRef = useRef<HTMLDivElement>(null!);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolumeState] = useState(100);

  // Inject YT IFrame API script once
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }
  }, []);

  // Create/destroy player when the active song changes
  useEffect(() => {
    if (!currentSong) {
      ytPlayerRef.current?.destroy();
      ytPlayerRef.current = null;
      return;
    }

    const createPlayer = () => {
      ytPlayerRef.current?.destroy();
      ytPlayerRef.current = null;
      if (!ytContainerRef.current) return;

      const playerDiv = document.createElement('div');
      playerDiv.id = 'yt-player-' + currentSong.uniqueId;
      ytContainerRef.current.innerHTML = '';
      ytContainerRef.current.appendChild(playerDiv);

      ytPlayerRef.current = new window.YT.Player(playerDiv.id, {
        videoId: currentSong.videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
        },
        events: {
          onReady: (event: { target: YTPlayer }) => {
            event.target.setVolume(volume);
          },
          onError: () => {
            onVideoError();
          },
          onStateChange: (event: { data: number }) => {
            // 0 = ENDED, 1 = PLAYING, 2 = PAUSED
            if (event.data === 0) onSongEnd();
            if (event.data === 1) setIsPlaying(true);
            if (event.data === 2) setIsPlaying(false);
          },
        },
      });
    };

    if (window.YT?.Player) {
      createPlayer();
    } else {
      window.onYouTubeIframeAPIReady = createPlayer;
    }

    return () => {
      ytPlayerRef.current?.destroy();
      ytPlayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong?.uniqueId]);

  /**
   * Toggle play/pause. Pass `true` to force play, `false` to force pause,
   * or omit to toggle the current state.
   */
  const togglePlayPause = useCallback(
    (force?: boolean) => {
      if (!ytPlayerRef.current) return;
      const shouldPlay = force !== undefined ? force : !isPlaying;
      if (shouldPlay) {
        ytPlayerRef.current.playVideo();
      } else {
        ytPlayerRef.current.pauseVideo();
      }
    },
    [isPlaying]
  );

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    ytPlayerRef.current?.setVolume(vol);
  }, []);

  return { ytContainerRef, isPlaying, volume, togglePlayPause, setVolume };
}
