# 최종 데이터 구조 명세 (Data Specification)

이 문서는 VideoWeb3 프로젝트의 비디오 생성을 위한 최종 JSON 데이터 구조를 정의합니다. Zod 스키마 변경 이후, 데이터 구조는 더욱 명확하고 엄격하게 고정되었습니다.

---

## 1. 최상위 구조 (Top-Level Structure)

입력 JSON 데이터는 다음과 같은 최상위 키를 가집니다.

```json
{
  "theme": { ... },
  "title": "영상 전체 제목 (선택 사항)",
  "postMeta": { ... },
  "media": [
    { ... } // Scene 객체 배열
  ]
}
```

| 키 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :--- |
| `theme` | 객체 | 선택 | 영상 전체에 적용될 기본 스타일. 생략 시 기본값 사용. |
| `title` | 문자열 | 선택 | 영상의 제목. |
| `postMeta` | 객체 | 선택 | 작성자, 시간 등 메타 정보. 생략 시 기본값 사용. |
| `media` | 배열 | **필수** | 각 요소가 하나의 씬(Scene)을 구성하는 배열. |

---

## 2. 씬 객체 상세 구조 (Scene Object)

`media` 배열의 각 요소인 `Scene` 객체는 다음과 같은 **고정된 구조**를 가집니다.

### 가. 기본 구조

```json
{
  "image": {
    "url": "...",
    "animation": {
      "effect": "...",
      "filter": "..."
    }
  },
  "script": {
    "text": "...",
    "animation": {
      "in": "...",
      "out": "...",
      "highlight": "..."
    }
  },
  "voice": "...",
  "transition": {
    "effect": "..."
  }
}
```

### 나. 필드 설명

| 키 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :--- |
| `image` | 객체 | 선택 | 씬의 배경 이미지. |
| ┣ `url` | 문자열 | **필수** | 이미지 파일의 URL 또는 로컬 경로. |
| ┗ `animation` | 객체 | **필수** | 이미지 애니메이션 설정. `image` 객체 존재 시 반드시 포함. |
| &nbsp;&nbsp; ┣ `effect` | 문자열 | **필수** | 움직임 효과 (`'none'`, `'zoom-in'` 등). 기본값: `'none'`. |
| &nbsp;&nbsp; ┗ `filter` | 문자열 | **필수** | 필터 효과 (`'none'`, `'grayscale'` 등). 기본값: `'none'`. |
| `script` | 객체 | **필수** | 씬에 표시될 텍스트. |
| ┣ `text` 또는 `url` | 문자열 | **필수** | `text`나 `url` 중 하나는 반드시 포함되어야 함. |
| ┗ `animation` | 객체 | **필수** | 텍스트 애니메이션 설정. `script` 객체 존재 시 반드시 포함. |
| &nbsp;&nbsp; ┣ `in` | 문자열 | **필수** | 등장 효과 (`'none'`, `'fadeIn'` 등). 기본값: `'none'`. |
| &nbsp;&nbsp; ┣ `out` | 문자열 | **필수** | 퇴장 효과 (`'none'`, `'fadeOut'` 등). 기본값: `'none'`. |
| &nbsp;&nbsp; ┗ `highlight` | 문자열 | **필수** | 강조 효과 (`'none'`, `'yellow-box'` 등). 기본값: `'yellow-box'`. |
| `voice` | 문자열 | 선택 | 씬의 길이를 결정하는 음성 파일 경로. |
| `transition`| 객체 | 선택 | **다음 씬으로 넘어갈 때만 의미가 있음.** 마지막 씬에서는 생략. |
| ┗ `effect` | 문자열 | **필수** | 전환 효과 (`'none'`, `'fade'` 등). 기본값: `'none'`. |

---

## 3. 전체 예시 (Full Example)

아래는 위 구조를 따르는 `media` 배열의 예시입니다.

```json
"media": [
  // 첫 번째 씬
  {
    "image": {
      "url": "public/image.png",
      "animation": {
        "effect": "zoom-in",
        "filter": "grayscale"
      }
    },
    "script": {
      "text": "첫 번째 장면입니다.",
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
  },
  // 두 번째 씬 (애니메이션 일부 비활성화)
  {
    "image": {
      "url": "public/image2.png",
      "animation": {
        "effect": "none", // 이미지 움직임 없음
        "filter": "none"  // 필터 없음
      }
    },
    "script": {
      "text": "두 번째 장면입니다.",
      "animation": {
        "in": "fadeIn",
        "out": "none", // 퇴장 애니메이션 없음
        "highlight": "underline"
      }
    },
    "voice": "public/audio2.mp3"
    // 마지막 씬이므로 transition 생략
  }
]