(function () {
  'use strict';
  var books = [
    { id:'andalus', title:'ربيع الأندلس', type:'رواية تاريخية', tone:'emerald', mark:'الأندلس', text:'رواية تعود إلى زمن التحولات الكبرى، حيث تتقاطع الحكايات الشخصية مع ذاكرة المدن.' },
    { id:'eagle', title:'تحديقة نسر', type:'أدب عربي', tone:'sand', mark:'نسر', text:'حكاية عن الرؤية من مسافة، وعن القرارات التي تبدو مختلفة حين ننظر إليها من أعلى.' },
    { id:'boundaries', title:'الحدود الصحية', type:'تطوير الذات', tone:'green', mark:'حدود', text:'قراءة عملية في بناء حدود واضحة ومتوازنة في العلاقات والعمل والحياة اليومية.' },
    { id:'suffering', title:'كيف تتقن المعاناة', type:'فكر وفلسفة', tone:'black', mark:'كيف', text:'تأملات في الألم والمعنى، وكيف يمكن للإنسان أن يفهم أيامه الصعبة بدل الهروب منها.' },
    { id:'morgana', title:'سيد المورغانا', type:'خيال عربي', tone:'violet', mark:'مورغانا', text:'عالم غرائبي تحكمه الأسرار والوعود القديمة، وتبدأ رحلته حين ينكسر قانون لم يجرؤ أحد على تحدّيه.' },
    { id:'ghazalia', title:'الغزالية', type:'رواية عربية', tone:'rose', mark:'الغزالية', text:'رواية اجتماعية تتتبع ذاكرة امرأة ومدينة، وما يبقى من الحكايات بعد رحيل أصحابها.' }
  ];

  function cover(book, size) {
    return '<div class="arabic-book-cover ' + book.tone + ' ' + (size || '') + '"><span></span><small>' + book.type + '</small><strong>' + book.mark + '</strong><i></i></div>';
  }

  function grid(items) {
    return '<div class="arabic-books-grid">' + items.map(function (book) {
      return '<button class="arabic-book-card" onclick="openDetail(\'' + book.id + '\')">' + cover(book) + '<b>' + book.title + '</b><small>' + book.type + '</small></button>';
    }).join('') + '</div>';
  }

  window.filterArabicBooks = function (query) {
    var value = (query || '').trim();
    document.querySelectorAll('.arabic-book-card').forEach(function (card) {
      card.hidden = value && !card.textContent.includes(value);
    });
  };

  window.booksTabs = function () {
    var active = detail === 'search' ? 'search' : 'library';
    return tabs([
      ['▤','المكتبة',"openDetail(null)",active === 'library'],
      ['⌕','بحث',"openDetail('search')",active === 'search']
    ]);
  };

  window.booksHTML = function () {
    if (detail && detail !== 'search') {
      var book = books.find(function (item) { return item.id === detail; });
      if (!book) return '';
      return '<div class="books-ios book-detail-ios"><header><button onclick="openDetail(null)">‹ المكتبة</button><button aria-label="المزيد">•••</button></header>' + cover(book,'large') + '<h1>' + book.title + '</h1><p class="book-kind">' + book.type + '</p><button class="book-read" onclick="toast(\'تم فتح عينة القراءة\')">اقرئي عينة</button><section><h2>عن الكتاب</h2><p>' + book.text + '</p></section><div class="book-actions"><button onclick="toast(\'أُضيف إلى قائمة القراءة\')">إضافة إلى قائمة القراءة</button><button onclick="toast(\'تم حفظ الكتاب\')">حفظ</button></div></div>';
    }
    if (detail === 'search') {
      return '<div class="books-ios"><header class="books-head"><h1>بحث</h1><span class="books-profile">ل</span></header><label class="books-search"><span>⌕</span><input type="search" placeholder="ابحثي عن كتاب أو تصنيف" oninput="filterArabicBooks(this.value)"></label><h2 class="books-section-title">كتب عربية رائجة</h2>' + grid(books) + '</div>';
    }
    return '<div class="books-ios"><header class="books-head"><div><small>كتب Apple</small><h1>المكتبة</h1></div><span class="books-profile">ل</span></header><section class="book-featured"><div><small>رائج الآن</small><h2>ربيع الأندلس</h2><p>رواية تاريخية عربية</p><button onclick="openDetail(\'andalus\')">عرض الكتاب</button></div>' + cover(books[0],'featured') + '</section><h2 class="books-section-title">كتب عربية رائجة</h2>' + grid(books) + '<h2 class="books-section-title">قائمة القراءة</h2><div class="reading-goal"><span><b>هدف القراءة</b><small>١٢ دقيقة اليوم</small></span><i><em></em></i><strong>٣٥٪</strong></div></div>';
  };
})();
