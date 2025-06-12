// 단순한 타입 정의 - 핵심만!
export interface Entity {
  id: string;
  type: string;
  name: string;
  created_at?: string;
}

export interface Observation {
  id: string;
  entityId: string;
  type: string;
  value: string;
  notes: string;
  importanceScore: number;
  timestamp: number;
}

export interface Relation {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  type: string;
  properties: Record<string, any>;
}
