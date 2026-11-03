#!/bin/sh
# يحذف مكوّنات «من نحن» و«قصتنا» القديمة بعد استبدالها بـ components/story و components/company.
# شغّله من جذر المشروع بعد التأكد أن الصفحتين تعملان: sh REMOVE-OLD-ABOUT.sh
rm -rf components/about
echo "تم حذف components/about"
