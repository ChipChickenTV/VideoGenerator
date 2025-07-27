# 프로젝트 애니메이션 명세

이 문서는 VideoWeb3 프로젝트에서 사용되는 모든 애니메이션의 종류와 파라미터를 정의합니다. 애니메이션은 `input.json` 파일의 `media` 배열 내 각 씬(Scene) 객체에서 설정됩니다.

---

## 1. 이미지 애니메이션 (Image Animation)

-   **설정 위치**: `scene.image.animation` 객체
-   **관련 파일**:
    -   스키마: `src/types/VideoProps.ts`
    -   구현: `src/remotion/components/ImageArea.tsx`
    -   로직: `src/animations/image/`

### 가. 애니메이션 효과 (effect)

이미지의 전반적인 움직임을 제어합니다.

| 이름 (Name) | 설명 | 파라미터 (JSON) |
| :--- | :--- | :--- |
| `none` | (기본값) 이미지를 움직이지 않고 고정합니다. | `effect: "none"` |
| `zoom-in` | 이미지를 서서히 확대합니다. | `effect: "zoom-in"` |
| `zoom-out` | 이미지를 서서히 축소합니다. | `effect: "zoom-out"` |
| `pan-right` | 이미지를 왼쪽에서 오른쪽으로 천천히 움직입니다. | `effect: "pan-right"` |

### 나. 필터 효과 (filter)

이미지에 시각적 필터를 적용합니다.

| 이름 (Name) | 설명 | 파라미터 (JSON) |
| :--- | :--- | :--- |
| `none` | (기본값) 아무 필터도 적용하지 않습니다. | `filter: "none"` |
| `grayscale` | 이미지를 흑백으로 만듭니다. | `filter: "grayscale"` |
| `sepia` | 이미지에 세피아 톤을 적용합니다. | `filter: "sepia"` |
| `blur` | 이미지에 블러(흐림) 효과를 적용합니다. | `filter: "blur"` |

---

## 2. 텍스트 애니메이션 (Text Animation)

-   **설정 위치**: `scene.script.animation` 객체
-   **관련 파일**:
    -   스키마: `src/types/VideoProps.ts`
    -   구현: `src/remotion/components/TextArea.tsx`
    -   로직: `src/remotion/hooks/useTextAnimation.ts`

### 가. 등장 애니메이션 (in)

텍스트가 화면에 나타나는 방식을 제어합니다.

| 이름 (Name) | 설명 | 파라미터 (JSON) |
| :--- | :--- | :--- |
| `none` | (기본값) 애니메이션 없이 즉시 나타납니다. | `in: "none"` |
| `fadeIn` | 텍스트가 서서히 나타납니다. | `in: "fadeIn"` |
| `typing` | 타자기로 치는 것처럼 한 글자씩 나타납니다. | `in: "typing"` |
| `slideUp` | 텍스트가 아래에서 위로 올라오며 나타납니다. | `in: "slideUp"` |
| `word-by-word-fade`| 단어 단위로 페이드인 효과가 적용됩니다. | `in: "word-by-word-fade"` |

### 나. 퇴장 애니메이션 (out)

텍스트가 화면에서 사라지는 방식을 제어합니다.

| 이름 (Name) | 설명 | 파라미터 (JSON) |
| :--- | :--- | :--- |
| `none` | (기본값) 애니메이션 없이 즉시 사라집니다. | `out: "none"` |
| `fadeOut` | 텍스트가 서서히 사라집니다. | `out: "fadeOut"` |
| `slideDown` | 텍스트가 위에서 아래로 내려가며 사라집니다. | `out: "slideDown"` |

### 다. 하이라이트 효과 (highlight)

스크립트 내 `<h>` 태그로 감싸진 텍스트에 적용되는 강조 효과를 제어합니다.

