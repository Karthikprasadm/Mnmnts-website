const SIGNATURE_ENDPOINT =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api/signature'
    : `${window.location.protocol}//${window.location.hostname}/api/signature`;

const ikUploadButton = document.getElementById('uploadButton');
const ikMediaUpload = document.getElementById('mediaUpload');
const ikProgressBar = document.getElementById('progress');
const ikPreview = document.getElementById('preview');
const ikErrorMessage = document.getElementById('errorMessage');
const ikStatusBox = document.getElementById('uploadStatus');
const toastContainer = document.getElementById('toastContainer');

const mediaUpload = document.getElementById('mediaUpload');
const preview = document.getElementById('preview');
const uploadedMedia = document.getElementById('uploadedMedia');

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'video/mp4',
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

function showToast(message, type = 'success') {
  if (!toastContainer) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

function addStatusRow(fileName) {
  if (!ikStatusBox) return null;
  const row = document.createElement('div');
  row.className = 'upload-status-item status-pending';
  row.dataset.fileName = fileName;

  const dot = document.createElement('span');
  dot.className = 'status-dot';
  const text = document.createElement('span');
  text.className = 'status-text';
  text.textContent = `${fileName} – pending`;

  row.appendChild(dot);
  row.appendChild(text);
  ikStatusBox.appendChild(row);
  return row;
}

function setStatus(fileName, state, message) {
  if (!ikStatusBox) return;
  const rows = [...ikStatusBox.querySelectorAll('.upload-status-item')];
  const row = rows.find((r) => r.dataset.fileName === fileName) || addStatusRow(fileName);
  if (!row) return;
  row.className = `upload-status-item status-${state}`;
  const text = row.querySelector('.status-text');
  if (text) text.textContent = `${fileName} – ${message}`;
}

let imagekit = null;
let imagekitConfig = null;

async function getImageKitConfig() {
  if (imagekitConfig) return imagekitConfig;
  const res = await fetch('/api/imagekit-config');
  if (!res.ok) {
    throw new Error(`Config request failed: ${res.status}`);
  }
  imagekitConfig = await res.json();
  return imagekitConfig;
}

async function initializeImageKit() {
  if (imagekit) return imagekit;
  const config = await getImageKitConfig();
  imagekit = new ImageKit({
    publicKey: config.publicKey,
    urlEndpoint: config.urlEndpoint,
  });
  return imagekit;
}

async function getSignature() {
  const res = await fetch(SIGNATURE_ENDPOINT);
  if (!res.ok) {
    throw new Error(`Signature request failed: ${res.status}`);
  }
  return res.json();
}

function getFileTypeLabel(mimeType) {
  const typeMap = {
    'application/pdf': 'PDF',
    'application/vnd.ms-powerpoint': 'PowerPoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
    'application/msword': 'Word',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
    'application/vnd.ms-excel': 'Excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
  };
  return typeMap[mimeType] || 'Document';
}

function openImageModal(src, filename, type) {
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  const modalVideo = document.getElementById('modalVideo');
  const modalIframe = document.getElementById('modalIframe');
  const modalCaption = document.getElementById('modalCaption');

  if (!modal || !modalImg || !modalVideo || !modalIframe || !modalCaption) return;

  modal.style.display = 'flex';
  modalImg.style.display = 'none';
  modalVideo.style.display = 'none';
  modalIframe.style.display = 'none';

  if (type === 'image') {
    modalImg.src = src;
    modalImg.style.display = 'block';
  } else if (type === 'video') {
    modalVideo.src = src;
    modalVideo.style.display = 'block';
  }

  modalCaption.textContent = filename;
}

function openDocumentModal(src, filename, type) {
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  const modalVideo = document.getElementById('modalVideo');
  const modalIframe = document.getElementById('modalIframe');
  const modalCaption = document.getElementById('modalCaption');

  if (!modal || !modalImg || !modalVideo || !modalIframe || !modalCaption) return;

  modal.style.display = 'flex';
  modalImg.style.display = 'none';
  modalVideo.style.display = 'none';
  modalIframe.style.display = 'none';

  if (type === 'pdf') {
    modalIframe.src = src;
    modalIframe.style.display = 'block';
  } else {
    const link = document.createElement('a');
    link.href = src;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => closeImageModal(), 100);
    return;
  }

  modalCaption.textContent = filename;
}

