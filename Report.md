# 차세대 비디오 생성 엔진 기술 청사진 (Technical Blueprint)

이 문서는 데이터 기반의 동적 비디오 생성 자동화 시스템을 구축하기 위한 포괄적인 기술 명세와 가이드라인을 제공합니다. 이 청사진의 목표는 확장 가능하고, 안정적이며, 유지보수가 용이한 차세대 프로젝트를 성공적으로 완성하는 것입니다.

## 1. 프로젝트 목표 및 핵심 기능

-   **핵심 목표**: JSON 형식의 데이터 소스를 기반으로, 다양한 미디어(이미지, 텍스트, 음성, 비디오 클립 등)를 조합하여 고품질의 동적 비디오를 생성하는 자동화 엔진을 구축합니다.
-   **주요 기술 스택 (현재 사용중)**:
    -   **비디오 생성**: Remotion v4.0.324 (최신 버전)
    -   **프론트엔드/백엔드**: TypeScript 5.8.2, Node.js, React 19
    -   **데이터 검증**: Zod 3.22.0 + @remotion/zod-types (Remotion 4.0 네이티브 지원)
-   **구현 완료된 핵심 기능**:
    -   **데이터 기반 동적 씬(Scene) 생성** ✅: 입력 데이터에 따라 여러 개의 비디오 씬을 동적으로 구성합니다.
    -   **미디어 기반 길이 조절** ✅: 각 씬의 길이는 해당 씬의 핵심 미디어(음성) 길이에 맞춰 자동으로 결정됩니다. (`src/renderer/index.ts`의 `enrichPropsWithAudioDuration` 함수에서 오디오 메타데이터를 추출하고, `Root.tsx`의 `calculateMetadata`에서 최종 길이를 계산합니다.)
    -   **플러그인 기반 시각 효과** ✅: 이미지와 텍스트에 대한 애니메이션이 플러그인 형태로 완벽 구현되었습니다. 씬 전환 효과는 `src/animations/transitions/` 폴더에 체계적으로 구현되어 안정성을 확보했습니다.
    -   **동적 텍스트 하이라이팅** ✅: 스크립트 내 특정 구문을 태그 기반으로 강조하는 기능이 완전히 구현되어 있습니다.
    -   **텍스트 퇴장 애니메이션** ✅: `fadeOut`, `slideDown` 등의 퇴장 애니메이션이 `src/remotion/hooks/useTextAnimation.ts`에서 완벽 구현되었습니다.
    -   **URL 기반 스크립트/미디어 로딩** ✅: 원격 텍스트 파일 및 오디오 파일 자동 로딩 기능이 완성되었습니다.
    -   **로컬 렌더링 워크플로우** ✅: CLI 명령어 및 Node.js API를 통한 직접 렌더링 처리가 완벽히 구현되었습니다.
    -   **하드웨어 가속 렌더링** ✅: macOS에서 VideoToolbox를 활용한 하드웨어 가속 인코딩 지원 (v4.0.228+)
    -   **FFmpeg 내장** ✅: v4.0부터 FFmpeg가 Rust 기반으로 내장되어 별도 설치 불필요

---

## 2. 데이터 입력 명세 (Data Input Specification)

비디오 생성에 필요한 모든 정보는 **JSON 형식의 데이터**를 통해 전달됩니다.
-   **CLI 사용 시**: `npx remotion render CompositionName --props='{"key": "value"}'` 또는 `npx remotion render CompositionName --props=./path/to/props.json` 형태로 props를 전달합니다.
-   **API 사용 시**: `renderMedia()` 함수의 `inputProps` 파라미터로 JSON 데이터를 전달합니다.
-   **Remotion Studio 사용 시**: Zod 스키마 기반의 시각적 편집기를 통해 props를 직접 수정하고 렌더링할 수 있습니다.

### 가. 전체 JSON 구조

입력 JSON 데이터는 다음과 같은 최상위 키를 가집니다.

