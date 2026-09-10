"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  CloudUploadIcon,
  Image02Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { request } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 10_000_000;

const uploadOne = async (file, credentials) => {
  const body = new FormData();

  body.append("file", file);
  body.append("api_key", credentials.apiKey);
  body.append("timestamp", String(credentials.timestamp));
  body.append("folder", credentials.folder);
  body.append("signature", credentials.signature);

  const response = await fetch(credentials.endpoint, { method: "POST", body });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok)
    throw new Error(payload.error?.message ?? "Cloudinary rejected that upload");

  return payload.secure_url;
};

const Gallery = ({ existing, onPick, disabled }) => (
  <Dialog>
    <DialogTrigger
      render={
        <Button type="button" variant="outline" size="sm" disabled={disabled} />
      }
    >
      <HugeiconsIcon icon={Image02Icon} strokeWidth={2} />
      Choose from gallery
    </DialogTrigger>

    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>Pictures already in the shop</DialogTitle>
        <DialogDescription>
          Every image used by a piece in the catalogue. Click one to reuse it.
        </DialogDescription>
      </DialogHeader>

      {existing.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nothing uploaded yet. Add the first picture above.
        </p>
      ) : (
        <ul className="grid max-h-[55vh] grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
          {existing.map((url) => (
            <li key={url}>
              <button
                type="button"
                onClick={() => onPick(url)}
                className="group relative block aspect-square w-full overflow-hidden rounded-lg border border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="140px"
                  className="object-cover transition group-hover:scale-105"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </DialogContent>
  </Dialog>
);

const ImageUploader = ({ value = [], onChange, existing = [] }) => {
  const input = useRef(null);
  const [dragging, setDragging] = useState(false);

  const upload = useMutation({
    mutationFn: async (files) => {
      const credentials = await request("/api/admin/uploads/sign", {
        method: "POST",
        body: {},
      });

      return Promise.all(files.map((file) => uploadOne(file, credentials)));
    },
    onSuccess: (urls) => {
      onChange([...value, ...urls]);
      toast.success(`${urls.length} image${urls.length === 1 ? "" : "s"} uploaded`);
    },
    onError: (error) => toast.error(error.message),
  });

  const accept = (list) => {
    const files = [...list];
    const usable = files.filter(
      (file) => ACCEPTED.includes(file.type) && file.size <= MAX_BYTES
    );

    if (usable.length < files.length)
      toast.error("Skipped files that were not JPEG, PNG, WebP or AVIF under 10 MB");

    if (usable.length > 0) upload.mutate(usable);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    accept(event.dataTransfer.files);
  };

  const handleRemove = (url) => onChange(value.filter((entry) => entry !== url));

  const handleMakePrimary = (url) =>
    onChange([url, ...value.filter((entry) => entry !== url)]);

  return (
    <div className="grid gap-4">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center transition",
          dragging ? "border-primary bg-primary/5" : "border-input"
        )}
      >
        <HugeiconsIcon
          icon={CloudUploadIcon}
          strokeWidth={2}
          className="size-6 text-muted-foreground"
        />

        <p className="text-sm font-medium">
          {upload.isPending ? "Uploading…" : "Drag pictures here"}
        </p>

        <p className="text-xs text-muted-foreground">
          JPEG, PNG, WebP or AVIF, up to 10 MB each. The first image is the one
          shoppers see in the grid.
        </p>

        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={upload.isPending}
            onClick={() => input.current?.click()}
          >
            Select files
          </Button>

          <Gallery
            existing={existing}
            disabled={upload.isPending}
            onPick={(url) =>
              onChange(value.includes(url) ? value : [...value, url])
            }
          />
        </div>

        <input
          ref={input}
          type="file"
          accept={ACCEPTED.join(",")}
          multiple
          className="sr-only"
          onChange={(event) => {
            accept(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {value.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {value.map((url, index) => (
            <li key={url} className="relative">
              <span className="relative block aspect-square overflow-hidden rounded-lg border border-border">
                <Image src={url} alt="" fill sizes="140px" className="object-cover" />
              </span>

              {index === 0 && (
                <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                  Main
                </span>
              )}

              <span className="absolute right-1 top-1 flex gap-1">
                {index > 0 && (
                  <button
                    type="button"
                    aria-label="Make this the main picture"
                    onClick={() => handleMakePrimary(url)}
                    className="flex size-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm hover:bg-background"
                  >
                    <HugeiconsIcon icon={StarIcon} strokeWidth={2} className="size-3" />
                  </button>
                )}

                <button
                  type="button"
                  aria-label="Remove this picture"
                  onClick={() => handleRemove(url)}
                  className="flex size-6 items-center justify-center rounded-full bg-background/90 text-destructive shadow-sm hover:bg-background"
                >
                  <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-3" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ImageUploader;
