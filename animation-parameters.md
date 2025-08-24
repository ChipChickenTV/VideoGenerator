# VideoWeb3 애니메이션 파라미터 가이드

Remotion 기반 VideoWeb3 프로젝트에서 사용되는 image, text, transition 애니메이션들의 duration 및 기타 파라미터들을 정리한 문서입니다.

## 🎯 애니메이션 타입 시스템

### 기본 타입 정의 (`src/animations/types.ts`)

```typescript
export interface AnimationPluginOptions {
  duration?: number;    // 애니메이션 지속 시간 (프레임 단위)
  delay?: number;       // 시작 지연 시간 (프레임 단위)
  frame?: number;       // 현재 프레임 (자동 감지)
  [key: string]: unknown;
}

export interface AnimationMetadata {
  description: string;           // 애니메이션 설명
  defaultDuration: number;       // 기본 지속 시간
  params?: Record<string, {      // 매개변수 정의
    type: string;
    default: unknown;
    required: boolean;
    description?: string;
  }>;
}
```

## 🖼️ 이미지 애니메이션 (`src/animations/image/`)

### 1. zoomIn (줌인)
- **파일**: `src/animations/image/zoomIn.ts`
- **기본 Duration**: 90 프레임
- **효과**: 이미지를 점진적으로 1.0 → 1.15 배율로 확대
- **Transform Origin**: center center

**파라미터**:
```typescript
{
  duration?: number;  // 기본값: 90프레임, 줌인 애니메이션 지속 시간
}
```

### 2. panRight (오른쪽 팬)
- **파일**: `src/animations/image/panRight.ts`
- **기본 Duration**: 90 프레임
- **효과**: 이미지를 오른쪽으로 팬하며 1.1배 확대 (translateX: 0 → -20px)
- **Transform Origin**: center center

**파라미터**:
```typescript
{
  duration?: number;  // 기본값: 90프레임, 팬 애니메이션 지속 시간
}
```

### 3. zoomOut
- **파일**: `src/animations/image/zoomOut.ts`
- **기본 Duration**: 90 프레임 (추정)
- **효과**: 이미지 축소 애니메이션

### 전체 이미지 애니메이션 목록
- `none`: 애니메이션 없음
- `zoom-in`: 줌인 효과
- `pan-right`: 오른쪽 팬 효과
- `zoom-out`: 줌아웃 효과

## 📝 텍스트 애니메이션 (`src/animations/text/`)

### 1. fadeIn (페이드 인)
- **파일**: `src/animations/text/fadeIn.ts`
- **기본 Duration**: 30 프레임
- **효과**: 텍스트가 점진적으로 나타남 (opacity: 0 → 1)

**파라미터**:
```typescript
{
  duration?: number;  // 기본값: 30프레임, 페이드인 지속 시간
  delay?: number;     // 기본값: 0프레임, 시작 지연 시간
  frame?: number;     // 현재 프레임 (자동 감지)
}
```

### 2. typing (타이핑 효과)
- **파일**: `src/animations/text/typing.ts`
- **기본 Duration**: 90 프레임
- **효과**: 텍스트가 한 글자씩 타이핑되는 효과
- **특수 로직**: `getVisibleText()` 함수로 글자 수에 따른 동적 duration

**파라미터**:
```typescript
{
  duration?: number;  // 기본값: 90프레임, 타이핑 지속 시간
  text?: string;      // 타이핑할 텍스트
}
```

**타이핑 속도 설정** (`src/config/theme.ts`):
```typescript
ANIMATION_CONSTANTS.DURATIONS.TYPING_SPEED = 3; // 글자당 3프레임
```

### 3. getCurrentTextChunk (청킹 시스템)
- **파일**: `src/animations/text/index.ts:29`
- **기능**: 긴 텍스트를 청크 단위로 나누어 표시
- **기본 청크 크기**: 4 단어
- **기본 Duration**: 90 프레임
- **페이드 효과**: 10 프레임 페이드인/아웃

**파라미터**:
```typescript
getCurrentTextChunk(
  text: string,        // 전체 텍스트
  frame: number,       // 현재 프레임
  duration: 90,        // 전체 지속시간
  chunkSize: 4         // 청크당 단어 수
)
```

### 전체 텍스트 애니메이션 목록
- `none`: 애니메이션 없음
- `fadeIn`: 페이드 인 효과
- `fadeOut`: 페이드 아웃 효과
- `typing`: 타이핑 효과
- `word-by-word-fade`: 단어별 페이드 효과
- `slideUp`: 위로 슬라이드
- `slideDown`: 아래로 슬라이드

