document.addEventListener("DOMContentLoaded", function () {
    const displayedImage = document.getElementById("displayedImage");
    const slideshowToggle = document.getElementById("slideshowToggle");
    const thumbnailsContainer = document.getElementById("thumbnailsContainer");
    const videoThumbnailsContainer = document.getElementById("videoThumbnailsContainer");
    const displayedVideo = document.getElementById("displayedVideo");
    
    let slideshowInterval;
    let isSlideshowActive = false;
    let galleryData = null;
    let videosData = null;
    let thumbnails = [];
    let videoThumbnails = [];
    let imageList = [];
    let currentIndex = 0;

    // Load gallery data from JSON file
    async function loadGalleryData() {
        try {
            const response = await fetch('../assets/images/gallery-data.json');
            if (!response.ok) {
                throw new Error('Failed to load gallery data');
            }
            galleryData = await response.json();
            await loadVideosData();
            initializeGallery();
        } catch (error) {
            console.error('Error loading gallery data:', error);
            // Fallback: show error message or use default image
            if (displayedImage) {
                displayedImage.src = 'https://ik.imagekit.io/ijv7nmfqx/Website_showcase/875320.jpg?updatedAt=1748107186320&v=2';
                displayedImage.alt = 'Main gallery image';
            }
        }
    }

    // Load videos data from separate JSON file
    async function loadVideosData() {
        try {
            const response = await fetch('../assets/videos/videos-data.json');
            if (!response.ok) {
                throw new Error('Failed to load videos data');
            }
            videosData = await response.json();
        } catch (error) {
            console.error('Error loading videos data:', error);
            videosData = { videos: [] };
        }
    }

    // Initialize gallery with loaded data
    function initializeGallery() {
        if (!galleryData) return;

        // Set default image
        if (galleryData.defaultImage && displayedImage) {
            displayedImage.src = galleryData.defaultImage.image;
            displayedImage.alt = galleryData.defaultImage.alt;
        }

        // Create image thumbnails
        if (galleryData.images && thumbnailsContainer) {
            galleryData.images.forEach((imgData, index) => {
                const thumb = document.createElement('img');
                thumb.className = 'thumb' + (index === 0 ? ' active' : '');
                thumb.src = imgData.thumbnail;
                thumb.setAttribute('data-src', imgData.image);
                thumb.alt = imgData.alt || `Gallery thumbnail ${index + 1}`;
                thumb.tabIndex = 0;
                thumb.loading = 'lazy';
                thumb.setAttribute('role', 'button');
                thumb.setAttribute('aria-label', `View image ${index + 1}`);
                thumbnailsContainer.appendChild(thumb);
                thumbnails.push(thumb);
                imageList.push(imgData.image);
            });
        }

        // Create video thumbnails
        if (videosData && videosData.videos && videoThumbnailsContainer && displayedVideo) {
            videosData.videos.forEach((videoData, index) => {
                const videoThumb = document.createElement('img');
                videoThumb.className = 'video-thumb' + (index === 0 ? ' active' : '');
                videoThumb.src = videoData.thumbnail;
                videoThumb.setAttribute('data-src', videoData.video);
                videoThumb.alt = videoData.alt || `Video thumbnail ${index + 1}`;
                videoThumb.tabIndex = 0;
                videoThumb.loading = 'lazy';
                videoThumb.setAttribute('role', 'button');
                videoThumb.setAttribute('aria-label', `Play video ${index + 1}`);
                
                // Error handling for thumbnail loading
                videoThumb.onerror = function() {
                    console.error('Failed to load video thumbnail:', videoData.thumbnail);
                    // Optionally set a fallback or placeholder
                    this.style.backgroundColor = 'rgba(60, 60, 60, 0.5)';
                };
                
                videoThumbnailsContainer.appendChild(videoThumb);
                videoThumbnails.push(videoThumb);

                // Set first video as default
                if (index === 0) {
                    const source = document.createElement('source');
                    source.setAttribute('data-src', videoData.video);
                    source.type = 'video/mp4';
                    displayedVideo.appendChild(source);
                }
            });
        }

        // Initialize lazy loading observer (only for image thumbnails, not video thumbnails)
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const thumb = entry.target;
                    // Only apply lazy loading to image thumbnails (they have data-src with image URL)
                    // Video thumbnails already have their src set and data-src contains video URL
                    if (thumb.classList.contains('thumb')) {
                        const src = thumb.getAttribute("data-src");
                        if (src) {
                            thumb.setAttribute("src", src);
                        }
                    }
                    observer.unobserve(thumb);
                }
            });
        });

        // Only observe image thumbnails for lazy loading
        thumbnails.forEach(thumb => observer.observe(thumb));
        // Video thumbnails are already loaded (src is set directly), no lazy loading needed

        // Initialize event listeners
        setupEventListeners();
    }

    // Setup event listeners
    function setupEventListeners() {
        // Change image function
        function changeImage(thumbnail, imageUrl) {
            if (!displayedImage || !thumbnail || !imageUrl) return;
            displayedImage.style.transition = "opacity 0.45s cubic-bezier(0.4,0,0.2,1), transform 0.45s cubic-bezier(0.4,0,0.2,1)";
            displayedImage.style.opacity = "0";
            displayedImage.style.transform = "scale(0.96)";
            setTimeout(() => {
                displayedImage.src = imageUrl;
                displayedImage.onload = function() {
                    displayedImage.style.opacity = "1";
                    displayedImage.style.transform = "scale(1)";
                };
                displayedImage.onerror = function() {
                    displayedImage.style.opacity = "1";
                    displayedImage.style.transform = "scale(1)";
                    console.error('Failed to load image:', imageUrl);
                };
            }, 80);

            thumbnails.forEach(thumb => thumb.classList.remove("active"));
            thumbnail.classList.add("active");
        }

        // Event delegation for thumbnails
        if (thumbnailsContainer) {
            thumbnailsContainer.addEventListener("click", function (e) {
                if (e.target.classList.contains("thumb")) {
                    const imageUrl = e.target.getAttribute("data-src");
                    changeImage(e.target, imageUrl);
                    stopSlideshow();
                }
            });
            // Keyboard navigation for thumbnails
            thumbnailsContainer.addEventListener("keydown", function (e) {
                if (e.target.classList.contains("thumb") && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    const imageUrl = e.target.getAttribute("data-src");
                    changeImage(e.target, imageUrl);
                    stopSlideshow();
                }
            });
        }

        // Slideshow functions
        function startSlideshow() {
            if (imageList.length === 0 || thumbnails.length === 0) {
                console.warn('Cannot start slideshow: No images available');
                return;
            }
            slideshowInterval = setInterval(() => {
                currentIndex = (currentIndex + 1) % imageList.length;
                const nextThumbnail = thumbnails[currentIndex];
                if (nextThumbnail && imageList[currentIndex]) {
                    changeImage(nextThumbnail, imageList[currentIndex]);
                }
            }, 1500);
        }

        function stopSlideshow() {
            clearInterval(slideshowInterval);
            isSlideshowActive = false;
            if (slideshowToggle) slideshowToggle.textContent = "🌙";
        }

        // Slideshow toggle
        if (slideshowToggle) {
            slideshowToggle.addEventListener("click", function () {
                isSlideshowActive = !isSlideshowActive;
                this.textContent = isSlideshowActive ? "🌕" : "🌙";
                if (isSlideshowActive) {
                    startSlideshow();
                } else {
                    stopSlideshow();
                }
            });
        }

        // Double-click to enter fullscreen
        if (displayedImage) {
            displayedImage.addEventListener("dblclick", function () {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    if (displayedImage.requestFullscreen) {
                        displayedImage.requestFullscreen();
                    } else if (displayedImage.mozRequestFullScreen) {
                        displayedImage.mozRequestFullScreen();
                    } else if (displayedImage.webkitRequestFullscreen) {
                        displayedImage.webkitRequestFullscreen();
                    } else if (displayedImage.msRequestFullscreen) {
                        displayedImage.msRequestFullscreen();
                    }
                }
            });
        }

        // Handle fullscreen change events
        function handleFullscreenChange() {
            if (displayedImage) {
                if (document.fullscreenElement) {
                    displayedImage.classList.add("fullscreen");
                } else {
                    displayedImage.classList.remove("fullscreen");
                }
            }
        }
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
        document.addEventListener("mozfullscreenchange", handleFullscreenChange);
        document.addEventListener("MSFullscreenChange", handleFullscreenChange);

        // Change video function
        function changeVideo(thumbnail, videoUrl) {
            if (!displayedVideo || !thumbnail || !videoUrl) return;
            const source = displayedVideo.querySelector('source');
            if (source) {
                source.src = videoUrl;
                displayedVideo.load();
                displayedVideo.play().catch(err => {
                    console.error('Failed to play video:', err);
                });
            }
            displayedVideo.onerror = function() {
                console.error('Failed to load video:', videoUrl);
            };
            videoThumbnails.forEach(thumb => thumb.classList.remove("active"));
            thumbnail.classList.add("active");
        }

        // Video thumbnail event listeners
        if (videoThumbnailsContainer) {
            videoThumbnailsContainer.addEventListener("click", function (e) {
                if (e.target.classList.contains("video-thumb")) {
                    const videoUrl = e.target.getAttribute("data-src");
                    changeVideo(e.target, videoUrl);
                }
            });
            // Keyboard navigation for video thumbnails
            videoThumbnailsContainer.addEventListener("keydown", function (e) {
                if (e.target.classList.contains("video-thumb") && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    const videoUrl = e.target.getAttribute("data-src");
                    changeVideo(e.target, videoUrl);
                }
            });
        }

        // Lazy load video source
        if (displayedVideo) {
            const source = displayedVideo.querySelector('source');
            if (source && source.dataset.src) {
                source.src = source.dataset.src;
                displayedVideo.load();
            }
        }
    }

    // Initialize custom tooltips
    function initTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(element => {
            const tooltipText = element.getAttribute('data-tooltip');
            if (tooltipText) {
                const tooltip = document.createElement('span');
                tooltip.className = 'custom-tooltip';
                tooltip.textContent = tooltipText;
                element.appendChild(tooltip);
                element.removeAttribute('title');
            }
        });
    }

    // Start loading gallery data
    loadGalleryData();
    initTooltips();
});
