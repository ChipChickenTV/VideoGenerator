/**
 * VideoWeb3 Schema API JavaScript 클래스
 * HTML/CSS 없이 순수 로직만 포함
 */
class SchemaAPI {
    constructor() {
        this.cache = new Map();
    }
    
    // 스키마 데이터 로드
    async loadSchema(field = '') {
        const cacheKey = `schema_${field}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        try {
            const url = field ? `/api/schema/${field}` : '/api/schema';
            const response = await fetch(url);
            const data = await response.json();
            
            this.cache.set(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Schema loading error:', error);
            return null;
        }
    }
    
    // 애니메이션 데이터 로드 (상세 정보 포함)
    async loadAnimations() {
        if (this.cache.has('animations_detailed')) {
            return this.cache.get('animations_detailed');
        }
        
        try {
            // 기본 애니메이션 목록 로드
            const response = await fetch('/api/animations');
            const data = await response.json();
            
            // 각 애니메이션의 상세 정보를 병렬로 로드 (파라미터가 있는 타입만)
            const noParamTypes = ['highlight'];
            
            const detailedAnimations = await Promise.allSettled(
                data.animations.map(async (anim) => {
                    try {
                        // 파라미터가 없는 타입이거나 'none' 애니메이션은 상세 정보 요청 안함
                        if (noParamTypes.includes(anim.type) || anim.name === 'none') {
                            return { ...anim, details: { fields: {} } };
                        }
                        
                        const detailResponse = await fetch(`/api/animations/${anim.type}/${anim.name}`);
                        const details = await detailResponse.json();
                        return { ...anim, details };
                    } catch {
                        return { ...anim, details: { fields: {} } };
                    }
                })
            );
            
            const result = detailedAnimations
                .filter(result => result.status === 'fulfilled')
                .map(result => result.value);
            
            this.cache.set('animations_detailed', result);
            return result;
        } catch (error) {
            console.error('Animation loading error:', error);
            return [];
        }
    }
    
    // 데이터 가공 헬퍼 함수들
    formatFieldData(fields) {
        return Object.entries(fields).map(([name, field]) => ({
            name,
            type: field.type,
            required: field.required,
            description: field.description,
            default: field.default,
            options: field.options,
            fields: field.fields ? this.formatFieldData(field.fields) : null
        }));
    }
    
    groupAnimationsByType(animations) {
        return animations.reduce((groups, animation) => {
            if (!groups[animation.type]) {
                groups[animation.type] = [];
            }
            groups[animation.type].push({
                name: animation.name,
                description: animation.description,
                parameters: animation.details?.fields ? 
                    Object.entries(animation.details.fields).map(([name, info]) => ({
                        name,
                        type: info.type,
                        default: info.default,
                        required: info.required
                    })) : []
            });
            return groups;
        }, {});
    }
    
    // 모든 데이터 한번에 로드
    async loadAll(field = '') {
        try {
            const [schema, animations] = await Promise.all([
                this.loadSchema(field),
                this.loadAnimations()
            ]);
            
            return {
                schema: schema ? this.formatFieldData(schema.fields) : [],
                animations: this.groupAnimationsByType(animations)
            };
        } catch (error) {
            console.error('Error loading all data:', error);
            return { schema: [], animations: {} };
        }
    }
    
    // 캐시 초기화
    clearCache() {
        this.cache.clear();
    }
}

// 사용 예시 (주석처리됨)
/*
const api = new SchemaAPI();

// 전체 스키마 로드
api.loadAll().then(data => {
    console.log('Schema:', data.schema);
    console.log('Animations:', data.animations);
});

// 특정 필드만 로드
api.loadAll('templateStyle').then(data => {
    console.log('TemplateStyle schema:', data.schema);
});
*/

// Node.js 환경에서도 사용 가능하도록
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SchemaAPI;
}