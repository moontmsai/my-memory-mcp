# Personal Memory MCP Server

Tired of AI conversations that restart from scratch every time? This system enables AI to truly remember and understand you. Your personality, preferences, relationships, and important experiences are naturally remembered by AI, allowing for deep and personal communication like a longtime friend or partner in every conversation. Go beyond simple Q&A and create a genuine AI experience based on real relationships and understanding.

## Features

- Entity-based data organization (Person, Company, Project, etc.)
- Observation tracking with importance scoring
- Relationship mapping between entities
- Search and summary capabilities
- TypeScript implementation with SQLite database

## Installation

### 1. Install the MCP Server

```bash
# Clone repository
git clone https://github.com/moontmsai/my-memory-mcp.git
cd my-memory-mcp

# Install dependencies
npm install

# Build
npm run build

# Start server
npm start
```

### 2. Configure Claude Desktop

Add this configuration to your Claude Desktop config file:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "my-memory": {
      "command": "node",
      "args": ["path/to/my-memory-mcp/dist/index.js"],
      "env": {
        "DATABASE_PATH": "path/to/my-memory-mcp/data/my-memory.sqlite"
      }
    }
  }
}
```

### 3. Configure Cursor AI

Add this to your Cursor AI settings:

1. Open Cursor AI Settings
2. Go to "Tools & Intergrations" → "MCP Tools"
3. Add new MCP server:

```json
{
  "mcpServers": {
    "my-memory": {
      "command": "node",
      "args": ["path/to/my-memory-mcp/dist/index.js"],
      "env": {
        "DATABASE_PATH": "path/to/my-memory-mcp/data/my-memory.sqlite"
      }
    }
  }
}
```

**Note:** Replace `path/to/my-memory-mcp` with the actual path to your installation directory.

## Development

```bash
# Development mode with auto-restart
npm run dev

# Type checking
npm run type-check

# Clean build
npm run clean
```

## API Tools

### my-memory:create
Create entities, observations, or relations.

**Parameters:**
- `type`: "entity" | "observation" | "relation"
- `entityType`: Entity type (for entities)
- `name`: Entity name (for entities)
- `entityId`: Target entity ID (for observations)
- `value`: Observation content (for observations)
- `sourceEntityId`: Source entity ID (for relations)
- `targetEntityId`: Target entity ID (for relations)
- `importanceScore`: Importance score (0-100)
- `notes`: Additional notes
- `properties`: Relation properties (JSON object)

### my-memory:get
Retrieve entities, observations, or relations.

**Parameters:**
- `type`: "entity" | "observation" | "relation"
- `entityType`: Filter by entity type
- `entityId`: Filter by specific entity
- `sourceEntityId`: Filter by source entity (relations)
- `minImportance`: Minimum importance score
- `includeDetails`: Include detailed information

### my-memory:search
Search and summarize memory data.

**Parameters:**
- `mode`: "summary" | "importance"
- `entityId`: Entity to summarize (summary mode)
- `minScore`: Minimum importance score (importance mode)
- `type`: Filter by data type
- `includeDetails`: Include detailed information

### my-memory:update
Update existing entities, observations, or relations.

**Parameters:**
- `type`: "entity" | "observation" | "relation"
- `id`: ID of item to update
- `data`: Updated data fields

### my-memory:delete
Delete entities, observations, or relations.

**Parameters:**
- `type`: "entity" | "observation" | "relation"
- `id`: ID of item to delete
- `entityId`: Delete all items for specific entity
- `cascade`: Delete related data
- `minImportance`: Minimum importance for deletion
- `maxImportance`: Maximum importance for deletion

## Data Structure

### Entity
- Represents people, companies, projects, concepts, etc.
- Has type, name, and importance score
- Can have multiple observations and relations

### Observation
- Specific information about an entity
- Includes type, value, importance score, and notes
- Timestamped for tracking changes

### Relation
- Connection between two entities
- Has type and optional properties
- Supports complex relationship modeling

## Usage Examples

```typescript
// Create a person entity
my-memory:create({
  type: "entity",
  entityType: "Person", 
  name: "John Doe",
  importanceScore: 80
})

// Add observation about the person
my-memory:create({
  type: "observation",
  entityId: "entity_id",
  value: "Prefers direct communication",
  importanceScore: 85,
  notes: "Important for work interactions"
})

// Create relationship
my-memory:create({
  type: "relation",
  sourceEntityId: "person_id",
  targetEntityId: "company_id", 
  properties: { role: "developer", startDate: "2025-01-01" }
})

// Search by importance
my-memory:search({
  mode: "importance",
  minScore: 80,
  includeDetails: true
})

// Get entity summary
my-memory:search({
  mode: "summary",
  entityId: "entity_id"
})
```

## Recommended User Preferences

For optimal use with AI assistants, add this configuration to your user preferences:

```
0. Session initialization (execute only once at session start):
   - Query relationships with importance score 80+ using includeDetails=true from my-memory MCP
   - Additionally query observations with importance score 80+ for relevant entities
   - Do not brief the retrieved personal memories

