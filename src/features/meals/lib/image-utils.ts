/**
 * Normalizes an uploaded/captured meal photo before sending to Supabase Storage:
 * 1. Resizes large smartphone photos to a maximum dimension of 1600px.
 * 2. Flattens alpha channels / grayscale onto a solid white background (#FFFFFF)
 *    to prevent the PyTorch / Torchvision tensor error in vision models
 *    ("mean must have 1 elements if it is an iterable, got 3" on 4-channel PNGs).
 * 3. Compresses to high-quality JPEG (0.85) to reduce upload time & payload size.
 */
export async function normalizeMealImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // If running in an environment without DOM (e.g. SSR), fallback to the original file
    if (typeof window === "undefined" || typeof URL === "undefined" || !URL.createObjectURL) {
      resolve(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const MAX_DIM = 1600;
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        // Fallback to original file if canvas 2D context is unavailable
        resolve(file);
        return;
      }

      // Fill with solid white background to eliminate any transparency / alpha channel
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            resolve(file);
          }
        },
        "image/jpeg",
        0.85
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Impossible de charger la photo sélectionnée."));
    };

    img.src = objectUrl;
  });
}
