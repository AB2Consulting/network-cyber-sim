// JHS Football Kiosk Slideshow Engine
const SLIDE_DURATION = 8000; // How long each slide is shown (ms)
let currentIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('slideshow-container');

    // config.js defines the global `kioskImages` array via update_images.py
    if (!window.kioskImages || window.kioskImages.length === 0) {
        container.innerHTML = '<div class="loading">No images found. Add photos to the images/ folder and run update_images.py</div>';
        return;
    }

    // Synchronously build all slide elements
    window.kioskImages.forEach((imagePath, index) => {
        const img = document.createElement('img');
        img.classList.add('slide');
        img.id = `slide-${index}`;
        img.src = `images/${imagePath}`;
        container.appendChild(img);
    });

    // Grab all slides AFTER they are all appended to the DOM
    const slides = Array.from(document.querySelectorAll('.slide'));

    function showSlide(index) {
        slides.forEach(s => s.classList.remove('active'));
        slides[index].classList.add('active');
    }

    // Show the first slide immediately
    showSlide(0);

    // Begin cycling slides via a reliable interval
    if (slides.length > 1) {
        setInterval(() => {
            currentIndex = (currentIndex + 1) % slides.length;
            showSlide(currentIndex);
        }, SLIDE_DURATION);
    }
});
