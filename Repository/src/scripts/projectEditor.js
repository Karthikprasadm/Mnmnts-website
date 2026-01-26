const modal = document.querySelector('.password-modal');
const trigger = document.querySelector('.heart-button');
const form = modal ? modal.querySelector('form') : null;
const passwordInput = modal ? modal.querySelector('input[name="password"]') : null;
const passwordError = modal ? modal.querySelector('.password-error') : null;
const overviewEl = document.getElementById('project-overview');
const languageEl = document.getElementById('project-language');
const imageEl = document.getElementById('project-image');
const imageInput = document.querySelector('.image-input');
const projectSection = document.querySelector('[data-project-id]');
const projectId = projectSection ? projectSection.getAttribute('data-project-id') : null;
let sessionPassword = null;

if (modal instanceof HTMLDialogElement && trigger) {
  trigger.addEventListener('click', () => modal.showModal());
}

const applyEdits = (data) => {
  if (!data) return;
  if (overviewEl && typeof data.overview === 'string') {
    overviewEl.textContent = data.overview;
  }
  if (languageEl && typeof data.language === 'string') {
    languageEl.textContent = data.language;
  }
  if (imageEl instanceof HTMLImageElement && typeof data.image === 'string') {
    imageEl.src = data.image;
  }
};

const fetchEdits = async () => {
  if (!projectId) return;
  try {
    const res = await fetch(`/api/project-edits/${encodeURIComponent(projectId)}`);
    if (!res.ok) return;
    const payload = await res.json();
    applyEdits(payload.data || null);
  } catch {
    // ignore fetch errors
  }
};

const saveEdits = async () => {
  if (!overviewEl || !languageEl || !projectId || !sessionPassword) return;
  const payload = {
    password: sessionPassword,
    overview: overviewEl.textContent || '',
    language: languageEl.textContent || '',
    image: imageEl instanceof HTMLImageElement ? imageEl.src : '',
  };
  try {
    await fetch(`/api/project-edits/${encodeURIComponent(projectId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // ignore save errors
  }
};

const enableEditing = () => {
  document.body.classList.add('edit-mode');
  const makeEditable = (el) => {
    if (!(el instanceof HTMLElement)) return;
    el.contentEditable = 'true';
    el.setAttribute('contenteditable', 'true');
    el.setAttribute('role', 'textbox');
    el.setAttribute('tabindex', '0');
    el.addEventListener('input', () => void saveEdits());
  };
  makeEditable(overviewEl);
  makeEditable(languageEl);
  if (imageEl instanceof HTMLImageElement && imageInput instanceof HTMLInputElement) {
    imageEl.classList.add('editable');
    imageEl.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', () => {
      const file = imageInput.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          imageEl.src = reader.result;
          void saveEdits();
        }
      };
      reader.readAsDataURL(file);
    });
  }
};

void fetchEdits();

if (form && passwordInput && modal instanceof HTMLDialogElement) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const submitter = event.submitter;
    const action =
      submitter instanceof HTMLButtonElement ? submitter.value : 'submit';
    if (action !== 'submit') {
      passwordError?.setAttribute('hidden', 'true');
      passwordInput.value = '';
      modal.close();
      return;
    }
    if (!projectId) return;
    const attempt = passwordInput.value;
    fetch(`/api/project-edits/${encodeURIComponent(projectId)}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: attempt }),
    })
      .then((res) => {
        if (!res.ok) {
          passwordError?.removeAttribute('hidden');
          return;
        }
        sessionPassword = attempt;
        passwordError?.setAttribute('hidden', 'true');
        modal.close();
        enableEditing();
      })
      .catch(() => {
        passwordError?.removeAttribute('hidden');
      })
      .finally(() => {
        passwordInput.value = '';
      });
  });
}

