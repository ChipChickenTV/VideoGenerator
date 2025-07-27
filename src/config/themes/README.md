# 🎨 VideoWeb3 테마 시스템

JSON 기반으로 완전히 리팩토링된 테마 시스템입니다.

## 📁 구조

```
src/config/themes/
├── README.md          # 이 파일
├── index.ts           # 테마 로더 (메인 진입점)
├── original.json      # 기본 테마 (template-examples.html 3배 비율)
├── dark.json          # 다크 모드 테마
├── minimal.json       # 미니멀 테마
├── retro.json         # 레트로 게임 스타일
├── neon.json          # 사이버펑크 네온
├── nature.json        # 자연 친화적 그린
├── newspaper.json     # 신문 스타일
├── comics.json        # 코믹북 스타일
├── tech.json          # 개발자 코드 스타일
├── romantic.json      # 로맨틱 핑크
└── simple-black.json  # 심플 블랙
```

## 🎯 사용법

### 1. 기본 사용 (기존과 동일)
```typescript
import { THEME_PRESETS, THEME_INFO } from '@/config/themes';

// 테마 적용
const templateStyle = THEME_PRESETS.retro;

// 테마 정보 가져오기
const themeInfo = THEME_INFO.retro;
// { name: '레트로', description: '향수를 불러일으키는 복고풍 스타일', emoji: '🎵' }
```

### 2. 새로운 테마 추가
1. `new-theme.json` 파일 생성
2. `index.ts`에 import 추가
3. `THEME_PRESETS`에 등록
4. `THEME_INFO`에 메타데이터 추가

### 3. 개별 테마 수정
각 JSON 파일을 직접 편집하면 됩니다. 코드 재컴파일이 자동으로 처리됩니다.

## ✨ 장점

### 🔧 유지보수성
- 각 테마가 개별 파일로 분리
- 변경사항 추적이 용이
- 팀원간 충돌 최소화

### 📈 확장성  
- 새 테마 추가가 매우 간단
- JSON 구조로 API 호환성 보장
- 동적 로딩 구현 가능

### 🎨 디자이너 친화적
- JSON 형태로 비개발자도 수정 가능
- showcase 시스템과 완벽 호환
- 실시간 미리보기 지원

### 🚀 성능
- 필요한 테마만 선택적 로딩 가능
- 번들 크기 최적화 용이
- 트리 쉐이킹 지원

## 📊 템플릿 기준

모든 테마는 **template-examples.html 기준 3배 비율**을 따릅니다:

| 요소 | template-examples.html | 실제 시스템 (1080p) |
|------|----------------------|-------------------|
| 제목 폰트 | 16px | 48px (3배) |
| 본문 폰트 | 16px | 48px (3배) |
| 메타 폰트 | 12px | 36px (3배) |
| 패딩 | 15px 10px | 45px 30px (3배) |

## 🎮 테마 목록

| 테마 | 이모지 | 설명 | 특징 |
|------|--------|------|------|
| original | 📱 | 기본 VideoWeb3 스타일 | template-examples.html 정확한 3배 |
| dark | 🌙 | 다크 모드 | 그라디언트 + 네온 테두리 |
| minimal | ✨ | 미니멀 디자인 | 깔끔한 회색조 |
| retro | 🎵 | 레트로 게임 | DungGeunMo 폰트 + 바운스 애니메이션 |
| neon | 🌟 | 사이버펑크 | 네온 효과 + 플리커 애니메이션 |
| nature | 🌿 | 자연 친화적 | 그린 그라디언트 + 이모지 데코 |
| newspaper | 📰 | 신문 스타일 | 세리프 폰트 + 더블 보더 |
| comics | 💥 | 코믹북 | Bangers 폰트 + 텍스트 쉐도우 |
| tech | 💻 | 개발자 코드 | Source Code Pro + VS Code 색상 |
| romantic | 💕 | 로맨틱 핑크 | Playfair Display + 하트 데코 |
| simple-black | ⚫ | 심플 블랙 | 미니멀 검정 테마 |

## 🔄 마이그레이션

기존 `themes.ts` 파일은 `src/config/backup/themes.ts.original`로 백업되었습니다.
모든 import 경로는 기존과 동일하게 작동합니다.

## 📝 JSON 스키마

각 테마 JSON 파일은 `TemplateStyle` 타입을 따릅니다:

```typescript
interface TemplateStyle {
  themePreset: ThemePreset;
  fontFamily?: string;
  fontSize?: {
    title?: string;
    text?: string;
    meta?: string;
  };
  fontWeight?: {
    title?: number;
    text?: number;
    meta?: number;
  };
  // ... 기타 스타일 속성들
}
```

상세한 타입 정의는 `src/types/VideoProps.ts`를 참조하세요. 