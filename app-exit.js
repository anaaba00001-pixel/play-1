/* iOS-style app opening and closing transitions. */
(function () {
  'use strict';

  var DURATION_OPEN = 460;
  var DURATION_EXIT = 480;
  var EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';

  var origGoHome = window.goHome;
  var origOpenApp = window.openApp;
  var origLockPhone = window.lockPhone;
  var origStart = window.start;
  if (typeof origGoHome !== 'function' || typeof origOpenApp !== 'function') return;
  if (!Element.prototype.animate) return;

  var exiting = false;
  var busy = false;
  var animations = [];
  var skip = false;

  function byId(id) { return document.getElementById(id); }

  function reducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function findIcon(id) {
    var selector = '[onclick="openApp(\'' + id + '\')"]';
    var button = document.querySelector('#apps ' + selector) ||
      document.querySelector('#dock ' + selector);
    if (!button && id === 'search') button = document.querySelector('.searchpill');
    if (!button) button = document.querySelector(selector);
    if (!button) return null;
    return button.querySelector('.icon') || button;
  }

  function iconState(view, id) {
    var viewRect = view.getBoundingClientRect();
    if (!viewRect.width || !viewRect.height) return null;

    var ratio = viewRect.width / (view.offsetWidth || viewRect.width);
    var viewWidth = view.offsetWidth || viewRect.width;
    var viewHeight = view.offsetHeight || viewRect.height;
    var icon = findIcon(id);
    var iconRect = icon && icon.getBoundingClientRect();
    var x, y, scale, cropY, radius;

    if (iconRect && iconRect.width) {
      var iconWidth = iconRect.width / ratio;
      var iconHeight = iconRect.height / ratio;
      scale = iconWidth / viewWidth;
      cropY = Math.max(0, (viewHeight - iconHeight / scale) / 2);
      x = (iconRect.left - viewRect.left) / ratio;
      y = (iconRect.top - viewRect.top) / ratio - cropY * scale;
      radius = (0.27 * iconWidth) / scale;
    } else {
      scale = 0.2;
      cropY = 0;
      x = (viewWidth - viewWidth * scale) / 2;
      y = viewHeight - viewHeight * scale;
      radius = 60;
    }

    return {
      transform: 'translate(' + x + 'px,' + y + 'px) scale(' + scale + ')',
      clipPath: 'inset(' + cropY + 'px 0 ' + cropY + 'px 0 round ' + radius + 'px)'
    };
  }

  var FULL = {
    transform: 'translate(0,0) scale(1)',
    clipPath: 'inset(0 0 0 0 round 0)'
  };

  function clearAnimations() {
    animations.forEach(function (animation) {
      try { animation.cancel(); } catch (error) {}
    });
    animations = [];

    var view = byId('appview');
    if (view) {
      view.style.pointerEvents = '';
      view.style.willChange = '';
      view.style.transformOrigin = '';
    }
    exiting = false;
    busy = false;
  }

  function prepare(view) {
    view.style.pointerEvents = 'none';
    view.style.willChange = 'transform, clip-path, opacity';
    view.style.transformOrigin = '0 0';
  }

  function animateHome(keyframes, duration) {
    ['.home', '#dock'].forEach(function (selector) {
      var element = document.querySelector(selector);
      if (element) {
        animations.push(element.animate(keyframes, { duration: duration, easing: EASE }));
      }
    });
  }

  function canAnimate(view, screen) {
    return view && screen && !reducedMotion() && !screen.classList.contains('locked');
  }

  function openAnimated(id) {
    var view = byId('appview');
    var screen = byId('screen');
    if (!canAnimate(view, screen) || !view.classList.contains('active')) return;

    var from = iconState(view, id);
    if (!from) return;

    prepare(view);
    busy = true;
    var move = view.animate([from, FULL], { duration: DURATION_OPEN, easing: EASE });
    var fade = view.animate([
      { opacity: 0, offset: 0 },
      { opacity: 1, offset: 0.3 },
      { opacity: 1, offset: 1 }
    ], { duration: DURATION_OPEN, easing: 'linear' });
    animations = [move, fade];
    animateHome([
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(1.12)', opacity: 0.35 }
    ], DURATION_OPEN);

    move.onfinish = function () {
      if (animations[0] === move) clearAnimations();
    };
  }

  window.openApp = function (id) {
    var view = byId('appview');
    var fromHome = !(view && view.classList.contains('active')) || exiting;
    if (busy) clearAnimations();
    var result = origOpenApp.apply(this, arguments);
    if (fromHome && !skip) openAnimated(id);
    return result;
  };

  function exitAnimated() {
    var view = byId('appview');
    var screen = byId('screen');
    if (!canAnimate(view, screen) || !view.classList.contains('active')) return false;

    var to = iconState(view, typeof current === 'string' ? current : '');
    if (!to) return false;
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    prepare(view);

    var move = view.animate([FULL, to], {
      duration: DURATION_EXIT,
      easing: EASE,
      fill: 'forwards'
    });
    var fade = view.animate([
      { opacity: 1, offset: 0 },
      { opacity: 1, offset: 0.55 },
      { opacity: 0, offset: 1 }
    ], { duration: DURATION_EXIT, easing: 'linear', fill: 'forwards' });
    animations = [move, fade];
    animateHome([
      { transform: 'scale(1.12)', opacity: 0.35 },
      { transform: 'scale(1)', opacity: 1 }
    ], DURATION_EXIT);

    exiting = true;
    busy = true;
    var done = false;
    move.onfinish = function () {
      if (done || !exiting) return;
      done = true;
      origGoHome();
      clearAnimations();
    };
    move.oncancel = function () { done = true; };
    return true;
  }

  window.goHome = function () {
    if (exiting) return;
    if (busy) clearAnimations();
    if (!skip && exitAnimated()) return;
    return origGoHome.apply(this, arguments);
  };

  if (typeof origLockPhone === 'function') {
    window.lockPhone = function () {
      if (busy) clearAnimations();
      skip = true;
      try { return origLockPhone.apply(this, arguments); }
      finally { skip = false; }
    };
  }

  if (typeof origStart === 'function') {
    window.start = function () {
      if (busy) clearAnimations();
      skip = true;
      try { return origStart.apply(this, arguments); }
      finally { skip = false; }
    };
  }
})();
