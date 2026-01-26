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

  elements.forEach((el) => {
    const projectId = el.getAttribute('data-project-id') || '';
    const mode = el.getAttribute('data-project-image-mode');
    const defaultImage = el.getAttribute('data-project-default-image') || '';
    const overrideImage = imageMap.get(projectId) || '';
    const imageToUse = overrideImage || defaultImage;

    if (!imageToUse) return;

    if (mode === 'img' && el instanceof HTMLImageElement) {
      el.src = imageToUse;
      return;
    }

    if (mode === 'background') {
      const safeUrl = imageToUse.replace(/"/g, '%22');
      el.style.setProperty('--image', `url("${safeUrl}")`);
    }
  });
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