function closeImageModal() {
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  const modalVideo = document.getElementById('modalVideo');
  const modalIframe = document.getElementById('modalIframe');

  if (!modal || !modalImg || !modalVideo || !modalIframe) return;

  modal.style.display = 'none';
  modalImg.src = '';
  modalVideo.src = '';
  modalIframe.src = '';
}

function displayUploadedMedia(files) {
  if (!uploadedMedia) return;
  uploadedMedia.textContent = '';
  Array.from(files).forEach((file) => {
    if (file.type.startsWith('application/')) {
      const docElement = document.createElement('div');
      docElement.classList.add('gallery-media', 'document-file');
      docElement.style.cursor = 'pointer';
      docElement.setAttribute('data-filename', file.name);

      const icon = document.createElement('div');
      icon.className = 'document-icon';
      icon.textContent = '📄';
      const name = document.createElement('div');
      name.className = 'document-name';
      name.textContent = file.name;
      const type = document.createElement('div');
      type.className = 'document-type';
      type.textContent = getFileTypeLabel(file.type);

      docElement.appendChild(icon);
      docElement.appendChild(name);
      docElement.appendChild(type);

      const reader = new FileReader();
      reader.onload = function (e) {
        const dataUrl = e.target?.result;
        if (!dataUrl) return;
        docElement.addEventListener('click', () => {
          if (file.type === 'application/pdf') {
            openDocumentModal(dataUrl, file.name, 'pdf');
          } else {
            openDocumentModal(dataUrl, file.name, 'document');
          }
        });
      };
      reader.readAsDataURL(file);

      uploadedMedia.appendChild(docElement);
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const dataUrl = e.target?.result;
      if (!dataUrl) return;
      const mediaElement = document.createElement(
        file.type.startsWith('image') ? 'img' : 'video'
      );
      mediaElement.src = dataUrl;
      mediaElement.alt = 'Uploaded Media';
      mediaElement.classList.add('gallery-media');
      mediaElement.style.cursor = 'pointer';
      mediaElement.setAttribute('data-filename', file.name);

      if (file.type.startsWith('video')) {
        mediaElement.controls = true;
      }

      mediaElement.addEventListener('click', () => {
        openImageModal(dataUrl, file.name, file.type.startsWith('image') ? 'image' : 'video');
      });

      uploadedMedia.appendChild(mediaElement);
    };
    reader.readAsDataURL(file);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('imageModal');
  const closeBtn = document.querySelector('.image-modal-close');

  if (closeBtn) {
    closeBtn.addEventListener('click', closeImageModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeImageModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.getElementById('imageModal');
      if (activeModal && activeModal.style.display === 'flex') {
        closeImageModal();
      }
    }
  });
});

if (mediaUpload) {
  mediaUpload.addEventListener('change', function () {
    const files = Array.from(this.files || []);
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) errorMessage.textContent = '';

    if (files.length === 0) {
      if (preview) preview.textContent = '';
      return;
    }

    let isValid = true;
    const errorDetails = [];
    files.forEach((file) => {
      let fileType = file.type;
      if (!fileType) {
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
        const extensionToMime = {
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          png: 'image/png',
          mp4: 'video/mp4',
          pdf: 'application/pdf',
          ppt: 'application/vnd.ms-powerpoint',
          pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          doc: 'application/msword',
          docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          xls: 'application/vnd.ms-excel',
          xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        };
        fileType = extensionToMime[fileExtension] || fileType;
      }

      if (!ALLOWED_TYPES.includes(fileType)) {
        isValid = false;
        errorDetails.push(
          `${file.name}: Invalid file type (${file.type || 'unknown'}). Allowed: images (JPEG, PNG), videos (MP4), documents (PDF, Word, Excel, PowerPoint)`
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        isValid = false;
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        errorDetails.push(`${file.name}: File size is ${sizeMB}MB (max 10MB)`);
      }
    });

    if (!isValid) {
      const errorText =
        errorDetails.length > 0 ? errorDetails.join('\n') : 'Invalid file type or size (max 10MB).';
      if (errorMessage) errorMessage.textContent = errorText;
      this.value = '';
      if (preview) preview.textContent = '';
      showToast('Invalid file type or size (max 10MB).', 'error');
    } else {
      if (preview) {
        preview.textContent = '';
        const p = document.createElement('p');
        p.textContent = `${files.length} file(s) selected.`;
        preview.appendChild(p);
      }
      showToast(`${files.length} file(s) ready to upload.`, 'success');
    }
  });
}

