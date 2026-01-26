const applyProjectImageOverrides = async () => {
  const elements = Array.from(
    document.querySelectorAll('[data-project-id][data-project-image-mode]'),
  );
  if (!elements.length) return;

  const uniqueIds = Array.from(
    new Set(
      elements
        .map((el) => el.getAttribute('data-project-id'))
        .filter((id) => typeof id === 'string' && id.length > 0),
    ),
  );

  const results = await Promise.all(
    uniqueIds.map(async (projectId) => {
      try {
        const res = await fetch(
          `/api/project-edits/${encodeURIComponent(projectId)}`,
        );
        if (!res.ok) return [projectId, null];
        const payload = await res.json();
        return [projectId, payload?.data?.image || null];
      } catch {
        return [projectId, null];
      }
    }),
  );

  const imageMap = new Map(results);

  const preload = (url) =>
    new Promise((resolve) => {
      if (!url) return resolve(false);
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });

  const setImage = (el, mode, url) => {
    if (!url) return;
    if (mode === 'img' && el instanceof HTMLImageElement) {
      el.src = url;
      return;
    }
    if (mode === 'background') {
      const safeUrl = url.replace(/"/g, '%22');
      el.style.setProperty('--image', `url("${safeUrl}")`);
    }
  };

  const setWithFallback = async (el, mode, primary, fallback) => {
    if (!primary && fallback) {
      setImage(el, mode, fallback);
      return;
    }
    if (!primary) return;
    const ok = await preload(primary);
    if (ok) {
      setImage(el, mode, primary);
      return;
    }
    if (fallback) {
      const okFallback = await preload(fallback);
      if (okFallback) {
        setImage(el, mode, fallback);
        return;
      }
    }
    // Last resort: keep primary to avoid blank tile
    setImage(el, mode, primary);
  };

  const updatePromises = elements.map((el) => {
    const projectId = el.getAttribute('data-project-id') || '';
    const mode = el.getAttribute('data-project-image-mode');
    const defaultImage = el.getAttribute('data-project-default-image') || '';
    const fallbackImage = el.getAttribute('data-project-fallback-image') || '';
    const overrideImage = imageMap.get(projectId) || '';
    const imageToUse = overrideImage || defaultImage;

    if (!imageToUse && !fallbackImage) return null;
    return setWithFallback(el, mode, imageToUse, fallbackImage);
  });

  await Promise.all(updatePromises.filter(Boolean));
};

let lastRunPath = '';
const runIfNeeded = () => {
  if (lastRunPath === window.location.pathname) {
    return;
  }
  lastRunPath = window.location.pathname;
  if (!document.querySelector('[data-project-id][data-project-image-mode]')) {
    return;
  }
  void applyProjectImageOverrides();
};

document.addEventListener('DOMContentLoaded', runIfNeeded);
document.addEventListener('astro:page-load', runIfNeeded);

