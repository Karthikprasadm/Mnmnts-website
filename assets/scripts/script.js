document.addEventListener("DOMContentLoaded", function () {
    const thumbnails = document.querySelectorAll(".thumb");
    const displayedImage = document.getElementById("displayedImage");
    const slideshowToggle = document.getElementById("slideshowToggle");
    let slideshowInterval;
    let isSlideshowActive = false;
    const imageList = Array.from(thumbnails).map(thumb => thumb.getAttribute("data-src"));
    let currentIndex = 0;

    // Lazy load thumbnails
    const lazyLoad = (thumb) => {
        const src = thumb.getAttribute("data-src");
        thumb.setAttribute("src", src);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                lazyLoad(entry.target);
                observer.unobserve(entry.target);
            }
        });
    });

    thumbnails.forEach(thumb => observer.observe(thumb));

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
                // If image fails to load, restore visibility with fallback
                displayedImage.style.opacity = "1";
                displayedImage.style.transform = "scale(1)";
                console.error('Failed to load image:', imageUrl);
            };
        }, 80);

        thumbnails.forEach(thumb => thumb.classList.remove("active"));
        thumbnail.classList.add("active");
    }

    // Event delegation for thumbnails
    const thumbnailsContainer = document.querySelector(".thumbnails");
    if (thumbnailsContainer) {
        thumbnailsContainer.addEventListener("click", function (e) {
            if (e.target.classList.contains("thumb")) {
                const imageUrl = e.target.getAttribute("data-src");
                changeImage(e.target, imageUrl);
                stopSlideshow(); // Stop slideshow when manually changing images
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
            currentIndex = (currentIndex + 1) % imageList.length; // Cycle through images
            const nextThumbnail = thumbnails[currentIndex];
            if (nextThumbnail && imageList[currentIndex]) {
                changeImage(nextThumbnail, imageList[currentIndex]);
            }
        }, 1500); // Change image every 1.5 seconds
    }

    function stopSlideshow() {
        clearInterval(slideshowInterval);
        isSlideshowActive = false;
        if (slideshowToggle) slideshowToggle.textContent = "🌙"; // Reset button text
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

    // Video functionality
    const videoThumbnails = document.querySelectorAll(".video-thumb");
    const displayedVideo = document.getElementById("displayedVideo");

    // Change video function
    function changeVideo(thumbnail, videoUrl) {
        if (!displayedVideo || !thumbnail || !videoUrl) return;
        displayedVideo.src = videoUrl;
        displayedVideo.load();
        displayedVideo.play().catch(err => {
            console.error('Failed to play video:', err);
            // Video might need user interaction to play
        });
        displayedVideo.onerror = function() {
            console.error('Failed to load video:', videoUrl);
        };
        videoThumbnails.forEach(thumb => thumb.classList.remove("active"));
        thumbnail.classList.add("active");
    }

    const videoThumbnailsContainer = document.querySelector(".video-thumbnails");
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

    // Upload functionality is handled in upload.html, removed duplicate code

    // Home page menu bubble detach animation
    const body = document.body;
    if (body.classList.contains("home-page")) {
        const nav = document.querySelector(".navbar");
        const menuBubble = document.querySelector(".menu-button-separate");
        if (nav && menuBubble) {
            const updateMenuPosition = () => {
                const navRect = nav.getBoundingClientRect();
                const menuRect = menuBubble.getBoundingClientRect();
                const targetTop = navRect.top + navRect.height / 2 - menuRect.height / 2 + window.scrollY;
                document.documentElement.style.setProperty("--menu-detach-top", `${targetTop}px`);
            };

            // Initial position calculation
            updateMenuPosition();
            window.addEventListener("resize", updateMenuPosition);
            window.addEventListener("scroll", updateMenuPosition);

            // Trigger detach animation after initial render
            setTimeout(() => {
                body.classList.add("menu-detach-active");
            }, 800);
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
                // Remove title attribute to prevent native tooltip
                element.removeAttribute('title');
            }
        });
    }

    initTooltips();
});
