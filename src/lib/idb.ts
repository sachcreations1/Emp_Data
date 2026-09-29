import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Employee } from './types';

interface StaffIDB extends DBSchema {
  templates: {
    key: string;
    value: File;
  };
  employees: {
      key: string;
      value: Employee;
      indexes: { 'by-id': string };
  }
}

const dbPromise: Promise<IDBPDatabase<StaffIDB>> | null =
  typeof window !== 'undefined'
    ? openDB<StaffIDB>('staff-id-db', 2, {
        upgrade(db, oldVersion) {
          if (oldVersion < 1) {
            if (!db.objectStoreNames.contains('templates')) {
              db.createObjectStore('templates');
            }
          }
          if (oldVersion < 2) {
             if (!db.objectStoreNames.contains('employees')) {
                const employeeStore = db.createObjectStore('employees', { keyPath: 'id' });
                employeeStore.createIndex('by-id', 'id');
             }
          }
        },
      })
    : null;

export const saveTemplateFile = async (key: string, file: File) => {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.put('templates', file, key);
};

export const getTemplateFile = async (key: string): Promise<File | undefined> => {
  if (!dbPromise) return undefined;
  const db = await dbPromise;
  return await db.get('templates', key);
};


// --- Employee Data Functions ---

export const getEmployeesDB = async (): Promise<Employee[]> => {
  if (!dbPromise) return [];
  const db = await dbPromise;
  const idbEmployees = await db.getAll('employees');

  // One-time migration from localStorage to IndexedDB
  if (idbEmployees.length === 0) {
    const lsData = localStorage.getItem('employees');
    if (lsData) {
      try {
        const employees = JSON.parse(lsData) as Employee[];
        if (Array.isArray(employees) && employees.length > 0) {
          await saveEmployeesDB(employees);
          localStorage.removeItem('employees'); // Clean up old data
          return employees;
        }
      } catch (e) {
        console.error("Failed to parse or migrate from localStorage", e);
        localStorage.removeItem('employees'); // Clear corrupted data
      }
    }
  }
  return idbEmployees;
};

export const saveEmployeesDB = async (employees: Employee[]) => {
    if (!dbPromise) return;
    const db = await dbPromise;
    const tx = db.transaction('employees', 'readwrite');
    // Clear existing data before saving new data.
    await tx.store.clear();
    // Use Promise.all to wait for all put operations to complete.
    await Promise.all(employees.map(emp => tx.store.put(emp)));
    await tx.done;
};

export const addEmployeeDB = async (employee: Employee) => {
    if (!dbPromise) return;
    const db = await dbPromise;
    await db.put('employees', employee);
};

export const deleteEmployeesDB = async (ids: string[]) => {
    if (!dbPromise) return;
    const db = await dbPromise;
    const tx = db.transaction('employees', 'readwrite');
    await Promise.all(ids.map(id => tx.store.delete(id)));
    await tx.done;
};

export const getEmployeeDB = async (id: string): Promise<Employee | undefined> => {
    if (!dbPromise) return undefined;
    const db = await dbPromise;
    return db.get('employees', id);
};

export const clearEmployeesDB = async () => {
    if(!dbPromise) return;
    const db = await dbPromise;
    await db.clear('employees');
}
