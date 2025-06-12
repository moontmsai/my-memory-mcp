# 🧠 Personal Memory MCP Server

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=flat&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

> **AI의 개인적 기억과 관찰을 체계적으로 관리하는 MCP(Model Context Protocol) 서버**

Personal Memory MCP Server는 AI 어시스턴트가 사용자와의 상호작용에서 얻은 개인적 정보, 관찰사항, 그리고 엔티티 간의 관계를 효율적으로 저장하고 관리할 수 있도록 설계된 전문적인 메모리 시스템입니다.

## ✨ 주요 특징

### 🎯 **핵심 메모리 관리**
- **엔티티 중심 설계**: 사람, 장소, 개념 등을 체계적으로 분류
- **관찰 기반 학습**: 중요도 점수를 통한 인사이트 우선순위화  
- **관계 네트워크**: 엔티티 간 복잡한 연결고리 추적
- **AI 요약 기능**: 축적된 정보의 지능적 종합

### 🚀 **성능과 안정성**
- **SQLite 기반**: 빠르고 안정적인 인메모리 데이터베이스
- **TypeScript**: 타입 안전성을 통한 견고한 코드 품질
- **MCP 표준 준수**: Model Context Protocol 완전 호환
- **모듈식 아키텍처**: 확장 가능하고 유지보수가 용이한 구조

### 💡 **설계 철학**
- **단순함의 힘**: 복잡성보다 명확성을 우선시
- **사용자 중심**: 실제 필요에 기반한 기능 구현
- **확장성**: 미래 요구사항에 대비한 유연한 구조

## 📦 설치 및 설정

### 사전 요구사항
- Node.js 16.0.0 이상
- npm 또는 yarn
### 빠른 시작

```bash
# 저장소 클론
git clone https://github.com/moontmsai/my-memory-mcp.git
cd my-memory-mcp

# 의존성 설치
npm install

# TypeScript 컴파일
npm run build

# 서버 실행
npm start
```

### 개발 모드

```bash
# 개발 서버 실행 (자동 재시작)
npm run dev

# 타입 체크
npm run type-check

# 빌드 정리
npm run clean
```

## 🔧 API 레퍼런스

### 엔티티 관리

#### `create_entity`
새로운 엔티티를 생성합니다.

```typescript
{
  type: string,    // 엔티티 유형 (Person, Place, Concept 등)
  name: string     // 엔티티 이름
}
```

**예시:**
```typescript
create_entity({ type: "Person", name: "moontmai" })
create_entity({ type: "Place", name: "서울" })
```

#### `get_entities`
등록된 엔티티 목록을 조회합니다.

```typescript
{
  type?: string    // 선택적: 특정 유형으로 필터링
}
```

### 관찰 관리

#### `create_observation`
엔티티에 대한 새로운 관찰을 추가합니다.

```typescript
{
  entityId: string,        // 대상 엔티티 ID
  type: string,           // 관찰 유형
  value: string,          // 관찰 내용
  importanceScore?: number, // 중요도 (0-100, 기본값: 50)
  notes?: string          // 추가 메모
}
```

**예시:**
```typescript
create_observation({
  entityId: "entity_123",
  type: "Preference",
  value: "직설적인 소통 선호",
  importanceScore: 85,
  notes: "업무 상황에서 특히 중요"
})
```

#### `get_observations`
저장된 관찰 목록을 조회합니다.

```typescript
{
  entityId?: string    // 선택적: 특정 엔티티의 관찰만 조회
}
```

### 관계 관리

#### `create_relation`
엔티티 간의 관계를 정의합니다.

```typescript
{
  sourceEntityId: string,  // 출발 엔티티 ID
  targetEntityId: string,  // 대상 엔티티 ID
  type: string,           // 관계 유형
  properties?: object     // 관계 속성 (선택적)
}
```

**예시:**
```typescript
create_relation({
  sourceEntityId: "person_001",
  targetEntityId: "place_001", 
  type: "LivesIn",
  properties: { since: "2020", status: "current" }
})
```

#### `get_relations`
엔티티 관계 목록을 조회합니다.

```typescript
{
  sourceEntityId?: string    // 선택적: 특정 엔티티의 관계만 조회
}
```

### AI 요약

#### `get_entity_summary`
엔티티에 대한 AI 기반 종합 요약을 생성합니다.

```typescript
{
  entityId: string    // 요약할 엔티티 ID
}
```

## 🗄️ 데이터 구조

### 엔티티 (Entity)
```sql
- id: TEXT PRIMARY KEY
- type: TEXT NOT NULL
- name: TEXT NOT NULL  
- created_at: DATETIME
- updated_at: DATETIME
```

### 관찰 (Observation)
```sql
- id: TEXT PRIMARY KEY
- entity_id: TEXT
- type: TEXT NOT NULL
- value: TEXT NOT NULL
- importance_score: INTEGER
- notes: TEXT
- created_at: DATETIME
```

### 관계 (Relation)
```sql
- id: TEXT PRIMARY KEY
- source_entity_id: TEXT
- target_entity_id: TEXT
- type: TEXT NOT NULL
- properties: TEXT (JSON)
- created_at: DATETIME
```

## 💼 사용 사례

### 개인 비서 AI
```typescript
// 사용자 정보 등록
create_entity({ type: "Person", name: "사용자" })

// 선호도 관찰
create_observation({
  entityId: "user_001",
  type: "Communication",
  value: "간결하고 직설적인 답변 선호",
  importanceScore: 90
})

// 관심사 추가
create_observation({
  entityId: "user_001", 
  type: "Interest",
  value: "게임 개발과 AI 기술",
  importanceScore: 80
})
```

### 프로젝트 관리
```typescript
// 프로젝트 엔티티 생성
create_entity({ type: "Project", name: "메모리 MCP 서버" })

// 프로젝트 진행사항 기록
create_observation({
  entityId: "project_001",
  type: "Progress", 
  value: "v1.0.0 릴리즈 완료",
  importanceScore: 95
})

// 팀원과의 관계
create_relation({
  sourceEntityId: "project_001",
  targetEntityId: "person_001",
  type: "ManagedBy"
})
```

## 🏗️ 아키텍처

```
src/
├── index.ts          # MCP 서버 진입점
├── memory.ts         # 메모리 관리 핵심 로직
├── database.ts       # SQLite 데이터베이스 처리
└── types.ts          # TypeScript 타입 정의
```

### 핵심 컴포넌트

- **MemoryManager**: 메모리 작업의 중앙 컨트롤러
- **DatabaseManager**: SQLite 연결 및 스키마 관리  
- **MCP Handlers**: Model Context Protocol 요청 처리
- **Type Definitions**: 강타입 데이터 구조 정의

## 🔮 향후 계획

- [ ] 웹 인터페이스 추가
- [ ] 백업/복원 기능
- [ ] 고급 검색 및 필터링
- [ ] 다중 사용자 지원
- [ ] REST API 엔드포인트
- [ ] 데이터 시각화 도구

## 🤝 기여하기

1. Fork 생성
2. Feature 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 Push (`git push origin feature/amazing-feature`)
5. Pull Request 생성

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙋‍♂️ 지원

문제가 발생하거나 질문이 있으시면 [Issues](https://github.com/moontmsai/my-memory-mcp/issues)에 등록해 주세요.

---

**"복잡함보다 명확함이 우선"** - 개발 철학

Made with ❤️ for intelligent memory management