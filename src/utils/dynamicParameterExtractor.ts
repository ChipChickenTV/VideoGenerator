import * as fs from 'fs';
import * as path from 'path';

interface ParameterInfo {
  name: string;
  defaultValue: any;
  type: 'number' | 'string' | 'boolean';
}

interface ExtractedParams {
  [key: string]: {
    type: string;
    required: boolean;
    default?: any;
  };
}

export class DynamicParameterExtractor {
  private animationsPath: string;

  constructor(animationsPath = 'src/animations') {
    this.animationsPath = animationsPath;
  }

  /**
   * Extract parameters from all animation files dynamically
   */
  async extractAllParameters(): Promise<Record<string, ExtractedParams>> {
    const results: Record<string, ExtractedParams> = {};
    
    try {
      // Get all animation files
      const animationFiles = await this.getAllAnimationFiles();
      
      for (const filePath of animationFiles) {
        const animationKeys = this.getAnimationKey(filePath);
        for (const animationKey of animationKeys) {
          const extracted = await this.extractFromFile(filePath);
          if (Object.keys(extracted.params).length > 0) {
            results[animationKey] = extracted.params;
          }
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error extracting parameters:', error);
      return {};
    }
  }

  /**
   * Extract parameters and description from a single animation file
   */
  private async extractFromFile(filePath: string): Promise<{ params: ExtractedParams, description?: string }> {
    const params: ExtractedParams = {};
    let description: string | undefined;
    
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Check if this is a transition animation (only transitions show duration)
      const isTransition = filePath.includes('transitions');
      
      // Look for function parameter patterns
      const functionParams = this.extractFunctionParameters(content, isTransition);
      
      for (const param of functionParams) {
        params[param.name] = {
          type: param.type,
          required: param.defaultValue === undefined,
          ...(param.defaultValue !== undefined && { default: param.defaultValue })
        };
      }
      
      // Extract description
      description = this.extractDescription(content);
      
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
    }
    
    return { params, description };
  }


  /**
   * Extract function parameters using regex patterns
   */
  private extractFunctionParameters(content: string, isTransition: boolean = false): ParameterInfo[] {
    const params: ParameterInfo[] = [];
    
    // Pattern 1: ({ duration = 90, delay = 0 }) => {} or ({ duration, delay = 0 } = {})
    const destructuringPattern = /\(\s*\{\s*([^}]+)\s*\}\s*(?:=\s*\{\})?\s*\)\s*=>/g;
    let match;
    
    while ((match = destructuringPattern.exec(content)) !== null) {
      const paramString = match[1];
      
      // Extract parameters with defaults: name = value
      const paramWithDefaultPattern = /(\w+)\s*=\s*([^,}]+)/g;
      let paramMatch;
      
      while ((paramMatch = paramWithDefaultPattern.exec(paramString)) !== null) {
        const name = paramMatch[1].trim();
        const defaultStr = paramMatch[2].trim().replace(/'/g, '').replace(/"/g, '');
        
        let defaultValue: any;
        let type: 'number' | 'string' | 'boolean' = 'string';
        
        // Try to parse as number
        if (!isNaN(Number(defaultStr))) {
          defaultValue = Number(defaultStr);
          type = 'number';
        } else if (defaultStr === 'true' || defaultStr === 'false') {
          defaultValue = defaultStr === 'true';
          type = 'boolean';
        } else {
          defaultValue = defaultStr;
          type = 'string';
        }
        
        params.push({ name, defaultValue, type });
      }
      
      // Extract parameters without defaults: just name
      const paramNames = paramString.split(',').map(p => p.trim());
      for (const paramName of paramNames) {
        const cleanName = paramName.split('=')[0].trim();
        if (cleanName && !params.find(p => p.name === cleanName)) {
          if (cleanName === 'duration' && isTransition) {
            // Show duration parameter only for transitions (user-configurable)
            params.push({ name: cleanName, defaultValue: undefined, type: 'number' });
          } else if (cleanName === 'delay') {
            // Show delay parameter
            params.push({ name: cleanName, defaultValue: 0, type: 'number' });
          }
          // Skip duration parameter for text/image animations
        }
      }
    }
    
    // Pattern 2: (frame, duration) => {} for transitions
    if (isTransition) {
      const transitionPattern = /\(\s*\w+\s*,\s*(\w+)\s*\)\s*=>/g;
      while ((match = transitionPattern.exec(content)) !== null) {
        const paramName = match[1];
        if (paramName === 'duration' && !params.find(p => p.name === paramName)) {
          // Get actual defaultDuration value
          const defaultDurationMatch = content.match(/\.defaultDuration\s*=\s*(\d+)/);
          const actualDefault = defaultDurationMatch ? Number(defaultDurationMatch[1]) : undefined;
          
          params.push({ 
            name: 'duration', 
            defaultValue: actualDefault, 
            type: 'number' 
          });
        }
      }
    }
    
    // Pattern 3: (frame, durationInFrames, transitionDuration = 15) => {}
    const transitionPattern = /\(\s*\w+\s*,\s*\w+\s*,\s*(\w+)\s*=\s*(\d+)\s*\)/g;
    while ((match = transitionPattern.exec(content)) !== null) {
      const name = match[1];
      const defaultValue = Number(match[2]);
      params.push({ name, defaultValue, type: 'number' });
    }
    
    return params;
  }

