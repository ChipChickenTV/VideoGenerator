# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VideoWeb3 is a next-generation video generation engine built on Remotion 4.x. It provides a comprehensive system for creating customized videos with advanced styling, animations, and rendering capabilities.

### Core Technologies
- **Remotion 4.0**: React-based video generation framework
- **TypeScript**: Strict typing with path aliases (`@/remotion/*`, `@/renderer/*`, etc.)
- **Express API**: Server-side rendering API
- **Zod**: Schema validation and type generation
- **Tailwind v4**: Styling framework

## Development Commands

### Core Development
```bash
# Start Remotion Studio (main video preview/editing interface)
npm run dev

# Start API server for video rendering
npm run api:dev
```

### Rendering & Testing
```bash
# CLI rendering for testing
npm run render:video

# Render still frame for testing
npm run render:still

# Basic Remotion render
npm run render

# CLI render with custom options
npm run render:cli

# Lint and type check
npm run lint

# Build for production
npm run build
```

### API Commands
```bash
# Build API server
npm run api:build

# Run production API server
npm run api:start

# Upgrade Remotion dependencies
npm run upgrade
```

## Architecture

### Directory Structure
- `src/animations/` - Animation modules (text, image, transitions)
- `src/config/` - Theme configurations and presets
- `src/remotion/` - Remotion video components and utilities
- `src/renderer/` - Core rendering engine with validation
- `src/types/` - TypeScript type definitions
- `src/lib/` - External service integrations (Supabase)
- `src/utils/` - Utility functions (schema analyzer, parameter extractor)
- `server.ts` - Express API server
- `render.ts` - CLI rendering script
- `legacy/` - Legacy showcase application files

### Key Components

#### Video Generation Pipeline
1. **Input**: JSON via URL (`inputUrl` parameter) 
2. **Validation**: Zod schema validation (`VideoPropsSchema`)
3. **Enrichment**: Audio duration calculation and data processing
4. **Rendering**: Remotion-based video generation
5. **Storage**: Supabase upload with automatic cleanup
6. **Output**: Public video URL

#### Core Rendering Architecture
- `src/renderer/core.ts` - Main rendering logic
- `src/renderer/validation.ts` - Props validation and enrichment  
- `src/renderer/enrichment.ts` - Data processing and audio handling
- `src/renderer/bundler.ts` - Webpack bundling for rendering
- `src/Root.tsx` - Remotion composition registration

### Schema System
The project uses a comprehensive Zod schema system:
- **VideoPropsSchema**: Main video configuration
- **SceneSchema**: Individual scene/slide definitions  
- **TemplateStyleSchema**: Styling and theming options

## API Endpoints

### Development Server (port 3001)
- `GET /health` - Server status and metrics
- `GET /api/schema` - Get schema structure (1-depth analysis)
- `GET /api/schema/:field` - Field-specific schema details
- `GET /api/animations` - Available animations list (dynamic)
- `GET /api/animations/:type/:name` - Animation parameters (dynamic)
- `POST /render` - Video rendering with `inputUrl`
- `GET /output/*` - Download rendered files
- `GET /schema-viewer.html` - Visual API schema documentation (JSON-style viewer)

## Style System

VideoWeb3 supports direct style customization through the `templateStyle` object without theme presets.

### Component-Level Styling
The system supports independent styling for:
- Header (with shadow/glow effects)
- Title (independent font/color)
- Text/Body content (with alignment options)  
- Meta information (author, time, views)

## Animation System

### Text Animations
- **In**: `fadeIn`, `typing`, `slideUp`, `word-by-word-fade`
- **Out**: `fadeOut`, `slideDown`
- **Highlights**: `yellow-box`, `red-box`, `underline`, `bold`, `glow`, etc.

### Image Animations
- `zoom-in`, `zoom-out`, `pan-right`, `static`

#### TypedAnimationFunction Migration Status
✅ **Completed Image Animations** (2025-08-22):
- `panRight.ts` - TypedAnimationFunction metadata 시스템 적용 완료
- `zoomIn.ts` - TypedAnimationFunction metadata 시스템 적용 완료  
- `zoomOut.ts` - TypedAnimationFunction metadata 시스템 적용 완료
- 모든 `as any` 사용 제거, 한글 description 추가, Object.assign 패턴 적용

