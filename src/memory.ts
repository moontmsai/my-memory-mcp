import { DatabaseManager } from './database.js';
import { Entity, Observation, Relation, RelationWithDetails, ObservationWithDetails, EntityWithDetails } from './types.js';

// 간단한 매니저들 - 하나씩만!
export class MemorySystem {
  private db = DatabaseManager.getInstance();

  // 엔티티 관리
  async createEntity(data: { type: string; name: string; importanceScore?: number }): Promise<Entity> {
    const id = `e_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    const importanceScore = data.importanceScore ?? 50;
    await this.db.run(
      'INSERT INTO entities (id, type, name, importanceScore) VALUES (?, ?, ?, ?)',
      [id, data.type, data.name, importanceScore]
    );
    return { id, ...data, importanceScore };
  }

  async getEntities(filter: { type?: string; minImportance?: number; includeDetails?: boolean } = {}): Promise<EntityWithDetails[]> {
    const { type, minImportance, includeDetails = false } = filter;
    const fields = includeDetails ? '*' : 'id, name, type, importanceScore';
    let sql = `SELECT ${fields} FROM entities`;
    const params: any[] = [];
    
    if (type || minImportance !== undefined) {
      sql += ' WHERE ';
      const conditions = [];
      if (type) { conditions.push('type = ?'); params.push(type); }
      if (minImportance !== undefined) { conditions.push('importanceScore >= ?'); params.push(minImportance); }
      sql += conditions.join(' AND ');
    }
    
    const entities = await this.db.all(sql + ' ORDER BY importanceScore DESC', params);
    
    if (includeDetails) {
      // 각 엔티티의 상위 10개 관찰 조회
      const entitiesWithDetails = await Promise.all(
        entities.map(async (entity) => {
          const observations = await this.db.all(
            'SELECT id, type, value, importanceScore FROM observations WHERE entityId = ? ORDER BY importanceScore DESC LIMIT 10',
            [entity.id]
          );
          
          return {
            ...entity,
            observations
          } as EntityWithDetails;
        })
      );
      
      return entitiesWithDetails;
    }
    
    return entities.map(entity => ({ ...entity })) as EntityWithDetails[];
  }

  // 관찰 관리
  async createObservation(data: {
    entityId: string;
    type: string;
    value: string;
    notes?: string;
    importanceScore?: number;
    timestamp?: number;
  }): Promise<Observation> {
    const id = `o_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    const timestamp = data.timestamp ?? Math.floor(Date.now() / 1000);
    const importanceScore = data.importanceScore ?? 50;
    const notes = data.notes ?? '';
    
    await this.db.run(
      'INSERT INTO observations (id, entityId, type, value, notes, importanceScore, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, data.entityId, data.type, data.value, notes, importanceScore, timestamp]
    );

    return { id, entityId: data.entityId, type: data.type, value: data.value, notes, importanceScore, timestamp };
  }

  async getObservations(filter: { entityId?: string; minImportance?: number; includeDetails?: boolean } = {}): Promise<ObservationWithDetails[]> {
    const { entityId, minImportance, includeDetails = false } = filter;
    
    let sql: string;
    const params: any[] = [];
    
    if (includeDetails) {
      sql = `
        SELECT o.*, e.name as entity_name, e.type as entity_type
        FROM observations o
        LEFT JOIN entities e ON o.entityId = e.id
      `;
    } else {
      sql = 'SELECT id, entityId, type, value, importanceScore FROM observations';
    }
    
    if (entityId || minImportance !== undefined) {
      sql += ' WHERE ';
      const conditions = [];
      if (entityId) { 
        conditions.push(includeDetails ? 'o.entityId = ?' : 'entityId = ?'); 
        params.push(entityId); 
      }
      if (minImportance !== undefined) { 
        conditions.push(includeDetails ? 'o.importanceScore >= ?' : 'importanceScore >= ?'); 
        params.push(minImportance); 
      }
      sql += conditions.join(' AND ');
    }
    
    sql += includeDetails ? ' ORDER BY o.importanceScore DESC, o.timestamp DESC' : ' ORDER BY importanceScore DESC, timestamp DESC';
    const rows = await this.db.all(sql, params);
    
    return rows.map(row => {
      const observation: ObservationWithDetails = {
        id: row.id,
        entityId: row.entityId,
        type: row.type,
        value: row.value,
        notes: includeDetails ? row.notes : '',
        importanceScore: row.importanceScore,
        timestamp: includeDetails ? row.timestamp : 0
      };
      
      if (includeDetails && row.entity_name) {
        observation.entity = {
          name: row.entity_name,
          type: row.entity_type
        };
      }
      
      return observation;
    });
  }