const uploadForm = document.querySelector('.upload-form');
if (uploadForm && mediaUpload) {
  uploadForm.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadForm.classList.add('dragover');
  });

  uploadForm.addEventListener('dragleave', () => {
    uploadForm.classList.remove('dragover');
  });

  uploadForm.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadForm.classList.remove('dragover');
    mediaUpload.files = e.dataTransfer.files;
    mediaUpload.dispatchEvent(new Event('change'));
  });
}

if (ikUploadButton && ikMediaUpload) {
  ikUploadButton.addEventListener('click', async () => {
    const files = ikMediaUpload.files || [];
    if (files.length === 0) {
      if (ikPreview) {
        ikPreview.textContent = '';
        const p = document.createElement('p');
        p.textContent = 'Please select a file before uploading.';
        ikPreview.appendChild(p);
      }
      showToast('Select a file to upload.', 'error');
      return;
    }

    try {
      await initializeImageKit();
    } catch (error) {
      if (ikErrorMessage) {
        ikErrorMessage.textContent = 'Failed to initialize upload service. Please try again later.';
      }
      showToast('Upload service unavailable.', 'error');
      return;
    }

    if (ikErrorMessage) ikErrorMessage.textContent = '';
    if (ikPreview) {
      ikPreview.textContent = '';
      const p = document.createElement('p');
      p.textContent = `Uploading ${files.length} file(s)...`;
      ikPreview.appendChild(p);
    }
    if (ikProgressBar) ikProgressBar.style.width = '0%';
    if (ikStatusBox) ikStatusBox.textContent = '';

    let sigData;
    try {
      sigData = await getSignature();
      if (!sigData.signature || !sigData.token || !sigData.expire) {
        throw new Error('Invalid signature response');
      }
    } catch {
      if (ikErrorMessage) {
        ikErrorMessage.textContent = 'Failed to get upload signature. Please try again later.';
      }
      if (ikPreview) ikPreview.textContent = '';
      showToast('Could not get upload signature.', 'error');
      return;
    }

    let completedUploads = 0;
    let failedUploads = 0;
    const failedFiles = [];
    const failedReasons = [];
    let totalProgress = 0;
    const totalFiles = files.length;
    const maxRetries = 2;

    async function processFiles() {
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        setStatus(file.name, 'pending', 'Queued');

        const allowedTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'video/mp4',
          'application/pdf',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];
        const maxSize = 10 * 1024 * 1024;

        let fileType = file.type;
        if (!fileType) {
          const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
          const extensionToMime = {
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            mp4: 'video/mp4',
            pdf: 'application/pdf',
            ppt: 'application/vnd.ms-powerpoint',
            pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            doc: 'application/msword',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            xls: 'application/vnd.ms-excel',
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          };
          fileType = extensionToMime[fileExtension] || fileType;
        }

        if (!allowedTypes.includes(fileType)) {
          failedUploads++;
          failedFiles.push(file.name);
          failedReasons.push(
            `${file.name}: Invalid file type (${file.type || 'unknown'}). Allowed: images (JPEG, PNG), videos (MP4), documents (PDF, Word, Excel, PowerPoint)`
          );
          updateProgress();
          showToast(`${file.name}: invalid type`, 'error');
          setStatus(file.name, 'error', 'Invalid type');
          continue;
        }
        if (file.size > maxSize) {
          failedUploads++;
          failedFiles.push(file.name);
          failedReasons.push(`${file.name}: File size exceeds 10MB`);
          updateProgress();
          showToast(`${file.name}: too large (>10MB)`, 'error');
          setStatus(file.name, 'error', 'Too large (>10MB)');
          continue;
        }

        let sigDataPerFile;
        try {
          sigDataPerFile = await getSignature();
          if (!sigDataPerFile.signature || !sigDataPerFile.token || !sigDataPerFile.expire) {
            throw new Error('Invalid signature response');
          }
        } catch {
          failedUploads++;
          failedFiles.push(file.name);
          failedReasons.push(`${file.name}: Failed to get upload signature.`);
          updateProgress();
          showToast(`${file.name}: signature failed`, 'error');
          setStatus(file.name, 'error', 'Signature failed');
          continue;
        }

        async function uploadWithRetry(attempt = 0) {
          setStatus(
            file.name,
            attempt === 0 ? 'uploading' : 'retry',
            attempt === 0 ? 'Uploading...' : `Retrying (${attempt}/${maxRetries})...`
          );
          return new Promise((resolve) => {
            imagekit.upload(
              {
                file,
                fileName: file.name,
                signature: sigDataPerFile.signature,
                expire: sigDataPerFile.expire,
                token: sigDataPerFile.token,
                useUniqueFileName: true,
                onProgress: function (progress) {
                  const fileProgress = (progress.loaded / progress.total) * 100;
                  const fileWeight = 100 / totalFiles;
                  totalProgress = index * fileWeight + (fileProgress * fileWeight) / 100;
                  if (ikProgressBar) ikProgressBar.style.width = `${totalProgress}%`;
                },
              },
              async function (err) {
                if (err) {
                  if (attempt < maxRetries) {
                    const backoff = 600 * Math.pow(2, attempt);
                    setStatus(file.name, 'retry', `Retrying in ${Math.round(backoff)}ms...`);
                    setTimeout(() => resolve(uploadWithRetry(attempt + 1)), backoff);
                  } else {
                    failedUploads++;
                    failedFiles.push(file.name);
                    const reason = err?.message ? err.message : 'Unknown error';
                    failedReasons.push(`${file.name}: ${reason}`);
                    console.error(`Error uploading ${file.name}:`, err);
                    setStatus(file.name, 'error', `Failed: ${reason}`);
                    updateProgress();
                    resolve();
                  }
                } else {
                  completedUploads++;
                  setStatus(file.name, 'success', 'Uploaded');
                  updateProgress();
                  resolve();
                }
              }
            );
          });
        }

        await uploadWithRetry();
      }
    }

    function updateProgress() {
      if (completedUploads + failedUploads === totalFiles) {
        if (ikProgressBar) ikProgressBar.style.width = '100%';
        if (failedUploads > 0) {
          if (ikPreview) {
            ikPreview.textContent = '';
            const p = document.createElement('p');
            p.innerHTML = `Completed: ${completedUploads} files uploaded, ${failedUploads} failed.<br>Failed: ${failedFiles.join(
              ', '
            )}<br>${failedReasons.length ? '<br>Reasons:<br>' + failedReasons.join('<br>') : ''}`;
            ikPreview.appendChild(p);
          }
          if (ikErrorMessage) {
            ikErrorMessage.textContent =
              'Some files failed to upload. Please check file type, size, or see details below.';
          }
          showToast('Some files failed to upload.', 'error');
        } else {
          if (ikPreview) {
            ikPreview.textContent = '';
            const p = document.createElement('p');
            p.textContent = `Success! All ${completedUploads} file(s) uploaded.`;
            ikPreview.appendChild(p);
          }
          if (ikErrorMessage) ikErrorMessage.textContent = '';
          displayUploadedMedia(files);
          showToast('Upload complete!', 'success');
        }
      }
    }

    processFiles();
  });
}

