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

// 도구 목록 정의
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'create_entity',
        description: '새로운 엔티티 생성',
        inputSchema: {
          type: 'object',
          properties: {
            type: { type: 'string', description: '엔티티 유형 (Person, Place 등)' },
            name: { type: 'string', description: '엔티티 이름' },
          },
          required: ['type', 'name'],
        },
      },
      {
        name: 'get_entities',
        description: '엔티티 목록 조회',
        inputSchema: {
          type: 'object',
          properties: {
            type: { type: 'string', description: '필터할 유형 (선택사항)' },
          },
        },
      },
      {
        name: 'create_observation',
        description: '새로운 관찰 추가',
        inputSchema: {
          type: 'object',
          properties: {
            entityId: { type: 'string', description: '대상 엔티티 ID' },
            type: { type: 'string', description: '관찰 유형' },
            value: { type: 'string', description: '관찰 내용' },
            notes: { type: 'string', description: '추가 메모' },
            importanceScore: { type: 'number', description: '중요도 (0-100)' },
          },
          required: ['entityId', 'type', 'value'],
        },
      },
      {
        name: 'get_observations',
        description: '관찰 목록 조회',
        inputSchema: {
          type: 'object',
          properties: {
            entityId: { type: 'string', description: '특정 엔티티의 관찰만 조회' },
          },
        },
      },
      {
        name: 'create_relation',
        description: '엔티티 간 관계 생성',
        inputSchema: {
          type: 'object',
          properties: {
            sourceEntityId: { type: 'string', description: '소스 엔티티 ID' },
            targetEntityId: { type: 'string', description: '타겟 엔티티 ID' },
            type: { type: 'string', description: '관계 유형' },
            properties: { type: 'object', description: '관계 속성' },
          },
          required: ['sourceEntityId', 'targetEntityId', 'type'],
        },
      },
      {
        name: 'get_relations',
        description: '관계 목록 조회',
        inputSchema: {
          type: 'object',
          properties: {
            sourceEntityId: { type: 'string', description: '특정 엔티티의 관계만 조회' },
          },
        },
      },
      {
        name: 'get_entity_summary',
        description: '엔티티 요약 정보 생성',
        inputSchema: {
          type: 'object',
          properties: {
            entityId: { type: 'string', description: '요약할 엔티티 ID' },
          },
          required: ['entityId'],
        },
      },
    ],
  };
});
// 도구 호출 핸들러 - 간단하게!
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (!args) {
      throw new Error('인수가 필요합니다');
    }

    switch (name) {
      case 'create_entity':
        const entity = await memory.createEntity(args as any);
        return { content: [{ type: 'text', text: `엔티티 생성 완료: ${JSON.stringify(entity, null, 2)}` }] };

      case 'get_entities':
        const entities = await memory.getEntities(args as any);
        return { content: [{ type: 'text', text: `엔티티 목록:\n${JSON.stringify(entities, null, 2)}` }] };

      case 'create_observation':
        const observation = await memory.createObservation(args as any);
        return { content: [{ type: 'text', text: `관찰 추가 완료: ${JSON.stringify(observation, null, 2)}` }] };

      case 'get_observations':
        const observations = await memory.getObservations(args as any);
        return { content: [{ type: 'text', text: `관찰 목록:\n${JSON.stringify(observations, null, 2)}` }] };

      case 'create_relation':
        const relation = await memory.createRelation(args as any);
        return { content: [{ type: 'text', text: `관계 생성 완료: ${JSON.stringify(relation, null, 2)}` }] };

      case 'get_relations':
        const relations = await memory.getRelations(args as any);
        return { content: [{ type: 'text', text: `관계 목록:\n${JSON.stringify(relations, null, 2)}` }] };

      case 'get_entity_summary':
        const summary = await memory.getEntitySummary((args as any).entityId);
        return { content: [{ type: 'text', text: summary }] };

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