1. Continuous operation during conversations:
   - Record new personal information in my-memory MCP when discovered
   - Judge importance score (0-100 points) for all responses
   - Base judgments only on existing memories without repeated queries

2. Personal information collection (personal information only):
   - Basic identity (age, gender, location, occupation, education, health status, etc.)
   - Behavioral patterns (interests, habits, hobbies, personality traits, etc.)
   - Preferences (communication style, preferred language, style, values, etc.)
   - Long-term goals (life goals, long-term plans, personal aspirations, etc.)
   - Relationships (family, friends, romantic partners, colleagues, etc.)

3. my-memory MCP memory updates:
   - Entity creation (with importance scores): Important people, organizations, places, concepts
   - Relationship connections: Establish relations with existing entities
   - Observation storage: Record personal characteristics and facts as observations

4. What NOT to record in my-memory MCP:
   - Specific work details (coding specifics, particular task progress, etc.)
   - Temporary work memory (today's tasks, temporary notes, etc.)
   - Technical details (configuration values, code snippets, error messages, etc.)

5. Additional operational principles for my-memory MCP:
   - Set importance scores based on personal significance and long-term relevance
   - Record relationship information with high importance
   - Carefully record personal tendencies and values
   - Record work-related information only at company name, position, colleague name level
```

## License

MIT License



## ☕ Support My Work

If you find this project helpful or interesting, consider [buying me a coffee](https://coff.ee/moontmsai)!  
Your support helps me maintain and improve this open source work.

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-%E2%98%95-blue?style=flat&logo=buy-me-a-coffee&logoColor=white)](https://coff.ee/moontmsai)


---

# 개인 기억 MCP 서버

AI와의 대화가 매번 처음부터 다시 시작되는 것이 아쉬우셨나요? 이 시스템은 AI가 당신을 진짜로 기억하고 이해할 수 있게 해줍니다. 당신의 성격, 취향, 인간관계, 중요한 경험들을 AI가 자연스럽게 기억하며, 대화할 때마다 마치 오랜 친구나 연인처럼 깊이 있고 개인적인 소통이 가능해집니다. 단순한 질답을 넘어서, 진정한 관계와 이해를 바탕으로 한 AI 경험을 만들어보세요.

## 주요 기능

- 엔티티 기반 데이터 구조 (사람, 회사, 프로젝트 등)
- 중요도 점수를 통한 관찰 추적
- 엔티티 간 관계 매핑
- 검색 및 요약 기능
- TypeScript 구현 및 SQLite 데이터베이스

## 설치

### 1. MCP 서버 설치

```bash
# 저장소 복제
git clone https://github.com/moontmsai/my-memory-mcp.git
cd my-memory-mcp

# 의존성 설치
npm install

# 빌드
npm run build

# 서버 시작
npm start
```

### 2. Claude Desktop 설정

Claude Desktop 설정 파일에 다음 구성을 추가하세요:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "my-memory": {
      "command": "node",
      "args": ["path/to/my-memory-mcp/dist/index.js"],
      "env": {
        "DATABASE_PATH": "path/to/my-memory-mcp/data/my-memory.sqlite"
      }
    }
  }
}
```

### 3. Cursor AI 설정

Cursor AI 설정에 다음을 추가하세요:

1. Cursor AI 설정 열기
2. Go to "Tools & Intergrations" → "MCP Tools"
3. Add new MCP server:

```json
{
  "mcpServers": {
    "my-memory": {
      "command": "node",
      "args": ["path/to/my-memory-mcp/dist/index.js"],
      "env": {
        "DATABASE_PATH": "path/to/my-memory-mcp/data/my-memory.sqlite"
      }
    }
  }
}
```

**참고:** `path/to/my-memory-mcp`를 실제 설치 디렉토리 경로로 변경하세요.

## 개발

```bash
# 개발 모드 (자동 재시작)
npm run dev

# 타입 체크
npm run type-check

# 빌드 정리
npm run clean
```

## API 도구

### my-memory:create
엔티티, 관찰, 관계를 생성합니다.

**매개변수:**
- `type`: "entity" | "observation" | "relation"
- `entityType`: 엔티티 유형 (엔티티용)
- `name`: 엔티티 이름 (엔티티용)
- `entityId`: 대상 엔티티 ID (관찰용)
- `value`: 관찰 내용 (관찰용)
- `sourceEntityId`: 소스 엔티티 ID (관계용)
- `targetEntityId`: 타겟 엔티티 ID (관계용)
- `importanceScore`: 중요도 점수 (0-100)
- `notes`: 추가 메모
- `properties`: 관계 속성 (JSON 객체)

### my-memory:get
엔티티, 관찰, 관계를 조회합니다.

**매개변수:**
- `type`: "entity" | "observation" | "relation"
- `entityType`: 엔티티 유형별 필터
- `entityId`: 특정 엔티티별 필터
- `sourceEntityId`: 소스 엔티티별 필터 (관계용)
- `minImportance`: 최소 중요도 점수
- `includeDetails`: 상세 정보 포함

### my-memory:search
메모리 데이터를 검색하고 요약합니다.

**매개변수:**
- `mode`: "summary" | "importance"
- `entityId`: 요약할 엔티티 (요약 모드)
- `minScore`: 최소 중요도 점수 (중요도 모드)
- `type`: 데이터 유형별 필터
- `includeDetails`: 상세 정보 포함

### my-memory:update
기존 엔티티, 관찰, 관계를 수정합니다.

**매개변수:**
- `type`: "entity" | "observation" | "relation"
- `id`: 수정할 항목 ID
- `data`: 수정할 데이터 필드

### my-memory:delete
엔티티, 관찰, 관계를 삭제합니다.

**매개변수:**
- `type`: "entity" | "observation" | "relation"
- `id`: 삭제할 항목 ID
- `entityId`: 특정 엔티티의 모든 항목 삭제
- `cascade`: 관련 데이터 함께 삭제
- `minImportance`: 삭제할 최소 중요도
- `maxImportance`: 삭제할 최대 중요도

## 데이터 구조

### 엔티티
- 사람, 회사, 프로젝트, 개념 등을 나타냄
- 유형, 이름, 중요도 점수를 가짐
- 여러 관찰과 관계를 가질 수 있음

### 관찰
- 엔티티에 대한 구체적 정보
- 유형, 내용, 중요도 점수, 메모 포함
- 변경 추적을 위한 타임스탬프

### 관계
- 두 엔티티 간의 연결
- 유형과 선택적 속성을 가짐
- 복잡한 관계 모델링 지원

## 사용 예시

```typescript
// 사람 엔티티 생성
my-memory:create({
  type: "entity",
  entityType: "Person", 
  name: "홍길동",
  importanceScore: 80
})

// 사람에 대한 관찰 추가
my-memory:create({
  type: "observation",
  entityId: "entity_id",
  value: "직설적인 소통을 선호함",
  importanceScore: 85,
  notes: "업무 상호작용에 중요"
})

// 관계 생성
my-memory:create({
  type: "relation",
  sourceEntityId: "person_id",
  targetEntityId: "company_id", 
  properties: { role: "개발자", startDate: "2025-01-01" }
})

// 중요도별 검색
my-memory:search({
  mode: "importance",
  minScore: 80,
  includeDetails: true
})

// 엔티티 요약
my-memory:search({
  mode: "summary",
  entityId: "entity_id"
})
```

## 권장 사용자 설정

AI 어시스턴트와 최적으로 사용하려면 사용자 설정에 다음 구성을 추가하세요:

```
0. 세션 초기화 (세션 시작 시 1회만 실행):
   - my-memory MCP에서 중요도 80점 이상의 관계를 includeDetails=true로 조회
   - 추가로 해당 엔티티의 중요도 80점 이상의 관찰도 함께 조회
   - 조회한 개인적인 기억은 브리핑하지 않음

1. 대화 중 지속적 운영:
   - 새로운 개인 정보 발견 시 my-memory MCP에 기록
   - 모든 응답에 대해 중요도 점수(0-100점) 판단
   - 기존 기억만을 기반으로 판단하고 반복 조회하지 않음

2. 개인 정보 수집 (개인적 정보만):
   - 기본 정체성 (나이, 성별, 위치, 직업, 학력, 건강상태 등)
   - 행동 패턴 (관심사, 습관, 취미, 성격 특성 등)
   - 선호도 (소통 방식, 선호 언어, 스타일, 가치관 등)
   - 장기적 목표 (인생 목표, 장기 계획, 개인적 열망 등)
   - 관계 (가족, 친구, 연인, 회사 동료 등)

3. my-memory MCP 기억 업데이트:
   - 엔티티 생성 (중요도 점수 부여): 중요한 사람, 조직, 장소, 개념
   - 관계 연결: 기존 엔티티들과 관계 설정
   - 관찰 저장: 개인적 특성과 사실들을 관찰로 기록

4. my-memory MCP에 기록하지 않는 것들:
   - 구체적인 작업 내용 (코딩 세부사항, 특정 업무 진행상황 등)
   - 일시적인 작업 기억 (오늘 해야 할 일, 임시 메모 등)
   - 기술적 세부사항 (설정값, 코드 조각, 에러 메시지 등)

5. my-memory MCP 추가 운용 원칙:
   - 중요도 점수는 개인적 중요성과 장기적 관련성을 기준으로 설정
   - 사람과의 관계 정보는 높은 중요도로 기록
   - 개인적 성향이나 가치관은 신중하게 기록
   - 작업 관련 정보는 회사명, 직책, 동료 이름 수준만 기록
```

## 라이선스

MIT 라이선스



## ☕ 후원하기

이 프로젝트가 도움이 되셨다면, 커피 한 잔으로 응원해주세요: [https://coff.ee/moontmsai](https://coff.ee/moontmsai)  
여러분의 후원이 지속적인 오픈소스 개발에 큰 힘이 됩니다.

