
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { getEmployees, saveEmployees, addEmployee, saveCSVData, deleteEmployees, wipeAllEmployeeData } from "@/lib/db";
import { parseCSV } from "@/lib/csv";
import type { Employee } from "@/lib/types";
import { getTemplate, saveTemplate, Template } from "@/lib/template";
import Papa from "papaparse";
import { saveTemplateFile } from "@/lib/idb";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EmployeeCard from "@/components/EmployeeCard";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  Search,
  Plus,
  Menu,
  SlidersHorizontal,
  Cake,
  Upload,
  LayoutGrid,
  Users,
  UserPlus,
  Clock,
  Images,
  CreditCard,
  Download,
  Trash2,
  Settings,
  X,
  BarChart2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function EmployeesPage() {
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const [isBirthdayDialogOpen, setIsBirthdayDialogOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [employeesWithBirthdayToday, setEmployeesWithBirthdayToday] = useState<Employee[]>([]);

  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [designationFilter, setDesignationFilter] = useState('All');
  const [gradeFilter, setGradeFilter] = useState('All');
  const [areaFilter, setAreaFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('All');
  const [ageFilter, setAgeFilter] = useState('All');

  const [selection, setSelection] = useState<string[]>([]);
  const router = useRouter();
  const isSelectionMode = selection.length > 0;

  const fetchData = useCallback(async () => {
    const data = await getEmployees();
    setAllEmployees(data);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (allEmployees.length === 0) {
      setEmployeesWithBirthdayToday([]);
      return;
    }

    const today = new Date();
    const currentMonth = today.getMonth(); // 0-11
    const currentDate = today.getDate(); // 1-31

    const birthdayEmps = allEmployees.filter((emp) => {
      if (!emp.dob) return false;
      
      // DOB is DD-MM-YYYY or DD/MM/YYYY
      const parts = emp.dob.split(/[-/]/);
      if (parts.length !== 3) return false;
      
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // month is 0-indexed

      if (isNaN(day) || isNaN(month)) return false;
      
      return month === currentMonth && day === currentDate;
    });

    setEmployeesWithBirthdayToday(birthdayEmps);
  }, [allEmployees]);
  
  const departments = useMemo(() => ['All', ...Array.from(new Set(allEmployees.map(e => e.department).filter((value): value is string => Boolean(value))))], [allEmployees]);
  const designations = useMemo(() => ['All', ...Array.from(new Set(allEmployees.map(e => e.designation).filter((value): value is string => Boolean(value))))], [allEmployees]);
  const grades = useMemo(() => ['All', ...Array.from(new Set(allEmployees.map(e => e.grade).filter((value): value is string => Boolean(value))))], [allEmployees]);
  const areas = useMemo(() => ['All', ...Array.from(new Set(allEmployees.map(e => e.area).filter((value): value is string => Boolean(value))))], [allEmployees]);
  const genders = useMemo(() => ['All', ...Array.from(new Set(allEmployees.map(e => e.gender).filter((value): value is string => Boolean(value))))], [allEmployees]);
  const bloodGroups = useMemo(() => ['All', ...Array.from(new Set(allEmployees.map(e => e.bloodGroup).filter((value): value is string => Boolean(value))))], [allEmployees]);

  const handleAddEmployee = async () => {
    const newName = prompt("Enter new employee name:");
    if (!newName) return;
    const newEmpId = prompt("Enter employee ID:");
    if (!newEmpId) return;
    
    const randomMonth = Math.floor(Math.random() * 12) + 1;
    const randomDay = Math.floor(Math.random() * 28) + 1;
    const today = new Date();
    const isBirthdayToday = Math.random() > 0.8;
    const dob = isBirthdayToday 
      ? `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear() - 30}`
      : `${String(randomDay).padStart(2, '0')}-${String(randomMonth).padStart(2, '0')}-1990`;

    const newEmployee: Employee = {
      id: `id-${Date.now()}`,
      empId: newEmpId,
      name: newName,
      photo: "",
      designation: "Associate",
      department: "PRODUCTION",
      dob: dob,
      bloodGroup: "O+",
    };
    await addEmployee(newEmployee);
    await fetchData();
    toast({ title: "Success", description: `${newName} has been added.` });
    setIsMenuOpen(false);
  };
  
  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseCSV(file);
      if (data.length === 0) {
        toast({ title: "Empty CSV", description: "The selected file is empty or invalid." });
        return;
      }

      await saveCSVData(data);
      await fetchData();
      toast({
        title: "Import Complete",
        description: `${data.length} records imported. All previous data has been replaced.`
      });

    } catch (error) {
      toast({ variant: 'destructive', title: 'Import Failed', description: 'There was an error parsing the CSV file.' });
      console.error(error);
    } finally {
      e.target.value = '';
    }
  };

  const handleDownloadCsv = async () => {
    const employees = await getEmployees();
    if (employees.length === 0) {
        toast({ title: 'No data', description: 'There are no employees to export.' });
        return;
    }
    const csv = Papa.unparse(employees);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'employees.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Success", description: "Employee data downloaded as CSV." });
    setIsMenuOpen(false);
  };

  const handleWipeData = async () => {
      if (confirm("Are you sure you want to delete ALL local data? This cannot be undone.")) {
          await wipeAllEmployeeData();
          await fetchData();
          toast({ title: "Data Wiped", description: "All local employee data has been deleted."});
      }
      setIsMenuOpen(false);
  };

  const handleTemplateUpload = async (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        toast({ variant: 'destructive', title: 'Invalid File', description: 'Please upload an image file.' });
        return;
    }
    
    try {
        await saveTemplateFile(side, file);
        toast({ title: 'Success', description: `Template for ${side} side updated.` });
    } catch (error) {
        console.error("Failed to save template to IndexedDB", error);
        toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save the image file. It might be too large or your browser may be in private mode.' });
    }
    e.target.value = ''; // Reset file input
  };

  const handleAppBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ variant: 'destructive', title: 'Invalid File', description: 'Please upload an image file.' });
      e.target.value = '';
      return;
    }

    try {
      await saveTemplateFile('app-background', file);
      window.dispatchEvent(new Event('stafflink-background-updated'));
      toast({ title: 'Background Updated', description: 'The app page background has been updated.' });
    } catch (error) {
      console.error('Failed to save app background image', error);
      toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save the background image.' });
    }
    e.target.value = '';
  };


  const handleToggleSelection = (empId: string) => {
      setSelection(prev => 
          prev.includes(empId)
              ? prev.filter(id => id !== empId)
              : [...prev, empId]
      );
  };

  const handleStartSelection = (empId: string) => {
      if (!isSelectionMode) {
          setSelection([empId]);
      } else {
        handleToggleSelection(empId);
      }
  };

  const handleNavigate = (empId: string) => {
      router.push(`/employees/${empId}`);
  };

  const handleCancelSelection = () => {
      setSelection([]);
  };

  const handleDeleteSelected = async () => {
      if (confirm(`Are you sure you want to delete ${selection.length} employee(s)? This cannot be undone.`)) {
          await deleteEmployees(selection);
          await fetchData();
          setSelection([]);
          toast({ title: "Success", description: `${selection.length} employee(s) deleted.` });
      }
  };

  const filteredEmployees = useMemo(() => {
    return allEmployees.filter(emp =>
      ((emp.name && emp.name.toLowerCase().includes(search.toLowerCase())) ||
      (emp.empId && emp.empId.toLowerCase().includes(search.toLowerCase())) ||
      (emp.bloodGroup && emp.bloodGroup.toLowerCase().includes(search.toLowerCase()))) &&
      (departmentFilter === 'All' || emp.department === departmentFilter) &&
      (designationFilter === 'All' || emp.designation === designationFilter) &&
      (gradeFilter === 'All' || emp.grade === gradeFilter) &&
      (areaFilter === 'All' || emp.area === areaFilter) &&
      (genderFilter === 'All' || emp.gender === genderFilter) &&
      (bloodGroupFilter === 'All' || emp.bloodGroup === bloodGroupFilter) &&
      (ageFilter === 'All' || (() => {
        const age = Number.parseInt(emp.age || '', 10);
        if (!Number.isFinite(age) || age <= 0) return false;
        if (ageFilter === 'Under 25') return age < 25;
        if (ageFilter === '25-34') return age >= 25 && age <= 34;
        if (ageFilter === '35-44') return age >= 35 && age <= 44;
        if (ageFilter === '45-54') return age >= 45 && age <= 54;
        return age >= 55;
      })())
    );
  }, [allEmployees, search, departmentFilter, designationFilter, gradeFilter, areaFilter, genderFilter, bloodGroupFilter, ageFilter]);

  const resetAllFilters = () => {
    setDepartmentFilter('All');
    setDesignationFilter('All');
    setGradeFilter('All');
    setAreaFilter('All');
    setGenderFilter('All');
    setBloodGroupFilter('All');
    setAgeFilter('All');
    setSearch('');
  };

  const menuItems = [
    { href: '/', icon: Users, label: 'FERRERO IMEU Directory', active: true },
    { href: '/analytics', icon: BarChart2, label: 'Workforce Analytics' },
    { onClick: handleAddEmployee, icon: UserPlus, label: 'Add New Employee' },
    { href: '/retirement', icon: Clock, label: 'Retirement List' },
    { label: 'Upload CSV', icon: Upload, isUpload: true, action: handleCsvUpload, id: 'csv-upload-menu' },
    { href: '#', icon: Images, label: 'Bulk Photos' },
    { href: '/designer', icon: CreditCard, label: 'ID Card Designer' },
    { label: 'Upload Front Template', icon: Upload, isTemplateUpload: true, action: (e: any) => handleTemplateUpload(e, 'front'), id: 'front-template-upload' },
    { label: 'Upload Back Template', icon: Upload, isTemplateUpload: true, action: (e: any) => handleTemplateUpload(e, 'back'), id: 'back-template-upload' },
    { label: 'Upload App Background', icon: Upload, isBackgroundUpload: true, action: handleAppBackgroundUpload, id: 'app-background-upload' },
    { onClick: handleDownloadCsv, icon: Download, label: 'Download CSV' },
    { onClick: handleWipeData, icon: Trash2, label: 'Wipe All Records', className: "text-destructive" },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="bg-slate-50/70 min-h-dvh">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-destructive text-primary-foreground p-4 shadow-md">
        {isSelectionMode ? (
           <div className="flex items-center justify-between h-12">
              <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={handleCancelSelection}><X className="h-5 w-5" /></Button>
                  <h1 className="text-xl font-bold">{selection.length} selected</h1>
              </div>
              <Button variant="ghost" size="icon" onClick={handleDeleteSelected}><Trash2 className="h-5 w-5" /></Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold tracking-wider">FERRERO IMEU</h1>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setIsFilterOpen(true)}><SlidersHorizontal className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(true)}><Menu className="h-5 w-5" /></Button>
              </div>
            </div>
            <div className="mt-4 relative">
              <Input
                className="w-full h-12 rounded-full pl-5 pr-14 bg-white text-gray-800 placeholder:text-gray-500"
                placeholder="Search Name, ID, or Blood Group..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 bg-destructive hover:bg-destructive/90 rounded-full">
                <Search className="h-5 w-5 text-white" />
              </Button>
            </div>
          </>
        )}
      </header>

      <main className="p-4 space-y-4">
        {employeesWithBirthdayToday.length > 0 && !isSelectionMode && (
          <Dialog open={isBirthdayDialogOpen} onOpenChange={setIsBirthdayDialogOpen}>
            <DialogTrigger asChild>
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 rounded-xl shadow-lg cursor-pointer flex items-center gap-4">
                    <Cake className="h-8 w-8" />
                    <div>
                        <h2 className="font-bold">BIRTHDAY CELEBRATION!</h2>
                        <p className="text-sm">{employeesWithBirthdayToday.length} CELEBRANT(S) TODAY</p>
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Today's Birthday Celebrants</DialogTitle>
                <DialogDescription>
                    Wishing a very happy birthday to:
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {employeesWithBirthdayToday.map(emp => (
                    <div key={emp.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100">
                         <img
                            src={emp.photo || `https://api.dicebear.com/8.x/initials/svg?seed=${emp.name}`}
                            alt={emp.name}
                            className="w-10 h-10 rounded-full object-cover bg-slate-200"
                        />
                        <span className="font-medium">{emp.name}</span>
                    </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}

        <p className="rounded-md border bg-white px-4 py-3 text-sm font-semibold text-slate-700" aria-live="polite">
          Total Employees Found: <span className="text-lg font-bold text-slate-950">{filteredEmployees.length}</span>
        </p>

        <div className="space-y-3">
            {filteredEmployees.map((emp) => (
                <EmployeeCard 
                  key={emp.id} 
                  employee={emp}
                  isSelected={selection.includes(emp.id)}
                  isSelectionMode={isSelectionMode}
                  onClick={() => {
                      if (isSelectionMode) {
                          handleToggleSelection(emp.id);
                      } else {
                          handleNavigate(emp.id);
                      }
                  }}
                  onContextMenu={(e) => {
                      e.preventDefault();
                      handleStartSelection(emp.id);
                  }}
                />
            ))}
        </div>
         {filteredEmployees.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
                <p>No employees found.</p>
                <p className="text-sm">Try adjusting your filters or adding a new employee.</p>
                 <Button asChild variant="outline" className="mt-4">
                    <label htmlFor="csv-upload" className="cursor-pointer flex items-center"><Upload className="mr-2 h-4 w-4"/>Import CSV</label>
                </Button>
                <input type="file" id="csv-upload" className="hidden" accept=".csv" onChange={handleCsvUpload} />
            </div>
        )}
      </main>

      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold text-primary text-left">STAFFLINK</SheetTitle>
            <SheetDescription className="text-left">
              Main menu and application shortcuts.
            </SheetDescription>
          </SheetHeader>
            <div className="py-4 flex flex-col space-y-1">
                {menuItems.map((item, index) => {
                    const content = (
                        <div className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium ${item.active ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'} ${item.className}`}>
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </div>
                    );

                    if (item.href) {
                        return <a href={item.href} key={index} onClick={() => setIsMenuOpen(false)}>{content}</a>;
                    }
                    if (item.isUpload) {
                      return (
                        <label htmlFor={item.id} key={index} className="cursor-pointer">
                          {content}
                          <input type="file" id={item.id} className="hidden" accept=".csv" onChange={(e) => { item.action(e); setIsMenuOpen(false); }} />
                        </label>
                      );
                    }
                    if (item.isTemplateUpload) {
                       return (
                        <label htmlFor={item.id} key={index} className="cursor-pointer">
                          {content}
                          <input type="file" id={item.id} className="hidden" accept="image/*" onChange={(e) => { (item.action as any)(e); setIsMenuOpen(false); }} />
                        </label>
                      );
                    }
                    if (item.isBackgroundUpload) {
                      return (
                        <label htmlFor={item.id} key={index} className="cursor-pointer">
                          {content}
                          <input type="file" id={item.id} className="hidden" accept="image/*" onChange={(e) => { (item.action as any)(e); setIsMenuOpen(false); }} />
                        </label>
                      );
                    }
                    return <button onClick={item.onClick} key={index} className="w-full text-left">{content}</button>;
                })}
            </div>
        </SheetContent>
      </Sheet>

      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filter Employees</SheetTitle>
            <SheetDescription>
              Refine your search results based on specific criteria.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>Department</Label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
             <div className="grid gap-2">
              <Label>Designation</Label>
              <Select value={designationFilter} onValueChange={setDesignationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Designation" />
                </SelectTrigger>
                <SelectContent>
                  {designations.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Grade</Label>
              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Area</Label>
              <Select value={areaFilter} onValueChange={setAreaFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Area" />
                </SelectTrigger>
                <SelectContent>
                  {areas.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Gender</Label>
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  {genders.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Blood Group</Label>
              <Select value={bloodGroupFilter} onValueChange={setBloodGroupFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Blood Group" />
                </SelectTrigger>
                <SelectContent>
                  {bloodGroups.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Age</Label>
              <Select value={ageFilter} onValueChange={setAgeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Age Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All ages</SelectItem>
                  <SelectItem value="Under 25">Under 25</SelectItem>
                  <SelectItem value="25-34">25-34</SelectItem>
                  <SelectItem value="35-44">35-44</SelectItem>
                  <SelectItem value="45-54">45-54</SelectItem>
                  <SelectItem value="55+">55+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="button" variant="outline" className="w-full" onClick={resetAllFilters}>
              <X className="mr-2 h-4 w-4" />
              Reset All Filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>


      {!isSelectionMode && (
        <Button
          size="icon"
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-destructive hover:bg-destructive/90 shadow-xl"
          onClick={handleAddEmployee}
        >
          <Plus className="h-8 w-8" />
        </Button>
      )}
    </div>
  );
}

    
