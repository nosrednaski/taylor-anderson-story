(function () {
  var overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');

  var closeBtn = document.createElement('span');
  closeBtn.className = 'lightbox-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.setAttribute('aria-label', 'Close');

  var lbImg = document.createElement('img');
  lbImg.alt = '';

  overlay.appendChild(closeBtn);
  overlay.appendChild(lbImg);
  document.body.appendChild(overlay);

  function openLightbox(src, alt) {
    lbImg.src = src;
    lbImg.alt = alt || '';
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    overlay.classList.remove('active');
    lbImg.src = '';
    document.body.style.overflow = '';
  }

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay || e.target === closeBtn) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });

  // Make all gallery/figure/feature images clickable
  var selectors = [
    '.gallery img',
    '.fig img',
    '.photo-strip img',
    '.split img',
    '.director-card img',
    '.andersons-grid img',
    '[data-lightbox] img',
    '[data-lightbox]'
  ];

  document.querySelectorAll(selectors.join(', ')).forEach(function (el) {
    var imgEl = el.tagName === 'IMG' ? el : el.querySelector('img');
    if (!imgEl) return;
    imgEl.style.cursor = 'zoom-in';
    imgEl.addEventListener('click', function (e) {
      e.stopPropagation();
      openLightbox(imgEl.src, imgEl.alt);
    });
  });
})();