✅ **Completed Transition Animations** (2025-08-22):
- `fade.ts` - TypedAnimationFunction metadata 시스템 적용 완료
- `slideLeft.ts` - TypedAnimationFunction metadata 시스템 적용 완료
- `slideRight.ts` - TypedAnimationFunction metadata 시스템 적용 완료
- `wipeUp.ts` - TypedAnimationFunction metadata 시스템 적용 완료
- 모든 `as any` 사용 완전 제거, 한글 description 추가, Object.assign 패턴 적용
- TransitionAnimation 호환성 wrapper 함수 구현 (`transitions/index.ts`)

✅ **Completed Text Animations** (2025-08-22):
- `fadeOut.ts` - TypedAnimationFunction metadata 시스템 적용 완료 (as any 2개 제거)
- `slideDown.ts` - TypedAnimationFunction metadata 시스템 적용 완료 (as any 2개 제거)
- `slideUp.ts` - TypedAnimationFunction metadata 시스템 적용 완료 (as any 2개 제거)
- `wordByWordFade.ts` - TypedAnimationFunction metadata 시스템 적용 완료 (as any 2개 제거)
- 총 8개 `as any` 사용 완전 제거, 한글 description 추가, Object.assign 패턴 적용
- `text/index.ts`와 `server.ts` 타입 호환성 개선

### Transitions
- `fade`, `slide-left`, `slide-right`, `wipe-up`

## Development Workflow

### Testing Video Rendering
1. Use `npm run api:dev` to start the API server
2. Test with curl:
```bash
curl -X POST http://localhost:3001/render \
  -H "Content-Type: application/json" \
  -d '{"inputUrl": "https://your-server.com/config.json"}'
```

### Working with Schemas
- All schemas are defined in `src/types/VideoProps.ts`
- Use `/api/schema` endpoints to inspect schema structure
- Dynamic parameter extraction available via `/api/animations` endpoints

### Duration Calculation
- Video duration is automatically calculated from `audioDuration` fields in scenes
- Default scene duration: 3 seconds if no audio specified
- FPS: 30 (configured in `src/Root.tsx`)

## Configuration Files

### TypeScript Configuration
- Path aliases configured in `tsconfig.json` 
- Strict mode enabled with comprehensive linting

### Remotion Configuration
- `remotion.config.ts` - Tailwind integration and path aliases
- JPEG image format for optimization
- Overwrite output enabled

### API Configuration
- CORS enabled for cross-origin requests
- 50MB request size limit
- Static file serving from `/output` directory
- Supabase integration for file storage

## Style System Architecture

### Consolidated Style Utilities (`src/remotion/utils/styleUtils.ts`)

The project uses a unified style utility system with component-specific style generation functions:

```typescript
// Component-specific style generators
export const generateHeaderStyle = (style?: TemplateStyle) => { /* Header-specific */ };
export const generateTitleStyle = (style?: TemplateStyle) => { /* Title-specific */ };
export const generateTextAreaStyle = (style?: TemplateStyle) => { /* Text-specific */ };
export const generateMetaStyle = (style?: TemplateStyle) => { /* Meta-specific */ };
export const generateContainerStyle = (style?: TemplateStyle) => { /* Container */ };

// Background and effect utilities
export const generateBackground = (style?: TemplateStyle) => string;
export const generateHeaderBackground = (style?: TemplateStyle) => string;
export const generateTextShadow = (effect?: TemplateStyle['textEffect']) => string;
export const generateBoxShadow = (shadow?: any) => string;
export const generateBorder = (border?: TemplateStyle['border']) => string;
```

**Key Principles**:
- Component independence: Each component uses only its own style fields
- Centralized style management through utility functions
- No cross-component style references

## Common Tasks

### Adding New Animations
1. Create animation function in `src/animations/{type}/`
2. Export in `src/animations/{type}/index.ts`
3. Register in `src/animations/index.ts`
4. Animation will be automatically detected by the API system

### Customizing Styles
Customize individual style fields directly in the `templateStyle` object. Each component (header, title, text, meta) can be styled independently.

### Extending Schema
1. Modify schemas in `src/types/VideoProps.ts`
2. Update validation in `src/renderer/validation.ts`  
3. Test with schema inspection endpoints

## Important Notes

