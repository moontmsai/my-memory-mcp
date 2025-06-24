#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { MemorySystem } from './memory.js';

// 단순한 MCP 서버 - 복잡한 설정 없이!
const server = new Server(
  {
    name: 'my-memory-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const memory = new MemorySystem();

// 도구 목록 정의 - 통합된 5개 도구
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'create',
        description: '새로운 엔티티/관찰/관계 생성',
        inputSchema: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['entity', 'observation', 'relation'], description: '생성할 데이터 타입' },
            // Entity fields
            name: { type: 'string', description: '엔티티 이름 (entity 타입시 필수)' },
            entityType: { type: 'string', description: '엔티티 유형 (entity 타입시 필수)' },
            // Observation fields
            entityId: { type: 'string', description: '대상 엔티티 ID (observation 타입시 필수)' },
            value: { type: 'string', description: '관찰 내용 (observation 타입시 필수)' },
            notes: { type: 'string', description: '추가 메모 (observation용)' },
            // Relation fields
            sourceEntityId: { type: 'string', description: '소스 엔티티 ID (relation 타입시 필수)' },
            targetEntityId: { type: 'string', description: '타겟 엔티티 ID (relation 타입시 필수)' },
            properties: { type: 'object', description: '관계 속성 (relation용)' },
            // Common fields
            importanceScore: { type: 'number', description: '중요도 (0-100)' },
          },
          required: ['type'],
        },
      },
      {
        name: 'get',
        description: '엔티티/관찰/관계 목록 조회',
        inputSchema: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['entity', 'observation', 'relation'], description: '조회할 데이터 타입' },
            // Entity filters
            entityType: { type: 'string', description: '필터할 엔티티 유형 (entity 타입용)' },
            // Observation/Relation filters
            entityId: { type: 'string', description: '특정 엔티티 관련 항목만 조회' },
            sourceEntityId: { type: 'string', description: '소스 엔티티 ID (relation 타입용)' },
            // Common filters
            minImportance: { type: 'number', description: '최소 중요도 점수로 필터링' },
            includeDetails: { type: 'boolean', description: '상세 정보 포함 (기본: false)' },
          },
          required: ['type'],
        },
      },
      {
        name: 'search',
        description: '검색 및 요약 기능',
        inputSchema: {
          type: 'object',
          properties: {
            mode: { type: 'string', enum: ['summary', 'importance'], description: '검색 모드' },
            // Summary mode
            entityId: { type: 'string', description: '요약할 엔티티 ID (summary 모드시 필수)' },
            // Importance mode
            minScore: { type: 'number', description: '최소 중요도 점수 (importance 모드시 필수)' },
            type: { type: 'string', enum: ['entity', 'relation', 'observation'], description: '검색할 데이터 타입 (선택사항)' },
            includeDetails: { type: 'boolean', description: '상세 정보 포함 (기본: false)' },
          },
          required: ['mode'],
        },
      },
      {
        name: 'update',
        description: '엔티티/관계/관찰 수정',
        inputSchema: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['entity', 'relation', 'observation'], description: '수정할 데이터 타입' },
            id: { type: 'string', description: '수정할 항목의 ID' },
            data: { type: 'object', description: '수정할 데이터 (부분 수정 가능)' },
          },
          required: ['type', 'id', 'data'],
        },
      },
      {
        name: 'delete',
        description: '엔티티/관계/관찰 삭제',
        inputSchema: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['entity', 'relation', 'observation'], description: '삭제할 데이터 타입' },
            id: { type: 'string', description: '삭제할 항목의 ID (선택사항)' },
            entityId: { type: 'string', description: '특정 엔티티 관련 항목 삭제 (선택사항)' },
            cascade: { type: 'boolean', description: '관련 데이터도 함께 삭제' },
            minImportance: { type: 'number', description: '최소 중요도 점수로 필터링' },
            maxImportance: { type: 'number', description: '최대 중요도 점수로 필터링' },
          },
          required: ['type'],
        },
      },
    ],
  };
});
// 도구 호출 핸들러 - 통합된 도구들
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (!args) {
      throw new Error('인수가 필요합니다');
    }

    switch (name) {
      case 'create': {
        const { type } = args as any;
        let result;
        
        switch (type) {
          case 'entity':
            const { name, entityType, importanceScore } = args as any;
            if (!name || !entityType) {
              throw new Error('entity 생성시 name과 entityType이 필수입니다');
            }
            result = await memory.createEntity({ 
              type: entityType, 
              name, 
              importanceScore 
            });
            break;
            
          case 'observation':
            const { entityId, value, notes, importanceScore: obsScore } = args as any;
            if (!entityId || !value) {
              throw new Error('observation 생성시 entityId와 value가 필수입니다');
            }
            result = await memory.createObservation({
              entityId,
              type: (args as any).observationType || 'general',
              value,
              notes,
              importanceScore: obsScore
            });
            break;
            
          case 'relation':
            const { sourceEntityId, targetEntityId, properties, importanceScore: relScore } = args as any;
            if (!sourceEntityId || !targetEntityId) {
              throw new Error('relation 생성시 sourceEntityId와 targetEntityId가 필수입니다');
            }
            result = await memory.createRelation({
              sourceEntityId,
              targetEntityId,
              type: (args as any).relationType || 'related',
              properties,
              importanceScore: relScore
            });
            break;
            
          default:
            throw new Error(`지원하지 않는 생성 타입: ${type}`);
        }
        
        return { content: [{ type: 'text', text: `${type} 생성 완료: ${JSON.stringify(result, null, 2)}` }] };
      }

      case 'get': {
        const { type } = args as any;
        let result;
        
        switch (type) {
          case 'entity':
            const { entityType, minImportance, includeDetails } = args as any;
            result = await memory.getEntities({ 
              type: entityType, 
              minImportance, 
              includeDetails 
            });
            break;
            
          case 'observation':
            const { entityId, minImportance: obsMin, includeDetails: obsDetails } = args as any;
            result = await memory.getObservations({ 
              entityId, 
              minImportance: obsMin, 
              includeDetails: obsDetails 
            });
            break;
            
          case 'relation':
            const { sourceEntityId, minImportance: relMin, includeDetails: relDetails } = args as any;
            result = await memory.getRelations({ 
              sourceEntityId, 
              minImportance: relMin, 
              includeDetails: relDetails 
            });
            break;
            
          default:
            throw new Error(`지원하지 않는 조회 타입: ${type}`);
        }
        
        return { content: [{ type: 'text', text: `${type} 목록:\n${JSON.stringify(result, null, 2)}` }] };
      }

      case 'search': {
        const { mode } = args as any;
        let result;
        
        switch (mode) {
          case 'summary':
            const { entityId } = args as any;
            if (!entityId) {
              throw new Error('summary 모드에서는 entityId가 필수입니다');
            }
            result = await memory.getEntitySummary(entityId);
            return { content: [{ type: 'text', text: result }] };
            
          case 'importance':
            const { minScore, type, includeDetails } = args as any;
            if (minScore === undefined) {
              throw new Error('importance 모드에서는 minScore가 필수입니다');
            }
            result = await memory.searchByImportance(minScore, type, includeDetails);
            return { content: [{ type: 'text', text: `중요도 검색 결과:\n${JSON.stringify(result, null, 2)}` }] };
            
          default:
            throw new Error(`지원하지 않는 검색 모드: ${mode}`);
        }
      }

      case 'update':
        const updated = await memory.update(args as any);
        return { content: [{ type: 'text', text: `수정 완료: ${JSON.stringify(updated, null, 2)}` }] };

      case 'delete':
        const deleted = await memory.delete(args as any);
        return { content: [{ type: 'text', text: `삭제 완료: ${JSON.stringify(deleted, null, 2)}` }] };

      default:
        throw new Error(`알 수 없는 도구: ${name}`);
    }
  } catch (error) {
    return { 
      content: [{ 
        type: 'text', 
        text: `오류 발생: ${error instanceof Error ? error.message : String(error)}` 
      }] 
    };
  }
});

// 서버 시작
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('My Memory MCP Server 시작됨');
}

main().catch((error) => {
  console.error('서버 시작 실패:', error);
  process.exit(1);
});