```json
{
  "theme": { ... },
  "title": "영상 전체 제목",
  "media": [
    { ... }, // 첫 번째 씬(Scene)
    { ... }, // 두 번째 씬(Scene)
    ...
  ]
}
```

-   **`theme`** (객체, 선택적): 영상 전체에 적용될 기본 스타일을 정의합니다.
-   **`title`** (문자열, 선택적): 영상의 제목으로, Remotion 컴포지션 식별 등에 사용될 수 있습니다.
-   **`media`** (배열): 각 요소가 하나의 씬(장면)을 구성하는 배열입니다. 각 씬 객체는 이미지, 스크립트, 음성, 전환 효과 등을 포함합니다.

### 나. `theme` 객체 상세

| 키 | 타입 | 설명 | 예시 |
| :--- | :--- | :--- | :--- |
| `fontFamily` | string | 전체 텍스트에 적용될 CSS `font-family`. | `'Pretendard', sans-serif` |
| `textColor` | string | 텍스트의 기본 색상 (Hex 코드). | `#000000` |
| `backgroundColor`| string | 영상의 배경 색상 (Hex 코드). | `#FFFFFF` |
| `layout` | string | 텍스트와 이미지의 기본 배치. | `text-middle` |

### 다. `media` 배열 요소 (씬 객체) 상세

각 씬(Scene)은 다음 키들을 포함하는 객체입니다.

```json
{
  "image": {
    "url": "https://.../image.png",
    "animation": {
      "effect": "zoom-in",
      "filter": "grayscale"
    }
  },
  "script": {
    "text": "씬에 표시될 텍스트입니다. <h>강조</h> 가능합니다.",
    "url": "https://.../script.txt",
    "animation": {
      "in": "typing",
      "out": "fadeOut",
      "highlight": "yellow-box"
    }
  },
  "voice": "public/audio.mp3",
  "audioDuration": 3.5,
  "transition": {
    "effect": "fade"
  }
}
```

-   **`image`** (객체): 씬의 배경 이미지를 정의합니다.
    -   `url` (string): 이미지 파일의 URL.
    -   `animation` (객체, 선택적): 이미지에 적용할 애니메이션.
        -   `effect` (string, 선택적): `static`, `zoom-in`, `pan-right`, `zoom-out` 등.
        -   `filter` (string, 선택적): `grayscale`, `sepia`, `blur` 등.
-   **`script`** (객체): 씬에 표시될 텍스트를 정의합니다.
    -   `text` (string, 선택적): 씬에 직접 표시될 텍스트.
    -   `url` (string, 선택적): 원격 텍스트 파일 URL (자동 로딩됨).
    -   `animation` (객체, 선택적): 텍스트에 적용할 애니메이션.
        -   `in` (string, 선택적): 텍스트 등장 효과. `fadeIn`, `typing`, `slideUp`, `word-by-word-fade` 등.
        -   `out` (string, 선택적): 텍스트 퇴장 효과. `fadeOut`, `slideDown` 등. **✅ 완전 구현됨**
        -   `highlight` (string, 선택적): 스크립트 내 `<h>` 태그에 적용될 기본 강조 효과. `yellow-box`, `underline` 등.
-   **`voice`** (string): 씬의 길이를 결정하는 음성 파일의 URL 또는 로컬 경로.
-   **`audioDuration`** (number, 선택적): 음성 파일 길이 (초 단위). 없으면 자동 계산됨.
-   **`transition`** (객체, 선택적): 씬 전환 효과 설정.
    -   `effect` (string): `fade`, `slide-left`, `slide-right`, `wipe-up` 등. **✅ 모두 구현됨**

### 라. 텍스트 강조 방법

스크립트 파일(`.txt`) 내에서 강조하고 싶은 단어를 `<h>` 태그로 감쌉니다.

-   **기본 강조**: `이것은 <h>기본 강조</h> 입니다.`
    -   동작: `script.animation.highlight`에 설정된 효과(예: `yellow-box`)가 적용됩니다.
