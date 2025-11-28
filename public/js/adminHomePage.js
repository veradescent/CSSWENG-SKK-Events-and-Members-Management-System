// Guard the create-event button in case it's not present for non-admin users
const createEventBtn = document.getElementById('create-event');
if (createEventBtn) {
  createEventBtn.onclick = function () {
    location.href = '/createEvent';
  };
}

document.addEventListener('DOMContentLoaded', function () {
  const carousel = document.getElementById('eventsCarousel');
  const leftBtn = document.getElementById('carouselLeft');
  const rightBtn = document.getElementById('carouselRight');

  if (!carousel || !leftBtn || !rightBtn) return;

  const cards = carousel.querySelectorAll('.event-card-wrapper');
  let currentIndex = 0;
  let cardsPerView = 3;

  // Calculate cards per view based on screen size
  function updateCardsPerView() {
    const width = window.innerWidth;
    if (width <= 576) {
      cardsPerView = 1;
    } else if (width <= 992) {
      cardsPerView = 2;
    } else {
      cardsPerView = 3;
    }
    updateCarousel();
  }

  function updateCarousel() {
    const maxIndex = Math.max(0, cards.length - cardsPerView);
    currentIndex = Math.min(currentIndex, maxIndex);

    const cardWidth = cards[0]?.offsetWidth || 0;
    const gap = 24;
    const offset = currentIndex * (cardWidth + gap);

    carousel.style.transform = `translateX(-${offset}px)`;

    leftBtn.disabled = currentIndex === 0;
    rightBtn.disabled = currentIndex >= maxIndex;
  }

  leftBtn.addEventListener('click', function () {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  });

  rightBtn.addEventListener('click', function () {
    const maxIndex = Math.max(0, cards.length - cardsPerView);
    if (currentIndex < maxIndex) {
      currentIndex++;
      updateCarousel();
    }
  });

  window.addEventListener('resize', updateCardsPerView);
  updateCardsPerView();
  
  // --- Slideshow: auto-rotate images, no arrows, pause on hover ---
  function initHomepageSlideshow() {
    const container = document.getElementById('homepageSlideshow');
    if (!container) return;
    const slides = Array.from(container.querySelectorAll('.slide'));
    if (!slides.length) return;

    let current = 0;
    const intervalMs = 4000;
    let intervalId = null;

    function show(index) {
      index = (index + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle('active', i === index));
      current = index;
    }

    function next() { show(current + 1); }

    function start() {
      stop();
      intervalId = setInterval(next, intervalMs);
    }

    function stop() {
      if (intervalId) { clearInterval(intervalId); intervalId = null; }
    }

    // pause on hover/focus
    container.addEventListener('mouseenter', stop);
    container.addEventListener('mouseleave', start);
    container.addEventListener('focusin', stop);
    container.addEventListener('focusout', start);

    // initialize
    slides.forEach(s => s.style.transition = 'opacity 600ms ease');
    show(0);
    start();
  }

  initHomepageSlideshow();
});
