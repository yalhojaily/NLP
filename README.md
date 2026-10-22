# شرح كتاب معالجة الكلام واللغة

موقع عربي يشرح كتاب **Speech and Language Processing** (Jurafsky & Martin، مسودة الطبعة الثالثة) فصلاً فصلاً: خلاصة كل قسم، وشرح مفصّل، وشرح كل مفهوم رياضي من الصفر، وأدوات تفاعلية.

## البنية

```
index.html                 الصفحة الرئيسية: قائمة الفصول
chapters/NN-name.html      صفحة لكل فصل
assets/css/site.css        التصميم المشترك (خطوط Noto، الألوان، الصناديق)
assets/js/chNN.js          الأدوات التفاعلية الخاصة بكل فصل
.github/workflows/pages.yml النشر التلقائي على GitHub Pages
```

موقع ثابت بلا خطوة بناء. أي دفع إلى فرع `main` ينشره تلقائياً.

## إضافة فصل

1. أنشئ `chapters/NN-name.html` على قالب `01-introduction.html`.
2. ضع أدواته في `assets/js/chNN.js`.
3. حوّل بطاقة الفصل في `index.html` من «قريباً» إلى رابط.
