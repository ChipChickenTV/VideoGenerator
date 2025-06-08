import React from 'react';

// Font options - change the active import to try different fonts
const FontLoader: React.FC = () => {
  return (
    <style>{`
      /* ✅ Currently Active: Pretendard (Modern, Popular in Korea) */
      @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/static/pretendard.css');
      
      /* 🎨 Alternative Options - Replace above line to try: */
      
      /* Option 1: Noto Sans KR (Google, Clean & Reliable) */
      /* @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap'); */
      
      /* Option 2: SUIT (Korean, Youthful & Modern) */
      /* @import url('https://cdn.jsdelivr.net/gh/sunn-us/SUIT/fonts/static/woff2/SUIT.css'); */
      
      /* Option 3: IBM Plex Sans KR (IBM, Tech-savvy) */
      /* @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@300;400;500;600;700&display=swap'); */
      
      /* Option 4: Spoqa Han Sans Neo (Spoqa, Friendly) */
      /* @import url('https://cdn.jsdelivr.net/gh/spoqa/spoqa-han-sans@latest/css/SpoqaHanSansNeo.css'); */
    `}</style>
  );
};

export default FontLoader; 