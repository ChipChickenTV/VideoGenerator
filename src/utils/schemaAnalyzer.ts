import { z } from 'zod';

// Zod 내부 타입 정의를 위한 확장 인터페이스
interface ZodDefExtended {
  _def?: {
    description?: string;
    innerType?: z.ZodType;
    schema?: z.ZodType;
    type?: z.ZodType;
    values?: readonly string[];
    defaultValue?: () => any;
  };
}

// 타입 안전한 Zod 타입 정의
type ZodTypeWithDef = z.ZodType & ZodDefExtended;

interface FieldInfo {
  type: string;
  required: boolean;
  default?: any;
  description?: string;
  fields?: Record<string, FieldInfo>; // 중첩된 object의 필드들
  itemFields?: Record<string, FieldInfo>; // array 아이템이 object인 경우의 필드들
  options?: string[]; // enum의 선택 가능한 값들
}

interface SchemaAnalysisResult {
  fields: Record<string, FieldInfo>;
}

/**
 * Zod 스키마를 분석해서 1depth 구조 정보를 추출합니다.
 */
export function analyze1DepthSchema(schema: z.ZodObject<any>): SchemaAnalysisResult {
  const shape = schema.shape;
  const fields: Record<string, FieldInfo> = {};
  
  for (const [key, zodType] of Object.entries(shape)) {
    fields[key] = analyzeZodType1Depth(zodType as z.ZodType);
  }
  
  return { fields };
}

/**
 * 특정 필드의 상세 스키마를 분석합니다.
 */
export function analyzeFieldSchema(schema: z.ZodObject<any>, fieldName: string): SchemaAnalysisResult | null {
  const shape = schema.shape;
  const fieldType = shape[fieldName] as z.ZodType;
  
  if (!fieldType) {
    return null;
  }
  
  // 필드 타입에서 실제 object 스키마 추출
  let currentType = fieldType;
  
  // ZodOptional 언래핑
  if (currentType instanceof z.ZodOptional) {
    currentType = currentType._def.innerType;
  }
  
  // ZodDefault 언래핑
  if (currentType instanceof z.ZodDefault) {
    currentType = currentType._def.innerType;
  }
  
  // ZodObject 또는 ZodArray인 경우 상세 분석 가능
  if (currentType instanceof z.ZodObject) {
    return analyzeFullDepthSchema(currentType);
  } else if (currentType instanceof z.ZodArray) {
    // Array의 아이템 타입을 분석
    const itemType = currentType._def.type;
    if (itemType instanceof z.ZodObject) {
      return analyzeFullDepthSchema(itemType);
    }
  }
  
  return null;
}

/**
 * 전체 depth 스키마를 분석합니다.
 */
function analyzeFullDepthSchema(schema: z.ZodObject<any>): SchemaAnalysisResult {
  const shape = schema.shape;
  const fields: Record<string, FieldInfo> = {};
  
  for (const [key, zodType] of Object.entries(shape)) {
    fields[key] = analyzeZodTypeFullDepth(zodType as z.ZodType);
  }
  
  return { fields };
}

/**
 * 개별 Zod 타입을 1depth만 분석해서 필드 정보를 추출합니다.
 */
function analyzeZodType1Depth(zodType: z.ZodType): FieldInfo {
  let currentType = zodType;
  let isOptional = false;
  let defaultValue: any = undefined;
  let description: string | undefined = undefined;
  
  // description 추출 (언래핑 전에 먼저 확인)
  const typedCurrentType = currentType as ZodTypeWithDef;
  if (typedCurrentType._def?.description) {
    description = typedCurrentType._def.description;
  }
  
  // ZodOptional 언래핑
  if (currentType instanceof z.ZodOptional) {
    isOptional = true;
    currentType = currentType._def.innerType;
    
    // Optional 내부에도 description이 있을 수 있음
    const typedInnerType = currentType as ZodTypeWithDef;
    if (!description && typedInnerType._def?.description) {
      description = typedInnerType._def.description;
    }
  }
  
  // ZodDefault 언래핑
  if (currentType instanceof z.ZodDefault) {
    defaultValue = currentType._def.defaultValue();
    currentType = currentType._def.innerType;
    
    // Default 내부에도 description이 있을 수 있음
    const typedInnerType = currentType as ZodTypeWithDef;
    if (!description && typedInnerType._def?.description) {
      description = typedInnerType._def.description;
    }
  }
  
  // 실제 타입 결정 (1depth만)
  let typeString = 'unknown';
  let options: string[] | undefined = undefined;
  
  if (currentType instanceof z.ZodString) {
    typeString = 'string';
  } else if (currentType instanceof z.ZodNumber) {
    typeString = 'number';
  } else if (currentType instanceof z.ZodBoolean) {
    typeString = 'boolean';
  } else if (currentType instanceof z.ZodObject) {
    typeString = 'object';
    // 1depth에서는 object 내부를 분석하지 않음
  } else if (currentType instanceof z.ZodArray) {
    const itemType = analyzeZodType1Depth(currentType._def.type);
    typeString = `array<${itemType.type}>`;
    // 1depth에서는 array 내부를 분석하지 않음
  } else if (currentType instanceof z.ZodEnum) {
    typeString = 'enum';
    // ZodEnum에서 선택 가능한 값들을 동적으로 추출
    options = currentType._def.values as string[];
  }
  
  const result: FieldInfo = {
    type: typeString,
    required: !isOptional && defaultValue === undefined
  };
  
  if (defaultValue !== undefined) {
    result.default = defaultValue;
  }
  
  if (description) {
    result.description = description;
  }
  
  if (options) {
    result.options = options;
  }
  
  return result;
}

