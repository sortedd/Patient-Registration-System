
import { PGlite } from '@electric-sql/pglite';
import { toast } from '../components/ui/sonner';

// Define proper types for our database results
interface QueryResult {
  rows: any[];
  columns: { name: string }[];
}

// Create mock database for fallback
class MockDB {
  private data: {
    patients: any[];
  };

  constructor() {
    // Initialize with data from localStorage if available
    try {
      const savedData = localStorage.getItem('patient_data');
      this.data = {
        patients: savedData ? JSON.parse(savedData) : []
      };
    } catch (error) {
      console.error('Failed to load mock data:', error);
      this.data = { patients: [] };
    }
  }

  async query(query: string, params: any[] = []): Promise<QueryResult> {
    console.log('Using mock database:', query, params);
    
    // Very simple query parser for basic operations
    query = query.toLowerCase().trim();
    
    // CREATE TABLE (just ignore in mock)
    if (query.includes('create table')) {
      return { rows: [], columns: [] };
    }
    
    // INSERT
    if (query.includes('insert into patients')) {
      const newPatient = {
        id: this.data.patients.length + 1,
        first_name: params[0],
        last_name: params[1],
        date_of_birth: params[2],
        gender: params[3],
        email: params[4],
        phone: params[5],
        address: params[6],
        medical_history: params[7],
        created_at: new Date().toISOString()
      };
      
      this.data.patients.push(newPatient);
      this.saveToLocalStorage();
      
      return {
        rows: [{ id: newPatient.id }],
        columns: [{ name: 'id' }]
      };
    }
    
    // SELECT
    if (query.includes('select * from patients')) {
      return {
        rows: [...this.data.patients],
        columns: [
          { name: 'id' },
          { name: 'first_name' },
          { name: 'last_name' },
          { name: 'date_of_birth' },
          { name: 'gender' },
          { name: 'email' },
          { name: 'phone' },
          { name: 'address' },
          { name: 'medical_history' },
          { name: 'created_at' }
        ]
      };
    }
    
    // Default - empty result
    return { rows: [], columns: [] };
  }
  
  private saveToLocalStorage() {
    try {
      localStorage.setItem('patient_data', JSON.stringify(this.data.patients));
    } catch (error) {
      console.error('Failed to save mock data:', error);
    }
  }
}

// Global variables
let db: PGlite | MockDB | null = null;
let isInitialized = false;
let usingMockDB = false;

// BroadcastChannel for cross-tab communication
let channel: BroadcastChannel | null = null;

// Initialize the database with fallback to MockDB
export async function initializeDB() {
  if (isInitialized && db) return db;

  try {
    console.log('Starting database initialization...');
    
    // Try to initialize PGlite first
    try {
      db = new PGlite();
      
      // Test if PGlite is working by running a simple query
      await db.query('SELECT 1');
      
      console.log('PGlite initialized successfully');
      usingMockDB = false;
    } catch (pgliteError) {
      console.error('PGlite initialization failed, falling back to mock DB:', pgliteError);
      toast.warning('Using in-memory database (data will persist in localStorage)');
      
      // Fall back to mock database
      db = new MockDB();
      usingMockDB = true;
    }
    
    // Initialize broadcast channel for cross-tab communication
    channel = new BroadcastChannel('patient_db_channel');
    
    // Listen for changes from other tabs
    channel.onmessage = async (event) => {
      if (event.data.type === 'db_change') {
        // Notify UI components about the change
        window.dispatchEvent(new CustomEvent('db_updated', { 
          detail: { source: 'other_tab', table: event.data.table } 
        }));
      }
    };
    
    // Create patients table (real DB only, mock DB ignores this)
    await db.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        date_of_birth DATE NOT NULL,
        gender TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        medical_history TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    isInitialized = true;
    console.log('Database initialized successfully');
    
    // In real PGlite mode, attempt to load data from localStorage
    if (!usingMockDB) {
      try {
        const savedData = localStorage.getItem('patient_data');
        if (savedData) {
          const patients = JSON.parse(savedData);
          
          // Insert saved patients
          for (const patient of patients) {
            await db.query(
              `INSERT INTO patients 
              (first_name, last_name, date_of_birth, gender, email, phone, address, medical_history) 
              VALUES 
              ($1, $2, $3, $4, $5, $6, $7, $8)`, 
              [
                patient.first_name,
                patient.last_name,
                patient.date_of_birth,
                patient.gender,
                patient.email || '',
                patient.phone || '',
                patient.address || '',
                patient.medical_history || ''
              ]
            );
          }
        }
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      }
    }
    
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    isInitialized = false;
    db = null;
    toast.error('Database initialization failed');
    throw error;
  }
}

// Get the database instance
export async function getDB() {
  if (!isInitialized || !db) {
    return await initializeDB();
  }
  return db;
}

// Execute a query and return the results
export async function executeQuery(query: string, params: any[] = []): Promise<QueryResult> {
  try {
    const database = await getDB();
    if (!database) {
      throw new Error('Database not initialized');
    }
    
    const result = await database.query(query, params) as unknown as QueryResult;
    
    // Save patients table to localStorage
    if (query.toLowerCase().includes('insert into patients') || 
        query.toLowerCase().includes('update patients') || 
        query.toLowerCase().includes('delete from patients')) {
      // Get all patients and save to localStorage
      const patients = await database.query('SELECT * FROM patients') as unknown as QueryResult;
      
      if (patients && patients.rows) {
        localStorage.setItem('patient_data', JSON.stringify(patients.rows));
      }
      
      // Notify other tabs about the change
      if (channel) {
        channel.postMessage({ type: 'db_change', table: 'patients' });
      }
      
      // Dispatch event for current tab
      window.dispatchEvent(new CustomEvent('db_updated', { 
        detail: { source: 'current_tab', table: 'patients' } 
      }));
    }
    
    return result;
  } catch (error) {
    console.error('Query execution failed:', error);
    toast.error(`Query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

// Add a new patient
export async function addPatient(patientData: {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  email?: string;
  phone?: string;
  address?: string;
  medical_history?: string;
}) {
  try {
    const result = await executeQuery(
      `INSERT INTO patients 
      (first_name, last_name, date_of_birth, gender, email, phone, address, medical_history) 
      VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id`, 
      [
        patientData.first_name,
        patientData.last_name,
        patientData.date_of_birth,
        patientData.gender,
        patientData.email || '',
        patientData.phone || '',
        patientData.address || '',
        patientData.medical_history || ''
      ]
    );
    
    toast.success('Patient added successfully');
    return result;
  } catch (error) {
    console.error('Failed to add patient:', error);
    toast.error('Failed to add patient');
    throw error;
  }
}

// Get all patients
export async function getAllPatients() {
  try {
    const result = await executeQuery('SELECT * FROM patients ORDER BY created_at DESC');
    if (result && result.rows) {
      return result.rows;
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch patients:', error);
    toast.error('Failed to load patients');
    throw error;
  }
}

// Initialize the database when the module loads
if (typeof window !== 'undefined') {
  initializeDB().catch(err => {
    console.error('Failed to initialize database on load:', err);
  });
}
