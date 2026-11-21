(function () {
  'use strict';
  var playing = false;

  function svg(name) {
    var icons = {
      play: '<path d="M22 15 50 32 22 49Z" fill="currentColor"/>',
      pause: '<rect x="20" y="16" width="8" height="32" rx="2" fill="currentColor"/><rect x="36" y="16" width="8" height="32" rx="2" fill="currentColor"/>',
      more: '<circle cx="16" cy="32" r="4" fill="currentColor"/><circle cx="32" cy="32" r="4" fill="currentColor"/><circle cx="48" cy="32" r="4" fill="currentColor"/>',
      forward: '<path d="M18 20a19 19 0 1 1-3 20M18 20V8m0 12H7" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><text x="32" y="39" text-anchor="middle" font-size="17" font-weight="700" fill="currentColor">30</text>',
      back: '<path d="M46 20a19 19 0 1 0 3 20M46 20V8m0 12h11" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><text x="32" y="39" text-anchor="middle" font-size="17" font-weight="700" fill="currentColor">15</text>',
      airplay: '<path d="M12 40V15h40v25M20 49l12-13 12 13Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>'
    };
    return '<svg viewBox="0 0 64 64" aria-hidden="true">' + icons[name] + '</svg>';
  }

  function cover(kind, size) {
    var names = { coast: ['حكايات', 'الساحل'], mind: ['نقطة', 'تحوّل'], night: ['قبل', 'النوم'], file: ['ملف', 'مغلق'] };
    var words = names[kind] || names.coast;
    return '<div class="ios-pod-cover ' + kind + ' ' + (size || '') + '"><small>بودكاست</small><strong>' + words[0] + '<br>' + words[1] + '</strong><i></i></div>';
  }

  function miniPlayer() {
    return '<div class="pod-mini-player"><button class="pod-mini-open" onclick="openDetail(\'episode\')">' + cover('coast', 'mini') + '<span><b>تفاصيل لا ننساها</b><small>حكايات الساحل</small></span></button><button class="pod-mini-play" onclick="togglePodcastPlay()" aria-label="تشغيل أو إيقاف">' + svg(playing ? 'pause' : 'play') + '</button><button class="pod-mini-more" aria-label="المزيد">' + svg('more') + '</button></div>';
  }

  function episodeRow(kind, title, show, meta, action) {
    return '<article class="ios-pod-row">' + cover(kind, 'row') + '<div><small>' + show + '</small><h3>' + title + '</h3><p>' + meta + '</p><span><button onclick="' + (action || "toast('بدأ تشغيل الحلقة')") + '" aria-label="تشغيل">' + svg('play') + '</button><button aria-label="المزيد">' + svg('more') + '</button></span></div></article>';
  }

  window.togglePodcastPlay = function () { playing = !playing; render(); };

  window.podcastTabs = function () {
    var active = detail || 'listen';
    if (detail === 'episode') return '';
    return miniPlayer() + tabs([
      ['▶', 'استمع الآن', "openDetail(null)", active === 'listen'],
      ['▦', 'تصفح', "openDetail('browse')", active === 'browse'],
      ['▤', 'المكتبة', "openDetail('library')", active === 'library'],
      ['⌕', 'بحث', "openDetail('search')", active === 'search']
    ]);
  };

  window.podcastHTML = function () {
    if (detail === 'episode') {
      return '<div class="pod-ios pod-now-playing"><header><button onclick="openDetail(null)" aria-label="تصغير">⌄</button><b>قيد التشغيل</b><button aria-label="المزيد">' + svg('more') + '</button></header>' + cover('coast', 'player') + '<section class="pod-track-copy"><h2>تفاصيل لا ننساها</h2><p>حكايات الساحل</p></section><div class="pod-scrubber"><i></i></div><div class="pod-time"><span>١٢:٤٦</span><span>−٢٥:١٤</span></div><div class="pod-ios-controls"><button aria-label="رجوع 15 ثانية">' + svg('back') + '</button><button class="main" onclick="togglePodcastPlay()" aria-label="تشغيل أو إيقاف">' + svg(playing ? 'pause' : 'play') + '</button><button aria-label="تقديم 30 ثانية">' + svg('forward') + '</button></div><div class="pod-player-tools"><button>1×</button><button aria-label="AirPlay">' + svg('airplay') + '</button><button aria-label="قائمة الانتظار">☷</button></div><div class="pod-up-next"><b>التالي</b><span>حين تحفظ الأماكن أسرارنا</span></div></div>';
    }

    var pageTitle = detail === 'browse' ? 'تصفح' : detail === 'library' ? 'المكتبة' : detail === 'search' ? 'بحث' : 'استمع الآن';
    var head = '<div class="pod-ios"><header class="pod-ios-head"><div><small>السبت، ٢١ نوفمبر</small><h1>' + pageTitle + '</h1></div><button class="pod-account" aria-label="الحساب">ل</button></header>';
    if (detail === 'browse') return head + '<h2 class="pod-ios-title">استكشف التصنيفات</h2><div class="pod-ios-categories"><button class="purple">قصص</button><button class="green">مجتمع وثقافة</button><button class="blue">تعليم</button><button class="orange">كوميديا</button><button class="rose">صحة</button><button class="navy">أخبار</button></div><h2 class="pod-ios-title">الأكثر استماعًا</h2>' + episodeRow('mind','كيف تغيّر قرارًا واحدًا؟','نقطة تحوّل','اليوم · ٤٢ دقيقة') + episodeRow('night','المدينة حين تنام','قبل النوم','أمس · ٢٧ دقيقة') + '</div>';
    if (detail === 'library') return head + '<div class="pod-library-ios"><button><span>أحدث الحلقات</span><b>٨</b></button><button><span>المحفوظة</span><b>٣</b></button><button><span>تم التنزيل</span><b>٢</b></button><button><span>البرامج</span><b>٤</b></button></div><h2 class="pod-ios-title">برامجي</h2><div class="pod-show-grid"><button onclick="openDetail(\'episode\')">' + cover('coast','grid') + '<b>حكايات الساحل</b></button><button>' + cover('mind','grid') + '<b>نقطة تحوّل</b></button><button>' + cover('night','grid') + '<b>قبل النوم</b></button><button>' + cover('file','grid') + '<b>ملف مغلق</b></button></div></div>';
    if (detail === 'search') return head + '<label class="pod-ios-search"><span>⌕</span><input type="search" placeholder="برامج وحلقات وقنوات"></label><h2 class="pod-ios-title">تصفح التصنيفات</h2><div class="pod-ios-categories"><button class="purple">قصص</button><button class="green">مجتمع وثقافة</button><button class="blue">تعليم</button><button class="orange">كوميديا</button></div></div>';
    return head + '<section class="pod-feature"><div class="pod-feature-label">حلقة جديدة</div><button onclick="openDetail(\'episode\')">' + cover('coast','feature') + '<span><small>حكايات الساحل</small><h2>تفاصيل لا ننساها</h2><p>رحلة إلى الأماكن الصغيرة التي تحتفظ بذكرياتنا.</p><b>تشغيل الحلقة</b></span></button></section><h2 class="pod-ios-title">التالي</h2>' + episodeRow('coast','تفاصيل لا ننساها','حكايات الساحل','اليوم · ٣٨ دقيقة',"openDetail('episode')") + '<h2 class="pod-ios-title">قد يعجبك</h2><div class="pod-show-grid"><button>' + cover('mind','grid') + '<b>نقطة تحوّل</b><small>حوارات وأفكار</small></button><button>' + cover('night','grid') + '<b>قبل النوم</b><small>قصص هادئة</small></button></div></div>';
  };
})();
