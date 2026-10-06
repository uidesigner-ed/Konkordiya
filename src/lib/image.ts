"use client";

/**
 * Проміс, що виконується, коли зображення повністю завантажене й декодоване
 * (або сталася помилка / минув тайм-аут — щоб анімація ніколи не «зависла»).
 */
export function imageReady(img: HTMLImageElement | null | undefined, timeout = 4000): Promise<void> {
  return new Promise((resolve) => {
    if (!img) return resolve();
    const done = () => {
      (img.decode ? img.decode() : Promise.resolve()).catch(() => {}).then(() => resolve());
    };
    if (img.complete && img.naturalWidth > 0) return done();
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", () => resolve(), { once: true });
    setTimeout(resolve, timeout);
  });
}
