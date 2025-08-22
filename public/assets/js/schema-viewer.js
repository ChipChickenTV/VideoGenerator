/**
 * VideoWeb3 Schema Viewer - JSON-Style Renderer
 */

class SchemaViewer {
    constructor() {
        this.api = new SchemaAPI();
        this.currentTab = 'schema';
        this.schemaData = null;
        this.animationsData = null;
        
        this.initTabs();
        this.loadData();
    }
    
    initTabs() {
        const tabs = document.querySelectorAll('.nav-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                this.switchTab(targetTab);
            });
        });
    }
    
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-content`);
        });
        
        this.currentTab = tabName;
    }
    
    async loadData() {
        try {
            // Load all data in parallel
            const [schemaResponse, animationsResponse] = await Promise.all([
                this.api.loadSchema(),
                this.api.loadAnimations()
            ]);
            
            this.schemaData = schemaResponse;
            this.animationsData = animationsResponse;
            
            this.renderSchema();
            this.renderAnimations();
            
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('schema', error.message);
            this.showError('animations', error.message);
        }
    }
    
    showError(section, message) {
        const loadingEl = document.getElementById(`${section}-loading`);
        const contentEl = document.getElementById(`${section}-content`);
        
        if (loadingEl) loadingEl.classList.add('hidden');
        if (contentEl) {
            contentEl.innerHTML = `<div class="error">데이터 로딩 중 오류가 발생했습니다: ${message}</div>`;
        }
    }
    
    renderSchema() {
        const loadingEl = document.getElementById('schema-loading');
        const contentEl = document.getElementById('schema-content');
        
        if (!this.schemaData || !this.schemaData.fields) {
            this.showError('schema', 'Invalid schema data');
            return;
        }
        
        loadingEl.classList.add('hidden');
        
        const jsonHtml = this.renderJsonSchema(this.schemaData.fields, 0);
        contentEl.innerHTML = `
            <div class="section-header">
                <span class="section-header__icon">🏗️</span>
                <h2 class="section-header__title">JSON Schema Structure</h2>
            </div>
            <div class="schema-tree">
                <div class="json-brace">{</div>
                ${jsonHtml}
                <div class="json-brace">}</div>
            </div>
        `;
        
        // Add expand/collapse functionality
        this.initJsonToggling();
    }
    
    renderJsonSchema(fields, depth = 0) {
        const indent = '  '.repeat(depth + 1);
        const entries = Object.entries(fields);
        
        return entries.map(([name, field], index) => {
            const hasChildren = field.fields && Object.keys(field.fields).length > 0;
            const isExpandable = hasChildren || this.isExpandableField(field);
            const isLast = index === entries.length - 1;
            const fieldId = `field-${Math.random().toString(36).substr(2, 9)}`;
            
            let html = `
                <div class="field" data-field-id="${fieldId}" data-field-name="${name}">
                    <div class="field-line">
                        <span class="field-indent">${indent}</span>
                        ${isExpandable ? `<span class="expand-toggle" data-target="${fieldId}" data-field-name="${name}">▶</span>` : '<span class="expand-toggle hidden"></span>'}
                        <span class="field-name">${name}</span>
                        <span class="field-colon">:</span>
                        <span class="field-value">${this.renderFieldValue(field, isExpandable)}</span>
                        <span class="field-type">${field.type}</span>
                        ${field.required ? '<span class="field-required">*</span>' : ''}
                        ${field.description ? `<span class="field-comment">// ${field.description}</span>` : ''}
                        ${field.default !== undefined ? `<span class="field-default-inline">= ${JSON.stringify(field.default)}</span>` : ''}
                        ${!isLast ? '<span class="json-comma">,</span>' : ''}
                    </div>
                    ${field.options && field.options.length > 0 ? `
                        <div class="field-line">
                            <span class="field-indent">${indent}  </span>
                            <span class="field-comment">// options: [${field.options.map(opt => `"${opt}"`).join(', ')}]</span>
                        </div>
                    ` : ''}
            `;
            
            if (hasChildren) {
                html += `
                    <div class="field-children collapsed" data-children-of="${fieldId}">
                        ${this.renderJsonSchema(field.fields, depth + 1)}
                    </div>
                `;
            } else if (this.isExpandableField(field)) {
                // Placeholder for dynamically loaded content
                html += `
                    <div class="field-children collapsed" data-children-of="${fieldId}" data-lazy-load="${name}">
                        <div class="field-line">
                            <span class="field-indent">${indent}  </span>
                            <span class="loading__text">로딩 중...</span>
                        </div>
                    </div>
                `;
            }
            
            html += `</div>`;
            
            return html;
        }).join('');
    }
    
    isExpandableField(field) {
        // Any object type field can be expanded to show its structure
        return field.type === 'object' || field.type === 'array<object>';
    }
    
    renderFieldValue(field, hasChildren) {
        if (hasChildren) {
            return '<span class="json-ellipsis">{ ... }</span>';
        }
        
        switch (field.type) {
            case 'string':
                return '<span class="json-string">string</span>';
            case 'number':
                return '<span class="json-number">number</span>';
            case 'boolean':
                return '<span class="json-boolean">boolean</span>';
            case 'array':
                return '<span class="json-array-bracket">[</span><span class="json-type">array</span><span class="json-array-bracket">]</span>';
            case 'array<object>':
                return '<span class="json-array-bracket">[</span><span class="json-brace">{</span><span class="json-ellipsis">...</span><span class="json-brace">}</span><span class="json-array-bracket">]</span>';
            case 'object':
                return '<span class="json-brace">{</span><span class="json-ellipsis">...</span><span class="json-brace">}</span>';
            case 'enum':
                return '<span class="json-string">enum</span>';
            default:
                return `<span class="json-type">${field.type}</span>`;
        }
    }
    
    initJsonToggling() {
        // Remove existing event listeners to avoid duplicates
        document.removeEventListener('click', this.handleToggleClick);
        document.removeEventListener('click', this.handleEllipsisClick);
        
        // Use event delegation for better performance and dynamic content support
        this.handleToggleClick = async (e) => {
            const toggle = e.target.closest('.expand-toggle:not(.hidden)');
            if (!toggle) return;
            
            e.stopPropagation();
            const targetId = toggle.dataset.target;
            const fieldName = toggle.dataset.fieldName;
            const children = document.querySelector(`[data-children-of="${targetId}"]`);
            
            if (children) {
                const isCollapsed = children.classList.contains('collapsed');
                
                if (isCollapsed) {
                    // If this is a lazy-load field, fetch detailed structure
                    if (children.hasAttribute('data-lazy-load')) {
                        await this.loadFieldDetails(fieldName, children, targetId);
                    }
                    
                    children.classList.remove('collapsed');
                    toggle.classList.add('expanded');
                    // Update ellipsis to show expanded state
                    const ellipsis = toggle.closest('.field-line').querySelector('.json-ellipsis');
                    if (ellipsis) {
                        ellipsis.style.display = 'none';
                    }
                } else {
                    children.classList.add('collapsed');
                    toggle.classList.remove('expanded');
                    // Show ellipsis again
                    const ellipsis = toggle.closest('.field-line').querySelector('.json-ellipsis');
                    if (ellipsis) {
                        ellipsis.style.display = 'inline';
                    }
                }
            }
        };
        
        this.handleEllipsisClick = (e) => {
            const ellipsis = e.target.closest('.json-ellipsis');
            if (!ellipsis) return;
            
            e.stopPropagation();
            const toggle = ellipsis.closest('.field-line').querySelector('.expand-toggle:not(.hidden)');
            if (toggle) {
                toggle.click();
            }
        };
        
        // Add event listeners with delegation
        document.addEventListener('click', this.handleToggleClick);
        document.addEventListener('click', this.handleEllipsisClick);
    }
    
    async loadFieldDetails(fieldName, container, targetId) {
        try {
            // Fetch detailed schema for this field
            const response = await fetch(`/api/schema/${fieldName}`);
            const data = await response.json();
            
            if (data.success && data.fields) {
                // Calculate proper indentation based on current depth
                const parentIndent = container.closest('.field').querySelector('.field-indent');
                const currentDepth = parentIndent ? (parentIndent.textContent.length / 2) : 1;
                
                // Render ONLY the field contents, without the outer braces
                const detailHtml = this.renderJsonSchema(data.fields, currentDepth);
                
                container.innerHTML = detailHtml;
                container.removeAttribute('data-lazy-load');
            } else {
                container.innerHTML = `
                    <div class="field-line">
                        <span class="field-indent">${'  '.repeat(2)}</span>
                        <span class="error">구조 정보를 불러올 수 없습니다</span>
                    </div>
                `;
            }
        } catch (error) {
            console.error(`Error loading details for ${fieldName}:`, error);
            container.innerHTML = `
                <div class="field-line">
                    <span class="field-indent">${'  '.repeat(2)}</span>
                    <span class="error">로딩 실패: ${error.message}</span>
                </div>
            `;
        }
    }
    
    async renderAnimations() {
        const loadingEl = document.getElementById('animations-loading');
        const contentEl = document.getElementById('animations-content');
        
        if (!this.animationsData || !Array.isArray(this.animationsData)) {
            this.showError('animations', 'Invalid animations data');
            return;
        }
        
        loadingEl.classList.add('hidden');
        
        // Group animations by type
        const groupedAnimations = this.groupAnimationsByType(this.animationsData);
        
        // Render each group
        const groupsHtml = Object.entries(groupedAnimations).map(([type, animations]) => {
            return `
                <div class="animation-group">
                    <div class="animation-group__header">
                        <h3 class="animation-group__title">
                            <span class="animation-group__icon">${this.getTypeIcon(type)}</span>
                            ${type}
                        </h3>
                        <span class="animation-group__count">${animations.length}개</span>
                    </div>
                    ${animations.map(anim => this.renderAnimationItem(anim)).join('')}
                </div>
            `;
        }).join('');
        
        contentEl.innerHTML = `
            <div class="section-header">
                <span class="section-header__icon">🎭</span>
                <h2 class="section-header__title">Animation Library</h2>
            </div>
            <div class="animation-grid">${groupsHtml}</div>
        `;
        
        // Load detailed parameters for each animation
        this.loadAnimationDetails();
    }
    
    groupAnimationsByType(animations) {
        return animations.reduce((groups, animation) => {
            if (!groups[animation.type]) {
                groups[animation.type] = [];
            }
            groups[animation.type].push(animation);
            return groups;
        }, {});
    }
    
    getTypeIcon(type) {
        const icons = {
            image: '🖼️',
            text: '📝',
            transition: '🔄',
            filter: '🎨',
            highlight: '✨'
        };
        return icons[type] || '🎬';
    }
    
    renderAnimationItem(animation) {
        return `
            <div class="animation-item" data-type="${animation.type}" data-name="${animation.name}">
                <div class="animation-item__name">${animation.name}</div>
                <div class="animation-item__description">${animation.description}</div>
                <div class="animation-item__params">
                    <div class="params-title">Parameters</div>
                    <div class="params-content">
                        <div class="loading__text">파라미터 정보를 불러오는 중...</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    async loadAnimationDetails() {
        const animationItems = document.querySelectorAll('.animation-item');
        
        // Types that don't have parameters (CSS styles only)
        const noParamTypes = ['highlight', 'filter'];
        
        // Load details for each animation
        const promises = Array.from(animationItems).map(async (item, index) => {
            const type = item.dataset.type;
            const name = item.dataset.name;
            
            // Skip parameter loading for types that don't have parameters or 'none' animations
            if (noParamTypes.includes(type) || name === 'none') {
                this.renderEmptyParams(item);
                return;
            }
            
            try {
                // Add small delay to avoid overwhelming the server
                await new Promise(resolve => setTimeout(resolve, index * 50));
                
                const response = await fetch(`/api/animations/${type}/${name}`);
                const data = await response.json();
                
                if (data.success && data.fields && Object.keys(data.fields).length > 0) {
                    this.renderAnimationParams(item, data.fields);
                } else {
                    this.renderEmptyParams(item);
                }
            } catch (error) {
                console.error(`Error loading ${type}/${name}:`, error);
                this.renderEmptyParams(item);
            }
        });
        
        await Promise.allSettled(promises);
    }
    
    renderAnimationParams(item, fields) {
        const paramsContainer = item.querySelector('.params-content');
        
        if (!fields || Object.keys(fields).length === 0) {
            this.renderEmptyParams(item);
            return;
        }
        
        const paramsHtml = Object.entries(fields).map(([name, param]) => {
            return `
                <div class="param">
                    <span class="param__name">${name}</span>
                    <div class="param__details">
                        <span class="param__type">${param.type}</span>
                        ${param.default !== undefined ? `<span class="param__default">${param.default}</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        paramsContainer.innerHTML = paramsHtml;
    }
    
    renderEmptyParams(item) {
        const paramsContainer = item.querySelector('.params-content');
        paramsContainer.innerHTML = '<div class="empty-state">파라미터 없음</div>';
    }
}

// Initialize the schema viewer when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SchemaViewer();
});