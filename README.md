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
### 3. 옵션 명세 및 키워드

`input.json` 파일을 수정하여 영상의 전체적인 스타일과 애니메이션을 제어할 수 있습니다.

#### `theme` 옵션

| 키 | 타입 | 설명 |
| :--- | :--- | :--- |
| `fontFamily` | string | CSS `font-family` 속성. |
| `textColor` | string | 텍스트의 기본 색상 (Hex 코드). |
| `backgroundColor`| string | 영상의 배경 색상 (Hex 코드 또는 그라데이션 키워드). |
| `layout` | string | 텍스트와 이미지의 기본 배치. (예: `text-top`, `text-middle`) |

#### `image.animation` 옵션

| 키 | 사용 가능 키워드 | 설명 |
| :--- | :--- | :--- |
| **`effect`** | `static`, `zoom-in`, `zoom-out`, `pan-right`, `pan-left`, `pan-down`, `pan-up`, `ken-burns`, `subtle-wobble` | 슬라이드가 지속되는 동안 이미지에 적용될 움직임 효과. |
| **`filter`** | `grayscale`, `sepia`, `blur` | 이미지에 적용할 시각적 필터. |

#### `script.animation` 옵션

| 키 | 사용 가능 키워드 | 설명 |
| :--- | :--- | :--- |
| **`in`** | `fadeIn`, `slideUp`, `reveal`, `typing`, `word-by-word-fade`, `pop-in` | 텍스트가 장면에 나타나는 방식. |
| **`out`** | `fadeOut`, `slideDown`, `blur-out` | 텍스트가 장면에서 사라지는 방식. (다음 텍스트 그룹으로 전환 시) |
| **`highlight`**| `none`, `yellow-box`, `underline`, `color-change`, `bounce`, `glow` | **기본** 강조 효과. |

#### `transition` 옵션

`media` 객체에 직접 추가하여 다음 슬라이드로 넘어갈 때의 장면 전환 효과를 설정합니다.

| 키 | 사용 가능 키워드 | 설명 |
| :--- | :--- | :--- |
| **`effect`** | `slide-left`, `wipe-up`, `circle-open` | 장면 전환 방식. |
| **`duration`** | `number` (frames) | 장면 전환이 일어나는 시간 (프레임 단위). |

---

### **텍스트 강조 방법**

스크립트 파일(`.txt`) 내에서 강조하고 싶은 단어를 `<h>` 태그로 감싸세요.

**기본 강조:**
- 스크립트: `이것은 <h>기본 강조</h> 입니다.`
- 동작: `script.animation.highlight`에 설정된 효과(예: `yellow-box`)가 적용됩니다.

**타입 지정 강조:**
- 스크립트: `이것은 <h type="underline">밑줄 강조</h> 입니다.`
- 동작: `type`에 지정된 효과가 기본 설정을 무시하고 적용됩니다.

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