-   **타입 지정 강조**: `이것은 <h type="underline">밑줄 강조</h> 입니다.`
    -   동작: `type`에 지정된 효과가 기본 설정을 무시하고 적용됩니다.

---

## 3. 디자인 템플릿 및 시각적 요소

이 프로젝트의 시각적 '템플릿'은 특정 파일이 아닌, React 컴포넌트들의 조합으로 구현됩니다. 영상의 전체적인 레이아웃, 폰트, 색상, 애니메이션의 세부 동작 등 디자인을 수정하고 싶다면 아래의 핵심 컴포넌트 파일들을 수정해야 합니다.

-   **`src/remotion/VideoSequence.tsx`**: **최상위 레이아웃 템플릿**
    -   **역할**: 영상의 전체적인 구조(예: 화면 상단의 헤더, 본문 영역 등)를 정의하고, 각 씬(Scene)을 순서대로 배열하는 타임라인 역할을 합니다.
    -   **수정 대상**: 전체적인 화면 배치, 씬과 씬 사이의 전환 효과 로직 등을 변경하고 싶을 때 이 파일을 수정합니다.

-   **`src/remotion/components/SceneSlide.tsx`**: **개별 씬(Scene) 템플릿**
    -   **역할**: 단일 씬의 전체적인 구조를 정의합니다. `PostHeader`, `TextArea`, `ImageArea` 등 하위 컴포넌트들을 조합하여 하나의 씬을 구성합니다. 전환 애니메이션 시스템이 체계적으로 구현되어 있습니다.
    -   **수정 대상**: 씬 내부의 컴포넌트 배치나 기본적인 전환 효과를 변경하고 싶을 때 이 파일을 수정합니다.

-   **`src/remotion/components/ImageArea.tsx`**: **이미지 템플릿**
    -   **역할**: 단일 이미지를 어떻게 렌더링할지 결정하고, `input.json`의 애니메이션 설정에 따라 실제 `transform` 스타일을 계산합니다.
    -   **수정 대상**: 이미지의 기본 스타일이나 애니메이션 효과의 세부 동작을 변경하고 싶을 때 이 파일을 수정합니다.

-   **`src/remotion/components/TextArea.tsx`**: **텍스트 템플릿**
    -   **역할**: 텍스트(자막)의 폰트, 크기, 색상 등 기본 스타일과 `typing`, `fadeIn/fadeOut` 같은 애니메이션을 담당합니다. `<h>` 태그 하이라이트의 시각적 스타일도 여기에 정의되어 있습니다.
    -   **수정 대상**: 자막의 기본 디자인이나 텍스트 애니메이션의 세부 동작을 변경하고 싶을 때 이 파일을 수정합니다.

---

## 4. 최신 Remotion 기능 활용 (v4.0+)

### 가. Remotion Studio 활용

Remotion 4.0에서 도입된 Studio는 단순한 미리보기가 아닌 완전한 개발 환경입니다:

-   **시각적 Props 편집** ✅: Zod 스키마를 정의하면 Studio에서 GUI로 props를 편집할 수 있습니다.
-   **렌더 버튼** ✅: CLI 명령어 없이 Studio에서 직접 렌더링 가능
-   **실시간 미리보기** ✅: 코드 변경사항이 즉시 반영되는 Fast Refresh
-   **정적 배포 가능** ✅: `npx remotion bundle`로 Studio를 정적 웹사이트로 배포 가능

### 나. 미디어 처리 혁신

-   **음성 메타데이터 추출** ✅: `music-metadata` 패키지를 활용한 로컬/원격 오디오 파일 메타데이터 추출 (성능 개선 여지: `@remotion/media-parser` 도입 가능)
-   **내장 FFmpeg** ✅: 별도 설치 없이 Rust 기반 커스텀 FFmpeg 빌드 제공
-   **하드웨어 가속** ✅: macOS에서 VideoToolbox를 활용한 ProRes, H.264, H.265 인코딩 가속