  /**
   * Extract description from animation file
   */
  private extractDescription(content: string): string | undefined {
    // Look for .description = "..." pattern
    const descriptionPattern = /\.description\s*=\s*["']([^"']+)["']/;
    const match = descriptionPattern.exec(content);
    return match ? match[1] : undefined;
  }



  /**
   * Get all animation TypeScript files recursively
   */
  private async getAllAnimationFiles(): Promise<string[]> {
    const files: string[] = [];
    
    const walkDir = (dir: string) => {
      try {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            walkDir(fullPath);
          } else if (item.endsWith('.ts') && !item.endsWith('.d.ts') && item !== 'index.ts') {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // Ignore directory read errors
      }
    };
    
    walkDir(this.animationsPath);
    return files;
  }

  /**
   * Convert file path to animation key (e.g., "image/zoom-in")
   * Also creates aliases for both camelCase and kebab-case versions
   */
  private getAnimationKey(filePath: string): string[] {
    const normalized = filePath.replace(/\\/g, '/');
    const parts = normalized.split('/');
    
    // Find the part after 'animations'
    const animationsIndex = parts.findIndex(part => part === 'animations');
    if (animationsIndex === -1 || animationsIndex + 2 >= parts.length) {
      return [];
    }
    
    const category = parts[animationsIndex + 1]; // image, text, transitions, etc.
    const fileName = parts[parts.length - 1].replace('.ts', '');
    
    const keys: string[] = [];
    
    // Add original camelCase version
    if (category === 'transitions') {
      keys.push(`transition/${fileName}`);
    } else {
      keys.push(`${category}/${fileName}`);
    }
    
    // Add kebab-case version if different
    const kebabName = fileName.replace(/([A-Z])/g, '-$1').toLowerCase();
    if (kebabName !== fileName) {
      if (category === 'transitions') {
        keys.push(`transition/${kebabName}`);
      } else {
        keys.push(`${category}/${kebabName}`);
      }
    }
    
    return keys;
  }

  /**
   * Extract all animation info including descriptions
   */
  async extractAllAnimationInfo(): Promise<Record<string, { params: ExtractedParams, description?: string }>> {
    const results: Record<string, { params: ExtractedParams, description?: string }> = {};
    
    try {
      const animationFiles = await this.getAllAnimationFiles();
      
      for (const filePath of animationFiles) {
        const animationKeys = this.getAnimationKey(filePath);
        for (const animationKey of animationKeys) {
          const extracted = await this.extractFromFile(filePath);
          results[animationKey] = extracted;
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error extracting animation info:', error);
      return {};
    }
  }
}

// Export singleton instance
export const parameterExtractor = new DynamicParameterExtractor();