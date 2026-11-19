(function () {
  'use strict';

  var gameNotificationTimer = null;
  var healthAlarmTimer = null;
  var gameTimerStarted = false;
  var healthTimerStarted = false;
  var workUnread = false;

  chatData.work = {
    name: 'العمل',
    avatar: 'ع',
    preview: 'لو شفت الرسالة ردي علينا',
    messages: [['اليوم', 'الآن', 'لو شفت الرسالة ردي علينا', false]]
  };

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
      chatData.work.preview = 'لو شفت الرسالة ردي علينا';
      showLiveNotification('whatsapp', 'العمل', 'لو شفت الرسالة ردي علينا', function () {
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
    var avatarClass = id === 'work' ? 'work' : id === 'mom' ? 'mom' : id === 'unknown' ? 'unknown' : '';
    return '<button class="wa-chat-row" onclick="' + (id === 'work' ? 'openWorkChat()' : "openDetail('" + id + "')") + '"><span class="wa-list-avatar ' + avatarClass + '">' + chat.avatar + '</span><span class="wa-row-copy"><b>' + chat.name + '</b><small>' + chat.preview + '</small></span><span class="wa-row-meta">' + (unread ? 'الآن' : id === 'unknown' ? '21:46' : 'اليوم') + (unread ? '<i class="wa-unread">1</i>' : '') + '</span></button>';
  }

  window.chatRows = function (query) {
    var order = ['work', 'sara', 'mom', 'nasser', 'unknown'];
    return order.filter(function (id) {
      var chat = chatData[id];
      return chat && (chat.name + chat.preview).includes(query || '');
    }).map(function (id) { return listRow(id, chatData[id]); }).join('');
  };

  window.chatHTML = function () {
    if (detail === null) {
      return '<div class="wa-home"><div class="wa-titlebar"><h2>WhatsApp</h2><button aria-label="الكاميرا">▣</button><button aria-label="بحث">⌕</button><span class="wa-profile">لي</span></div><div class="wa-filters"><button class="active">الكل</button><button>غير مقروءة</button><button>جهات الاتصال</button><button>المجموعات</button></div><div class="wa-archive">▣ <b>المؤرشفة</b></div><div id="chatList">' + chatRows('') + '</div><p class="wa-encrypted">🔒 رسائلك الشخصية مشفّرة من طرف إلى طرف</p></div>';
    }
    var chat = chatData[detail];
    if (!chat) return '';
    var avatarClass = detail === 'work' ? 'work' : detail === 'mom' ? 'mom' : detail === 'unknown' ? 'unknown' : '';
    var messages = chat.messages.map(function (item) {
      return (item[0] ? '<div class="daychip">' + item[0] + '</div>' : '') + '<div class="wa-bubble ' + (item[3] ? 'out' : '') + '">' + esc(item[2]) + '<time>' + item[1] + (item[3] ? ' ✓✓' : '') + '</time></div>';
    }).join('');
    return '<div class="wa-convo-head"><button class="wa-head-action" onclick="openDetail(null)">‹</button><span class="wa-list-avatar ' + avatarClass + '">' + chat.avatar + '</span><span><b>' + chat.name + '</b><small>اضغطي هنا لمعلومات جهة الاتصال</small></span><span class="spacer"></span><button class="wa-head-action">▣</button><button class="wa-head-action">☎</button><button class="wa-head-action">⋮</button></div><div class="wa-message-area">' + messages + '</div><div class="wa-compose-real"><span>＋</span><div class="message-field">رسالة</div><span>☺　▣</span><button>●</button></div>';
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