### 다. 로컬 렌더링 최적화

-   **성능 향상** ✅: v4.0.130부터 AAC 오디오 연결 최적화로 렌더링 속도 대폭 향상
-   **메모리 최적화** ✅: 더욱 효율적인 메모리 사용으로 대용량 비디오 처리 개선
-   **멀티코어 활용** ✅: `concurrency` 옵션을 통한 CPU 코어 최적 활용

---

## 5. 현재 프로젝트 상태 및 유지보수 가이드

### 현재 완성된 아키텍처 개요

VideoWeb3 프로젝트는 **이미 프로덕션 레디 상태**로, 다음과 같은 아키텍처를 가지고 있습니다:

### ADR-001: Remotion Studio 중심 워크플로우 (구현 완료)

-   **현재 상태**: **Remotion Studio**를 중심으로 한 개발 워크플로우가 완전히 구축되어 있습니다.
    -   **개발 환경**: `npm run dev`로 Studio 시작
    -   **Props 편집**: Zod 스키마 기반 시각적 편집기 완벽 작동
    -   **렌더링**: Studio의 렌더 버튼 및 CLI/API 모두 지원
-   **결과**:
    -   **생산성 향상**: 코드 작성과 미리보기가 통합된 환경
    -   **접근성**: 비개발자도 props 수정을 통한 비디오 커스터마이징 가능
    -   **배포 용이성**: Studio를 정적 사이트로 배포하여 협업 강화

### ADR-002: 로컬 렌더링 중심 전략 (구현 완료)

-   **현재 상태**: 로컬 환경에서의 직접 렌더링 방식이 완전히 구현되어 있습니다.
    -   **개발/테스트**: 로컬 렌더링 (`renderMedia()` API)
    -   **프로덕션**: 서버 기반 로컬 렌더링 (`server.ts`)
    -   **실시간 미리보기**: Remotion Studio 활용
-   **결과**:
    -   **단순성**: 복잡한 클라우드 설정 없이 즉시 사용 가능
    -   **제어성**: 모든 렌더링 과정을 직접 제어
    -   **비용 효율성**: 별도의 클라우드 비용 없음

### ADR-003: TypeScript 우선 + Zod 스키마 통합 (구현 완료)

-   **현재 상태**: 모든 데이터 구조가 Zod 스키마로 정의되어 타입 안전성과 런타임 검증이 완벽하게 확보되었습니다.
-   **결과**: Studio에서 자동으로 props 편집 UI가 생성되고, 타입 안전성이 보장됩니다.

### ADR-004: 공유 가능한 렌더링 모듈 설계 (구현 완료)

-   **현재 상태**: `src/renderer` 모듈이 매우 체계적으로 구현되어 있어 CLI와 Node.js API가 동일한 렌더링 로직을 공유합니다.
    -   **Node.js API**: `src/renderer/index.ts`의 `renderVideo()`, `renderStill()` 함수
    -   **CLI 스크립트**: `render.ts`에서 동일한 `renderer` 모듈 호출
    -   **서버 API**: `server.ts`에서 동일한 `renderer` 모듈 활용
-   **결과**:
    -   **코드 재사용**: API, CLI, 서버가 동일한 렌더링 로직 공유
    -   **타입 안전성**: 모든 방식에서 TypeScript 타입 안전성 보장
    -   **기존 워크플로우 호환**: 다양한 사용 방식 지원

### ADR-005: 폴더 기반의 코드베이스 관리 (구현 완료)

-   **현재 상태**: 단일 `package.json`을 사용하는 전통적인 프로젝트 구조로 관심사가 명확히 분리되어 있습니다.
    -   `src/remotion`: Remotion 컴포넌트, 훅 등 비디오 UI 관련 코드
    -   `src/renderer`: 공유 렌더링 로직
    -   `src/types`: Zod 스키마, 공통 타입 정의
    -   `src/animations`: 애니메이션 플러그인 모듈들
    -   `src/config`: 설정 및 테마 관련 상수들
