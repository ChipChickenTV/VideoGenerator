# UI 구현 참고사항

## API 엔드포인트
- `GET /api/schema` - 전체 스키마
- `GET /api/schema/templateStyle` - 특정 필드 
- `GET /api/animations` - 애니메이션 목록
- `GET /api/animations/{type}/{name}` - 애니메이션 상세

## 주요 데이터 구조
- `field.type`, `field.required`, `field.description`, `field.default`, `field.options`
- `field.fields` - 중첩 필드
- `animation.details.fields` - 애니메이션 파라미터