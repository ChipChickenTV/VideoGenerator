/**
 * VideoWeb3 Schema Viewer
 * JSON 스타일로 API 스키마를 시각화하는 도구
 */

class SchemaViewer {
    constructor() {
        this.api = new SchemaAPI();
        this.currentTab = 'schema';
        this.schemaData = null; // 전체 스키마 데이터 저장
        
        this.initializeComponents();
    }
    
    /**
     * 컴포넌트 초기화
     */
    initializeComponents() {
        this.setupTabNavigation();
        this.loadSchemaData();
    }
    
    /**
     * 탭 네비게이션 설정
     */
    setupTabNavigation() {
        const tabs = document.querySelectorAll('.nav-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTab(tab.dataset.tab);
            });
        });
    }
    
    /**
     * 탭 전환
     */
    switchTab(tabName) {
        // 탭 버튼 상태 업데이트
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // 탭 컨텐츠 상태 업데이트
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-content`);
        });
        
        this.currentTab = tabName;
    }
    
    /**
     * 스키마 데이터 로드 및 렌더링
     */
    async loadSchemaData() {
        try {
            const [schemaResponse, animationsResponse] = await Promise.all([
                this.loadCompleteSchema(),
                this.api.loadAnimations()
            ]);
            
            this.renderSchema(schemaResponse);
            this.renderAnimations(animationsResponse);
            
        } catch (error) {
            console.error('데이터 로딩 실패:', error);
            this.showErrorMessage('데이터를 불러올 수 없습니다.');
        }
    }
    
    /**
     * 모든 중첩 필드를 포함한 전체 스키마 로드
     */
    async loadCompleteSchema() {
        const baseSchema = await this.api.loadSchema();
        if (!baseSchema?.fields) return baseSchema;
        
        // 최상위 object/array<object> 필드들의 상세 정보 로드
        const objectFields = Object.entries(baseSchema.fields).filter(([name, field]) => 
            field.type === 'object' || field.type === 'array<object>'
        );
        
        const detailPromises = objectFields.map(async ([name, field]) => {
            try {
                const detail = await this.api.loadSchema(name);
                if (detail?.fields) {
                    field.fields = detail.fields;
                }
            } catch (error) {
                console.error(`Failed to load ${name} details:`, error);
            }
        });
        
        await Promise.all(detailPromises);
        return baseSchema;
    }
    
    /**
     * 에러 메시지 표시
     */
    showErrorMessage(message) {
        const schemaContent = document.getElementById('schema-content');
        const animationsContent = document.getElementById('animations-content');
        
        const errorHTML = `<div class="error">${message}</div>`;
        
        if (schemaContent) schemaContent.innerHTML = errorHTML;
        if (animationsContent) animationsContent.innerHTML = errorHTML;
    }
    
    /**
     * 스키마 렌더링
     */
    renderSchema(data) {
        const loadingEl = document.getElementById('schema-loading');
        const contentEl = document.getElementById('schema-content');
        
        // 로딩 숨기기
        loadingEl.classList.add('hidden');
        
        // 데이터 검증
        if (!data?.fields) {
            this.showErrorMessage('스키마 데이터를 불러올 수 없습니다');
            return;
        }
        
        // 전체 스키마 데이터 저장
        this.schemaData = data;
        
        // HTML 구성
        const sectionHeader = this.createSectionHeader('🏗️', 'JSON Schema Structure');
        const fieldsHtml = this.renderFields(data.fields, 1);
        const jsonViewer = this.createJsonViewer(fieldsHtml);
        
        contentEl.innerHTML = sectionHeader + jsonViewer;
        
        // 닫는 중괄호 추가
        this.addClosingBrace(contentEl);
        
        // 토글 이벤트 초기화
        this.initializeToggling();
    }
    
    /**
     * 섹션 헤더 생성
     */
    createSectionHeader(icon, title) {
        return `
            <div class="section-header">
                <span class="section-header__icon">${icon}</span>
                <h2 class="section-header__title">${title}</h2>
            </div>
        `;
    }
    
    /**
     * JSON 뷰어 컨테이너 생성
     */
    createJsonViewer(fieldsHtml) {
        return `
            <div class="json-viewer">
                <div class="json-line"><span class="json-brace">{</span></div>
                ${fieldsHtml}
            </div>
        `;
    }
    
    /**
     * 닫는 중괄호 추가
     */
    addClosingBrace(contentEl) {
        const jsonViewer = contentEl.querySelector('.json-viewer');
        const closingBrace = document.createElement('div');
        closingBrace.className = 'json-line';
        closingBrace.innerHTML = '<span class="json-brace">}</span>';
        jsonViewer.appendChild(closingBrace);
    }
    
    /**
     * 필드들을 JSON 형태로 렌더링
     */
    renderFields(fields, level, parentPath = '') {
        const indent = '  '.repeat(level);
        const entries = Object.entries(fields);
        const container = document.createElement('div');
        
        entries.forEach(([name, field], index) => {
            const fieldPath = parentPath ? `${parentPath}.${name}` : name;
            const fieldData = {
                name,
                field,
                isLast: index === entries.length - 1,
                canExpand: this.isExpandableField(field),
                fieldId: this.generateFieldId(),
                level,
                indent,
                fieldPath
            };
            
            const fieldElement = this.createFieldElement(fieldData);
            container.appendChild(fieldElement);
        });
        
        return container.innerHTML;
    }
    
    /**
     * 필드가 확장 가능한지 확인
     */
    isExpandableField(field) {
        return field.type === 'object' || field.type === 'array<object>';
    }
    
    /**
     * 고유한 필드 ID 생성
     */
    generateFieldId() {
        return `field_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * 개별 필드 요소 생성
     */
    createFieldElement(fieldData) {
        const { name, field, isLast, canExpand, fieldId, level, indent, fieldPath } = fieldData;
        
        // 필드 컨테이너
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'json-field';
        fieldDiv.setAttribute('data-level', level);
        fieldDiv.setAttribute('data-field-path', fieldPath);
        
        // 필드 라인 생성
        const lineDiv = this.createFieldLine(fieldData);
        fieldDiv.appendChild(lineDiv);
        
        // 확장 가능한 내용 추가
        if (canExpand) {
            const expandableDiv = this.createExpandableContent(fieldId, indent);
            fieldDiv.appendChild(expandableDiv);
        }
        
        return fieldDiv;
    }
    
    /**
     * 필드 라인 생성
     */
    createFieldLine(fieldData) {
        const { name, field, isLast, canExpand, fieldId, indent } = fieldData;
        
        const lineDiv = document.createElement('div');
        lineDiv.className = 'json-line';
        
        let lineHTML = `<span class="json-indent">${indent}</span>`;
        
        // 토글 버튼 또는 공백
        if (canExpand) {
            lineHTML += `<span class="json-toggle" data-target="${fieldId}">▶</span>`;
        } else {
            lineHTML += `<span class="json-toggle-space"> </span>`;
        }
        
        // 필드 정보
        lineHTML += `<span class="json-key">"${name}"</span>`;
        lineHTML += `<span class="json-colon">: </span>`;
        lineHTML += this.renderFieldValue(field, canExpand, fieldData.fieldPath);
        
        // 필수 필드 표시
        if (field.required) {
            lineHTML += ` <span class="json-required">*</span>`;
        }
        
        // 설명 표시
        if (field.description) {
            lineHTML += ` <span class="json-comment">// ${field.description}</span>`;
        }
        
        // 쉼표 표시
        if (!isLast) {
            lineHTML += `<span class="json-comma">,</span>`;
        }
        
        lineDiv.innerHTML = lineHTML;
        return lineDiv;
    }
    
    /**
     * 확장 가능한 컨텐츠 생성
     */
    createExpandableContent(fieldId, indent) {
        const expandableDiv = document.createElement('div');
        expandableDiv.className = 'json-expandable';
        expandableDiv.id = fieldId;
        expandableDiv.style.display = 'none';
        
        expandableDiv.innerHTML = `
            <div class="json-line"><span class="json-indent">${indent}  </span><span class="json-brace">{</span></div>
            <div class="json-loading">로딩 중...</div>
            <div class="json-line"><span class="json-indent">${indent}  </span><span class="json-brace">}</span></div>
        `;
        
        return expandableDiv;
    }
    
    /**
     * 필드 값 렌더링
     */
    renderFieldValue(field, canExpand, fieldPath = '') {
        if (canExpand) {
            if (field.type === 'array<object>') {
                return '<span class="json-array">[{...}]</span>';
            }
            return '<span class="json-object">{...}</span>';
        }
        
        // enum 타입 특별 처리
        if (field.type === 'enum' && field.options && Array.isArray(field.options)) {
            return this.renderEnumValue(field, fieldPath);
        }
        
        const valueTypeMap = {
            'string': '<span class="json-type-value">&lt;string&gt;</span>',
            'number': '<span class="json-type-value">&lt;number&gt;</span>',
            'boolean': '<span class="json-type-value">&lt;boolean&gt;</span>',
            'enum': '<span class="json-type-value">&lt;enum&gt;</span>'
        };
        
        return valueTypeMap[field.type] || `<span class="json-type-value">&lt;${field.type}&gt;</span>`;
    }
    
    /**
     * Animation Library 필드인지 확인
     */
    isAnimationLibraryField(fieldPath) {
        const animationPaths = [
            'image.animation.effect',
            'script.animation.in',
            'script.animation.out', 
            'script.animation.highlight',
            'transition.effect'
        ];
        
        return animationPaths.some(path => fieldPath.includes(path));
    }
    
    /**
     * enum 필드 값 렌더링 (Animation Library vs 일반 enum 구분)
     */
    renderEnumValue(field, fieldPath) {
        const options = field.options;
        const defaultValue = field.default;
        const isAnimationField = this.isAnimationLibraryField(fieldPath);
        
        // Animation Library 필드는 특별한 스타일
        const baseClass = isAnimationField ? 'json-animation-enum' : 'json-enum-option';
        const containerClass = isAnimationField ? 'json-animation-container' : '';
        
        // 옵션이 4개 이하면 inline으로, 그 이상이면 축약
        if (options.length <= 4) {
            const optionsHtml = options.map(option => {
                const isDefault = option === defaultValue;
                const classes = `${baseClass}${isDefault ? ' default' : ''}`;
                return `<span class="${classes}">"${option}"</span>`;
            }).join(` <span class="json-enum-separator ${isAnimationField ? 'animation' : ''}">|</span> `);
            
            return `<span class="${containerClass}">${optionsHtml}</span>`;
        } else {
            // 긴 enum은 preview + more 스타일
            const previewOptions = options.slice(0, 2);
            const previewHtml = previewOptions.map(option => {
                const isDefault = option === defaultValue;
                const classes = `${baseClass}${isDefault ? ' default' : ''}`;
                return `<span class="${classes}">"${option}"</span>`;
            }).join(` <span class="json-enum-separator ${isAnimationField ? 'animation' : ''}">|</span> `);
            
            const moreClass = isAnimationField ? 'json-animation-more' : 'json-enum-more';
            return `<span class="${containerClass}">${previewHtml} <span class="json-enum-separator ${isAnimationField ? 'animation' : ''}">|</span> <span class="${moreClass}">+${options.length - 2} more</span></span>`;
        }
    }
    
    /**
     * 토글 이벤트 초기화
     */
    initializeToggling() {
        document.addEventListener('click', this.handleToggleClick.bind(this));
    }
    
    /**
     * 토글 클릭 이벤트 처리
     */
    async handleToggleClick(e) {
        const toggle = e.target.closest('.json-toggle');
        if (!toggle) return;
        
        const targetId = toggle.dataset.target;
        const expandable = document.getElementById(targetId);
        if (!expandable) return;
        
        const isExpanded = expandable.style.display !== 'none';
        
        if (isExpanded) {
            this.collapseField(toggle, expandable);
        } else {
            await this.expandField(toggle, expandable);
        }
    }
    
    /**
     * 필드 접기
     */
    collapseField(toggle, expandable) {
        expandable.style.display = 'none';
        toggle.textContent = '▶';
    }
    
    /**
     * 필드 펼치기
     */
    async expandField(toggle, expandable) {
        expandable.style.display = 'block';
        toggle.textContent = '▼';
        
        // 데이터 로딩이 필요한 경우
        const loading = expandable.querySelector('.json-loading');
        if (loading) {
            await this.loadFieldData(expandable, loading);
        }
    }
    
    /**
     * 필드 세부 데이터 로드
     */
    async loadFieldData(expandable, loading) {
        try {
            const fieldPath = this.extractFieldPath(expandable);
            const fieldData = this.getFieldDataByPath(fieldPath);
            
            if (fieldData && fieldData.fields) {
                const level = this.getFieldLevel(expandable) + 1;
                const fieldsHtml = this.renderFields(fieldData.fields, level, fieldPath);
                loading.outerHTML = fieldsHtml;
            } else {
                // 최상위 필드의 경우 API 호출 시도
                const topLevelField = fieldPath.split('.')[0];
                const response = await fetch(`/api/schema/${topLevelField}`);
                const data = await response.json();
                
                if (data.success && data.fields) {
                    const level = this.getFieldLevel(expandable) + 1;
                    const fieldsHtml = this.renderFields(data.fields, level, fieldPath);
                    loading.outerHTML = fieldsHtml;
                } else {
                    this.showLoadingError(loading, '데이터를 불러올 수 없습니다');
                }
            }
        } catch (error) {
            console.error('필드 데이터 로딩 실패:', error);
            this.showLoadingError(loading, '로딩 실패');
        }
    }
    
    /**
     * 확장 가능한 요소에서 필드 경로 추출
     */
    extractFieldPath(expandable) {
        const fieldElement = expandable.closest('.json-field');
        return fieldElement.dataset.fieldPath;
    }
    
    /**
     * 필드 경로로부터 데이터 가져오기
     */
    getFieldDataByPath(path) {
        if (!this.schemaData) return null;
        
        const parts = path.split('.');
        let current = this.schemaData.fields;
        
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const isLastPart = i === parts.length - 1;
            
            if (current[part]) {
                current = current[part];
                
                // 마지막 part가 아니고, object나 array<object> 타입인 경우 fields로 이동
                if (!isLastPart && (current.type === 'object' || current.type === 'array<object>')) {
                    if (current.fields) {
                        current = current.fields;
                    } else {
                        return null; // fields가 없으면 더 탐색할 수 없음
                    }
                }
            } else {
                return null;
            }
        }
        
        return current;
    }
    
    /**
     * 필드 레벨 가져오기
     */
    getFieldLevel(expandable) {
        const fieldElement = expandable.closest('.json-field');
        return parseInt(fieldElement.dataset.level);
    }
    
    /**
     * 로딩 에러 표시
     */
    showLoadingError(loading, message) {
        loading.innerHTML = `<div class="json-error">${message}</div>`;
    }
    
    /**
     * 애니메이션 렌더링
     */
    renderAnimations(animations) {
        const loadingEl = document.getElementById('animations-loading');
        const contentEl = document.getElementById('animations-content');
        
        loadingEl.classList.add('hidden');
        
        if (!Array.isArray(animations)) {
            this.showErrorMessage('애니메이션 데이터를 불러올 수 없습니다');
            return;
        }
        
        
        const sectionHeader = this.createSectionHeader('🎭', 'Animation Library');
        const animationGrid = this.createAnimationGrid(animations);
        
        contentEl.innerHTML = sectionHeader + animationGrid;
    }
    
    /**
     * 애니메이션 그리드 생성
     */
    createAnimationGrid(animations) {
        const grouped = this.groupAnimationsByType(animations);
        
        const groupsHtml = Object.entries(grouped).map(([type, anims]) => {
            const icon = this.getAnimationTypeIcon(type);
            return `
                <div class="animation-group">
                    <h3>${icon} ${type} (${anims.length}개)</h3>
                    ${anims.map(anim => `
                        <div class="animation-item">
                            <div class="anim-name">${anim.name}</div>
                            <div class="anim-desc">${anim.description}</div>
                            ${this.renderAnimationParameters(anim.parameters)}
                        </div>
                    `).join('')}
                </div>
            `;
        }).join('');
        
        return `<div class="animation-grid">${groupsHtml}</div>`;
    }
    
    /**
     * 애니메이션을 타입별로 그룹화
     */
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
    
    /**
     * 애니메이션 타입 아이콘 가져오기
     */
    getAnimationTypeIcon(type) {
        const icons = {
            image: '🖼️',
            text: '📝',
            transition: '🔄',
            highlight: '✨'
        };
        return icons[type] || '🎬';
    }
    
    /**
     * 애니메이션 파라미터 렌더링
     */
    renderAnimationParameters(parameters) {
        if (!parameters || parameters.length === 0) {
            return '<div class="anim-params"><span class="no-params">No parameters</span></div>';
        }
        
        const paramsHtml = parameters.map(param => {
            const defaultText = param.default !== undefined ? ` = ${param.default}` : '';
            const requiredText = param.required ? ' *' : '';
            
            return `<span class="param-item">
                <span class="param-name">${param.name}</span><span class="param-colon">:</span> 
                <span class="param-type">&lt;${param.type}&gt;</span><span class="param-default">${defaultText}</span><span class="param-required">${requiredText}</span>
            </span>`;
        }).join(', ');
        
        return `
            <div class="anim-params">
                <div class="params-label">Parameters:</div>
                <div class="params-list">{ ${paramsHtml} }</div>
            </div>
        `;
    }
}

/**
 * DOM 로드 완료 시 SchemaViewer 초기화
 */
document.addEventListener('DOMContentLoaded', () => {
    new SchemaViewer();
});