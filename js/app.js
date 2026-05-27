/* DoveQR — Main application logic
   History is stored in localStorage now and will migrate to
   Firebase Firestore once Firebase is configured (see firebase/config.js). */

(function () {
  'use strict';

  /* ── State ─────────────────────────────────────────────── */
  var state = {
    url:      'https://github.com',
    fgColor:  '#000000',
    bgColor:  '#ffffff',
    dotStyle: 'square',
    iconId:   'none',
  };

  var SHAPES = [
    { id: 'square',  label: 'Square',  qrType: 'square' },
    { id: 'dots',    label: 'Dots',    qrType: 'dots' },
    { id: 'rounded', label: 'Rounded', qrType: 'rounded' },
    { id: 'smooth',  label: 'Smooth',  qrType: 'extra-rounded' },
  ];

  /* Corner styles that complement each dot style */
  var CORNER_MAP = {
    square:  { square: 'square',        dot: 'square' },
    dots:    { square: 'dot',           dot: 'dot' },
    rounded: { square: 'extra-rounded', dot: 'dot' },
    smooth:  { square: 'extra-rounded', dot: 'dot' },
  };

  /* ── QR instance ────────────────────────────────────────── */
  var qrCode = null;

  /* ── Boot ───────────────────────────────────────────────── */
  function init() {
    renderShapes();
    renderIcons();
    initQR();
    bindEvents();
    loadHistory();
  }

  /* ── Shape selector ─────────────────────────────────────── */
  function renderShapes() {
    var grid = document.getElementById('shape-grid');
    grid.innerHTML = SHAPES.map(function (s) {
      var dots = Array(9).fill('<span></span>').join('');
      return [
        '<div class="shape-opt' + (s.id === state.dotStyle ? ' selected' : '') + '"',
        ' data-shape="' + s.id + '">',
        '<div class="dot-preview ' + s.id + '">' + dots + '</div>',
        '<span class="shape-name">' + s.label + '</span>',
        '</div>',
      ].join('');
    }).join('');

    grid.querySelectorAll('.shape-opt').forEach(function (el) {
      el.addEventListener('click', function () {
        state.dotStyle = el.dataset.shape;
        grid.querySelectorAll('.shape-opt').forEach(function (o) {
          o.classList.toggle('selected', o === el);
        });
        scheduleUpdate();
      });
    });
  }

  /* ── Icon selector ──────────────────────────────────────── */
  function renderIcons() {
    var grid = document.getElementById('icon-grid');
    grid.innerHTML = ICONS.map(function (icon) {
      return [
        '<div class="icon-opt' + (icon.id === state.iconId ? ' selected' : '') + '"',
        ' data-icon="' + icon.id + '">',
        '<img src="' + icon.dataUrl + '" alt="' + icon.name + '">',
        '<span class="icon-opt-name">' + icon.name + '</span>',
        '</div>',
      ].join('');
    }).join('');

    grid.querySelectorAll('.icon-opt').forEach(function (el) {
      el.addEventListener('click', function () {
        state.iconId = el.dataset.icon;
        grid.querySelectorAll('.icon-opt').forEach(function (o) {
          o.classList.toggle('selected', o === el);
        });
        scheduleUpdate();
      });
    });
  }

  /* ── QR options builder ─────────────────────────────────── */
  function buildOptions(size) {
    size = size || 300;
    var icon   = ICONS.find(function (i) { return i.id === state.iconId; });
    var shape  = SHAPES.find(function (s) { return s.id === state.dotStyle; });
    var corner = CORNER_MAP[state.dotStyle] || CORNER_MAP.square;
    var hasIcon = icon && icon.id !== 'none';

    return {
      width:  size,
      height: size,
      type:   'canvas',
      data:   state.url || 'https://doveqr.app',
      image:  hasIcon ? icon.dataUrl : undefined,
      margin: 12,
      qrOptions: {
        /* High error correction when a logo covers part of the QR code */
        errorCorrectionLevel: hasIcon ? 'H' : 'M',
      },
      dotsOptions: {
        color: state.fgColor,
        type:  shape ? shape.qrType : 'square',
      },
      cornersSquareOptions: {
        color: state.fgColor,
        type:  corner.square,
      },
      cornersDotOptions: {
        color: state.fgColor,
        type:  corner.dot,
      },
      backgroundOptions: {
        color: state.bgColor,
      },
      imageOptions: {
        crossOrigin:          'anonymous',
        margin:               6,
        hideBackgroundDots:   true,
        imageSize:            0.34,
      },
    };
  }

  /* ── Initialise & update QR ─────────────────────────────── */
  function initQR() {
    var container = document.getElementById('qr-container');
    qrCode = new QRCodeStyling(buildOptions(300));
    qrCode.append(container);
  }

  var _updateTimer = null;
  function scheduleUpdate(delay) {
    clearTimeout(_updateTimer);
    _updateTimer = setTimeout(function () {
      qrCode.update(buildOptions(300));
    }, delay !== undefined ? delay : 80);
  }

  /* ── Event binding ──────────────────────────────────────── */
  function bindEvents() {
    /* URL */
    var urlInput = document.getElementById('qr-url');
    urlInput.addEventListener('input', function (e) {
      state.url = e.target.value;
      scheduleUpdate(350);
    });

    document.getElementById('url-clear').addEventListener('click', function () {
      urlInput.value = '';
      state.url = '';
      urlInput.focus();
      scheduleUpdate(0);
    });

    /* Colors */
    var fgPicker = document.getElementById('fg-color');
    var bgPicker = document.getElementById('bg-color');
    var fgHex    = document.getElementById('fg-hex');
    var bgHex    = document.getElementById('bg-hex');

    fgPicker.addEventListener('input', function (e) {
      state.fgColor = e.target.value;
      fgHex.textContent = e.target.value.toUpperCase();
      scheduleUpdate(0);
    });

    bgPicker.addEventListener('input', function (e) {
      state.bgColor = e.target.value;
      bgHex.textContent = e.target.value.toUpperCase();
      scheduleUpdate(0);
    });

    /* Downloads */
    var btnPng = document.getElementById('btn-png');
    var btnSvg = document.getElementById('btn-svg');

    btnPng.addEventListener('click', function () {
      qrCode.download({ name: 'doveqr', extension: 'png' });
      flashDownloaded(btnPng);
      saveToHistory();
    });

    btnSvg.addEventListener('click', function () {
      qrCode.download({ name: 'doveqr', extension: 'svg' });
      flashDownloaded(btnSvg);
      saveToHistory();
    });

    /* History */
    document.getElementById('btn-clear-history').addEventListener('click', clearHistory);
  }

  function flashDownloaded(btn) {
    var orig = btn.innerHTML;
    btn.classList.add('downloaded');
    btn.innerHTML = btn.innerHTML.replace(/Download PNG|Download SVG|SVG/, '✓ Saved');
    setTimeout(function () {
      btn.classList.remove('downloaded');
      btn.innerHTML = orig;
    }, 1800);
  }

  /* ── History ─────────────────────────────────────────────
     Stored in localStorage now.
     When Firebase is enabled (firebase/config.js), replace the
     localStorage calls below with FirebaseService.saveQRCode() /
     FirebaseService.getQRHistory() / FirebaseService.deleteQRHistory().
  ────────────────────────────────────────────────────────── */
  var HISTORY_KEY = 'doveqr_history';
  var HISTORY_MAX = 12;

  function getHistory() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
    catch (_) { return []; }
  }

  function saveToHistory() {
    var entry = {
      id:        String(Date.now()),
      url:       state.url || '',
      dotStyle:  state.dotStyle,
      fgColor:   state.fgColor,
      bgColor:   state.bgColor,
      iconId:    state.iconId,
      createdAt: new Date().toISOString(),
    };

    /* FirebaseService.saveQRCode(entry); — uncomment when Firebase is ready */

    var list = getHistory();
    list.unshift(entry);
    list = list.slice(0, HISTORY_MAX);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
    renderHistory(list);
  }

  function clearHistory() {
    /* FirebaseService.deleteQRHistory(); — uncomment when Firebase is ready */
    localStorage.removeItem(HISTORY_KEY);
    renderHistory([]);
  }

  function loadHistory() {
    /* FirebaseService.getQRHistory().then(renderHistory); — when Firebase ready */
    renderHistory(getHistory());
  }

  function timeAgo(iso) {
    var s = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (s < 60)    return 'just now';
    if (s < 3600)  return Math.floor(s / 60)    + 'm ago';
    if (s < 86400) return Math.floor(s / 3600)  + 'h ago';
    return Math.floor(s / 86400) + 'd ago';
  }

  function renderHistory(items) {
    var list = document.getElementById('history-list');

    if (!items.length) {
      list.innerHTML = '<p class="history-empty">Downloaded QR codes will appear here.<br><small>Cloud sync via Firebase — coming soon</small></p>';
      return;
    }

    list.innerHTML = items.map(function (item) {
      return [
        '<div class="history-item" data-id="' + item.id + '">',
        '<div class="history-dot" style="background:' + item.fgColor + '"></div>',
        '<span class="history-url">' + (item.url || '(empty)') + '</span>',
        '<span class="history-time">' + timeAgo(item.createdAt) + '</span>',
        '</div>',
      ].join('');
    }).join('');

    list.querySelectorAll('.history-item').forEach(function (el) {
      el.addEventListener('click', function () {
        var item = getHistory().find(function (i) { return i.id === el.dataset.id; });
        if (!item) return;

        state.url      = item.url;
        state.dotStyle = item.dotStyle;
        state.fgColor  = item.fgColor;
        state.bgColor  = item.bgColor;
        state.iconId   = item.iconId;

        /* Sync UI controls */
        document.getElementById('qr-url').value   = item.url;
        document.getElementById('fg-color').value = item.fgColor;
        document.getElementById('bg-color').value = item.bgColor;
        document.getElementById('fg-hex').textContent = item.fgColor.toUpperCase();
        document.getElementById('bg-hex').textContent = item.bgColor.toUpperCase();

        renderShapes();
        renderIcons();
        scheduleUpdate(0);
      });
    });
  }

  /* ── Start ──────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', init);

}());
