# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VideoWeb3 is a video generation engine built on Remotion 4.x with complete TypeScript type safety. It converts JSON configurations into customized videos through a comprehensive animation and styling system.

### Core Technologies
- **Remotion 4.0**: React-based video generation
- **TypeScript**: Strict typing with path aliases (`@/*`)
- **Express API**: Server-side rendering
- **Zod**: Schema validation
- **Tailwind v4**: Styling

## Development Commands

```bash
# Development
npm run dev          # Remotion Studio
npm run api:dev      # API server (port 3001)

# Rendering
npm run render:video # CLI video rendering
npm run render:still # Still frame rendering

# Quality
npm run lint         # ESLint + TypeScript check
npm run build        # Production build
```

## Architecture

### Directory Structure
- `src/animations/` - Text, image, transition animations
- `src/remotion/` - Video components and utilities
- `src/renderer/` - Core rendering engine
- `src/types/` - TypeScript definitions (VideoProps, schemas)
- `src/utils/` - Schema analyzer utilities
- `server.ts` - Express API server
- `render.ts` - CLI rendering

### Pipeline
JSON Input → Zod Validation → Enrichment → Remotion Rendering → Video Output

## API Endpoints

### Server (port 3001)
- `GET /health` - Server status
- `GET /api/schema` - Schema structure
- `GET /api/animations` - Available animations
- `GET /api/animations/:type/:name` - Animation parameters
- `POST /render` - Video rendering with `inputUrl` or `videoData`
- `GET /output/*` - Download files

## Animation System (Unified Architecture)

All animations now use consistent `TypedAnimationFunction` interface with metadata:
```typescript
animation({ duration?, frame, delay? }) → { style: CSSProperties }
```

### Duration System (Frame-based)
- **All durations in frames** (30fps standard)
- JSON input: `duration`, `inDuration`, `outDuration` (frames)
- Auto-fallback: `metadata.defaultDuration` → hardcoded defaults
- No seconds-to-frames conversion needed

### Text Animations
- **In**: `fadeIn`, `typing`, `slideUp`, `word-by-word-fade` 
- **Out**: `fadeOut`, `slideDown`
- **Highlights**: `yellow-box`, `red-box`, `underline`, `bold`, `glow`
- **Duration control**: `script.animation.inDuration`, `outDuration`

### Image Animations  
- `zoom-in`, `zoom-out`, `pan-right`, `none`
- **Duration**: Automatically matches scene duration (audioDuration)

### Transitions
- `fade`, `slide-left`, `slide-right`, `wipe-up`, `none`
- **Duration control**: `transition.duration`
- **No wrapping**: Direct `TypedAnimationFunction` usage

### Architecture Notes
- All `index.ts` files are simple export collections
- Animation-specific logic stays in individual files
- Example: `getCurrentTextChunk` moved to `wordByWordFade.ts` only
- Consistent metadata structure for auto-documentation

## Key Development Notes

### Schemas & Types
- All schemas: `src/types/VideoProps.ts`
- Use `/api/schema` to inspect structure
- Video duration auto-calculated from `audioDuration` fields
- Default duration: 3 seconds, FPS: 30
- **headerTitle**: Header service name (optional, default: "썰풀기")
- **postMeta**: Uses `leftText`/`rightText` for custom positioning instead of individual fields

### Adding Animations
1. Create in `src/animations/{type}/`
2. Export in `src/animations/{type}/index.ts` 
3. Auto-detected by API system

### Style System
- Component-independent styling via `templateStyle`
- Style generators in `src/remotion/utils/styleUtils.ts`
- Header, title, text, meta styled separately

### Video Rendering API

**Method 1: URL 방식 (기존)**
```bash
curl -X POST http://localhost:3001/render \
  -H "Content-Type: application/json" \
  -d '{"inputUrl": "https://your-server.com/config.json"}'
```

**Method 2: Direct JSON 방식 (신규)**
```bash
curl -X POST http://localhost:3001/render \
  -H "Content-Type: application/json" \
  -d '{
    "videoData": {
      "headerTitle": "My App",
      "title": "My Video",
      "postMeta": {
        "leftText": "작성자 | 오후 14:25",
        "rightText": "조회수 1,287"
      },
      "media": [...],
      "templateStyle": {...}
    },
    "outputConfig": {
      "filename": "custom_video",
      "bucket": "my-bucket",
      "path": "videos"
    }
  }'
```

**Parameters:**
- `inputUrl`: JSON 설정 파일 URL (Method 1 전용)
- `videoData`: VideoProps 객체 (Method 2 전용)
- `outputConfig`: 출력 설정 (Method 2 전용)
  - `filename`: 파일명 (기본값: `video_${timestamp}`)
  - `bucket`: Supabase 버킷 (기본값: `ssul`)
  - `path`: 업로드 경로 (기본값: `videos`)

**Response:**
```json
{
  "success": true,
  "message": "Video rendering and upload completed successfully",
  "videoUrl": "https://...",
  "duration": 30000,
  "uploadPath": "videos/my_video.mp4"
}
```

### Important
- TypeScript strict mode enforced
- Use absolute URLs for remote assets
- Path aliases configured (`@/*`)
- CORS enabled, 50MB limit