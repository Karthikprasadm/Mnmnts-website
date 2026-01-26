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
            const response = await fetch('/api/gallery-data');
            if (!response.ok) {
                throw new Error('Failed to load gallery data');
            }
            galleryData = await response.json();
            await loadVideosData();
            initializeGallery();
        } catch (error) {
            console.error('Error loading gallery data:', error);
            
            // Show user-friendly error message
            if (typeof errorHandler !== 'undefined') {
                errorHandler.handleImageError(null, error);
            }
            
            // Final fallback: show default image
            if (displayedImage) {
                displayedImage.src = 'https://ik.imagekit.io/ijv7nmfqx/Website_showcase/875320.jpg?updatedAt=1748107186320&v=2';
                displayedImage.alt = 'Main gallery image';
            }
        }
    }

    // Load videos data from JSON file
    async function loadVideosData() {
        try {
            const response = await fetch('/api/videos-data');
            if (!response.ok) {
                throw new Error('Failed to load videos data');
            }
            videosData = await response.json();
        } catch (error) {
            console.error('Error loading videos data:', error);
            
            // Show user-friendly error message
            if (typeof errorHandler !== 'undefined') {
                errorHandler.handleImageError(null, error);
            }
            
            // Fallback: empty videos array
            videosData = { videos: [] };
        }
    }

    // Helper function to hide skeleton
    function hideSkeleton(skeletonElement) {
        if (skeletonElement) {
            skeletonElement.classList.add('fade-out');
            setTimeout(() => {
                skeletonElement.style.display = 'none';
            }, 300);
        }
    }

    // Helper function to show skeleton
    function showSkeleton(skeletonElement) {
        if (skeletonElement) {
            skeletonElement.style.display = 'block';
            skeletonElement.classList.remove('fade-out');
        }
    }

    // Create skeleton thumbnail
    function createSkeletonThumb() {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton skeleton-thumb';
        skeleton.setAttribute('aria-hidden', 'true');
        return skeleton;
    }

    // Initialize gallery with loaded data
    function initializeGallery() {
        if (!galleryData) return;

        // Show main image skeleton
        const mainImageSkeleton = document.getElementById('mainImageSkeleton');
        if (mainImageSkeleton && displayedImage) {
            showSkeleton(mainImageSkeleton);
        }

        // Set default image with loading state
        if (galleryData.defaultImage && displayedImage) {
            displayedImage.classList.add('loading');
            displayedImage.src = galleryData.defaultImage.image;
            displayedImage.alt = galleryData.defaultImage.alt;
            
            // Hide skeleton when image loads
            displayedImage.onload = function() {
                this.classList.remove('loading');
                this.classList.add('loaded');
                hideSkeleton(mainImageSkeleton);
            };
            
            // Handle image load errors
            displayedImage.onerror = function() {
                this.classList.remove('loading');
                hideSkeleton(mainImageSkeleton);
            };
        }

        // Create image thumbnails with skeletons
        if (galleryData.images && thumbnailsContainer) {
            galleryData.images.forEach((imgData, index) => {
                // Create skeleton first
                const skeleton = createSkeletonThumb();
                thumbnailsContainer.appendChild(skeleton);
                
                // Create actual thumbnail
                const thumb = document.createElement('img');
                thumb.className = 'thumb loading' + (index === 0 ? ' active' : '');
                thumb.src = imgData.thumbnail; // Set src immediately to start loading
                thumb.setAttribute('data-src', imgData.image);
                thumb.alt = imgData.alt || `Gallery thumbnail ${index + 1}`;
                thumb.tabIndex = 0;
                thumb.loading = 'lazy';
                thumb.setAttribute('role', 'button');
                thumb.setAttribute('aria-label', `View image ${index + 1}`);
                thumb.style.opacity = '0'; // Use opacity instead of display to allow loading
                thumb.style.position = 'absolute'; // Position absolutely to overlay skeleton
                
                // Show image and hide skeleton when loaded
                thumb.onload = function() {
                    this.classList.remove('loading');
                    this.classList.add('loaded');
                    this.style.opacity = '1';
                    this.style.position = 'relative'; // Change to relative when visible
                    hideSkeleton(skeleton);
                };
                
                // Handle load errors
                thumb.onerror = function() {
                    this.classList.remove('loading');
                    this.style.opacity = '1';
                    this.style.position = 'relative';
                    hideSkeleton(skeleton);
                };
                
                thumbnailsContainer.appendChild(thumb);
                thumbnails.push(thumb);
                imageList.push(imgData.image);
            });
            
            // Add "view more" link after all thumbnails
            const viewMoreLink = document.createElement('a');
            viewMoreLink.href = '../ElasticGridScroll/index.html';
            viewMoreLink.textContent = '◯';
            viewMoreLink.className = 'portal-circle';
            thumbnailsContainer.appendChild(viewMoreLink);

            const portalLabel = document.createElement('span');
            portalLabel.textContent = 'View in';
            portalLabel.className = 'portal-label';
            thumbnailsContainer.appendChild(portalLabel);
        }

        // Create video thumbnails with skeletons
        if (videosData && videosData.videos && videosData.videos.length > 0 && videoThumbnailsContainer && displayedVideo) {
            videosData.videos.forEach((videoData, index) => {
                // Create skeleton first
                const skeleton = createSkeletonThumb();
                videoThumbnailsContainer.appendChild(skeleton);
                
                // Create actual video thumbnail
                const videoThumb = document.createElement('img');
                videoThumb.className = 'video-thumb loading' + (index === 0 ? ' active' : '');
                videoThumb.src = videoData.thumbnail; // Set src immediately to start loading
                videoThumb.setAttribute('data-src', videoData.video);
                videoThumb.alt = videoData.alt || `Video thumbnail ${index + 1}`;
                videoThumb.tabIndex = 0;
                videoThumb.loading = 'lazy';
                videoThumb.setAttribute('role', 'button');
                videoThumb.setAttribute('aria-label', `Play video ${index + 1}`);
                videoThumb.style.opacity = '0'; // Use opacity instead of display to allow loading
                videoThumb.style.position = 'absolute'; // Position absolutely to overlay skeleton
                videoThumb.style.zIndex = '2'; // Ensure thumbnail is above skeleton
                
                // Append to container first so it can load
                videoThumbnailsContainer.appendChild(videoThumb);
                videoThumbnails.push(videoThumb);
                
                // Show image and hide skeleton when loaded
                const handleThumbLoad = function() {
                    videoThumb.classList.remove('loading');
                    videoThumb.classList.add('loaded');
                    videoThumb.style.opacity = '1';
                    videoThumb.style.position = 'relative'; // Change to relative when visible
                    videoThumb.style.zIndex = '1'; // Reset z-index when visible
                    hideSkeleton(skeleton);
                };
                
                // Check if image is already loaded (cached)
                if (videoThumb.complete && videoThumb.naturalHeight !== 0) {
                    handleThumbLoad();
                } else {
                    videoThumb.onload = handleThumbLoad;
                }
                
                // Error handling for thumbnail loading
                videoThumb.onerror = function() {
                    console.error('Failed to load video thumbnail:', videoData.thumbnail);
                    this.classList.remove('loading');
                    this.style.opacity = '1';
                    this.style.position = 'relative';
                    this.style.zIndex = '1';
                    this.style.backgroundColor = 'rgba(60, 60, 60, 0.5)';
                    hideSkeleton(skeleton);
                    
                    // Show user-friendly error if error handler is available
                    if (typeof errorHandler !== 'undefined') {
                        errorHandler.handleImageError(this, null);
                    }
                };

                // Set first video as default and load it
                if (index === 0 && displayedVideo) {
                    const source = document.createElement('source');
                    source.src = videoData.video; // Set src directly, not data-src
                    source.type = 'video/mp4';
                    displayedVideo.appendChild(source);
                    
                    // Load and display the first video
                    displayedVideo.load();
                    
                    // Handle video load
                    const handleVideoLoad = function() {
                        displayedVideo.style.opacity = "1";
                        displayedVideo.style.pointerEvents = "auto";
                    };
                    
                    // Check if video is already loaded
                    if (displayedVideo.readyState >= 2) {
                        handleVideoLoad();
                    } else {
                        // Use multiple event listeners to ensure video becomes visible
                        const loadHandler = function() {
                            handleVideoLoad();
                        };
                        displayedVideo.addEventListener('loadeddata', loadHandler, { once: true });
                        displayedVideo.addEventListener('canplay', loadHandler, { once: true });
                        displayedVideo.addEventListener('loadedmetadata', loadHandler, { once: true });
                        
                        // Fallback: make visible after a short delay if events don't fire
                        setTimeout(() => {
                            if (displayedVideo.readyState >= 1) {
                                handleVideoLoad();
                            }
                        }, 1000);
                    }
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
        
        // Show skeleton when changing image (skeleton is absolutely positioned, won't affect layout)
        const mainImageSkeleton = document.getElementById('mainImageSkeleton');
        if (mainImageSkeleton) {
            showSkeleton(mainImageSkeleton);
        }
        displayedImage.classList.add('loading');
        displayedImage.classList.remove('loaded');
        
        // Use opacity transition only, no transform to prevent layout shifts
        displayedImage.style.transition = "opacity 0.35s cubic-bezier(0.4,0,0.2,1)";
        displayedImage.style.opacity = "0";
        setTimeout(() => {
            displayedImage.src = imageUrl;
            displayedImage.onload = function() {
                this.classList.remove('loading');
                this.classList.add('loaded');
                this.style.opacity = "1";
                this.style.transform = "none";
                if (mainImageSkeleton) {
                    hideSkeleton(mainImageSkeleton);
                }
            };
            displayedImage.onerror = function() {
                this.classList.remove('loading');
                this.style.opacity = "1";
                this.style.transform = "none";
                if (mainImageSkeleton) {
                    hideSkeleton(mainImageSkeleton);
                }
                console.error('Failed to load image:', imageUrl);
            };
        }, 50);

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
        
        // Show skeleton when changing video (skeleton is absolutely positioned, won't affect layout)
        const videoSkeleton = document.getElementById('videoSkeleton');
        if (videoSkeleton) {
            showSkeleton(videoSkeleton);
        }
        
        // Pause current video first to prevent any playback issues
        displayedVideo.pause();
        
        // Use opacity instead of display to prevent layout shifts
        displayedVideo.style.transition = "opacity 0.35s cubic-bezier(0.4,0,0.2,1)";
        displayedVideo.style.opacity = "0";
        displayedVideo.style.pointerEvents = "none";
        // Ensure video maintains its dimensions
        displayedVideo.style.width = "90%";
        displayedVideo.style.maxWidth = "800px";
        displayedVideo.style.height = "auto";
        
        const source = displayedVideo.querySelector('source');
        if (source) {
            source.src = videoUrl;
            // Use requestAnimationFrame to ensure smooth transition
            requestAnimationFrame(() => {
                displayedVideo.load();
            });
            
            // Hide skeleton when video can play - use multiple event listeners
            const videoLoadHandler = function() {
                if (videoSkeleton) {
                    hideSkeleton(videoSkeleton);
                }
                // Small delay to ensure video is ready
                requestAnimationFrame(() => {
                    displayedVideo.style.opacity = "1";
                    displayedVideo.style.pointerEvents = "auto";
                });
            };
            displayedVideo.addEventListener('loadeddata', videoLoadHandler, { once: true });
            displayedVideo.addEventListener('canplay', videoLoadHandler, { once: true });
            displayedVideo.addEventListener('loadedmetadata', videoLoadHandler, { once: true });
            
            // Fallback: make visible after a short delay if events don't fire
            setTimeout(() => {
                if (displayedVideo.readyState >= 1) {
                    videoLoadHandler();
                }
            }, 1000);
            
            displayedVideo.play().catch(err => {
                console.error('Failed to play video:', err);
                if (videoSkeleton) {
                    hideSkeleton(videoSkeleton);
                }
                displayedVideo.style.opacity = "1";
                displayedVideo.style.pointerEvents = "auto";
            });
        }
        displayedVideo.onerror = function() {
            console.error('Failed to load video:', videoUrl);
            if (videoSkeleton) {
                hideSkeleton(videoSkeleton);
            }
            displayedVideo.style.opacity = "1";
            displayedVideo.style.pointerEvents = "auto";
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
            const videoSkeleton = document.getElementById('videoSkeleton');
            const source = displayedVideo.querySelector('source');
            if (source && source.dataset.src) {
                // Show skeleton while loading
                if (videoSkeleton) {
                    showSkeleton(videoSkeleton);
                }
                displayedVideo.style.opacity = "0";
                displayedVideo.style.transition = "opacity 0.35s cubic-bezier(0.4,0,0.2,1)";
                source.src = source.dataset.src;
                displayedVideo.load();
                
                // Hide skeleton when video is ready
                displayedVideo.addEventListener('loadeddata', function() {
                    if (videoSkeleton) {
                        hideSkeleton(videoSkeleton);
                    }
                    displayedVideo.style.opacity = "1";
                    displayedVideo.style.pointerEvents = "auto";
                }, { once: true });
            }
        }
    }

    // Note: Tooltips are auto-initialized by tooltips.js (IIFE)
    // No need to manually initialize here to avoid duplication

    // Start loading gallery data
    loadGalleryData();
});
