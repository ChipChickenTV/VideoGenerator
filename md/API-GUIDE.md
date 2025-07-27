# VideoWeb3 API 서버 사용 가이드

> 🎬 차세대 비디오 생성 엔진 - API 서버 완벽 가이드

## 📋 개요

VideoWeb3 API 서버는 Report.md의 **ADR-002(로컬 렌더링 중심 전략)**과 **ADR-004(공유 가능한 렌더링 모듈 설계)**에 따라 구현된 개인용 서버입니다.

- **Node.js API**: `src/renderer` 모듈을 통한 프로그래매틱 렌더링
- **CLI 스크립트**: 동일한 `src/renderer` 모듈 사용
- **HTTP API**: Express 기반 RESTful API
- **타입 안전성**: Zod 스키마 기반 런타임 검증

---

## 🚀 서버 시작

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 시작
```bash
npm run api:dev
# 또는
ts-node server.ts
```

### 3. 프로덕션 빌드 및 실행
```bash
npm run api:build
npm run api:start
```

서버가 시작되면 `http://localhost:3001`에서 접근할 수 있습니다.

---

## 📡 API 엔드포인트

### `GET /` - API 정보
서버 정보와 사용 가능한 엔드포인트를 반환합니다.

```bash
curl http://localhost:3001/
```

**응답:**
```json
{
  "message": "VideoWeb3 API Server",
  "version": "1.0.0",
  "description": "차세대 비디오 생성 엔진 - API",
  "endpoints": {
    "POST /render": "비디오 렌더링",
    "POST /render/still": "스틸 이미지 렌더링",
    "POST /validate": "Props 검증",
    "GET /status": "서버 상태",
    "GET /output/*": "렌더링 결과 다운로드"
  }
}
```

### `GET /status` - 서버 상태
서버 상태와 시스템 정보를 반환합니다.

```bash
curl http://localhost:3001/status
```

**응답:**
```json
{
  "status": "running",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "uptime": 1234.567,
  "memory": {...},
  "version": "v20.11.0",
  "remotion": "4.0.324"
}
```

### `POST /validate` - Props 검증
VideoProps 스키마 검증을 수행합니다.

```bash
curl -X POST http://localhost:3001/validate \
  -H "Content-Type: application/json" \
  -d @input.json
```

**응답 (성공):**
```json
{
  "success": true,
  "message": "Props validation successful",
  "props": {...}
}
```

**응답 (실패):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "path": ["media", 0, "image", "url"],
      "message": "Invalid url"
    }
  ]
}
```

### `POST /render` - 비디오 렌더링
JSON props를 받아 비디오를 렌더링합니다.

```bash
curl -X POST http://localhost:3001/render \
  -H "Content-Type: application/json" \
  -d '{
    "props": {
      "title": "테스트 비디오",
      "media": [...]
    },
    "outputPath": "out/my_video.mp4",
    "codec": "h264",
    "jpegQuality": 80,
    "verbose": true
  }'
```

**요청 파라미터:**
- `props` (필수): VideoProps 객체
- `outputPath` (선택): 출력 파일 경로 (기본: `out/video_[timestamp].mp4`)
- `codec` (선택): 비디오 코덱 (`h264`, `h265`, `vp8`, `vp9`, `prores`)
- `jpegQuality` (선택): JPEG 품질 1-100 (기본: 80)
- `concurrency` (선택): 동시 처리 수 (기본: null = 자동)
- `overwrite` (선택): 파일 덮어쓰기 (기본: true)
- `verbose` (선택): 상세 로그 (기본: false)

**응답 (성공):**
```json
{
  "success": true,
  "message": "Video rendering completed successfully",
  "result": {
    "success": true,
    "outputPath": "/absolute/path/to/out/my_video.mp4",
    "downloadUrl": "/output/my_video.mp4",
    "duration": 45230,
    "totalDuration": 47890,
    "assetsInfo": {...}
  }
}
```

**응답 (실패):**
```json
{
  "success": false,
  "error": "Rendering failed: ...",
  "result": {
    "success": false,
    "outputPath": "/absolute/path/to/out/my_video.mp4",
    "error": "...",
    "duration": 12340
  }
}
```

### `POST /render/still` - 스틸 이미지 렌더링
특정 프레임의 스틸 이미지를 렌더링합니다.

```bash
curl -X POST http://localhost:3001/render/still \
  -H "Content-Type: application/json" \
  -d '{
    "props": {
      "title": "테스트 비디오",
      "media": [...]
    },
    "frame": 30,
    "outputPath": "out/still.png",
    "jpegQuality": 95
  }'