- All file paths should be relative to project root or use absolute URLs
- Audio files must be accessible at render time (local or web-accessible)
- Image optimization recommended for large files
- TypeScript strict mode is enforced throughout
- Component styling is completely independent (header fonts don't affect title/body)

## Legacy Components

The `legacy/` directory contains old showcase application files that are no longer actively used:
- `legacy/App.tsx` - Old showcase main app
- `legacy/components/` - Legacy UI components
- `legacy/styles/` - Legacy styling files

These files are preserved for reference but should not be modified in active development.

## Dynamic System Features

### Parameter Extraction
- `src/utils/dynamicParameterExtractor.ts` - Automatically extracts animation parameters
- `src/utils/schemaAnalyzer.ts` - Dynamically analyzes Zod schemas
- API endpoints provide runtime schema inspection

### Audio Processing
- Automatic audio duration calculation via `src/renderer/enrichment.ts`
- Metadata extraction using `music-metadata` library
- Integration with Remotion's `calculateMetadata` system

## Schema Viewer (Visual Documentation)

### Web Interface (`/schema-viewer-new.html`)

A JSON-style visual documentation tool for API schemas and animation parameters designed for planners and developers:

#### Features
- **JSON-Style Rendering**: Schema structure displayed as properly formatted JSON with VS Code-inspired syntax highlighting
- **Dynamic Tree View**: Expandable/collapsible object properties with clean visual hierarchy
- **Real-time API Integration**: Live data loading from `/api/schema` and `/api/animations` endpoints
- **Type Information**: Comprehensive display of types, required/optional status, descriptions, and default values
- **Animation Library**: Categorized animation catalog with comprehensive parameter details including types, default values, and required status
- **Smart Visual Distinction**: Animation Library enum fields are displayed with special neon gradient styling to distinguish them from regular enum fields
- **Responsive Design**: Mobile and desktop optimized interface with proper touch support

#### File Structure
- `public/schema-viewer-new.html` - Main HTML interface with separated structure
- `public/assets/css/schema-viewer-new.css` - VS Code-style CSS with modern dark theme
- `public/assets/js/schema-viewer-new.js` - Refactored DOM-based rendering engine
- `public/schema-api.js` - Enhanced API utilities with error handling

#### Key Improvements
- **DOM-based Rendering**: Uses proper DOM API instead of string concatenation for reliable HTML structure
- **Component Separation**: Clean separation between field lines and expandable content
- **Error Handling**: Comprehensive error handling for API failures and invalid data
- **Code Organization**: Well-structured classes with clear method responsibilities
- **Performance**: Optimized rendering with minimal DOM manipulations

#### Usage
1. Start the development server: `npm run api:dev`
2. Navigate to `http://localhost:3001/schema-viewer-new.html`
3. Browse schema structure in clean JSON format
4. Click ▶ arrows to expand object properties and see detailed field information
5. Explore animation library with type-categorized animations

#### Troubleshooting
**Object Expansion Errors (Fixed)**:
- **Problem**: "데이터를 불러올 수 없습니다" error with 404 on `/api/schema/fontFamily`
- **Cause**: Attempting to load nested object fields (e.g., `templateStyle.fontFamily`) with incorrect API paths
- **Solution**: Pre-load all nested object data and use field path tracking system instead of individual API calls

#### Technical Architecture
- **SchemaViewer Class**: Main controller with modular methods
- **DOM-First Approach**: Proper HTML element creation prevents nesting issues
- **Event Delegation**: Efficient event handling for dynamic content
- **API Integration**: Real-time schema loading with fallback error handling
- **Smart Field Loading**: Pre-loads nested object fields to avoid 404 errors when expanding complex objects
- **Path-based Navigation**: Field path tracking system (`data-field-path`) for proper nested object navigation
- **Enum Type Distinction**: Automatic detection and visual differentiation between Animation Library enums and regular enums
  - **Animation Library Fields**: `image.animation.effect`, `script.animation.in/out/highlight`, `transition.effect` displayed with cyberpunk neon gradient styling
  - **Regular Enums**: `templateStyle.fontStyle`, `layout`, `textAlign` displayed with standard VS Code styling

#### JSON-Style Theme
- **VS Code Colors**: Authentic dark theme with proper syntax highlighting
- **Clean Typography**: JetBrains Mono font for code readability
- **Smooth Interactions**: Hover effects and animated expand/collapse transitions
- **Professional Layout**: Section headers, icons, and organized grid layout

## Performance Notes

- Remotion is CPU-intensive; adjust `--concurrency` options as needed
- Hardware acceleration available on macOS with h265 codec
- Optimize large images before use
- Use proper error handling with API validation endpoints