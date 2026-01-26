const retryButton = document.getElementById('offlineRetryButton');
if (retryButton) {
  retryButton.addEventListener('click', () => {
    window.location.reload();
  });
}

window.addEventListener('online', () => {
  window.location.reload();
});

setInterval(() => {
  if (navigator.onLine) {
    window.location.reload();
  }
}, 30000);

