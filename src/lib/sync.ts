import { db } from "./firebase";
import { collection, writeBatch, doc, getDocs } from "firebase/firestore";
import type { Employee } from "./types";

export const syncToCloud = async (employees: Employee[]) => {
  if (!employees || employees.length === 0) {
    console.log("No employees to sync.");
    return;
  }
  
  const batch = writeBatch(db);
  const employeesCollection = collection(db, "employees");

  employees.forEach((emp) => {
    // Use the local ID for the document ID in Firestore to avoid duplicates
    const docRef = doc(employeesCollection, emp.id);
    batch.set(docRef, emp);
  });

  await batch.commit();
};

export const getCloudData = async (): Promise<Employee[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, "employees"));
        const employees = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Employee[];
        return employees;
    } catch (error) {
        console.error("🔥 Firestore Error:", error);
        throw new Error("Error fetching data from Firestore. Check console for details.");
    }
}
