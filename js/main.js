/* =========================================================================
   Richard's Tree Care — main.js
   Vanilla JavaScript. Zero dependencies. No build step.

   Contents
     1.  Icon set
     2.  CSV helpers (Google Sheets, Phase 2)
     3.  Collection loader (CSV with hard-coded fallback)
     4.  Services grid
     5.  FAQ accordion
     5b. Gallery grid
     6.  Header: height variable, scrolled state, mobile nav
     7.  IntersectionObserver: reveals + scrollspy
     8.  Lightbox (native <dialog>)
     9.  Contact form (Formspree)
    10.  Misc
   ========================================================================= */
(function () {
  'use strict';

  var CONFIG = window.RTC_CONFIG || {};
  var DATA   = window.RTC_DATA   || { services: [], faqs: [], gallery: [] };

  /* ---------------------------------------------------------------------
     1. ICONS — monoline 24x24, inherit currentColor
     --------------------------------------------------------------------- */
  var ICONS = {
    crown:     '<path d="M12 21v-6"/><path d="M7.5 15a5 5 0 0 1-1.4-9.8A4.8 4.8 0 0 1 12 2.8a4.8 4.8 0 0 1 5.9 2.4A5 5 0 0 1 16.5 15Z"/><path d="M12 15 9 12M12 12l3-3"/>',
    pollard:   '<path d="M12 21V7"/><path d="m12 10-4-4M12 12l4-4M12 7V3.5"/><path d="M6 6h.01M18 8h.01"/>',
    deadwood:  '<path d="M3.5 20.5 13 11"/><path d="M13 11h6V5"/><path d="m8.5 15.5-4-1M11.5 12.5l1-4"/><path d="m16 14 3 3m0-3-3 3"/>',
    fell:      '<path d="M12 21v-4.5"/><path d="M6 10.5a6 6 0 1 1 12 0 6 6 0 0 1-12 0Z"/><path d="M17.5 17.5 21 21m0 0h-3.5m3.5 0v-3.5"/>',
    stump:     '<ellipse cx="12" cy="8" rx="8" ry="3.4"/><path d="M4 8v5.2c0 1.9 3.6 3.4 8 3.4s8-1.5 8-3.4V8"/><ellipse cx="12" cy="8" rx="3" ry="1.2"/>',
    brace:     '<path d="M12 21V11"/><path d="m12 11-5-6M12 11l5-6"/><path d="M8 8.5h8"/><path d="M8 8.5h.01M16 8.5h.01"/>',
    hedge:     '<rect x="3" y="8.5" width="18" height="10" rx="2.5"/><path d="M3 12.5h18"/><path d="M8 8.5V5.5M16 8.5V5.5M12 8.5v-4"/>',
    clearance: '<path d="m14 3 7 7"/><path d="m3.5 20.5 7-7"/><path d="m8 12 4 4M11 9l4 4"/><path d="M3 21h6"/>',
    storm:     '<path d="M17 14.5a4 4 0 0 0-.8-7.9A5.6 5.6 0 0 0 5.4 8.5 3.5 3.5 0 0 0 6 14.5"/><path d="m13 11-3 5h3.5L10.5 21"/>',
    woodland:  '<path d="M8 21v-3.5M16.5 21v-2.5"/><path d="M8 17.5 4.2 11.5h7.6Z"/><path d="m8 12.5-2.6-4h5.2Z"/><path d="M16.5 18.5 13.4 13.5h6.2Z"/>',
    survey:    '<rect x="3.5" y="3" width="11" height="15" rx="2"/><path d="M7 3V2h4v1"/><path d="M6.5 8h5M6.5 11.5h3"/><circle cx="16.5" cy="16.5" r="3.5"/><path d="m19.2 19.2 2 2"/>',
    planning:  '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="m9 13.5 2 2 4-4"/>',
    leaf:      '<path d="M4 20C4 10.6 10.6 4 20 4c0 9.4-6.6 16-16 16Z"/><path d="M4 20 12.5 11.5"/>'
  };

  function icon(name) {
    var body = ICONS[name] || ICONS.leaf;
    return '<svg class="svc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
           'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
           body + '</svg>';
  }

  /* ---------------------------------------------------------------------
     2. CSV HELPERS
     Same approach as the other sites in the family: parse the published
     Google Sheet CSV by hand rather than pulling in a library.
     --------------------------------------------------------------------- */
  function splitCSVRow(row) {
    var result = [], current = '', inQuotes = false;
    for (var i = 0; i < row.length; i++) {
      var ch = row[i];
      if (ch === '"') {
        if (inQuotes && row[i + 1] === '"') { current += '"'; i++; }
        else { inQuotes = !inQuotes; }
      } else if (ch === ',' && !inQuotes) {
        result.push(current); current = '';
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result;
  }

  function parseCSV(text) {
    // Split on newlines that are not inside quotes
    var rows = [], current = '', inQuotes = false;
    var clean = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
    for (var i = 0; i < clean.length; i++) {
      var ch = clean[i];
      if (ch === '"') { inQuotes = !inQuotes; current += ch; }
      else if (ch === '\n' && !inQuotes) { rows.push(current); current = ''; }
      else { current += ch; }
    }
    if (current) rows.push(current);
    if (!rows.length) return [];

    var headers = splitCSVRow(rows[0]).map(function (h) {
      return h.trim().toLowerCase().replace(/^"|"$/g, '');
    });

    return rows.slice(1).map(function (row) {
      var values = splitCSVRow(row);
      return headers.reduce(function (obj, h, i) {
        obj[h] = (values[i] || '').trim();
        return obj;
      }, {});
    }).filter(function (obj) {
      // Drop entirely blank rows
      return Object.keys(obj).some(function (k) { return obj[k]; });
    });
  }

  /* ---------------------------------------------------------------------
     3. COLLECTION LOADER
     If a CSV URL is configured, fetch it; otherwise (or on any failure)
     use the hard-coded array from data.js. The site never renders empty.
     --------------------------------------------------------------------- */
  function loadCollection(url, fallback, normalise) {
    if (!url) return Promise.resolve(fallback);

    return fetch(url, { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('CSV response not OK');
        return res.text();
      })
      .then(function (text) {
        var rows = parseCSV(text).map(normalise).filter(Boolean);
        if (!rows.length) throw new Error('CSV parsed to zero rows');
        return rows;
      })
      .catch(function (err) {
        if (window.console) console.warn('[RTC] Falling back to local data:', err.message);
        return fallback;
      });
  }

  function normaliseService(row) {
    if (!row.title) return null;
    return {
      icon:   row.icon || 'leaf',
      title:  row.title,
      blurb:  row.blurb || '',
      points: (row.points || '').split('|').map(function (p) { return p.trim(); }).filter(Boolean)
    };
  }

  function normaliseFaq(row) {
    if (!row.question) return null;
    return { question: row.question, answer: row.answer || '' };
  }

  /* ---------------------------------------------------------------------
     Escape anything that came from a spreadsheet before it touches innerHTML
     --------------------------------------------------------------------- */
  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ---------------------------------------------------------------------
     4. SERVICES GRID
     --------------------------------------------------------------------- */
  var servicesGrid  = document.getElementById('services-grid');
  var servicesCount = document.getElementById('services-count');

  function serviceCard(s) {
    var points = s.points && s.points.length
      ? '<ul class="svc-points">' + s.points.map(function (p) {
          return '<li>' + esc(p) + '</li>';
        }).join('') + '</ul>'
      : '';

    return '' +
      '<article class="svc-card reveal">' +
        '<span class="svc-icon-wrap" aria-hidden="true">' + icon(s.icon) + '</span>' +
        '<h3 class="svc-title">' + esc(s.title) + '</h3>' +
        (s.blurb ? '<p class="svc-blurb">' + esc(s.blurb) + '</p>' : '') +
        points +
        '<a class="svc-link" href="#contact">Ask about this' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" ' +
          'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<path d="M5 12h13M12 5l7 7-7 7"/></svg>' +
        '</a>' +
      '</article>';
  }

  function renderServices(services) {
    if (!servicesGrid) return;

    if (!services.length) {
      servicesGrid.innerHTML =
        '<p class="grid-placeholder">Service list unavailable — please ' +
        '<a href="#contact">get in touch</a> and I will talk you through what I can do.</p>';
      return;
    }

    var cols = CONFIG.SERVICES_GRID_COLUMNS || 2;
    servicesGrid.style.setProperty('--grid-cols', cols);
    servicesGrid.innerHTML = services.map(serviceCard).join('');
    servicesGrid.removeAttribute('data-loading');

    if (servicesCount) {
      servicesCount.innerHTML = '<strong>' + services.length + '</strong> services listed';
    }
    observeReveals(servicesGrid);
  }

  /* ---------------------------------------------------------------------
     5. FAQ ACCORDION — <details>/<summary>, no JS state to go wrong
     --------------------------------------------------------------------- */
  var faqList = document.getElementById('faq-list');

  function faqItem(f, i) {
    return '' +
      '<details class="faq-item reveal"' + (i === 0 ? ' open' : '') + '>' +
        '<summary>' +
          '<span class="faq-q">' + esc(f.question) + '</span>' +
          '<span class="faq-chev" aria-hidden="true">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
            'stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>' +
          '</span>' +
        '</summary>' +
        '<div class="faq-a"><p>' + esc(f.answer) + '</p></div>' +
      '</details>';
  }

  function renderFaqs(faqs) {
    if (!faqList) return;

    if (!faqs.length) {
      faqList.innerHTML =
        '<p class="grid-placeholder">Questions unavailable right now — ' +
        '<a href="#contact">just ask me directly</a>.</p>';
      return;
    }

    faqList.innerHTML = faqs.map(faqItem).join('');
    faqList.removeAttribute('data-loading');

    // Accordion behaviour: only one open at a time
    var items = faqList.querySelectorAll('.faq-item');
    items.forEach(function (item) {
      item.addEventListener('toggle', function () {
        if (!item.open) return;
        items.forEach(function (other) { if (other !== item) other.open = false; });
      });
    });

    injectFaqSchema(faqs);
    observeReveals(faqList);
  }

  function injectFaqSchema(faqs) {
    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(function (f) {
        return {
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer }
        };
      })
    });
    document.head.appendChild(script);
  }

  /* ---------------------------------------------------------------------
     5b. GALLERY
     Derivatives are produced by scripts/build-gallery.py. Widths offered:
     400 and 800 in the grid, and the largest available tier in the lightbox.
     A master narrower than a tier never gets that tier (no upscaling), so the
     largest tier is derived from the master's own width rather than assumed.
     --------------------------------------------------------------------- */
  var GALLERY_TIERS = [400, 800, 1400];
  var GRID_SIZES = '(max-width: 620px) 45vw, (max-width: 980px) 30vw, 220px';

  function tierPath(file, width, ext) {
    return 'images/gallery/' + file + '-' + width + '.' + (ext || 'webp');
  }

  function largestTier(width) {
    var best = GALLERY_TIERS[0];
    for (var i = 0; i < GALLERY_TIERS.length; i++) {
      if (GALLERY_TIERS[i] <= width) best = GALLERY_TIERS[i];
    }
    return best;
  }

  var galleryGrid = document.getElementById('gallery-grid');
  var galleryItems = [];

  function shotMarkup(item) {
    var srcset = tierPath(item.file, 400) + ' 400w, ' + tierPath(item.file, 800) + ' 800w';
    var orient = item.w > item.h ? 'landscape' : 'portrait';
    return '' +
      '<button class="shot reveal" type="button" data-orient="' + orient + '" ' +
              'data-file="' + esc(item.file) + '">' +
        '<picture>' +
          '<source type="image/webp" srcset="' + srcset + '" sizes="' + GRID_SIZES + '">' +
          '<img src="' + tierPath(item.file, 800, 'jpg') + '" alt="' + esc(item.alt) + '" ' +
               'width="' + item.w + '" height="' + item.h + '" loading="lazy" decoding="async">' +
        '</picture>' +
      '</button>';
  }

  function renderGallery(items) {
    galleryItems = items || [];
    if (!galleryGrid) return;

    if (!galleryItems.length) {
      galleryGrid.innerHTML =
        '<p class="grid-placeholder">Photographs unavailable right now — ' +
        '<a href="#contact">ask me and I will send some over</a>.</p>';
      return;
    }

    galleryGrid.innerHTML = galleryItems.map(shotMarkup).join('');
    galleryGrid.removeAttribute('data-loading');
    observeReveals(galleryGrid);
  }

  function normaliseGalleryItem(row) {
    if (!row.file) return null;
    return {
      file: row.file,
      w: parseInt(row.w, 10) || 1200,
      h: parseInt(row.h, 10) || 1600,
      alt: row.alt || '',
      caption: row.caption || ''
    };
  }

  /* ---------------------------------------------------------------------
     6. HEADER
     --------------------------------------------------------------------- */
  var header    = document.getElementById('site-header');
  var navToggle = document.getElementById('nav-toggle');
  var nav       = document.getElementById('primary-nav');

  function setHeaderHeight() {
    if (!header) return;
    document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
  }

  function closeNav() {
    if (!nav) return;
    document.body.classList.remove('nav-open');
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');
    }
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  var lastY = 0;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('is-scrolled', y > 12);
    lastY = y;
  }

  /* ---------------------------------------------------------------------
     7. REVEALS + SCROLLSPY
     --------------------------------------------------------------------- */
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var revealObserver = ('IntersectionObserver' in window) && !prefersReduced
    ? new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 })
    : null;

  function observeReveals(scope) {
    var nodes = (scope || document).querySelectorAll('.reveal:not(.is-visible)');
    if (!revealObserver) {
      nodes.forEach(function (n) { n.classList.add('is-visible'); });
      return;
    }
    nodes.forEach(function (n) { revealObserver.observe(n); });
  }

  function initScrollspy() {
    if (!('IntersectionObserver' in window)) return;

    var links = Array.prototype.slice.call(
      document.querySelectorAll('#primary-nav a[href^="#"]')
    );
    if (!links.length) return;

    var map = {};
    var sections = links.map(function (link) {
      var id = link.getAttribute('href').slice(1);
      var section = document.getElementById(id);
      if (section) map[id] = link;
      return section;
    }).filter(Boolean);

    var visible = new Set();

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      });

      // Highlight the first section (in document order) currently in view
      var activeId = sections
        .map(function (s) { return s.id; })
        .find(function (id) { return visible.has(id); });

      links.forEach(function (l) {
        l.classList.remove('is-active');
        l.removeAttribute('aria-current');
      });
      if (activeId && map[activeId]) {
        map[activeId].classList.add('is-active');
        map[activeId].setAttribute('aria-current', 'true');
      }
    }, {
      rootMargin: '-45% 0px -45% 0px',
      threshold: 0
    });

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------------------------------------------------------------------
     8. LIGHTBOX — native <dialog> gives focus trapping and Esc for free
     --------------------------------------------------------------------- */
  function initLightbox() {
    var dialog   = document.getElementById('lightbox');
    var source   = document.getElementById('lb-source');
    var img      = document.getElementById('lb-img');
    var caption  = document.getElementById('lb-caption');
    var counter  = document.getElementById('lb-count');
    var closeBtn = document.getElementById('lb-close');
    var prevBtn  = document.getElementById('lb-prev');
    var nextBtn  = document.getElementById('lb-next');
    var shots    = Array.prototype.slice.call(document.querySelectorAll('.shot'));

    if (!dialog || !shots.length || typeof dialog.showModal !== 'function') return;

    var index = 0;

    function show(i) {
      index = (i + shots.length) % shots.length;
      var item = galleryItems[index];
      if (!item) return;

      // Order matters: set the <source> first, then the <img> src, so the
      // browser re-runs source selection with the new candidates.
      source.srcset = tierPath(item.file, largestTier(item.w));
      img.src = tierPath(item.file, Math.min(800, largestTier(item.w)), 'jpg');
      img.alt = item.alt || '';
      img.width = item.w;
      img.height = item.h;
      caption.textContent = item.caption || '';
      if (counter) counter.textContent = (index + 1) + ' / ' + shots.length;
    }

    shots.forEach(function (shot, i) {
      shot.addEventListener('click', function () {
        show(i);
        dialog.showModal();
      });
    });

    closeBtn.addEventListener('click', function () { dialog.close(); });
    prevBtn.addEventListener('click', function () { show(index - 1); });
    nextBtn.addEventListener('click', function () { show(index + 1); });

    dialog.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); show(index - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
    });

    // Click the backdrop (i.e. the dialog element itself) to close
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) dialog.close();
    });

    // Return focus to the thumbnail that opened it
    dialog.addEventListener('close', function () {
      if (shots[index]) shots[index].focus({ preventScroll: true });
    });
  }

  /* ---------------------------------------------------------------------
     9. CONTACT FORM — Formspree, submitted over fetch so the visitor
        never leaves the page
     --------------------------------------------------------------------- */
  function initContactForm() {
    var form   = document.getElementById('contact-form');
    if (!form) return;
    var status = document.getElementById('cf-status');
    var submit = document.getElementById('cf-submit');
    var label  = submit ? submit.querySelector('.btn-label') : null;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      var original = label ? label.textContent : '';
      if (submit) submit.disabled = true;
      if (label) label.textContent = 'Sending…';
      status.className = 'form-status is-pending';
      status.textContent = 'Sending your enquiry…';

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Bad response');
          form.reset();
          status.className = 'form-status is-ok';
          status.textContent =
            'Thank you — your message has been sent. I will get back to you as soon as I can, ' +
            'usually the same or next working day.';
        })
        .catch(function () {
          status.className = 'form-status is-error';
          status.innerHTML =
            'Sorry, something went wrong sending that. Please call ' +
            '<a href="tel:01582621675">01582 621675</a> or email ' +
            '<a href="mailto:richard@richardstreecare.co.uk">richard@richardstreecare.co.uk</a>.';
        })
        .finally(function () {
          if (submit) submit.disabled = false;
          if (label) label.textContent = original || 'Send enquiry';
        });
    });

    // Deep link: #contact?service=... is not used, but a ?service= query is
    // honoured so links from anywhere can pre-select the dropdown.
    var wanted = new URLSearchParams(window.location.search).get('service');
    if (wanted) {
      var select = document.getElementById('cf-service');
      if (select) {
        Array.prototype.forEach.call(select.options, function (opt) {
          if (opt.value.toLowerCase() === wanted.toLowerCase()) select.value = opt.value;
        });
      }
    }
  }

  /* ---------------------------------------------------------------------
     10. INIT
     --------------------------------------------------------------------- */
  function init() {
    var year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();

    setHeaderHeight();
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', setHeaderHeight);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(setHeaderHeight);

    observeReveals(document);
    initScrollspy();
    initContactForm();

    Promise.all([
      loadCollection(CONFIG.SERVICES_CSV_URL, DATA.services, normaliseService),
      loadCollection(CONFIG.FAQ_CSV_URL, DATA.faqs, normaliseFaq),
      loadCollection(CONFIG.GALLERY_CSV_URL, DATA.gallery, normaliseGalleryItem)
    ]).then(function (results) {
      renderServices(results[0]);
      renderFaqs(results[1]);
      renderGallery(results[2]);
      initLightbox();
      setHeaderHeight();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
