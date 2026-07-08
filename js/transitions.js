(function () {
  var DURATION = 250;

  // Wrap everything between nav and footer so only page content slides
  var nav    = document.querySelector('body > nav');
  var footer = document.querySelector('body > footer');
  var wrapper = document.createElement('div');
  wrapper.id = 'page-content';

  var children = Array.prototype.slice.call(document.body.children);
  children.forEach(function (child) {
    if (child !== nav && child !== footer) {
      wrapper.appendChild(child);
    }
  });

  if (nav) {
    nav.insertAdjacentElement('afterend', wrapper);
  } else {
    document.body.insertBefore(wrapper, document.body.firstChild);
  }

  document.addEventListener('click', function (e) {
    var anchor = e.target.closest('a');
    if (!anchor) return;
    var href = anchor.getAttribute('href');
    if (!href) return;
    if (anchor.target === '_blank') return;
    if (/^(mailto:|tel:|#)/.test(href)) return;
    if (anchor.origin && anchor.origin !== location.origin) return;
    if (href.indexOf('#') !== -1 && href.split('#')[0] === location.pathname.split('/').pop()) return;

    e.preventDefault();
    wrapper.style.transition = 'opacity ' + DURATION + 'ms linear';
    wrapper.style.opacity = '0';
    setTimeout(function () { location.href = href; }, DURATION);
  });
})();
