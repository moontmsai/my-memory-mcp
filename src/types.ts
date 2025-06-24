// 단순한 타입 정의 - 핵심만!
export interface Entity {
  id: string;
  type: string;
  name: string;
  importanceScore: number;
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
  importanceScore: number;
  properties: Record<string, any>;
}

export interface RelationWithDetails extends Relation {
  sourceEntity?: {
    name: string;
    type: string;
  };
  targetEntity?: {
    name: string;
    type: string;
  };
}

export interface ObservationWithDetails extends Observation {
  entity?: {
    name: string;
    type: string;
  };
}

export interface EntityWithDetails extends Entity {
  observations?: Array<{
    id: string;
    type: string;
    value: string;
    importanceScore: number;
  }>;
}
