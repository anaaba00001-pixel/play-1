/* توسعة التجربة باللهجة النجدية */
if(window.LAST_SIGNAL_PHOTOS){
  window.LAST_SIGNAL_PHOTOS.filter(p=>/photo-(1[1-9]|2[0-3])\.jpeg$/.test(p.src)).forEach(p=>{
    if(!galleryPhotos.some(existing=>existing.src===p.src))galleryPhotos.push(p);
  });
}
var facetimeApp=apps.find(a=>a[0]==='facetime');
if(facetimeApp)facetimeApp.splice(0,4,'contacts','جهات الاتصال','contacts','contacts-icon');
apps.splice(4,0,['games','ألعاب','games','games-icon']);
var baseIcon=icon;
icon=function(name){var e={games:'🎮',contacts:'👤'};return e[name]?'<span class="custom-app-icon">'+e[name]+'</span>':baseIcon(name)};
$('apps').innerHTML=apps.filter(a=>!['phone','safari','sms','music','search'].includes(a[0])).map(a=>`<button class="app" onclick="openApp('${a[0]}')"><span class="icon ${a[3]}">${icon(a[2])}</span><span>${a[1]}</span>${a[0]==='messages'?'<i class="dot">3</i>':''}</button>`).join('');
$('dock').innerHTML=['phone','safari','games','music'].map(id=>apps.find(a=>a[0]===id)).map(a=>`<button onclick="openApp('${a[0]}')" aria-label="${a[1]}"><span class="icon ${a[3]}">${icon(a[2])}</span></button>`).join('');
function culturaText(html){return html.replaceAll('مرفأ المنارة','مقهى كلتورا').replaceAll('مقهى المنارة','مقهى كلتورا').replaceAll('في المقهى','في مقهى كلتورا').replaceAll('طاولة المقهى','طاولة مقهى كلتورا')}
var lockNotifications=document.querySelector('.notifications');
if(lockNotifications)lockNotifications.innerHTML=culturaText(lockNotifications.innerHTML);

var safariTab='shop',safariQuery='',gameMode=null,memoryOpen=[],memoryMatched=[],tapScore=0,tapTimer=null;
var najdiNotes=[
  {id:'start',title:'ابدئي من هنا — وش السالفة؟',preview:'يا سارة، إذا لقيتي جوالي اقري هالملاحظة أول…'},
  {id:'sara',title:'لسارة، إذا تأخرت',preview:'لا تدورين علي برا الجوال…'},
  {id:'shopping',title:'المقاضي',preview:'قهوة، حليب، خبز، مناديل'},
  {id:'quote',title:'كلام عجبني',preview:'بعض الأماكن تعرفنا أكثر…'},
  {id:'work',title:'أغراض الدوام',preview:'الشاحن، الدفتر، السماعات'}
];

notesHTML=function(){
  if(!detail)return title('الملاحظات')+'<input class="iossearch" aria-label="بحث في الملاحظات" placeholder="⌕ دوّري بالملاحظات" oninput="filterNotes(this.value)"><div class="sectionlabel">على الـ iPhone · أول ملاحظة مثبتة</div><div class="iosgroup" id="noteList">'+najdiNotes.map(n=>row(n.title,n.preview,`openDetail('${n.id}')`)).join('')+'</div><p class="ioscaption" style="text-align:center">٥ ملاحظات</p>';
  if(detail==='start')return '<article class="note-document"><p class="notetime">مثبتة · اقريها أول</p><div class="story-note"><h3>هلا يا سارة، هذي السالفة من أولها</h3><p>الجوال اللي بيدك جوال <b>ليان</b>. لقيتيه على طاولة <b>مقهى كلتورا</b> عقب ما اختفت، وآخر رسالة منها تقول إن عندها أمانة ووثيقة لازم توصل لصاحبتها.</p><p>ليان ما تركت الحل بمكان واحد؛ وزّعته بين صورها، تذكيراتها، محادثاتها وتقويمها. مهمتك تعرفين <b>المكان، والوقت، والارتفاع</b> ثم تفتحين ملف <b>الحقيقة.pdf</b>.</p><div class="story-steps"><p>ابدئي بملاحظة «لسارة، إذا تأخرت».</p><p>اربطي أول الحروف بالصورة الصح.</p><p>راجعي التذكيرات وواتساب والتقويم.</p><p>إذا جمعتي الأرقام، روحي للملفات وافتحي الحقيقة.</p></div><p><b>تنبيه:</b> القصة خيالية. خذي راحتك وفتشي كل تطبيق.</p></div></article>';
  if(detail==='sara')return '<article class="note-document"><p class="notetime">٩ نوفمبر · تعدّلت بالليل</p><h2>لسارة، إذا تأخرت</h2><p>لا تدورين علي برا الجوال. حفظت صورة للمكان اللي بدت منه السالفة.<br>وإذا ما وضح لك الكلام، ارجعي لبداياته.</p><div class="acrostic"><p>ربما كان ترك الجوال مقصود.</p><p>صورة وحدة حفظت اللي ما قلته.</p><p>يختبي المكان بأول الكلام.</p><p>في الصور بتعرفين ليه.</p></div><div class="note-divider"></div><blockquote>احتفظي باللي تلقينه: المكان، عقبها اللحظة، ثم الارتفاع. كل شي له وقته.</blockquote></article>';
  var n=najdiNotes.find(n=>n.id===detail);var texts={shopping:'قهوة<br>حليب<br>خبز<br>مناديل',quote:'«بعض الأماكن تعرفنا أكثر من معرفتنا لها.»',work:'الشاحن<br>دفتر الملاحظات<br>السماعات<br>نسخة أوراق الدوام'};
  return n?'<article class="note-document"><p class="notetime">ملاحظة محفوظة</p><h2>'+n.title+'</h2><p>'+texts[detail]+'</p></article>':'';
};
filterNotes=function(value){$('noteList').innerHTML=najdiNotes.filter(n=>(n.title+n.preview).includes(value)).map(n=>row(n.title,n.preview,`openDetail('${n.id}')`)).join('')||'<p class="ioscaption">ما لقينا شي</p>'};

