document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('displayedVideo');
  if (!(video instanceof HTMLVideoElement)) return;
  const source = video.querySelector('source');
  if (source && source.dataset.src) {
    source.src = source.dataset.src;
    video.load();
  }
});

