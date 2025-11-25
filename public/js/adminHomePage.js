document.getElementById('create-event').onclick = function () {
  location.href = '/createEvent';
};

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
});