function safariHTML(){
  var labels=[['shop','شي إن'],['history','السجل'],['lawyers','محامين'],['shahid','شاهد'],['travel','تذاكر سفر']];
  var tabs='<div class="safari-tabs">'+labels.map(x=>`<button class="${safariTab===x[0]?'active':''}" onclick="setSafariTab('${x[0]}')">${x[1]}</button>`).join('')+'</div>';
  var bar='<div class="safari-bar"><span>🔒</span><input value="'+esc(safariQuery)+'" placeholder="ابحثي أو اكتبي اسم الموقع" onkeydown="if(event.key===\'Enter\')safariSearch(this.value)"><button onclick="safariSearch(this.previousElementSibling.value)">↻</button></div>';
  var body='';
  if(safariTab==='shop')body='<div class="shein-hero"><small>خصم اليوم</small><br><b>SHEIN</b><p>ستايلك الصيفي وصل · خصم ٣٠٪</p></div><div class="shop-grid"><button class="shop-item" onclick="toast(\'انضاف للسلة — هذي تجربة محفوظة\')"><div class="shop-pic">👗</div><span>فستان صيفي ناعم</span><b>ر.س ٦٩</b></button><button class="shop-item" onclick="toast(\'انضاف للسلة — هذي تجربة محفوظة\')"><div class="shop-pic">👜</div><span>شنطة كتف صغيرة</span><b>ر.س ٤٢</b></button></div>';
  if(safariTab==='history')body='<p class="sectionlabel">سجل البحث الأخير</p><div class="history-card">'+[['⚖️','محامين توثيق عقود بالرياض','اليوم، ٦:٤٢ م','lawyers'],['▶','برنامج شاهد تسجيل الدخول','اليوم، ٤:١٠ م','shahid'],['✈️','تذاكر سفر الرياض جدة','أمس، ٩:٢٥ م','travel'],['🛍️','SHEIN السعودية','أمس، ٧:٠٣ م','shop']].map(x=>`<button class="history-row" onclick="setSafariTab('${x[3]}')"><i>${x[0]}</i><span><b>${x[1]}</b><small>${x[2]}</small></span><em>‹</em></button>`).join('')+'</div>';
  if(safariTab==='lawyers')body='<div class="browser-page"><h2>محامين توثيق بالرياض</h2><p class="sub">نتائج محفوظة · بيانات تجريبية</p><div class="lawyer-result"><b>مكتب رواسي للمحاماة</b><p>عقود · توثيق · استشارات</p></div><div class="lawyer-result"><b>مكتب العدل للاستشارات</b><p>مواعيد إلكترونية ومراجعة وثائق</p></div><div class="lawyer-result"><b>دليل المحامين المعتمدين</b><p>نتيجة تجريبية ضمن القصة</p></div></div>';
  if(safariTab==='shahid')body='<div class="browser-page"><div class="biglogo">▶️</div><h2 style="text-align:center">شاهد</h2><div class="witness-card"><b>كمّلي المشاهدة</b><div class="play">▶</div><p>حلقة ١٧ · باقي ٢٤ دقيقة</p></div></div>';
  if(safariTab==='travel')body='<div class="browser-page"><h2>تذاكر السفر</h2><div class="ticket-pass"><small>رحلة محفوظة</small><br><strong>RUH ✈ JED</strong><p>الرياض ← جدة</p><small>٢٢ نوفمبر · ٨:٣٠ ص</small></div><button class="btn" onclick="toast(\'هذي تذكرة تجريبية داخل القصة\')">عرض تفاصيل الحجز</button></div>';
  return '<div class="safari-shell">'+bar+tabs+body+'</div>';
}
function setSafariTab(tab){safariTab=tab;safariQuery={shop:'shein.com',history:'السجل',lawyers:'محامين توثيق بالرياض',shahid:'shahid.mbc.net',travel:'تذاكر سفر الرياض جدة'}[tab]||'';render()}
function safariSearch(q){safariQuery=q;var s=q.toLowerCase();safariTab=s.includes('محام')?'lawyers':s.includes('شاهد')||s.includes('shahid')?'shahid':s.includes('تذاكر')||s.includes('سفر')?'travel':s.includes('shein')||s.includes('شي')?'shop':'history';render()}

