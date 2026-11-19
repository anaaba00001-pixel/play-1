(function () {
  'use strict';

  var memoryMoves = 0;
  var memorySeconds = 0;
  var memoryClock = null;
  var tapTimeLeft = 10;
  var tapClock = null;
  var tapX = 50;
  var tapY = 50;
  var memoryValues = ['☕', '✈️', '🎬', '🍦', '☕', '✈️', '🎬', '🍦'];

  function readBest(key, fallback) {
    var value = Number(localStorage.getItem(key));
    return value > 0 ? value : fallback;
  }

  function stopGameClocks() {
    clearInterval(memoryClock);
    clearInterval(tapClock);
    clearTimeout(tapTimer);
    memoryClock = null;
    tapClock = null;
  }

  function formatTime(seconds) {
    return Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
  }

  window.gamesHome = function () {
    stopGameClocks();
    gameMode = null;
    render();
  };

  window.gamesHTML = function () {
    var bestMemory = readBest('lastSignalMemoryBest', 0);
    var bestTap = readBest('lastSignalTapBest', 0);

    if (gameMode === 'memory') {
      return '<div class="game-stage"><div class="stage-bar"><button class="stage-back" onclick="gamesHome()">‹</button><b>تحدي الذاكرة</b><span class="stage-stat"><small>المحاولات</small><strong>' + memoryMoves + '</strong></span></div><p class="stage-sub">اكشفي البطاقات وطابقي كل الرموز</p><div class="memory-grid pro">' + memoryValues.map(function (value, index) {
        var visible = memoryOpen.includes(index) || memoryMatched.includes(index);
        return '<button aria-label="بطاقة ذاكرة" class="memory-card pro ' + (visible ? 'open ' : '') + (memoryMatched.includes(index) ? 'matched' : '') + '" onclick="flipMemory(' + index + ')">' + value + '</button>';
      }).join('') + '</div><div class="stage-progress"><i style="width:' + (memoryMatched.length / memoryValues.length * 100) + '%"></i></div><span class="stage-stat"><small>الوقت</small><strong>' + formatTime(memorySeconds) + '</strong></span></div>';
    }

    if (gameMode === 'memory-result') {
      return resultScreen('🏆', 'ذاكرة ممتازة!', memoryMoves + ' محاولة', 'أنهيتيها في ' + formatTime(memorySeconds), 'startMemory()', bestMemory ? 'أفضل نتيجة: ' + bestMemory + ' محاولة' : 'هذه أول نتيجة لك');
    }

    if (gameMode === 'tap') {
      return '<div class="game-stage"><div class="stage-bar"><button class="stage-back" onclick="gamesHome()">‹</button><b>تحدي البرق</b><span class="stage-stat"><small>النقاط</small><strong>' + tapScore + '</strong></span></div><p class="stage-sub">لاحقي الهدف قبل انتهاء الوقت</p><div class="tap-arena"><button class="tap-target pro" style="--tap-x:' + tapX + '%;--tap-y:' + tapY + '%" onclick="hitTapTarget()">اضغطي!</button></div><div class="timer-track"><i style="width:' + (tapTimeLeft * 10) + '%"></i></div><span class="stage-stat"><small>الوقت</small><strong>' + tapTimeLeft.toFixed(1) + '</strong></span></div>';
    }

    if (gameMode === 'tap-result') {
      return resultScreen(tapScore >= 20 ? '⚡' : '🎯', tapScore >= 20 ? 'سرعة خارقة!' : 'جولة حلوة!', tapScore + ' نقطة', tapScore >= 20 ? 'ردة فعلك سريعة جدًا' : 'جربي مرة ثانية وكسري رقمك', 'startTap()', 'أفضل نتيجة: ' + Math.max(bestTap, tapScore) + ' نقطة');
    }

    return '<div class="games-shell"><div class="games-top"><div><small>مرحبًا ليان</small><h2>مركز الألعاب</h2></div><span class="player-chip">L</span></div><div class="games-featured"><span class="tag">الأكثر لعبًا</span><h3>تحدي الذاكرة</h3><p>طابقي الرموز واكسري أفضل نتيجة لك</p><button class="game-play" onclick="startMemory()">ابدئي اللعب</button></div><div class="games-section-title"><b>كل الألعاب</b><span>لعبتان</span></div><div class="arcade-grid"><button class="arcade-card" onclick="startMemory()"><span class="arcade-art memory">🧩</span><b>طابقي الرموز</b><small>تركيز وذاكرة</small><span class="score-pill">' + (bestMemory ? 'الأفضل ' + bestMemory + ' محاولة' : 'لم تُلعب بعد') + '</span></button><button class="arcade-card" onclick="startTap()"><span class="arcade-art speed">⚡</span><b>تحدي البرق</b><small>سرعة وردة فعل</small><span class="score-pill">الأفضل ' + bestTap + ' نقطة</span></button></div></div>';
  };

  function resultScreen(icon, heading, score, message, replay, best) {
    return '<div class="game-stage"><div class="stage-bar"><button class="stage-back" onclick="gamesHome()">‹</button><b>النتيجة</b><span></span></div><div class="result-card"><span class="result-icon">' + icon + '</span><h2>' + heading + '</h2><div class="result-score">' + score + '</div><p>' + message + '</p><span class="score-pill">' + best + '</span><div class="result-actions"><button onclick="' + replay + '">العبي مرة ثانية</button><button class="ghost" onclick="gamesHome()">العودة للألعاب</button></div></div></div>';
  }

  window.startMemory = function () {
    stopGameClocks();
    gameMode = 'memory';
    memoryOpen = [];
    memoryMatched = [];
    memoryMoves = 0;
    memorySeconds = 0;
    memoryValues = ['☕', '✈️', '🎬', '🍦', '☕', '✈️', '🎬', '🍦'].sort(function () { return Math.random() - 0.5; });
    memoryClock = setInterval(function () { memorySeconds++; render(); }, 1000);
    render();
  };

  window.flipMemory = function (index) {
    if (gameMode !== 'memory' || memoryOpen.includes(index) || memoryMatched.includes(index) || memoryOpen.length === 2) return;
    memoryOpen.push(index);
    render();
    if (memoryOpen.length !== 2) return;
    memoryMoves++;
    var pair = memoryOpen.slice();
    setTimeout(function () {
      if (gameMode !== 'memory') return;
      if (memoryValues[pair[0]] === memoryValues[pair[1]]) memoryMatched.push(pair[0], pair[1]);
      memoryOpen = [];
      if (memoryMatched.length === memoryValues.length) {
        clearInterval(memoryClock);
        var best = readBest('lastSignalMemoryBest', 0);
        if (!best || memoryMoves < best) localStorage.setItem('lastSignalMemoryBest', memoryMoves);
        gameMode = 'memory-result';
      }
      render();
    }, 560);
  };

  window.startTap = function () {
    stopGameClocks();
    gameMode = 'tap';
    tapScore = 0;
    tapTimeLeft = 10;
    tapX = 50;
    tapY = 50;
    tapClock = setInterval(function () {
      tapTimeLeft = Math.max(0, tapTimeLeft - 0.1);
      if (tapTimeLeft <= 0) finishTap();
      else render();
    }, 100);
    render();
  };

  window.hitTapTarget = function () {
    if (gameMode !== 'tap') return;
    tapScore++;
    tapX = 15 + Math.random() * 70;
    tapY = 15 + Math.random() * 70;
    render();
  };

  function finishTap() {
    clearInterval(tapClock);
    tapClock = null;
    var best = readBest('lastSignalTapBest', 0);
    if (tapScore > best) localStorage.setItem('lastSignalTapBest', tapScore);
    gameMode = 'tap-result';
    render();
  }
})();