```

**요청 파라미터:**
- `props` (필수): VideoProps 객체
- `frame` (선택): 프레임 번호 (기본: 0)
- `outputPath` (선택): 출력 파일 경로 (기본: `out/still_[timestamp].png`)
- `jpegQuality` (선택): 이미지 품질 (기본: 90)
- `verbose` (선택): 상세 로그 (기본: false)

### `GET /output/*` - 렌더링 결과 다운로드
렌더링된 파일을 다운로드합니다.

```bash
# 렌더링 응답에서 받은 downloadUrl 사용
curl -O http://localhost:3001/output/my_video.mp4
```

---

## 🖥️ CLI 사용법

### 기본 사용법
```bash
npx ts-node render.ts <command> [options]
```

### 비디오 렌더링
```bash
# input.json 파일로 렌더링
npm run render:video
# 또는
npx ts-node render.ts video --props-file input.json --output out/video.mp4 --verbose

# JSON 문자열로 렌더링
npx ts-node render.ts video --props '{"title":"테스트","media":[...]}' --codec h265

# 고품질 렌더링
npx ts-node render.ts video --props-file input.json --codec h265 --jpeg-quality 95
```

### 스틸 이미지 렌더링
```bash
# 첫 번째 프레임
npm run render:still
# 또는
npx ts-node render.ts still --props-file input.json --frame 0 --output out/still.png

# 특정 프레임 (30번째)
npx ts-node render.ts still --props-file input.json --frame 30 --verbose
```

### CLI 옵션
- `--props-file <path>`: Props JSON 파일 경로
- `--props <json>`: Props JSON 문자열
- `--output <path>`: 출력 파일 경로
- `--codec <codec>`: 비디오 코덱
- `--frame <number>`: 스틸 이미지 프레임 번호
- `--jpeg-quality <1-100>`: JPEG 품질
- `--concurrency <number>`: 동시 처리 수
- `--verbose`: 상세 로그 출력
- `--help, -h`: 도움말 표시

---

## 📝 Props 스키마

VideoWeb3는 Zod 스키마를 사용하여 타입 안전성을 보장합니다.

### 기본 구조
```typescript
interface VideoProps {
  theme?: {
    fontFamily?: string;
    textColor?: string;
    backgroundColor?: string;
    headerColor?: string;
    layout?: string;
  };
  title?: string;
  postMeta?: {
    author?: string;
    time?: string;
    viewCount?: string;
  };
  media: Array<{
    image?: {
      url: string;
      animation?: {
        effect?: 'static' | 'zoom-in' | 'pan-right' | 'zoom-out';
        filter?: 'none' | 'grayscale' | 'sepia' | 'blur';
      };
    };
    script: {
      text: string;
      animation?: {
        in?: 'fadeIn' | 'typing' | 'slideUp';
        out?: 'fadeOut' | 'slideDown';
        highlight?: 'none' | 'yellow-box' | 'underline';
      };
    };
    voice?: string;
    transition?: {
      effect?: 'slide-left' | 'slide-right' | 'fade' | 'wipe-up';
      duration?: number;
    };
  }>;
}
```

### 예시 Props (input.json)
```json
{
  "theme": {
    "fontFamily": "Pretendard, sans-serif",
    "textColor": "#1a1a1a",
    "backgroundColor": "#ffffff",
    "headerColor": "#a5d8f3",
    "layout": "text-middle"
  },
  "title": "플라스틱의 비밀",
  "postMeta": {
    "author": "VideoWeb3",
    "time": "14:25",
    "viewCount": "1,234,567"
  },
  "media": [
    {
      "script": {
        "text": "플라스틱이 <h>실제로 무거워지고 있다는</h> 사실, 알고 계셨나요?",
        "animation": {
          "in": "typing",
          "highlight": "yellow-box"
        }
      },
      "image": {
        "url": "image.png",
        "animation": {
          "effect": "zoom-in",
          "filter": "sepia"
        }
      }
    }
  ]
}
```

---

## ⚡ 성능 최적화

### 하드웨어 가속 (macOS)
```bash
# macOS에서 VideoToolbox 하드웨어 가속 사용
npx ts-node render.ts video --props-file input.json --codec h265
```

### 동시 처리 최적화
```bash
# CPU 코어 수에 맞춰 자동 설정 (권장)
npx ts-node render.ts video --props-file input.json --concurrency null

# 수동 설정 (4코어)
npx ts-node render.ts video --props-file input.json --concurrency 4
```

### 품질 vs 속도 조절
```bash
# 고품질 (느림)
npx ts-node render.ts video --props-file input.json --codec h265 --jpeg-quality 95

# 표준 품질 (빠름)
npx ts-node render.ts video --props-file input.json --codec h264 --jpeg-quality 70
```

---

## 🐛 문제 해결

### 일반적인 오류

**1. Props 검증 실패**
```
❌ Props 검증 실패:
  - media.0.image.url: Invalid url
```
→ `src/types/VideoProps.ts`에서 스키마 확인

**2. 파일 경로 오류**
```
❌ Props 파일을 찾을 수 없습니다: input.json
```
→ 파일 경로 확인 또는 절대 경로 사용

**3. 포트 충돌**
```
Error: listen EADDRINUSE :::3001
```
→ `PORT=3002 npm run api:dev`로 다른 포트 사용

### 로그 확인

**서버 로그:**
```bash
npm run api:dev
# 또는 상세 로그
DEBUG=* npm run api:dev
```

**CLI 상세 로그:**
```bash
npx ts-node render.ts video --props-file input.json --verbose
```

---

## 🔗 관련 문서

- [Report.md](./Report.md) - 기술 청사진 및 아키텍처
- [ANIMATIONS.md](./ANIMATIONS.md) - 애니메이션 명세서
- [remotion_llm.txt](./remotion_llm.txt) - Remotion 가이드

---

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. **의존성**: `npm install` 완료
2. **Node.js**: v16+ 사용
3. **TypeScript**: `npx tsc --noEmit` 컴파일 확인
4. **Remotion**: `npm run dev`로 Studio 정상 작동 확인

💡 **팁**: API와 CLI는 동일한 `src/renderer` 모듈을 사용하므로, 한쪽에서 작동하면 다른 쪽도 작동합니다! 