calendarHTML=function(){var names=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];return title('تقويم ٢٠٢٦')+'<p class="sub">السنة كاملة · اضغطي على ٩ نوفمبر</p><div class="year-grid">'+names.map((m,mi)=>'<div class="mini-month"><b>'+m+'</b><div class="mini-days">'+Array.from({length:mi===1?28:[3,5,8,10].includes(mi)?30:31},(_,i)=>`<span class="${mi===10&&i===8?'marked':''}" ${mi===10&&i===8?'onclick="openDetail(\'today\')"':''}>${i+1}</span>`).join('')+'</div></div>').join('')+'</div>'+(detail?'<div class="card"><h3>٩ نوفمبر · مساء هادي</h3><p>قراءة بمقهى كلتورا، وبعدها موعد الأمانة.</p></div>':'')};

settingsHTML=function(){
  if(detail==='hints')return title('تلميحات التحقيق')+'<p class="ioscaption">كل تلميح يكشف لك خطوة زيادة، والسادس يعطيك الحل كامل.</p>'+hintTexts.slice(0,state.hints).map((h,i)=>'<div class="hint"><b>تلميح '+(i+1)+'</b><br>'+h+'</div>').join('')+(state.hints<6?'<button class="btn secondary" onclick="revealHint()">'+(state.hints===5?'اكشفي الحل كامل':'طلّعي التلميح اللي بعده')+'</button>':'');
  if(detail==='reset')return title('لعبة جديدة')+'<div class="card"><p>بينحذف تقدم هاللعبة والنهاية والمفضلة من هالمتصفح.</p><button class="btn danger" onclick="resetGame()">ابدئي من جديد</button><button class="btn secondary" onclick="openDetail(null)">إلغاء</button></div>';
  if(detail==='story')return title('عن القصة')+'<div class="story-note"><h3>وش السالفة؟</h3><p>أنتِ سارة، ولقيتي جوال ليان بمقهى كلتورا. فتشي التطبيقات واربطي اللي تركته عشان توصلين لملف الحقيقة.</p><button class="btn" onclick="openApp(\'notes\');setTimeout(()=>openDetail(\'start\'),0)">افتحي مقدمة القصة</button></div>';
  return title('الإعدادات')+'<div class="settings-hero"><span class="settings-avatar big">ل</span><span class="rowtext"><b style="font-size:18px">ليان</b><small>Apple ID، iCloud والوسائط والمشتريات</small></span><span class="chev">‹</span></div><div class="iosgroup"><div class="iosrow"><span class="setting-icon" style="background:#ff9f0a">✈</span><span class="rowtext"><b>نمط الطيران</b></span><span class="toggle"></span></div>'+row('Wi‑Fi','CULTURA WiFi',"toast('متصلة بشبكة مقهى كلتورا')",'⌁')+row('Bluetooth','تشغيل',"toast('البلوتوث شغّال')",'ᛒ')+row('خلوي','الشريحة الرئيسية',"toast('الخدمة الخلوية متاحة')",'▥')+'</div><div class="iosgroup">'+row('الإشعارات','',"toast('إشعارات ليان')",'◉')+row('الأصوات والحس اللمسي','الوضع الصامت مفعّل',"toast('الجوال على الصامت')",'♫')+row('التركيز','عدم الإزعاج',"toast('وضع التركيز مفعّل')",'☾')+row('مدة استخدام الجهاز','اليوم: ساعتين و١٢ دقيقة',"toast('ملخص الاستخدام')",'⌛')+'</div><div class="sectionlabel">اللعبة</div><div class="iosgroup">'+row('وش السالفة؟','اقري مقدمة القصة',"openDetail('story')",'❓')+row('تلميحات التحقيق','إذا وقفتي بمكان',"openDetail('hints')",'💡')+row('قفل الشاشة','',"lockPhone()",'🔒')+row('ابدئي لعبة جديدة','',"openDetail('reset')",'↻')+'</div>';
};

