import { useEffect, useState } from "react";

export default function SmartImage({ alt, className = "", src }) {
  const [status, setStatus] = useState(src ? "loading" : "empty");

  useEffect(() => {
    if (!src) {
      setStatus("empty");
      return;
    }

    setStatus("loading");

    const image = new Image();

    image.onload = () => setStatus("loaded");
    image.onerror = () => setStatus("error");
    image.src = src;

    const fallbackTimer = window.setTimeout(() => {
      setStatus((current) => (current === "loading" ? "loaded" : current));
    }, 1400);

    return () => {
      window.clearTimeout(fallbackTimer);
    };
  }, [src]);

  return (
    <div className={`smart-image-shell ${className}`}>
      {status !== "loaded" ? (
        <div className="image-placeholder">
          <span className="image-shimmer" />
        </div>
      ) : null}
      {src ? (
        <img
          alt={alt}
          className={`smart-image ${status === "loaded" ? "loaded" : "hidden"}`}
          src={src}
        />
      ) : null}
      {status === "empty" || status === "error" ? (
        <div className="image-fallback">No image</div>
      ) : null}
    </div>
  );
}
