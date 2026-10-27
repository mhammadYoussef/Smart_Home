(function (root) {
  'use strict';
  // UI strings only. JSON keys, metric IDs and imported dataset text are never translated.
  const dictionaries = {
    en: {
      'app.name':'Smart Home','app.tagline':'LOCAL DASHBOARD','app.edition':'STARTER / 01','app.eyebrow':'SMART HOME / DASHBOARD','app.footer':'SMART HOME / v1.0.0 · MIT CODE',
      'lang.toggle':'العربية','lang.toggleLabel':'Switch language to Arabic','skip':'Skip to dashboard',
      'nav.label':'Dashboard','nav.overview':'Home overview','nav.thermal':'Heat pump','nav.history':'Explore readings','nav.menu':'Menu','nav.open':'Open navigation','nav.close':'Close navigation','nav.hide':'Hide sidebar','nav.collapse':'Collapse sidebar','nav.expand':'Expand sidebar','nav.moveLeft':'Move sidebar to the left','nav.moveRight':'Move sidebar to the right',
      'sidebar.local':'LOCAL FIRST','sidebar.stay':'Your readings stay here.',
      'title.overview':'Home, in view.','title.thermal':'Heating, understood.','title.history':'A little perspective.','subtitle':'One place to understand your home.',
      'source.demo':'Synthetic demo · not a real home',
      'action.demo':'Demo','action.import':'Import readings','action.export':'Export JSON','action.recorder':'Load local recorder',
      'badge.demo':'SYNTHETIC DEMO','badge.recorderSynthetic':'SYNTHETIC / RECORDER','badge.recorderStale':'RECORDER / STALE','badge.recorderRecent':'RECORDER / RECENT','badge.imported':'IMPORTED / RECORDED',
      'footer.demo':'Synthetic sample','footer.recorded':'Latest recorded sample',
      'scene.tag':'THE BIG PICTURE','scene.sample':'SAMPLE HOME','scene.imported':'YOUR IMPORTED READINGS','scene.alt':'Generic illustrated home with solar panels and garage','scene.kicker':'Built around one useful question.','scene.question':'What’s happening at home?',
      'energy.eyebrow':'ENERGY / OVER TIME','energy.title':'Where the power goes.','energy.range':'Overview time range','range.24':'Last 24 hours','range.6':'Last 6 hours','range.1':'Last hour',
      'energy.note':'Site consumption includes the house and garage. Grid exchange is a separate measurement.',
      'split.eyebrow':'BUILDINGS / LATEST SAMPLE','split.title':'A little more context.','split.total':'Total site','split.garage':'Garage','split.house':'House',
      'split.note':'House = site − garage. Only derived from meters representing the same sample time. Your adapter must check source freshness and alignment first.',
      'card.solar':'SOLAR GENERATION','card.solarNote':'Panel production only.','card.load':'SITE CONSUMPTION','card.loadNote':'Whole property demand.',
      'card.gridExport':'GRID / EXPORT','card.gridImport':'GRID / IMPORT','card.gridNote':'Positive import · negative export.','card.battery':'BATTERY CHARGE','card.batteryNote':'Charge level, not power.',
      'card.hotWater':'HOT WATER','card.outdoor':'OUTDOOR','card.tempNote':'Latest recorded temperature.','card.compressor':'COMPRESSOR','card.compressorNote':'Frequency is not input power.',
      'thermal.eyebrow':'HEAT PUMP / OBSERVE FIRST','thermal.title':'A day tells you more than a number.','thermal.intro':'Temperature and compressor frequency share a timeline. This starter does not calculate electrical cost or efficiency from compressor frequency.',
      'thermal.hotWater':'Hot-water temperature','thermal.hotWaterNote':'Missing readings remain gaps. No readings are interpolated.','thermal.compressor':'Compressor activity','thermal.compressorNote':'Frequency indicates compressor activity. It is not an electrical-power measurement.',
      'history.eyebrow':'HISTORY / EXPLORE','history.title':'Follow a reading.','history.metric':'Measurement','history.recent':'Most recent samples','history.latest':'Latest 12','history.time':'Time','history.reading':'Reading',
      'history.coverage':'{n} of {total} samples contain this reading. Missing values and gaps over 10 minutes break the line. Chart times use your browser’s local timezone.','history.unavailable':'Unavailable',
      'metric.solar':'Solar generation','metric.siteLoad':'Site consumption','metric.garage':'Garage consumption','metric.gridNet':'Grid exchange','metric.batterySOC':'Battery charge','metric.hotWater':'Hot water','metric.outdoor':'Outdoor temperature','metric.compressor':'Compressor frequency',
      'chart.label':'{metrics} over time','chart.and':' and ','chart.empty':'No readings in this range.',
      'msg.demo':'Demo restored. All values are synthetic.','msg.tooLarge':'File too large. Keep it below 2 MB.','msg.badJson':'The file is not valid JSON.','msg.imported':'Imported {n} samples. They stay in this tab; export to keep a copy.','msg.importFailed':'Could not import: {error}',
      'msg.exported':'Exported the current dataset. Review your own readings before sharing them.','msg.needServer':'Start the optional local server with npm start, then open its printed address.','msg.noRecorder':'Recorder history is unavailable. Start the included local server and recorder; see README.',
      'msg.recorder':'Loaded local recorder history. Click again to refresh; this is a snapshot.','msg.artwork':'Custom artwork was unavailable. Using the included generic illustration.',
      'err.schema':'Use schemaVersion 1 with 1–5,000 samples.','err.timestamp':'Sample {1}: use a valid ISO timestamp, not a future time.','err.values':'Sample {1}: values must contain at least one supported measurement.','err.calendar':'Invalid calendar date.',
      'err.unknown':'Unknown measurement: {1}','err.number':'{1}: use a finite number or null.','err.range':'{1}: value outside the supported range.','err.duplicate':'Duplicate sample timestamps.',
    },
    ar: {
      'app.name':'Smart Home','app.tagline':'لوحة تحكم محلية','app.edition':'نسخة أولى / 01','app.eyebrow':'SMART HOME / لوحة التحكم','app.footer':'SMART HOME / v1.0.0 · شيفرة برخصة MIT',
      'lang.toggle':'English','lang.toggleLabel':'التبديل إلى اللغة الإنجليزية','skip':'انتقل إلى لوحة التحكم',
      'nav.label':'لوحة التحكم','nav.overview':'نظرة عامة على المنزل','nav.thermal':'المضخة الحرارية','nav.history':'استكشاف القراءات','nav.menu':'القائمة','nav.open':'فتح قائمة التنقل','nav.close':'إغلاق قائمة التنقل','nav.hide':'إخفاء الشريط الجانبي','nav.collapse':'طي الشريط الجانبي','nav.expand':'توسيع الشريط الجانبي','nav.moveLeft':'نقل الشريط الجانبي إلى اليسار','nav.moveRight':'نقل الشريط الجانبي إلى اليمين',
      'sidebar.local':'محلي أولاً','sidebar.stay':'قراءاتك تبقى هنا.',
      'title.overview':'منزلك، أمام عينيك.','title.thermal':'التدفئة، بوضوح.','title.history':'نظرة أوسع قليلاً.','subtitle':'مكان واحد لفهم منزلك.',
      'source.demo':'عرض تجريبي اصطناعي · ليس منزلاً حقيقياً',
      'action.demo':'العرض التجريبي','action.import':'استيراد القراءات','action.export':'تصدير JSON','action.recorder':'تحميل المسجّل المحلي',
      'badge.demo':'عرض تجريبي اصطناعي','badge.recorderSynthetic':'اصطناعي / المسجّل','badge.recorderStale':'المسجّل / قديم','badge.recorderRecent':'المسجّل / حديث','badge.imported':'مستورد / مسجّل',
      'footer.demo':'عينة اصطناعية','footer.recorded':'أحدث عينة مسجّلة',
      'scene.tag':'الصورة الكاملة','scene.sample':'منزل نموذجي','scene.imported':'قراءاتك المستوردة','scene.alt':'رسم توضيحي عام لمنزل مع ألواح شمسية ومرآب','scene.kicker':'مبني حول سؤال واحد مفيد.','scene.question':'ماذا يحدث في المنزل؟',
      'energy.eyebrow':'الطاقة / عبر الزمن','energy.title':'إلى أين تذهب الطاقة.','energy.range':'النطاق الزمني للنظرة العامة','range.24':'آخر 24 ساعة','range.6':'آخر 6 ساعات','range.1':'آخر ساعة',
      'energy.note':'يشمل استهلاك الموقع المنزل والمرآب. تبادل الشبكة قياس منفصل.',
      'split.eyebrow':'المباني / أحدث عينة','split.title':'مزيد من السياق.','split.total':'إجمالي الموقع','split.garage':'المرآب','split.house':'المنزل',
      'split.note':'المنزل = الموقع − المرآب. يُحسب فقط من عدادات تمثل وقت العينة نفسه. يجب أن يتحقق المحوّل أولاً من حداثة المصدر وتزامنه.',
      'card.solar':'توليد الطاقة الشمسية','card.solarNote':'إنتاج الألواح فقط.','card.load':'استهلاك الموقع','card.loadNote':'طلب العقار بالكامل.',
      'card.gridExport':'الشبكة / تصدير','card.gridImport':'الشبكة / استيراد','card.gridNote':'موجب = استيراد · سالب = تصدير.','card.battery':'شحن البطارية','card.batteryNote':'مستوى الشحن، وليس القدرة.',
      'card.hotWater':'الماء الساخن','card.outdoor':'الحرارة الخارجية','card.tempNote':'آخر درجة حرارة مسجّلة.','card.compressor':'الضاغط','card.compressorNote':'التردد ليس قدرة الإدخال.',
      'thermal.eyebrow':'المضخة الحرارية / الملاحظة أولاً','thermal.title':'يوم كامل يخبرك أكثر من رقم واحد.','thermal.intro':'تتشارك درجة الحرارة وتردد الضاغط خطاً زمنياً واحداً. لا يحسب هذا التطبيق التكلفة الكهربائية أو الكفاءة من تردد الضاغط.',
      'thermal.hotWater':'درجة حرارة الماء الساخن','thermal.hotWaterNote':'تبقى القراءات المفقودة فجوات. لا يتم استيفاء أي قراءات.','thermal.compressor':'نشاط الضاغط','thermal.compressorNote':'يشير التردد إلى نشاط الضاغط. وهو ليس قياساً للقدرة الكهربائية.',
      'history.eyebrow':'السجل / استكشاف','history.title':'تتبّع قراءة.','history.metric':'القياس','history.recent':'أحدث العينات','history.latest':'آخر 12','history.time':'الوقت','history.reading':'القراءة',
      'history.coverage':'{n} من أصل {total} عينة تحتوي على هذه القراءة. القيم المفقودة والفجوات التي تتجاوز 10 دقائق تقطع الخط. تستخدم أوقات الرسم البياني المنطقة الزمنية المحلية لمتصفحك.','history.unavailable':'غير متاح',
      'metric.solar':'توليد الطاقة الشمسية','metric.siteLoad':'استهلاك الموقع','metric.garage':'استهلاك المرآب','metric.gridNet':'تبادل الشبكة','metric.batterySOC':'شحن البطارية','metric.hotWater':'الماء الساخن','metric.outdoor':'درجة الحرارة الخارجية','metric.compressor':'تردد الضاغط',
      'chart.label':'{metrics} عبر الزمن','chart.and':' و','chart.empty':'لا توجد قراءات في هذا النطاق.',
      'msg.demo':'تمت استعادة العرض التجريبي. جميع القيم اصطناعية.','msg.tooLarge':'الملف كبير جداً. يجب أن يكون أقل من 2 ميغابايت.','msg.badJson':'الملف ليس JSON صالحاً.','msg.imported':'تم استيراد {n} عينة. تبقى في هذا التبويب؛ صدّرها للاحتفاظ بنسخة.','msg.importFailed':'تعذّر الاستيراد: {error}',
      'msg.exported':'تم تصدير مجموعة البيانات الحالية. راجع قراءاتك قبل مشاركتها.','msg.needServer':'شغّل الخادم المحلي الاختياري باستخدام npm start، ثم افتح العنوان الذي يطبعه.','msg.noRecorder':'سجل المسجّل غير متاح. شغّل الخادم المحلي والمسجّل المرفقين؛ راجع README.',
      'msg.recorder':'تم تحميل سجل المسجّل المحلي. انقر مجدداً للتحديث؛ هذه لقطة.','msg.artwork':'العمل الفني المخصص غير متاح. يتم استخدام الرسم التوضيحي العام المرفق.',
      'err.schema':'استخدم schemaVersion 1 مع 1–5,000 عينة.','err.timestamp':'العينة {1}: استخدم طابعاً زمنياً ISO صالحاً، وليس وقتاً مستقبلياً.','err.values':'العينة {1}: يجب أن تحتوي values على قياس مدعوم واحد على الأقل.','err.calendar':'تاريخ تقويمي غير صالح.',
      'err.unknown':'قياس غير معروف: {1}','err.number':'{1}: استخدم رقماً محدوداً أو null.','err.range':'{1}: القيمة خارج النطاق المدعوم.','err.duplicate':'طوابع زمنية مكررة للعينات.',
    },
  };
  // Maps the model's English validation errors to dictionary keys; captured groups fill {1}.
  const errors = [
    [/^Use schemaVersion 1 with 1–5,000 samples\.$/,'err.schema'],
    [/^Sample (\d+): use a valid ISO timestamp, not a future time\.$/,'err.timestamp'],
    [/^Sample (\d+): values must contain at least one supported measurement\.$/,'err.values'],
    [/^Invalid calendar date\.$/,'err.calendar'],
    [/^Unknown measurement: (.*)$/,'err.unknown'],
    [/^(.+): use a finite number or null\.$/,'err.number'],
    [/^(.+): value outside the supported range\.$/,'err.range'],
    [/^Duplicate sample timestamps\.$/,'err.duplicate'],
  ];
  const languages = ['en','ar'];
  let lang = 'en';
  function t(key, vars={}) {
    const s = dictionaries[lang][key] ?? dictionaries.en[key] ?? key;
    return s.replace(/\{(\w+)\}/g, (m,name) => name in vars ? String(vars[name]) : m);
  }
  function translateError(message) {
    for (const [pattern,key] of errors) { const m = pattern.exec(message); if (m) return t(key, {1:m[1]}); }
    return message;
  }
  function setLanguage(next) { lang = languages.includes(next) ? next : 'en'; return lang; }
  root.SmartHomeI18n = {dictionaries,errors,languages,t,translateError,setLanguage,get lang(){return lang},get dir(){return lang==='ar'?'rtl':'ltr'}};
})(globalThis);
