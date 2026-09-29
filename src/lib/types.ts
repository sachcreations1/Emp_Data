
export interface FamilyMember {
  name?: string;
  relation?: string;
  dob?: string;
  memAge?: string;
  occupation?: string;
  memberMobile?: string;
  // Keep allowing any other properties from CSV for a family member row
  [key: string]: any;
}

export interface Employee {
  id: string;
  empId: string; // From "Emp No"
  name: string;
  photo?: string; // From "Photo"
  designation?: string;
  department?: string;
  dob?: string;
  bloodGroup?: string;
  age?: string; // From "Emp Age"
  email?: string; // From "Personal Email"
  phone?: string; // From "Emp Primary Number"
  doj?: string; // Date of Joining
  gender?: string;
  address?: string;
  uan?: string;
  emergencyContact?: string; // From "Emergency No"
  area?: string;
  grade?: string;
  education?: string;

  family?: FamilyMember[];
  
  // Allow any other properties from the CSV
  [key: string]: any;
}
