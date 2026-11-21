(function () {
  'use strict';

  var gameNotificationTimer = null;
  var healthAlarmTimer = null;
  var gameTimerStarted = false;
  var healthTimerStarted = false;
  var workUnread = false;

  chatData.work = {
    name: 'المدير احمد زفت الطين',
    avatar: 'أ',
    preview: 'قراري نهائي: لا، لن أوافق.',
    messages: [
      ['اليوم', '9:12 م', 'ليان، أبيك تكمّلين تقرير المشروع الليلة وترسلينه قبل الصباح.', false],
      ['', '9:14 م', 'التقرير يحتاج وقت، ودوامي انتهى. أقدر أكمّله بكرة أول الدوام.', true],
      ['', '9:15 م', 'لا، الموضوع مستعجل وكل الفريق لازم يتعاون. ساعتين زيادة ما تضر.', false],
      ['', '9:17 م', 'التعاون ما يعني أن التكليف يصير بعد الدوام ومن دون تنسيق مسبق.', true],
      ['', '9:18 م', 'أنا المدير وأنا أحدد متى يخلص الشغل. اعتبريه توجيه مباشر.', false],
      ['', '9:20 م', 'وأنا أوضح لك أن عندي التزامات، وأي عمل إضافي لازم يكون متفقًا عليه ومحسوبًا رسميًا.', true],
      ['', '9:21 م', 'يعني بترفضين تنفذين المطلوب؟ فكري زين قبل تردين.', false],
      ['', '9:23 م', 'نعم، أرفض. قراري نهائي: لا، لن أوافق على العمل خارج دوامي بهذه الطريقة.', true]
    ]
  };

  Object.keys(chatData).forEach(function (id) {
    var chat = chatData[id];
    chat.preview = chat.preview.replace(/[🤍☺😀😂😍😊😅😢😡🥰👍🙏❤]/gu, '').trim();
    chat.messages.forEach(function (message) {
      message[2] = message[2].replace(/[🤍☺😀😂😍😊😅😢😡🥰👍🙏❤]/gu, '').trim();
    });
  });

  function uiIcon(name) {
    var paths = {
      phone: '<path d="M21.1 10.8c-2.3-1.1-5-.3-6.4 1.8l-3.1 4.7c-1.2 1.8-1.5 4.1-.8 6.2 5.1 15.1 16.9 26.9 32 32 2.1.7 4.4.4 6.2-.8l4.7-3.1c2.1-1.4 2.9-4.1 1.8-6.4l-4.4-9.3c-1-2.1-3.4-3.2-5.7-2.5l-7.5 2.2c-3.9-2.2-7.3-5.6-9.5-9.5l2.2-7.5c.7-2.3-.4-4.7-2.5-5.7Z" fill="currentColor"/>',
      send: '<path d="M9 31 54 10 39 54 31 36Zm22 5L54 10" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>',
      video: '<rect x="8" y="17" width="34" height="30" rx="7" fill="none" stroke="currentColor" stroke-width="4"/><path d="m42 27 13-8v26l-13-8Z" fill="currentColor"/>'
    };
    return '<svg viewBox="0 0 64 64" aria-hidden="true">' + paths[name] + '</svg>';
  }

  document.querySelectorAll('button[aria-label="الهاتف"] .icon').forEach(function (iconNode) {
    iconNode.innerHTML = uiIcon('phone');
    iconNode.style.background = 'linear-gradient(180deg,#65dc70,#18b84f)';
    iconNode.style.color = '#fff';
  });
  document.querySelectorAll('.notification').forEach(function (notification) {
    notification.innerHTML = notification.innerHTML.replace(/[🤍☺😀😂😍😊😅😢😡🥰👍🙏❤]/gu, '');
  });

  function beep() {
    try {
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      var context = new AudioContext();
      var oscillator = context.createOscillator();
      var gain = context.createGain();
      oscillator.frequency.value = 880;
      gain.gain.setValueAtTime(0.12, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.35);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.35);
    } catch (error) {}
  }

  function showLiveNotification(type, sender, message, action) {
    var screen = document.getElementById('screen');
    if (!screen) return;
    var old = screen.querySelector('.live-notification');
    if (old) old.remove();
    var banner = document.createElement('button');
    banner.className = 'live-notification' + (type === 'alarm' ? ' alarm' : '');
    banner.innerHTML = '<span class="live-icon">' + (type === 'alarm' ? '⏰' : '◉') + '</span><div><b>' + sender + '</b><span>' + message + '</span></div><time>الآن</time>';
    banner.onclick = function () {
      banner.remove();
      if (typeof action === 'function') action();
    };
    screen.appendChild(banner);
    beep();
    setTimeout(function () {
      if (!banner.isConnected) return;
      banner.classList.add('hide');
      setTimeout(function () { banner.remove(); }, 400);
    }, 6500);
  }

  function scheduleGameNotification() {
    if (gameTimerStarted) return;
    gameTimerStarted = true;
    gameNotificationTimer = setTimeout(function () {
      workUnread = true;
      chatData.work.preview = 'قراري نهائي: لا، لن أوافق.';
      showLiveNotification('whatsapp', 'المدير احمد زفت الطين', 'ليان، أبيك تكمّلين تقرير المشروع الليلة.', function () {
        openApp('messages');
        setTimeout(function () { openWorkChat(); }, 850);
      });
      if (current === 'messages' && detail === null) render();
    }, 120000);
  }

  function scheduleHealthAlarm() {
    if (healthTimerStarted) return;
    healthTimerStarted = true;
    healthAlarmTimer = setTimeout(function () {
      showLiveNotification('alarm', 'منبّه الصحة', 'مرّت أربع دقائق منذ فتح تطبيق صحتي', function () {
        openApp('health');
      });
    }, 240000);
  }

  window.openWorkChat = function () {
    workUnread = false;
    detail = 'work';
    render();
  };

  var originalStart = window.start;
  window.start = function () {
    var result = originalStart.apply(this, arguments);
    scheduleGameNotification();
    return result;
  };

  var originalOpenApp = window.openApp;
  window.openApp = function (id) {
    var result = originalOpenApp.apply(this, arguments);
    if (id === 'health') scheduleHealthAlarm();
    return result;
  };

  function listRow(id, chat) {
    var unread = id === 'work' && workUnread;
    var avatarClass = id === 'work' ? 'work' : id === 'mom' ? 'mom' : id === 'muzna' ? 'muzna' : id === 'unknown' ? 'unknown' : '';
    return '<button class="wa-chat-row" onclick="' + (id === 'work' ? 'openWorkChat()' : "openDetail('" + id + "')") + '"><span class="wa-list-avatar ' + avatarClass + '">' + chat.avatar + '</span><span class="wa-row-copy"><b>' + chat.name + '</b><small>' + chat.preview + '</small></span><span class="wa-row-meta">' + (unread ? 'الآن' : id === 'unknown' ? '21:46' : 'اليوم') + (unread ? '<i class="wa-unread">1</i>' : '') + '</span></button>';
  }

  window.chatRows = function (query) {
    var order = ['work', 'sara', 'mom', 'muzna', 'nasser', 'unknown'];
    return order.filter(function (id) {
      var chat = chatData[id];
      return chat && (chat.name + chat.preview).includes(query || '');
    }).map(function (id) { return listRow(id, chatData[id]); }).join('');
  };

  window.chatHTML = function () {
    if (detail === null) {
      return '<div class="wa-home"><div class="wa-titlebar"><h2>WhatsApp</h2><button aria-label="الكاميرا">▣</button><button aria-label="بحث">⌕</button><span class="wa-profile">لي</span></div><div class="wa-filters"><button class="active">الكل</button><button>غير مقروءة</button><button>جهات الاتصال</button><button>المجموعات</button></div><div class="wa-archive">▣ <b>المؤرشفة</b></div><div id="chatList">' + chatRows('') + '</div><p class="wa-encrypted">رسائلك الشخصية مشفّرة من طرف إلى طرف</p></div>';
    }
    var chat = chatData[detail];
    if (!chat) return '';
    var avatarClass = detail === 'work' ? 'work' : detail === 'mom' ? 'mom' : detail === 'muzna' ? 'muzna' : detail === 'unknown' ? 'unknown' : '';
    var messages = chat.messages.map(function (item) {
      return (item[0] ? '<div class="daychip">' + item[0] + '</div>' : '') + '<div class="wa-bubble ' + (item[3] ? 'out' : '') + '">' + esc(item[2]) + '<time>' + item[1] + (item[3] ? ' ✓✓' : '') + '</time></div>';
    }).join('');
    return '<div class="wa-convo-head"><button class="wa-head-action" onclick="openDetail(null)" aria-label="رجوع">‹</button><span class="wa-list-avatar ' + avatarClass + '">' + chat.avatar + '</span><span><b>' + chat.name + '</b><small>اضغطي هنا لمعلومات جهة الاتصال</small></span><span class="spacer"></span><button class="wa-head-action wa-svg-action" onclick="toast(\'مكالمة الفيديو غير متاحة\')" aria-label="مكالمة فيديو">' + uiIcon('video') + '</button><button class="wa-head-action wa-call" onclick="callWhatsAppContact()" aria-label="اتصال">' + uiIcon('phone') + '</button><button class="wa-head-action" aria-label="المزيد">⋮</button></div><div class="wa-message-area">' + messages + '</div><div class="wa-compose-real"><span>＋</span><input id="waMessageInput" class="message-field" type="text" placeholder="رسالة" aria-label="اكتبي رسالة" onkeydown="if(event.key===\'Enter\'){sendWhatsAppMessage()}"><button class="wa-send" onclick="sendWhatsAppMessage()" aria-label="إرسال">' + uiIcon('send') + '</button></div>';
  };

  window.sendWhatsAppMessage = function () {
    var input = document.getElementById('waMessageInput');
    var chat = chatData[detail];
    if (!input || !chat) return;
    var text = input.value.trim();
    if (!text) {
      input.focus();
      toast('اكتبي رسالة أولًا');
      return;
    }
    var time = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    chat.messages.push(['', time, text, true]);
    chat.preview = text;
    render();
    setTimeout(function () {
      var area = document.querySelector('.wa-message-area');
      if (area) area.scrollTop = area.scrollHeight;
    }, 0);
  };

  window.callWhatsAppContact = function () {
    var chat = chatData[detail];
    toast(chat ? 'جارٍ الاتصال بـ ' + chat.name + '…' : 'تعذر بدء الاتصال');
  };

  window.filterChats = function (query) {
    var list = document.getElementById('chatList');
    if (list) list.innerHTML = chatRows(query) || '<p class="wa-encrypted">لا توجد نتائج</p>';
  };

  var renderWithStandardFooter = window.render;
  window.render = function () {
    var result = renderWithStandardFooter.apply(this, arguments);
    if (current === 'messages') {
      if (detail !== null) document.getElementById('appFooter').style.display = 'none';
      var whatsappView = document.querySelector('.wa-home, .wa-conversation');
      if (whatsappView && whatsappView.animate && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        whatsappView.animate([
          { opacity: 0, transform: 'translateX(-18px)' },
          { opacity: 1, transform: 'translateX(0)' }
        ], { duration: 620, easing: 'cubic-bezier(.2,.75,.2,1)' });
      }
    }
    return result;
  };
})();
