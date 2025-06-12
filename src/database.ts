import Database from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

// 단순한 DB 관리자 - 복잡한 패턴 없이!
export class DatabaseManager {
  private static instance: DatabaseManager;
  private db: Database.Database;

  private constructor() {
    // 환경변수 우선, 없으면 기본 상대경로
    const dbPath = process.env.DATABASE_PATH || (() => {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      return path.resolve(__dirname, '../data/my-memory.sqlite');
    })();
    
    console.error('DB 경로:', dbPath);
    this.db = new Database.Database(dbPath);
    
    // WAL 모드 설정 - 커서 AI 호환성을 위해
    this.db.run("PRAGMA journal_mode=WAL;");
    this.db.run("PRAGMA busy_timeout=5000;");
    
    this.initTables();
  }

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  private initTables() {
    this.db.serialize(() => {
      // 엔티티 테이블
      this.db.run(`
        CREATE TABLE IF NOT EXISTS entities (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          name TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 관찰 테이블  
      this.db.run(`
        CREATE TABLE IF NOT EXISTS observations (
          id TEXT PRIMARY KEY,
          entityId TEXT NOT NULL,
          type TEXT NOT NULL,
          value TEXT NOT NULL,
          notes TEXT,
          importanceScore INTEGER DEFAULT 50,
          timestamp INTEGER DEFAULT 0,
          FOREIGN KEY (entityId) REFERENCES entities (id)
        )
      `);

      // 관계 테이블
      this.db.run(`
        CREATE TABLE IF NOT EXISTS relations (
          id TEXT PRIMARY KEY,
          sourceEntityId TEXT NOT NULL,
          targetEntityId TEXT NOT NULL,
          type TEXT NOT NULL,
          properties TEXT DEFAULT '{}',
          FOREIGN KEY (sourceEntityId) REFERENCES entities (id),
          FOREIGN KEY (targetEntityId) REFERENCES entities (id)
        )
      `);
    });
  }

  // 간단한 쿼리 헬퍼들
  async run(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  async get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async all(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  close() {
    this.db.close();
  }
}