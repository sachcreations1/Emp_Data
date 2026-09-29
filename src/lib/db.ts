
import type { Employee } from './types';
import {
    getEmployeesDB,
    saveEmployeesDB,
    addEmployeeDB,
    deleteEmployeesDB,
    getEmployeeDB,
    clearEmployeesDB,
} from './idb';


export const getEmployees = async (): Promise<Employee[]> => {
  if (typeof window === "undefined") return [];
  return getEmployeesDB();
};

export const getEmployee = async (id: string): Promise<Employee | undefined> => {
  if (typeof window === "undefined") return undefined;
  return getEmployeeDB(id);
}

export const saveEmployees = async (data: Employee[]) => {
  if (typeof window === "undefined") return;
  await saveEmployeesDB(data);
};

export const addEmployee = async (emp: Employee) => {
  if (typeof window === "undefined") return;
  await addEmployeeDB(emp);
};

export const deleteEmployees = async (ids: string[]) => {
  if (typeof window === "undefined") return;
  await deleteEmployeesDB(ids);
};

export const saveCSVData = async (data: Employee[]) => {
  // This function now REPLACES all existing data with the new data from the CSV.
  await saveEmployees(data);
};

export const wipeAllEmployeeData = async () => {
    if (typeof window === "undefined") return;
    await clearEmployeesDB();
}