  // 관계 관리
  async createRelation(data: {
    sourceEntityId: string;
    targetEntityId: string;
    type: string;
    importanceScore?: number;
    properties?: Record<string, any>;
  }): Promise<Relation> {
    const id = `r_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    const properties = data.properties || {};
    const importanceScore = data.importanceScore ?? 50;
    
    await this.db.run(
      'INSERT INTO relations (id, sourceEntityId, targetEntityId, type, importanceScore, properties) VALUES (?, ?, ?, ?, ?, ?)',
      [id, data.sourceEntityId, data.targetEntityId, data.type, importanceScore, JSON.stringify(properties)]
    );
    
    return { id, ...data, importanceScore, properties };
  }

  async getRelations(filter: { sourceEntityId?: string; minImportance?: number; includeDetails?: boolean } = {}): Promise<RelationWithDetails[]> {
    const { sourceEntityId, minImportance, includeDetails = false } = filter;
    
    let sql: string;
    const params: any[] = [];
    
    if (includeDetails) {
      sql = `
        SELECT r.*, 
               se.name as source_name, se.type as source_type,
               te.name as target_name, te.type as target_type
        FROM relations r
        LEFT JOIN entities se ON r.sourceEntityId = se.id
        LEFT JOIN entities te ON r.targetEntityId = te.id
      `;
    } else {
      sql = 'SELECT id, sourceEntityId, targetEntityId, type, importanceScore FROM relations';
    }
    
    if (sourceEntityId || minImportance !== undefined) {
      sql += includeDetails ? ' WHERE ' : ' WHERE ';
      const conditions = [];
      if (sourceEntityId) { 
        conditions.push(includeDetails ? 'r.sourceEntityId = ?' : 'sourceEntityId = ?'); 
        params.push(sourceEntityId); 
      }
      if (minImportance !== undefined) { 
        conditions.push(includeDetails ? 'r.importanceScore >= ?' : 'importanceScore >= ?'); 
        params.push(minImportance); 
      }
      sql += conditions.join(' AND ');
    }
    
    sql += includeDetails ? ' ORDER BY r.importanceScore DESC' : ' ORDER BY importanceScore DESC';
    const rows = await this.db.all(sql, params);
    
    return rows.map(row => {
      const relation: RelationWithDetails = {
        id: row.id,
        sourceEntityId: row.sourceEntityId,
        targetEntityId: row.targetEntityId,
        type: row.type,
        importanceScore: row.importanceScore,
        properties: includeDetails ? JSON.parse(row.properties || '{}') : {}
      };
      
      if (includeDetails) {
        relation.sourceEntity = {
          name: row.source_name,
          type: row.source_type
        };
        relation.targetEntity = {
          name: row.target_name,
          type: row.target_type
        };
      }
      
      return relation;
    });
  }

  // AI 요약 (간단한 버전)
  async getEntitySummary(entityId: string): Promise<string> {
    const [entity, observations] = await Promise.all([
      this.db.get('SELECT * FROM entities WHERE id = ?', [entityId]),
      this.db.all('SELECT * FROM observations WHERE entityId = ? ORDER BY importanceScore DESC LIMIT 5', [entityId])
    ]);
    
    if (!entity) return '엔티티를 찾을 수 없습니다.';

    const parts = [
      `【${entity.name} 정보 요약】`,
      '',
      `유형: ${entity.type}`,
      `생성일: ${entity.created_at}`,
      ''
    ];
    
    if (observations.length) {
      parts.push('【주요 정보 요약】');
      observations.forEach((obs, i) => {
        parts.push(`${i + 1}. [${obs.type}] ${obs.value}`);
        if (obs.notes) parts.push(`   ${obs.notes}`);
      });
    }
    
    return parts.join('\n');
  }

  // 통합 중요도 검색
  async searchByImportance(minScore: number, type?: 'entity' | 'relation' | 'observation', includeDetails = false) {
    if (!type) {
      const [entities, relations, observations] = await Promise.all([
        this.getEntities({ minImportance: minScore, includeDetails }),
        this.getRelations({ minImportance: minScore, includeDetails }),
        this.getObservations({ minImportance: minScore, includeDetails })
      ]);
      return { entities, relations, observations };
    }
    
    switch (type) {
      case 'entity': return this.getEntities({ minImportance: minScore, includeDetails });
      case 'relation': return this.getRelations({ minImportance: minScore, includeDetails });
      case 'observation': return this.getObservations({ minImportance: minScore, includeDetails });
    }
  }

  private async searchObservationsByImportance(minScore: number): Promise<Observation[]> {
    return this.db.all(
      'SELECT * FROM observations WHERE importanceScore >= ? ORDER BY importanceScore DESC',
      [minScore]
    );
  }

  // 통합 수정 시스템
  async update(options: {
    type: 'entity' | 'relation' | 'observation';
    id: string;
    data: Partial<Entity> | Partial<Relation> | Partial<Observation>;
  }) {
    const { type, id, data } = options;
    
    switch (type) {
      case 'entity':
        return this.updateEntity(id, data as Partial<Entity>);
      case 'relation':
        return this.updateRelation(id, data as Partial<Relation>);
      case 'observation':
        return this.updateObservation(id, data as Partial<Observation>);
      default:
        throw new Error('Invalid update type');
    }
  }

  private async updateEntity(id: string, data: Partial<Entity>) {
    const fields: string[] = [];
    const params: any[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); params.push(data.name); }
    if (data.type !== undefined) { fields.push('type = ?'); params.push(data.type); }
    if (data.importanceScore !== undefined) { fields.push('importanceScore = ?'); params.push(data.importanceScore); }

    if (fields.length === 0) throw new Error('수정할 필드가 없습니다');

    const sql = `UPDATE entities SET ${fields.join(', ')} WHERE id = ?`;
    params.push(id);

    const result = await this.db.run(sql, params);
    if (result.changes === 0) throw new Error('엔티티를 찾을 수 없습니다');

    return this.db.get('SELECT * FROM entities WHERE id = ?', [id]);
  }

  private async updateRelation(id: string, data: Partial<Relation>) {
    const fields: string[] = [];
    const params: any[] = [];

    if (data.type !== undefined) { fields.push('type = ?'); params.push(data.type); }
    if (data.importanceScore !== undefined) { fields.push('importanceScore = ?'); params.push(data.importanceScore); }
    if (data.properties !== undefined) { fields.push('properties = ?'); params.push(JSON.stringify(data.properties)); }

    if (fields.length === 0) throw new Error('수정할 필드가 없습니다');

    const sql = `UPDATE relations SET ${fields.join(', ')} WHERE id = ?`;
    params.push(id);

    const result = await this.db.run(sql, params);
    if (result.changes === 0) throw new Error('관계를 찾을 수 없습니다');

    const row = await this.db.get('SELECT * FROM relations WHERE id = ?', [id]);
    return { ...row, properties: JSON.parse(row.properties || '{}') };
  }

  private async updateObservation(id: string, data: Partial<Observation>) {
    const fields: string[] = [];
    const params: any[] = [];

    if (data.type !== undefined) { fields.push('type = ?'); params.push(data.type); }
    if (data.value !== undefined) { fields.push('value = ?'); params.push(data.value); }
    if (data.notes !== undefined) { fields.push('notes = ?'); params.push(data.notes); }
    if (data.importanceScore !== undefined) { fields.push('importanceScore = ?'); params.push(data.importanceScore); }

    if (fields.length === 0) throw new Error('수정할 필드가 없습니다');

    const sql = `UPDATE observations SET ${fields.join(', ')} WHERE id = ?`;
    params.push(id);

    const result = await this.db.run(sql, params);
    if (result.changes === 0) throw new Error('관찰을 찾을 수 없습니다');

    return this.db.get('SELECT * FROM observations WHERE id = ?', [id]);
  }

  // 통합 삭제 시스템
  async delete(options: {
    type: 'entity' | 'relation' | 'observation';
    id?: string;
    entityId?: string;
    cascade?: boolean;
    minImportance?: number;
    maxImportance?: number;
  }) {
    const { type, id, entityId, cascade = false, minImportance, maxImportance } = options;
    
    switch (type) {
      case 'entity':
        return this.deleteEntity(id, entityId, cascade, minImportance, maxImportance);
      case 'relation':
        return this.deleteRelation(id, entityId, cascade, minImportance, maxImportance);
      case 'observation':
        return this.deleteObservation(id, entityId, minImportance, maxImportance);
      default:
        throw new Error('Invalid delete type');
    }
  }

  private async deleteEntity(id?: string, entityId?: string, cascade = false, minImportance?: number, maxImportance?: number) {
    let targetIds: string[] = [];

    if (id) {
      targetIds = [id];
    } else if (entityId) {
      targetIds = [entityId];
    } else {
      // 중요도 기반 필터링으로 엔티티 선택
      const entities = await this.getEntitiesForDeletion(minImportance, maxImportance);
      targetIds = entities.map(e => e.id);
    }

    const results = { entities: 0, relations: 0, observations: 0 };

    for (const targetId of targetIds) {
      // 엔티티 삭제
      const entityResult = await this.db.run('DELETE FROM entities WHERE id = ?', [targetId]);
      results.entities += entityResult.changes || 0;

      if (cascade) {
        // 관련 관찰 삭제
        const obsResult = await this.db.run('DELETE FROM observations WHERE entityId = ?', [targetId]);
        results.observations += obsResult.changes || 0;

        // 관련 관계 삭제
        const relResult = await this.db.run(
          'DELETE FROM relations WHERE sourceEntityId = ? OR targetEntityId = ?',
          [targetId, targetId]
        );
        results.relations += relResult.changes || 0;
      }
    }

    return results;
  }

  private async deleteRelation(id?: string, entityId?: string, cascade = false, minImportance?: number, maxImportance?: number) {
    let sql = 'DELETE FROM relations WHERE ';
    const params: any[] = [];
    const conditions: string[] = [];

    if (id) {
      conditions.push('id = ?');
      params.push(id);
    } else {
      if (entityId) {
        conditions.push('(sourceEntityId = ? OR targetEntityId = ?)');
        params.push(entityId, entityId);
      }
      
      if (minImportance !== undefined) {
        conditions.push('importanceScore >= ?');
        params.push(minImportance);
      }
      
      if (maxImportance !== undefined) {
        conditions.push('importanceScore <= ?');
        params.push(maxImportance);
      }
    }

    if (conditions.length === 0) {
      throw new Error('삭제 조건이 필요합니다');
    }

    sql += conditions.join(' AND ');
    
    const results = { relations: 0, entities: 0 };

    if (cascade && entityId) {
      // 관계에 연결된 엔티티도 삭제
      const relatedEntities = await this.db.all(
        'SELECT DISTINCT sourceEntityId as id FROM relations WHERE targetEntityId = ? UNION SELECT DISTINCT targetEntityId as id FROM relations WHERE sourceEntityId = ?',
        [entityId, entityId]
      );
      
      for (const entity of relatedEntities) {
        const entityResult = await this.db.run('DELETE FROM entities WHERE id = ?', [entity.id]);
        results.entities += entityResult.changes || 0;
      }
    }

    const relResult = await this.db.run(sql, params);
    results.relations = relResult.changes || 0;

    return results;
  }

  private async deleteObservation(id?: string, entityId?: string, minImportance?: number, maxImportance?: number) {
    let sql = 'DELETE FROM observations WHERE ';
    const params: any[] = [];
    const conditions: string[] = [];

    if (id) {
      conditions.push('id = ?');
      params.push(id);
    } else {
      if (entityId) {
        conditions.push('entityId = ?');
        params.push(entityId);
      }
      
      if (minImportance !== undefined) {
        conditions.push('importanceScore >= ?');
        params.push(minImportance);
      }
      
      if (maxImportance !== undefined) {
        conditions.push('importanceScore <= ?');
        params.push(maxImportance);
      }
    }

    if (conditions.length === 0) {
      throw new Error('삭제 조건이 필요합니다');
    }

    sql += conditions.join(' AND ');
    const result = await this.db.run(sql, params);
    
    return { observations: result.changes || 0 };
  }

  private async getEntitiesForDeletion(minImportance?: number, maxImportance?: number): Promise<Entity[]> {
    let sql = 'SELECT * FROM entities WHERE 1=1';
    const params: any[] = [];

    if (minImportance !== undefined) {
      sql += ' AND importanceScore >= ?';
      params.push(minImportance);
    }
    
    if (maxImportance !== undefined) {
      sql += ' AND importanceScore <= ?';
      params.push(maxImportance);
    }

    return this.db.all(sql, params);
  }
}
