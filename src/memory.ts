import { DatabaseManager } from './database.js';
import { Entity, Observation, Relation } from './types.js';

// 간단한 매니저들 - 하나씩만!
export class MemorySystem {
  private db = DatabaseManager.getInstance();

  // 엔티티 관리
  async createEntity(data: { type: string; name: string }): Promise<Entity> {
    const id = `entity_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    await this.db.run(
      'INSERT INTO entities (id, type, name) VALUES (?, ?, ?)',
      [id, data.type, data.name]
    );
    return { id, ...data };
  }

  async getEntities(filter: { type?: string } = {}): Promise<Entity[]> {
    let sql = 'SELECT * FROM entities';
    const params: any[] = [];
    
    if (filter.type) {
      sql += ' WHERE type = ?';
      params.push(filter.type);
    }
    
    return await this.db.all(sql, params);
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
    const id = `obs_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const timestamp = data.timestamp ?? Math.floor(Date.now() / 1000);
    const importanceScore = data.importanceScore ?? 50;
    const notes = data.notes ?? '';
    
    await this.db.run(
      'INSERT INTO observations (id, entityId, type, value, notes, importanceScore, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, data.entityId, data.type, data.value, notes, importanceScore, timestamp]
    );

    return { id, ...data, notes, importanceScore, timestamp };
  }

  async getObservations(filter: { entityId?: string } = {}): Promise<Observation[]> {
    let sql = 'SELECT * FROM observations';
    const params: any[] = [];
    
    if (filter.entityId) {
      sql += ' WHERE entityId = ?';
      params.push(filter.entityId);
    }
    
    sql += ' ORDER BY importanceScore DESC, timestamp DESC';
    return await this.db.all(sql, params);
  }

  // 관계 관리
  async createRelation(data: {
    sourceEntityId: string;
    targetEntityId: string;
    type: string;
    properties?: Record<string, any>;
  }): Promise<Relation> {
    const id = `rel_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const properties = data.properties || {};
    
    await this.db.run(
      'INSERT INTO relations (id, sourceEntityId, targetEntityId, type, properties) VALUES (?, ?, ?, ?, ?)',
      [id, data.sourceEntityId, data.targetEntityId, data.type, JSON.stringify(properties)]
    );
    
    return { id, ...data, properties };
  }

  async getRelations(filter: { sourceEntityId?: string } = {}): Promise<Relation[]> {
    let sql = 'SELECT * FROM relations';
    const params: any[] = [];
    
    if (filter.sourceEntityId) {
      sql += ' WHERE sourceEntityId = ?';
      params.push(filter.sourceEntityId);
    }
    
    const rows = await this.db.all(sql, params);
    return rows.map(row => ({
      ...row,
      properties: JSON.parse(row.properties || '{}')
    }));
  }

  // AI 요약 (간단한 버전)
  async getEntitySummary(entityId: string): Promise<string> {
    const entity = await this.db.get('SELECT * FROM entities WHERE id = ?', [entityId]);
    if (!entity) return '엔티티를 찾을 수 없습니다.';

    const observations = await this.db.all(
      'SELECT * FROM observations WHERE entityId = ? ORDER BY importanceScore DESC LIMIT 5',
      [entityId]
    );

    let summary = `【${entity.name} 정보 요약】\n\n`;
    summary += `유형: ${entity.type}\n`;
    summary += `생성일: ${entity.created_at}\n\n`;
    
    if (observations.length > 0) {
      summary += '【주요 정보 요약】\n';
      observations.forEach((obs, i) => {
        summary += `${i + 1}. [${obs.type}] ${obs.value}\n`;
        if (obs.notes) summary += `   ${obs.notes}\n`;
      });
    }
    
    return summary;
  }
}
