(function () {
  var items = [];

  function init() {
    document.querySelectorAll('.split img, .photo-strip img, .fig-full img').forEach(function (img) {
      var wrapper = img.closest('.fig, .split, .photo-strip');
      if (wrapper) wrapper.style.overflow = 'hidden';
      items.push({ img: img, speed: img.closest('.fig-full') ? 0.1 : 0.18 });
    });
    tick();
  }

  function tick() {
    var vh = window.innerHeight;
    items.forEach(function (item) {
      var rect = item.img.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;
      var offset = (rect.top + rect.height / 2 - vh / 2) * item.speed;
      item.img.style.transform = 'translateY(' + offset + 'px)';
    });
  }

  window.addEventListener('scroll', tick, { passive: true });
  window.addEventListener('resize', tick, { passive: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
