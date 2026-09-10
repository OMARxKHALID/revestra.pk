"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import cn from "@/lib/utils/cn";
import { META, NOTICE } from "@/lib/type";
import { CloseIcon } from "@/components/ui/icons";

const MAX_IMAGES = 3;
const MAX_EDGE = 1400;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

const downscale = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);

      const scale = Math.min(1, MAX_EDGE / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");

      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);

      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file could not be read as an image"));
    };

    image.src = url;
  });

const ReviewPhotos = ({ value = [], onChange }) => {
  const input = useRef(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleFiles = async (event) => {
    const files = [...event.target.files];

    event.target.value = "";
    setError(null);

    if (files.length === 0) return;

    const room = MAX_IMAGES - value.length;

    if (room <= 0) {
      setError(`Up to ${MAX_IMAGES} photos.`);
      return;
    }

    const usable = files.filter((file) => ACCEPTED.includes(file.type));

    if (usable.length < files.length)
      setError("Only JPEG, PNG or WebP photos.");

    setBusy(true);

    try {
      const encoded = await Promise.all(
        usable.slice(0, room).map((file) => downscale(file))
      );

      onChange([...value, ...encoded]);
    } catch {
      setError("One of those photos could not be read.");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = (index) =>
    onChange(value.filter((_, entry) => entry !== index));

  return (
    <div>
      <span className={cn(META, "text-ink-soft")}>
        Photos (optional, up to {MAX_IMAGES})
      </span>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {value.map((source, index) => (
          <span key={source.slice(-24)} className="relative">
            <Image
              src={source}
              alt={`Your photo ${index + 1}`}
              width={80}
              height={80}
              unoptimized
              className="h-20 w-20 rounded object-cover"
            />

            <button
              type="button"
              onClick={() => handleRemove(index)}
              aria-label={`Remove photo ${index + 1}`}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white transition hover:bg-sale focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blurple"
            >
              <CloseIcon className="h-3 w-3" />
            </button>
          </span>
        ))}

        {value.length < MAX_IMAGES && (
          <button
            type="button"
            disabled={busy}
            onClick={() => input.current?.click()}
            className={cn(
              META,
              "flex h-20 w-20 items-center justify-center rounded border border-dashed border-rule-strong text-ink-soft transition hover:border-ink-muted hover:text-ink disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blurple"
            )}
          >
            {busy ? "…" : "Add"}
          </button>
        )}
      </div>

      <input
        ref={input}
        type="file"
        accept={ACCEPTED.join(",")}
        multiple
        onChange={handleFiles}
        className="sr-only"
      />

      <p className={cn(NOTICE, "mt-2", error ? "text-sale" : "text-ink-soft")}>
        {error ?? "Photos are resized in your browser before they are sent."}
      </p>
    </div>
  );
};

export default ReviewPhotos;