## 🔄 전환 애니메이션 (`src/animations/transitions/`)

### 1. fade (페이드 전환)
- **파일**: `src/animations/transitions/fade.ts`
- **기본 Duration**: 15 프레임
- **효과**: opacity 0 → 1 전환

**파라미터**:
```typescript
{
  duration?: number;  // 기본값: 15프레임, 페이드 지속시간
  delay?: number;     // 기본값: 0프레임, 시작 지연시간
  frame?: number;     // 현재 프레임
}
```

### 2. slideLeft (왼쪽 슬라이드)
- **파일**: `src/animations/transitions/slideLeft.ts`
- **기본 Duration**: 15 프레임 (0.5초)
- **효과**: translateX 100% → 0% (오른쪽에서 들어와서 중앙에 정착)

**파라미터**:
```typescript
{
  duration?: number;  // 기본값: 15프레임, 슬라이드 지속시간
  delay?: number;     // 기본값: 0프레임, 시작 지연시간  
  frame?: number;     // 현재 프레임
}
```

### 실제 사용 예시 (JSON 데이터)
```json
{
  "transition": {
    "effect": "wipe-up",
    "duration": 30  // 30프레임 (= 1초)
  }
}
```

### 전체 전환 애니메이션 목록
- `none`: 전환 효과 없음
- `fade`: 페이드 전환
- `slide-left`: 왼쪽 슬라이드
- `slide-right`: 오른쪽 슬라이드
- `wipe-up`: 위로 와이프

## ⚙️ 애니메이션 상수 설정 (`src/config/theme.ts`)

### Duration 상수
```typescript
ANIMATION_CONSTANTS.DURATIONS = {
  DEFAULT_TRANSITION: 30,    // 기본 전환 시간
  FAST_TRANSITION: 15,       // 빠른 전환 시간
  SLOW_TRANSITION: 60,       // 느린 전환 시간
  TYPING_SPEED: 3,           // 타이핑 속도 (글자당 프레임)
}
```

### 이징 함수
```typescript
ANIMATION_CONSTANTS.EASING = {
  EASE_OUT: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  EASE_IN: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  EASE_IN_OUT: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
}
```

## 📊 Duration 단위 체계

✅ **통일 완료**: 이 프로젝트는 **프레임 기반 통일 시스템**을 사용합니다.

### 프레임 단위 통일
모든 duration 파라미터는 **프레임(frame)** 단위로 통일:

**JSON 데이터**:
- `"duration": 30` = 30프레임 = 1초
- `"duration": 15` = 15프레임 = 0.5초

**애니메이션 메타데이터**:
- `defaultDuration: 15` = 15프레임 = 0.5초
- `defaultDuration: 30` = 30프레임 = 1초  
- `defaultDuration: 90` = 90프레임 = 3초

**오디오 예외**:
- `audioDuration`: 초 단위 (실제 오디오 파일 지속시간)

**시간 변환 참고** (30fps 기준):
- 1초 = 30프레임
- 0.5초 = 15프레임  
- 2초 = 60프레임
- 3초 = 90프레임

## 🔧 사용법 예시

### 이미지 애니메이션 적용
```typescript
// 기본값 사용
const zoomAnimation = zoomIn();

// 커스텀 duration 사용
const fastZoom = zoomIn({ duration: 45 }); // 1.5초
```

### 텍스트 애니메이션 적용
```typescript
// 기본 페이드인
const textFade = fadeIn();

// 지연된 페이드인
const delayedFade = fadeIn({ duration: 45, delay: 15 });
```

### 전환 효과 적용
```typescript
// 함수 호출 방식 (TransitionAnimation 타입)
const fadeTransition = fade(currentFrame, 20); // 20프레임 duration
```

## 🎬 Remotion 통합

모든 애니메이션은 Remotion의 `interpolate()` 함수를 사용하여 구현되며, `useCurrentFrame()` Hook과 연동됩니다.

```typescript
import { interpolate, useCurrentFrame } from 'remotion';

const frame = useCurrentFrame();
const opacity = interpolate(frame, [0, 30], [0, 1], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});
```

---

**참고**: 모든 duration 값은 30fps 기준 프레임 단위이며, 실제 시간으로 변환할 때는 30으로 나누어야 합니다.