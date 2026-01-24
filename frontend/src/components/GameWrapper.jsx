import { useRef, useState, useEffect, cloneElement, Children } from 'react';
import { Maximize, Minimize } from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';

/**
 * Wraps every game: fullscreen toggle, game-over detection, auto-save score.
 * Injects onGameEnd(score, durationSeconds) and isFullScreen.
 * Fullscreen: canvas scales to fill viewport without stretching (flex center + max-h-full max-w-full).
 */
export default function GameWrapper({ gameId, children }) {
  const containerRef = useRef(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { submitScore } = useGlobal();

  const onGameEnd = (score, durationSeconds) => {
    submitScore(gameId, score, typeof durationSeconds === 'number' ? durationSeconds : 0);
  };

  const toggleFullScreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullScreen(true);
      } catch (e) {
        console.warn('Fullscreen error:', e);
      }
    } else {
      document.exitFullscreen?.();
      setIsFullScreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const child = Children.only(children);
  const withProps = cloneElement(child, { onGameEnd, isFullScreen });

  return (
    <div
      ref={containerRef}
      className={`relative ${isFullScreen ? 'h-screen w-screen flex flex-col bg-slate-950' : 'w-full min-h-screen'}`}
    >
      <button
        type="button"
        onClick={toggleFullScreen}
        className="absolute top-2 right-2 z-[100] p-2 rounded-xl bg-black/50 hover:bg-black/70 text-white transition"
        aria-label="Toggle fullscreen"
      >
        {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
      </button>
      {isFullScreen ? (
        <div className="flex-1 flex items-center justify-center min-h-0 p-2">
          {withProps}
        </div>
      ) : (
        withProps
      )}
    </div>
  );
}
