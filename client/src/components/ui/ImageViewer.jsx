// components/common/ImageViewer.jsx
import { useState, useEffect, useRef } from "react";

const ImageViewer = ({ src, alt, isOpen, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [imageDimensions, setImageDimensions] = useState(null);
  const [isLandscape, setIsLandscape] = useState(false);
  const [showRotateHint, setShowRotateHint] = useState(false);
  const [userRotated, setUserRotated] = useState(false);
  const imgRef = useRef(null);

  // Detect image orientation once loaded
  useEffect(() => {
    if (!src || !isOpen) return;

    const img = new Image();
    img.onload = () => {
      const landscape = img.naturalWidth > img.naturalHeight;
      setIsLandscape(landscape);
      setImageDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight,
        ratio: img.naturalWidth / img.naturalHeight,
      });

      // Show rotate hint for landscape images on mobile
      if (landscape && window.innerWidth < 768) {
        setShowRotateHint(true);
        // Auto-hide hint after 3 seconds
        setTimeout(() => setShowRotateHint(false), 3000);
      }
    };
    img.src = src;
  }, [src, isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent background scroll
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Reset state on close
  const handleClose = () => {
    setZoom(1);
    setUserRotated(false);
    setShowRotateHint(false);
    onClose();
  };

  const zoomIn = (e) => {
    e.stopPropagation();
    setZoom((prev) => Math.min(prev + 0.5, 3));
  };

  const zoomOut = (e) => {
    e.stopPropagation();
    setZoom((prev) => Math.max(prev - 0.5, 0.5));
  };

  const resetZoom = (e) => {
    e.stopPropagation();
    setZoom(1);
  };

  const toggleRotation = (e) => {
    e.stopPropagation();
    setUserRotated((prev) => !prev);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={handleClose}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-white hover:text-white text-3xl z-[110]
                   w-12 h-12 flex items-center justify-center rounded-full 
                   bg-black/60 hover:bg-black/80 transition-colors
                   border border-white/20"
        aria-label="Close image viewer"
      >
        ✕
      </button>

      {/* Top controls */}
      <div className="absolute top-4 left-4 flex gap-2 z-[110]">
        {/* Rotate button */}
        <button
          onClick={toggleRotation}
          className={`
            px-4 py-2.5 rounded-lg text-sm flex items-center gap-2
            transition-all border
            ${
              userRotated
                ? "bg-blue-500/80 text-white border-blue-400/50"
                : "bg-black/60 hover:bg-black/80 text-white border-white/20"
            }
          `}
          title={userRotated ? "Reset rotation" : "Rotate image"}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {userRotated ? "Reset" : "Rotate"}
        </button>
      </div>

      {/* Rotate hint toast */}
      {showRotateHint && (
        <div
          className="absolute top-20 left-1/2 -translate-x-1/2 z-[110]
                        bg-white/95 text-gray-900 px-4 py-2.5 rounded-lg
                        shadow-lg animate-bounce text-sm flex items-center gap-2
                        whitespace-nowrap"
        >
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>
            Landscape image — tap <span className="font-bold">Rotate</span> or
            turn phone
          </span>
        </div>
      )}

      {/* Zoom controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-[110]">
        <button
          onClick={zoomOut}
          className="w-10 h-10 bg-black/60 hover:bg-black/80 text-white rounded-full 
                     flex items-center justify-center text-lg border border-white/20
                     transition-colors"
          aria-label="Zoom out"
        >
          −
        </button>
        <span className="px-3 py-2 text-white/70 text-sm self-center bg-black/40 rounded-lg">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={zoomIn}
          className="w-10 h-10 bg-black/60 hover:bg-black/80 text-white rounded-full 
                     flex items-center justify-center text-lg border border-white/20
                     transition-colors"
          aria-label="Zoom in"
        >
          +
        </button>
        {zoom !== 1 && (
          <button
            onClick={resetZoom}
            className="px-4 py-2 bg-black/60 hover:bg-black/80 text-white rounded-full 
                       text-sm border border-white/20 transition-colors"
            aria-label="Reset zoom"
          >
            Reset
          </button>
        )}
      </div>

      {/* Image */}
      <div
        className={`
          flex items-center justify-center
          transition-transform duration-300 ease-in-out
          ${userRotated ? "rotate-90" : ""}
        `}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={`
            object-contain
            transition-transform duration-200 select-none
            ${
              userRotated
                ? "max-w-[90vh] max-h-[90vw]" // Swapped dimensions when rotated
                : "max-w-[90vw] max-h-[90vh]" // Normal dimensions
            }
          `}
          style={{ transform: `scale(${zoom})` }}
          onClick={(e) => {
            e.stopPropagation();
            // Double-click/tap to toggle rotation
            if (e.detail === 2) toggleRotation(e);
          }}
          draggable={false}
        />
      </div>

      {/* Image caption */}
      {alt && (
        <div
          className="absolute bottom-24 left-1/2 -translate-x-1/2 
                        text-white/70 text-xs md:text-sm text-center px-4
                        bg-black/60 rounded-lg py-1.5 max-w-[90vw]"
        >
          {alt}
          {isLandscape && !userRotated && window.innerWidth < 768 && (
            <p className="text-white/40 text-xs mt-1">
              Double-tap image or tap Rotate button for better view
            </p>
          )}
        </div>
      )}

      {/* Image dimensions badge (desktop) */}
      {isLandscape && imageDimensions && (
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 
                        text-white/40 text-xs hidden md:block
                        bg-black/40 px-2 py-0.5 rounded"
        >
          {imageDimensions.width} × {imageDimensions.height} • Landscape
        </div>
      )}
    </div>
  );
};

export default ImageViewer;
