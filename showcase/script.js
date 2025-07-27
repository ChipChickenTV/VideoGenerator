const modal = document.getElementById('videoModal');
const modalVideo = document.getElementById('modalVideoPlayer');
const videoContainers = document.querySelectorAll('.video-container');
const closeBtn = document.querySelector('.close');

videoContainers.forEach(container => {
    container.addEventListener('click', () => {
        const videoSrc = container.getAttribute('data-video-src');
        modalVideo.src = videoSrc;
        modal.classList.add('active');
    });
});

function closeModal() {
    modal.classList.remove('active');
    modalVideo.pause();
    modalVideo.src = '';
}

closeBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Filter logic
const filterButtons = document.querySelectorAll('.filter-btn');
const categoryContainers = document.querySelectorAll('.category');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Manage active button state
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const selectedCategory = button.getAttribute('data-category');

        // Filter categories
        categoryContainers.forEach(container => {
            const containerCategory = container.getAttribute('data-category');
            if (selectedCategory === 'all' || selectedCategory === containerCategory) {
                container.style.display = 'block';
            } else {
                container.style.display = 'none';
            }
        });
    });
});