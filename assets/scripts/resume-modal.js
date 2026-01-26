const RESUME_URL = '/assets/resume/karthik_resume.pdf#zoom=page-width';

const resumeButton = document.getElementById('yodaResumeBtn');
const resumeModal = document.getElementById('resumeModal');
const resumeFrame = document.getElementById('resumeViewerFrame');
const popOutButton = document.getElementById('popOutBtn');

if (resumeButton && resumeModal) {
  resumeButton.addEventListener('click', () => {
    if (resumeFrame) {
      resumeFrame.src = RESUME_URL;
    }
    resumeModal.style.display = 'flex';
    setTimeout(() => resumeModal.classList.add('show'), 10);
  });
}

if (popOutButton) {
  popOutButton.addEventListener('click', (e) => {
    e.stopPropagation();
    window.open(RESUME_URL, '_blank', 'noopener,noreferrer');
  });
}

if (resumeModal) {
  resumeModal.addEventListener('click', (e) => {
    if (e.target === resumeModal) {
      resumeModal.classList.remove('show');
      setTimeout(() => {
        resumeModal.style.display = 'none';
      }, 200);
    }
  });
}