| 이름 (Name) | 설명 | 파라미터 (JSON) |
| :--- | :--- | :--- |
| `yellow-box` | (기본값) 노란색 배경 박스로 강조합니다. | `highlight: "yellow-box"` |
| `red-box` | 빨간색 배경 박스로 강조합니다. | `highlight: "red-box"` |
| `blue-box` | 파란색 배경 박스로 강조합니다. | `highlight: "blue-box"` |
| `green-box` | 초록색 배경 박스로 강조합니다. | `highlight: "green-box"` |
| `underline` | 텍스트에 밑줄을 긋습니다. | `highlight: "underline"` |
| `bold` | 텍스트를 굵게 표시합니다. | `highlight: "bold"` |
| `italic` | 텍스트를 기울임꼴로 표시합니다. | `highlight: "italic"` |
| `glow` | 텍스트에 네온 효과를 줍니다. | `highlight: "glow"` |
| `strike` | 텍스트에 취소선을 긋습니다. | `highlight: "strike"` |
| `outline` | 텍스트에 외곽선을 추가합니다. | `highlight: "outline"` |
| `none` | 아무 강조 효과도 적용하지 않습니다. | `highlight: "none"` |

---

## 3. 장면 전환 애니메이션 (Transition Animation)

-   **설정 위치**: `scene.transition` 객체
-   **관련 파일**:
    -   스키마: `src/types/VideoProps.ts`
    -   구현: `src/remotion/components/SceneSlide.tsx`
    -   로직: `src/animations/transitions/`

### 가. 전환 효과 (effect)

한 씬(Scene)에서 다음 씬으로 넘어갈 때의 시각적 효과를 제어합니다.

| 이름 (Name) | 설명 | 파라미터 (JSON) |
| :--- | :--- | :--- |
| `none` | (기본값) 애니메이션 없이 즉시 다음 씬으로 전환됩니다. | `effect: "none"` |
| `fade` | 현재 씬이 사라지면서 다음 씬이 나타납니다. | `effect: "fade"` |
| `slide-left` | 다음 씬이 오른쪽에서 왼쪽으로 슬라이드하며 나타납니다. | `effect: "slide-left"` |
| `slide-right` | 다음 씬이 왼쪽에서 오른쪽으로 슬라이드하며 나타납니다. | `effect: "slide-right"` |
| `wipe-up` | 다음 씬이 아래에서 위로 닦아내듯이 나타납니다. | `effect: "wipe-up"` |

---

## 4. JSON 사용 예시 (Usage Example)

이제 `image`와 `script` 객체에는 `animation` 필드가 필수로 포함되어야 합니다. 애니메이션을 사용하고 싶지 않다면, 각 효과(effect, in, out 등)의 값을 `"none"`으로 명시해야 합니다.

### 예시 1: 모든 애니메이션을 활성화한 경우

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
    "text": "모든 애니메이션이 적용된 텍스트입니다.",
    "animation": {
      "in": "typing",
      "out": "fadeOut",
      "highlight": "yellow-box"
    }
  },
  "voice": "public/audio.mp3",
  "transition": {
    "effect": "slide-left"
  }
}
```

### 예시 2: 일부 애니메이션을 비활성화한 경우 (`"none"` 사용)

이미지 애니메이션은 사용하지만 필터는 사용하지 않고, 텍스트 등장 애니메이션만 비활성화하는 예시입니다.

```json
{
  "image": {
    "url": "https://.../image.png",
    "animation": {
      "effect": "pan-right",
      "filter": "none" 
    }
  },
  "script": {
    "text": "등장 애니메이션만 없는 텍스트입니다.",
    "animation": {
      "in": "none", 
      "out": "slideDown",
      "highlight": "underline"
    }
  },
  "voice": "public/audio.mp3",
  "transition": {
    "effect": "fade"
  }
}
```

### 예시 3: 마지막 씬 (전환 효과 없음)

마지막 씬처럼 `transition` 객체 자체가 없는 경우입니다. `transition`은 optional 필드이므로 생략 가능합니다.

```json
{
  "image": {
    "url": "https://.../last_image.png",
    "animation": {
      "effect": "none",
      "filter": "none"
    }
  },
  "script": {
    "text": "이것이 마지막 장면입니다.",
    "animation": {
      "in": "fadeIn",
      "out": "none",
      "highlight": "none"
    }
  },
  "voice": "public/audio.mp3"
}
```