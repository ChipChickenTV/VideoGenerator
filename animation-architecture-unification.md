# VideoWeb3 애니메이션 아키텍쳐 통일 방안

## 🚨 현재 문제점

### 1. 비일관적인 API 시그니처
```typescript
// Image/Text 애니메이션
const result = animation({ duration, frame, delay }); // → { style: CSSProperties }

// Transition 애니메이션  
const result = animation(frame, duration); // → CSSProperties
```

### 2. 서로 다른 처리 방식
```typescript
// Image/Text: 직접 사용
const animationResult = animation({ duration });
const style = animationResult.style;

// Transition: wrapping 필요
const wrapTransition = (typedAnimation) => {
  return (frame, duration) => {
    const result = typedAnimation({ frame, duration });
    return result.style || {};
  };
};
```

### 3. 복잡한 메타데이터 접근
```typescript
// Image/Text: 간단
const duration = animation.metadata?.defaultDuration || 90;

// Transition: 복잡  
const transitionWithMetadata = transitionAnimation as { metadata?: { defaultDuration: number } };
const duration = transitionWithMetadata?.metadata?.defaultDuration || 15;
```

## 🎯 해결책: 통일된 애니메이션 아키텍쳐

### Phase 1: API 시그니처 통일

**목표**: 모든 애니메이션이 동일한 API를 사용하도록 변경

```typescript
// 통일된 API 시그니처
interface UnifiedAnimationOptions {
  duration?: number;
  frame?: number;
  delay?: number;
  [key: string]: unknown;
}

interface UnifiedAnimationResult {
  style: CSSProperties;
  className?: string;
}

type UnifiedAnimationFunction = (options?: UnifiedAnimationOptions) => UnifiedAnimationResult;

interface UnifiedAnimationMetadata {
  description: string;
  defaultDuration: number;
  params?: Record<string, {
    type: string;
    default: unknown;
    required: boolean;
    description?: string;
  }>;
}

type UnifiedAnimation = UnifiedAnimationFunction & {
  metadata: UnifiedAnimationMetadata;
};
```

### Phase 2: Transition 애니메이션 리팩토링

**Before (현재):**
```typescript
// src/animations/transitions/fade.ts
export const fade: TypedAnimationFunction = Object.assign(
  ({ duration, delay = 0, frame }: AnimationPluginOptions = {}) => {
    // ...
    return { style: { opacity } };
  },
  { metadata: { ... } }
);

// src/animations/transitions/index.ts
const wrapTransition = (typedAnimation) => {
  return (frame, duration) => {
    const result = typedAnimation({ frame, duration });
    return result.style || {};
  };
};
```

**After (개선):**
```typescript
// src/animations/transitions/fade.ts - 변경 없음!
export const fade: TypedAnimationFunction = Object.assign(
  ({ duration, delay = 0, frame }: AnimationPluginOptions = {}) => {
    // ...
    return { style: { opacity } };
  },
  { metadata: { ... } }
);

// src/animations/transitions/index.ts - wrapping 제거
export const transitionAnimations: Record<string, TypedAnimationFunction> = {
  'none': () => ({ style: {} }),
  fade,
  'slide-left': slideLeft,
  'slide-right': slideRight, 
  'wipe-up': wipeUp,
};

export const getTransitionAnimation = (effect: string): TypedAnimationFunction => {
  return transitionAnimations[effect];
};
```

### Phase 3: 사용부 통일

**Before (현재):**
```typescript
// SceneSlide.tsx
const transitionAnimation = getTransitionAnimation(effect);
const transitionStyle = transitionAnimation(frame, transitionDuration); // 다른 API

// ImageArea.tsx  
const animation = getImageAnimation(animationEffect);
const animationResult = animation({ duration }); // 다른 API
const style = animationResult.style;
```

**After (개선):**
```typescript
// 모든 애니메이션 동일한 API
const getAnimationDuration = (jsonDuration: number | undefined, animation: UnifiedAnimation, fallback: number): number => {
  return jsonDuration || animation.metadata?.defaultDuration || fallback;
};

// SceneSlide.tsx
const transitionAnimation = getTransitionAnimation(effect);
const transitionDuration = getAnimationDuration(scene.transition?.duration, transitionAnimation, 15);
const transitionResult = transitionAnimation({ duration: transitionDuration, frame });
const transitionStyle = transitionResult.style;

// ImageArea.tsx
const imageAnimation = getImageAnimation(animationEffect);
const imageDuration = getAnimationDuration(image.animation.duration, imageAnimation, 90);
const imageResult = imageAnimation({ duration: imageDuration });
const imageStyle = imageResult.style;

// useTextAnimation.ts  
const textAnimation = getTextAnimation(animationType);
const textDuration = getAnimationDuration(script.animation.inDuration, textAnimation, 30);
const textResult = textAnimation({ duration: textDuration, frame: frameInChunk, delay });
const textStyle = textResult.style;
```

## 🎨 최종 결과: 완벽한 일관성

### 1. 통일된 사용 패턴
```typescript
// 모든 애니메이션에서 동일한 패턴
const animation = getAnimation(effect);
const duration = getDuration(jsonDuration, animation, defaultFallback);
const result = animation({ duration, frame, delay });
const style = result.style;
```

### 2. 공통 유틸리티 함수
```typescript
// src/animations/utils.ts
export const getAnimationDuration = (
  jsonDuration: number | undefined,
  animation: UnifiedAnimation,
  fallback: number
): number => {
  return jsonDuration || animation.metadata?.defaultDuration || fallback;
};

export const applyAnimation = (
  animation: UnifiedAnimation,
  options: UnifiedAnimationOptions
): CSSProperties => {
  const result = animation(options);
  return result.style;
};
```

### 3. 타입 안전성 보장
```typescript
// 모든 애니메이션이 동일한 타입 사용
type ImageAnimation = UnifiedAnimation;
type TextAnimation = UnifiedAnimation;  
type TransitionAnimation = UnifiedAnimation;
```

## 🚀 마이그레이션 계획

### Step 1: TransitionAnimation 타입 변경
```typescript
// src/animations/transitions/types.ts
export type TransitionAnimation = UnifiedAnimation; // CSSProperties → UnifiedAnimation
```

### Step 2: transitions/index.ts 단순화
```typescript
// wrapping 로직 완전 제거
export const transitionAnimations: Record<string, UnifiedAnimation> = {
  'none': Object.assign(() => ({ style: {} }), { metadata: { description: "No transition", defaultDuration: 0 } }),
  fade,
  'slide-left': slideLeft,
  'slide-right': slideRight,
  'wipe-up': wipeUp,
};
```

### Step 3: 사용부 API 통일
```typescript
// 모든 컴포넌트에서 동일한 패턴 적용
const style = applyAnimation(animation, { duration, frame, delay });
```

## ✨ 최종 혜택

1. **코드 일관성**: 모든 애니메이션이 동일한 API 사용
2. **유지보수성**: 하나의 패턴만 이해하면 됨
3. **타입 안전성**: 통일된 타입 시스템
4. **확장성**: 새로운 애니메이션 추가 시 동일한 패턴 적용
5. **복잡성 제거**: wrapping, casting 등 불필요한 로직 제거

이 아키텍쳐로 변경하면 **"모든 애니메이션이 동일하게 작동"**한다는 원칙을 달성할 수 있습니다.