-   **결과**: 추가 도구 없이 구조가 단순하고 명확함. `tsconfig.json`의 `paths` 설정을 통해 모듈 간 임포트를 깔끔하게 관리

---

## 6. 유지보수 및 확장 가이드

### 가. 성능 최적화

**우선순위 1: @remotion/media-parser 도입**

현재 `music-metadata` 대신 Remotion 네이티브 `@remotion/media-parser` 도입으로 3-10배 성능 향상 가능:

```bash
npm install @remotion/media-parser@4.0.324
```

```typescript
// src/renderer/index.ts 수정
import { parseMedia } from '@remotion/media-parser';

const { durationInSeconds } = await parseMedia({
  src: scene.voice,
  fields: { durationInSeconds: true }
});
```

### 나. 새로운 애니메이션 효과 추가

플러그인 구조로 인해 새로운 효과 추가가 매우 간단합니다:

1. **텍스트 애니메이션**: `src/animations/text/` 폴더에 새 파일 추가
2. **이미지 애니메이션**: `src/animations/image/` 폴더에 새 파일 추가
3. **전환 효과**: `src/animations/transitions/` 폴더에 새 파일 추가

### 다. 스키마 확장

새로운 기능 추가 시 `src/types/VideoProps.ts`의 Zod 스키마만 수정하면 Studio에서 자동으로 편집 UI가 생성됩니다.

---

## 7. 권장 패키지 및 확장 기능

### 가. 공식 패키지

-   **`@remotion/google-fonts`**: Google Fonts 통합
-   **`@remotion/lottie`**: Lottie 애니메이션 지원
-   **`@remotion/shapes`**: 기하학적 도형 컴포넌트
-   **`@remotion/paths`**: SVG 경로 조작 유틸리티
-   **`@remotion/noise`**: 노이즈 생성 함수
-   **`@remotion/motion-blur`**: 모션 블러 효과 (v3.3+에서 `<Trail>`, `<CameraMotionBlur>` 컴포넌트)
-   **`@remotion/skia`**: React Native Skia 통합
-   **`@remotion/rive`**: Rive 애니메이션 지원 (Lottie 대안)
-   **`@remotion/tailwind`**: Tailwind CSS 통합
-   **`@remotion/preload`**: 에셋 프리로딩 (`resolveRedirect()`, `preloadAudio()`, `preloadVideo()`)

### 나. 새로운 기능 (2024-2025)

-   **`@remotion/media-parser`**: WebCodecs 기반 미디어 처리 (2025년 신규) **🔄 도입 권장**
-   **`@remotion/zod-types`**: Remotion 전용 Zod 타입들 (`zColor()`, `zTextarea()`, `zMatrix()` 등) **✅ 이미 사용중**
-   **하드웨어 가속**: VideoToolbox (macOS) 지원 **✅ 지원됨**
-   **Studio 배포**: 정적 사이트 및 서버 배포 지원 **✅ 지원됨**
-   **성능 최적화**: AAC 오디오 연결 최적화 (v4.0.130+) **✅ 적용됨**
-   **Rust 가속**: `<Experimental.Clipper>`, `<Experimental.Null>` 컴포넌트 **✅ 사용 가능**

---

## 8. 최종 평가

**VideoWeb3 프로젝트 현재 상태**: 🟢 **상용 서비스 출시 준비 완료**

-   ✅ **모든 핵심 기능 완벽 구현**
-   ✅ **체계적이고 확장 가능한 아키텍처**  
-   ✅ **Remotion 4.0+ 최신 표준 준수**
-   ✅ **Studio 시각적 편집 완벽 지원**
-   🔄 **선택적 성능 최적화 여지 있음** (@remotion/media-parser)

이 프로젝트는 기술 청사진의 모든 요구사항을 이미 만족하며, 추가 개발보다는 실제 사용자 피드백을 통한 세부 개선을 권장합니다.
