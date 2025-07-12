import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'data', 'catalog.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize tables
const initTables = () => {
  // Fabrics table
  db.exec(`
    CREATE TABLE IF NOT EXISTS fabrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price_per_meter REAL NOT NULL,
      category TEXT NOT NULL,
      color TEXT,
      material TEXT,
      width INTEGER DEFAULT 150,
      image_url TEXT,
      stock INTEGER DEFAULT 0,
      featured BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Admin users table (simple authentication)
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default admin user (password: admin123)
  const insertAdmin = db.prepare(`
    INSERT OR IGNORE INTO admin_users (username, password_hash) 
    VALUES (?, ?)
  `);
  
  // Simple hash for demo - in production use bcrypt
  const simpleHash = 'admin123_hashed';
  insertAdmin.run('admin', simpleHash);

  // Insert sample data if no fabrics exist
  const count = db.prepare('SELECT COUNT(*) as count FROM fabrics').get() as { count: number };
  
  if (count.count === 0) {
    const insertFabric = db.prepare(`
      INSERT INTO fabrics (name, description, price_per_meter, category, color, material, width, image_url, stock, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const sampleFabrics = [
      [
        'Algodón Premium',
        'Tela de algodón 100% natural, perfecta para ropa casual y cómoda.',
        450,
        'Algodón',
        'Blanco',
        'Algodón 100%',
        150,
        'https://images.pexels.com/photos/6292842/pexels-photo-6292842.jpeg',
        25,
        1
      ],
      [
        'Seda Elegante',
        'Seda natural de alta calidad para ocasiones especiales.',
        1200,
        'Seda',
        'Dorado',
        'Seda Natural',
        140,
        'https://images.pexels.com/photos/6292843/pexels-photo-6292843.jpeg',
        15,
        1
      ],
      [
        'Lino Veraniego',
        'Lino fresco y transpirable, ideal para el clima tropical.',
        650,
        'Lino',
        'Beige',
        'Lino 100%',
        145,
        'https://images.pexels.com/photos/6292844/pexels-photo-6292844.jpeg',
        30,
        0
      ]
    ];

    sampleFabrics.forEach(fabric => {
      insertFabric.run(...fabric);
    });
  }
};

// Initialize database
initTables();

export default db;

// Prepared statements for better performance
export const queries = {
  // Fabrics
  getAllFabrics: db.prepare('SELECT * FROM fabrics ORDER BY featured DESC, created_at DESC'),
  getFabricById: db.prepare('SELECT * FROM fabrics WHERE id = ?'),
  insertFabric: db.prepare(`
    INSERT INTO fabrics (name, description, price_per_meter, category, color, material, width, image_url, stock, featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),
  updateFabric: db.prepare(`
    UPDATE fabrics 
    SET name = ?, description = ?, price_per_meter = ?, category = ?, color = ?, material = ?, 
        width = ?, image_url = ?, stock = ?, featured = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),
  deleteFabric: db.prepare('DELETE FROM fabrics WHERE id = ?'),
  
  // Admin
  getAdminByUsername: db.prepare('SELECT * FROM admin_users WHERE username = ?'),
};