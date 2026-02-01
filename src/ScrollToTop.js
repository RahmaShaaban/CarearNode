import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation(); // بيعرف إحنا في أنهي صفحة دلوقتي

  useEffect(() => {
    // كل ما الـ pathname يتغير (يعني روحنا صفحة جديدة)، اطلعي لفوق خالص
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // المكون ده وظيفي بس ومش بيرسم حاجة على الشاشة
}