/**
 * 개별 Zod 타입을 전체 depth로 분석해서 필드 정보를 추출합니다.
 */
function analyzeZodTypeFullDepth(zodType: z.ZodType): FieldInfo {
  let currentType = zodType;
  let isOptional = false;
  let defaultValue: any = undefined;
  let description: string | undefined = undefined;
  
  // description 추출 (언래핑 전에 먼저 확인)
  const typedCurrentType = currentType as ZodTypeWithDef;
  if (typedCurrentType._def?.description) {
    description = typedCurrentType._def.description;
  }
  
  // ZodOptional 언래핑
  if (currentType instanceof z.ZodOptional) {
    isOptional = true;
    currentType = currentType._def.innerType;
    
    // Optional 내부에도 description이 있을 수 있음
    const typedInnerType = currentType as ZodTypeWithDef;
    if (!description && typedInnerType._def?.description) {
      description = typedInnerType._def.description;
    }
  }
  
  // ZodDefault 언래핑
  if (currentType instanceof z.ZodDefault) {
    defaultValue = currentType._def.defaultValue();
    currentType = currentType._def.innerType;
    
    // Default 내부에도 description이 있을 수 있음
    const typedInnerType = currentType as ZodTypeWithDef;
    if (!description && typedInnerType._def?.description) {
      description = typedInnerType._def.description;
    }
  }
  
  // 실제 타입 결정
  let typeString = 'unknown';
  let nestedFields: Record<string, FieldInfo> | undefined = undefined;
  let options: string[] | undefined = undefined;
  
  if (currentType instanceof z.ZodString) {
    typeString = 'string';
  } else if (currentType instanceof z.ZodNumber) {
    typeString = 'number';
  } else if (currentType instanceof z.ZodBoolean) {
    typeString = 'boolean';
  } else if (currentType instanceof z.ZodObject) {
    typeString = 'object';
    // object 내부 필드들을 재귀적으로 분석
    const objectShape = currentType.shape;
    nestedFields = {};
    for (const [key, zodType] of Object.entries(objectShape)) {
      nestedFields[key] = analyzeZodTypeFullDepth(zodType as z.ZodType);
    }
  } else if (currentType instanceof z.ZodArray) {
    const itemType = analyzeZodTypeFullDepth(currentType._def.type);
    typeString = `array<${itemType.type}>`;
    // array 항목이 object인 경우 해당 구조를 itemFields로 포함
    if (itemType.fields) {
      nestedFields = itemType.fields; // itemFields로 별도 관리할 수도 있음
    }
  } else if (currentType instanceof z.ZodEnum) {
    typeString = 'enum';
    // ZodEnum에서 선택 가능한 값들을 동적으로 추출
    options = currentType._def.values as string[];
  } else {
    // ZodRefine, ZodEffects 등의 특수 타입들 처리
    const typedSpecialType = currentType as ZodTypeWithDef;
    if (typedSpecialType._def?.innerType) {
      // ZodRefine, ZodEffects 등의 경우 내부 타입을 분석
      const innerType = typedSpecialType._def.innerType;
      const innerResult = analyzeZodTypeFullDepth(innerType);
      return {
        ...innerResult,
        required: !isOptional && defaultValue === undefined,
        default: defaultValue !== undefined ? defaultValue : innerResult.default,
        description: description || innerResult.description
      };
    } else if (typedSpecialType._def?.schema) {
      // ZodEffects의 경우
      const schemaType = typedSpecialType._def.schema;
      const schemaResult = analyzeZodTypeFullDepth(schemaType);
      return {
        ...schemaResult,
        required: !isOptional && defaultValue === undefined,
        default: defaultValue !== undefined ? defaultValue : schemaResult.default,
        description: description || schemaResult.description
      };
    }
  }
  
  const result: FieldInfo = {
    type: typeString,
    required: !isOptional && defaultValue === undefined
  };
  
  if (defaultValue !== undefined) {
    result.default = defaultValue;
  }
  
  if (description) {
    result.description = description;
  }
  
  if (nestedFields) {
    result.fields = nestedFields;
  }
  
  if (options) {
    result.options = options;
  }
  
  return result;
}