function gamesHTML(){
  if(gameMode==='memory')return '<div class="game-board"><h2>طابقي الرموز</h2><p class="sub">لقّي كل زوج بأقل عدد محاولات</p><div class="memory-grid">'+['☕','✈️','🎬','🍦','☕','✈️','🎬','🍦'].map((v,i)=>`<button class="memory-card ${memoryOpen.includes(i)||memoryMatched.includes(i)?'open':''} ${memoryMatched.includes(i)?'matched':''}" onclick="flipMemory(${i})">${v}</button>`).join('')+'</div><button class="btn secondary" onclick="gameMode=null;render()">رجوع للألعاب</button></div>';
  if(gameMode==='tap')return '<div class="game-board"><h2>تحدي السرعة</h2><p>النقاط: <b>'+tapScore+'</b> · قدامك ١٠ ثواني</p><button class="tap-target" onclick="tapScore++;render()">اضغطي!</button><button class="btn secondary" onclick="gameMode=null;clearTimeout(tapTimer);render()">إنهاء</button></div>';
  return title('ألعاب مصغّرة')+'<div class="game-home"><div class="game-grid"><button class="game-card" onclick="startMemory()"><i>🧩</i><b>طابقي الرموز</b><p>اختبري ذاكرتك</p></button><button class="game-card" onclick="startTap()"><i>⚡</i><b>تحدي السرعة</b><p>كم نقطة تجمعين؟</p></button></div></div>';
}
function startMemory(){gameMode='memory';memoryOpen=[];memoryMatched=[];render()}
function flipMemory(i){if(memoryOpen.includes(i)||memoryMatched.includes(i)||memoryOpen.length===2)return;memoryOpen.push(i);render();if(memoryOpen.length===2){var vals=['☕','✈️','🎬','🍦','☕','✈️','🎬','🍦'];setTimeout(()=>{if(vals[memoryOpen[0]]===vals[memoryOpen[1]])memoryMatched.push(...memoryOpen);memoryOpen=[];render();if(memoryMatched.length===8)toast('كفو! خلصتيها كلها 🎉')},650)}}
function startTap(){gameMode='tap';tapScore=0;clearTimeout(tapTimer);tapTimer=setTimeout(()=>{toast('خلص الوقت! نتيجتك '+tapScore);gameMode=null;render()},10000);render()}

function contactsHTML(){
  var people=[['أ','أمي','+966 5• ••• ••21'],['س','سارة','+966 5• ••• ••44'],['ن','ناصر','+966 5• ••• •019'],['م','مكتب التوثيق','011 ••• ••47']];
  if(detail){var p=people.find(x=>x[1]===detail);if(!p)return '';return '<div class="contact-detail"><div class="contact-avatar">'+p[0]+'</div><h2>'+p[1]+'</h2><p dir="ltr">'+p[2]+'</p><div class="contact-actions"><button onclick="toast(\'الاتصال غير متاح في النسخة المحفوظة\')">☎<small>اتصال</small></button><button onclick="openApp(\'messages\')">✉<small>رسالة</small></button><button onclick="toast(\'مشاركة جهة الاتصال\')">↗<small>مشاركة</small></button></div><div class="iosgroup"><div class="iosrow"><span class="rowtext"><small>رقم الجوال</small><b dir="ltr">'+p[2]+'</b></span></div></div></div>'}
  return title('جهات الاتصال')+'<input class="iossearch" placeholder="⌕ بحث" aria-label="بحث في جهات الاتصال"><p class="sectionlabel">المفضلة</p><div class="iosgroup contacts-list">'+people.map(p=>`<button class="iosrow" onclick="openDetail('${p[1]}')"><span class="contact-mini">${p[0]}</span><span class="rowtext"><b>${p[1]}</b><small dir="ltr">${p[2]}</small></span><span class="chev">‹</span></button>`).join('')+'</div>';
}

var baseRender=render;
render=function(){
  baseRender();
  if(current==='safari'){$('content').innerHTML=safariHTML();$('appTitle').textContent='سفاري'}
  else if(current==='games'){$('content').innerHTML='<div class="appbody">'+gamesHTML()+'</div>';$('appTitle').textContent='ألعاب'}
  else if(current==='contacts'){$('content').innerHTML='<div class="appbody">'+contactsHTML()+'</div>';$('appTitle').textContent=detail||'جهات الاتصال'}
  if($('content'))$('content').innerHTML=culturaText($('content').innerHTML);
};
