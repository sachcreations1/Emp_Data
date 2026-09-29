
import Papa from "papaparse";
import type { Employee, FamilyMember } from "./types";

export const parseCSV = (file: File): Promise<Employee[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: header => header.trim(),

      complete: (results) => {
        try {
          if (!results.meta.fields?.includes("Emp No")) {
            return reject(new Error('CSV Error: Required column "Emp No" was not found.'));
          }

          if (results.errors.length) {
            console.error("CSV Parsing Errors:", results.errors);
            const firstError = results.errors[0];
            return reject(new Error(`CSV Error on row ${firstError.row}: ${firstError.message}`));
          }
          
          const data = results.data as any[];
          
          const employees: Employee[] = [];
          let currentEmp: Employee | null = null;

          data.forEach((row) => {
            const empNo = (row["Emp No"] || "").toString().trim();
            const memberName = (row["Member Name"] || row["Insured name"] || "").toString().trim();

            if (empNo) {
              if (currentEmp) {
                employees.push(currentEmp);
              }

              currentEmp = {
                ...row,
                id: row.id || `${empNo}-${Date.now()}`,
                empId: empNo,
                name: row["Employee Name"] || "",
                age: row["Emp Age"],
                department: row["Department"],
                designation: row["Designation"],
                phone: row["Emp Primary Number"],
                email: row["Personal Email"],
                dob: row["DOB"],
                doj: row["DOJ"],
                gender: row["Gender"],
                bloodGroup: row["Blood Group"],
                address: row["Address"],
                uan: row["UAN"],
                emergencyContact: row["Emergency No"],
                area: row["Area"],
                grade: row["Grade"],
                education: row["Education"],
                photo: row["Photo Data"],
                family: [],
              };
            }
            
            if (currentEmp && memberName) {
                const familyMember: FamilyMember = {
                    ...row,
                    name: memberName,
                    relation: row["Relation"],
                    dob: row["MDob"],
                    memAge: row["Mem Age"],
                    occupation: row["Occupations"],
                    memberMobile: row["Member Mobile"],
                };
                if (!currentEmp.family) currentEmp.family = [];
                currentEmp.family.push(familyMember);
            }
          });

          if (currentEmp) {
            employees.push(currentEmp);
          }

          resolve(employees);

        } catch (error) {
          console.error("Error processing CSV data:", error);
          reject(error instanceof Error ? error : new Error('An unknown error occurred during CSV processing.'));
        }
      },

      error: (err: any) => {
        console.error("CSV Parsing Error:", err);
        reject(err);
      },
    });
  });
};
