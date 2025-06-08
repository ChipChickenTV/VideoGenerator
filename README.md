# YouTube Shorts Generator

Remotion을 사용하여 `input.json` 데이터를 기반으로 YouTube Shorts 비디오를 생성합니다.

## ✅ 요구사항

- Node.js 18 이상
- npm 또는 yarn

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

---

### 2. Remotion Studio (실시간 미리보기)

개발 중 실시간으로 비디오를 확인하고 수정하려면 Remotion Studio를 사용하세요.

```bash
npm start
```

이 명령어를 실행하면 브라우저에서 스튜디오가 열립니다.

---

### 3. Headless 렌더링 (MP4 파일 생성)

최종 비디오 파일을 생성하려면 다음 명령어를 사용하세요. 브라우저 창 없이 백그라운드에서 렌더링이 진행됩니다.

```bash
# 기본 품질로 렌더링
npm run render:headless
```

렌더링이 완료되면 `out/youtube-shorts.mp4` 파일이 생성됩니다.

#### 고품질 또는 빠른 렌더링

필요에 따라 다른 품질 옵션을 선택할 수 있습니다.

```bash
# 고품질 (느리지만 화질 좋음)
npm run render:headless:hq

# 빠른 렌더링 (화질 낮음)
npm run render:headless:fast
```

--- 