# شرح كتاب معالجة الكلام واللغة

موقع عربي يشرح كتاب **Speech and Language Processing** (Jurafsky & Martin، مسودة الطبعة الثالثة) فصلاً فصلاً: خلاصة كل قسم، وشرح مفصّل، وشرح كل مفهوم رياضي من الصفر، وأدوات تفاعلية.

## البنية

```
index.html                 الصفحة الرئيسية: قائمة الفصول
chapters/NN-name.html      صفحة لكل فصل
assets/css/site.css        التصميم المشترك (خطوط Noto، الألوان، الصناديق)
assets/js/chNN.js          الأدوات التفاعلية الخاصة بكل فصل
arabic/                    المسار العربي: صفحة المسار وعشرة دروس
assets/js/arNN.js          أدوات دروس المسار العربي (ومعها ar-common.js)
_src/                      مصادر صفحات المسار العربي ومولّدها (لا تُنشر)
.github/workflows/pages.yml النشر التلقائي على GitHub Pages
```

موقع ثابت بلا خطوة بناء. أي دفع إلى فرع `main` ينشره تلقائياً.

## إضافة فصل

1. أنشئ `chapters/NN-name.html` على قالب `01-introduction.html`.
2. ضع أدواته في `assets/js/chNN.js`.
3. حوّل بطاقة الفصل في `index.html` من «قريباً» إلى رابط.

## المسار العربي

صفحات `arabic/NN-*.html` مولَّدة من `_src/arabic/NN-*.frag` بالأمر:

```
python3 _src/build_arabic.py
```

عدّل ملف `.frag` (المحتوى) أو `assets/js/arNN.js` (الأدوات) ثم أعد التوليد. وصفحة `arabic/index.html` ومربعات «وفي العربية» في الفصول مكتوبة مباشرة.
