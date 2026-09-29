'use client';

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { getEmployees, saveEmployees, getEmployee } from "@/lib/db";
import type { Employee, FamilyMember } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, UserPlus, Trash2, Pencil as EditIcon, CalendarIcon, UploadCloud } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import type { Area } from "react-easy-crop";
import getCroppedImg from "@/lib/cropImage";

const Cropper = dynamic(() => import("@/components/ImageCropper"), { ssr: false });

const educationLevels = [
  "Pre-Primary / Anganwadi / Nursery / KG",
  "Primary (Class 1-5)",
  "Middle School (Class 6-8)",
  "Secondary (Class 9-10)",
  "Senior Secondary (Class 11-12)",
  "Diploma / Certificate",
  "Bachelor's Degree (e.g., BA, BSc, BCom, BTech, MBBS, LLB)",
  "Master's Degree, MA, MSc, MCom, MTech",
  "Doctorate / PhD",
  "ITI / Vocational Training",
  "Diploma / Polytechnic"
];

const genderOptions = ["Male", "Female", "Other"];
const bloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const relationOptions = ["Spouse", "Son", "Daughter", "Father", "Mother", "Brother", "Sister", "Other"];

const calculateAge = (dobString: string | undefined): string => {
    if (!dobString) return "";
    const parts = dobString.split(/[-/]/);
    if (parts.length !== 3) return "";
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year) || year < 1900) return "";

    const dob = new Date(Date.UTC(year, month, day));
    if (isNaN(dob.getTime())) return "";

    const today = new Date();
    let age = today.getUTCFullYear() - dob.getUTCFullYear();
    const m = today.getUTCMonth() - dob.getUTCMonth();
    if (m < 0 || (m === 0 && today.getUTCDate() < dob.getUTCDate())) {
        age--;
    }
    return age >= 0 ? age.toString() : "";
};

const parseDateString = (dateString: string | undefined): Date | undefined => {
    if (!dateString) return undefined;
    const parts = dateString.split(/[-/]/);
    if (parts.length !== 3) return undefined;
    
    // Assuming DD-MM-YYYY
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year) || year < 1900) return undefined;

    const date = new Date(year, month, day);
    if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
        return date;
    }
    
    return undefined;
};

const formatDateForInput = (date: Date | undefined): string => {
    if (!date) return "";
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}


export default function EditEmployeePage() {
  const [employee, setEmployee] = useState<Partial<Employee>>({});
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();

  const [isFamilyDialogOpen, setIsFamilyDialogOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState<Partial<FamilyMember> | null>(null);
  const [currentMemberIndex, setCurrentMemberIndex] = useState<number | null>(null);
  
  // State for image cropping
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      const data = await getEmployees();
      setAllEmployees(data);
      const found = data.find((e:any) => e.id === id);
      if (found) {
          setEmployee(found);
      } else {
          toast({ variant: "destructive", title: "Error", description: "Employee not found."});
          router.back();
      }
    };
    loadData();
  }, [id, router, toast]);

    const departments = useMemo(() => [...new Set(allEmployees.map(e => e.department).filter((value): value is string => Boolean(value)))], [allEmployees]);
    const designations = useMemo(() => [...new Set(allEmployees.map(e => e.designation).filter((value): value is string => Boolean(value)))], [allEmployees]);
    const grades = useMemo(() => [...new Set(allEmployees.map(e => e.grade).filter((value): value is string => Boolean(value)))], [allEmployees]);
    const areas = useMemo(() => [...new Set(allEmployees.map(e => e.area).filter((value): value is string => Boolean(value)))], [allEmployees]);
  
  const fieldLabels: { [key: string]: string } = {
    empId: "Employee ID",
    name: "Employee Name",
    dob: "Date of Birth",
    doj: "Date of Joining",
    bloodGroup: "Blood Group",
    emergencyContact: "Emergency Contact",
    uan: "UAN",
    email: "Email Address",
    phone: "Phone Number",
    address: "Address",
    age: "Age",
    department: "Department",
    designation: "Designation",
    education: "Education",
    grade: "Grade",
    area: "Area",
    gender: "Gender",
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmployee({ ...employee, [e.target.name]: e.target.value });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setEmployee({ ...employee, [name]: value });
  };

  const handleSave = async () => {
    let data = await getEmployees();
    data = data.map((e:any) =>
      e.id === employee.id ? employee : e
    );
    await saveEmployees(data);

    toast({ title: "Employee Updated", description: `${employee.name} has been updated.`});
    router.push(`/employees/${id}`);
  };
  
  const mainEmployeeFields = [
    'empId', 'name', 'age', 'department', 'designation', 'phone', 'email', 
    'dob', 'doj', 'gender', 'bloodGroup', 'address', 'uan', 
    'emergencyContact', 'area', 'grade', 'education'
  ];

  // Render all fields to allow editing/adding values even if not present in original data
  const employeeFields = mainEmployeeFields;

  const renderField = (key: string) => {
    const label = fieldLabels[key as keyof typeof fieldLabels] || key.replace(/([A-Z])/g, ' $1');
    const value = (employee as any)[key] || "";

    const selectFields: { [key: string]: readonly string[] } = {
        department: departments,
        designation: designations,
        grade: grades,
        area: areas,
        gender: genderOptions,
        bloodGroup: bloodGroupOptions,
        education: educationLevels
    };

    if (key === 'dob' || key === 'doj') {
        return (
            <div className="grid gap-1.5" key={key}>
                <Label htmlFor={key} className="capitalize">{label}</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "justify-start text-left font-normal",
                                !value && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {value ? value : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            captionLayout="dropdown-buttons"
                            fromYear={1940}
                            toYear={new Date().getFullYear()}
                            mode="single"
                            selected={parseDateString(value)}
                            onSelect={(date) => handleSelectChange(key, formatDateForInput(date))}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
        )
    }

    if (key in selectFields) {
        return (
            <div className="grid gap-1.5" key={key}>
                <Label htmlFor={key} className="capitalize">{label}</Label>
                <Select onValueChange={(val) => handleSelectChange(key, val)} value={value}>
                    <SelectTrigger id={key}>
                        <SelectValue placeholder={`Select ${label}`} />
                    </SelectTrigger>
                    <SelectContent>
                        {(selectFields[key] || []).map(option => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        )
    }

    return (
        <div className="grid gap-1.5" key={key}>
            <Label htmlFor={key} className="capitalize">{label}</Label>
            <Input
                id={key}
                name={key}
                value={value}
                onChange={handleChange}
                placeholder={`Enter ${label}`}
            />
        </div>
    );
  }

  // Family Member Handlers
  const handleOpenFamilyDialog = (member: Partial<FamilyMember> | null, index: number | null) => {
      setCurrentMember(member ? { ...member } : {});
      setCurrentMemberIndex(index);
      setIsFamilyDialogOpen(true);
  };

  const handleFamilyMemberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!currentMember) return;
      const { name, value } = e.target;
      const newMemberState = { ...currentMember, [name]: value };
      if (name === 'dob') {
        newMemberState.memAge = calculateAge(value);
      }
      setCurrentMember(newMemberState);
  };

  const handleFamilySelectChange = (name: string, value: string) => {
    if (!currentMember) return;
    setCurrentMember({ ...currentMember, [name]: value });
  };


  const handleSaveFamilyMember = () => {
      if (!currentMember || !currentMember.name) {
          toast({ variant: 'destructive', title: 'Validation Error', description: 'Member name is required.' });
          return;
      }

      const family = [...(employee.family || [])];
      
      const memberToSave = { ...currentMember };
      if (memberToSave.dob && !memberToSave.memAge) {
          memberToSave.memAge = calculateAge(memberToSave.dob);
      }

      if (currentMemberIndex !== null) {
          family[currentMemberIndex] = memberToSave as FamilyMember;
      } else {
          family.push(memberToSave as FamilyMember);
      }

      setEmployee({ ...employee, family });
      setIsFamilyDialogOpen(false);
  };

  const handleDeleteFamilyMember = (indexToDelete: number) => {
      if (confirm("Are you sure you want to delete this family member?")) {
          const updatedFamily = (employee.family || []).filter((_, index) => index !== indexToDelete);
          setEmployee({ ...employee, family: updatedFamily });
      }
  };

  // Photo Crop Handlers
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageToCrop(reader.result as string);
        setIsCropModalOpen(true);
      });
      reader.readAsDataURL(file);
    }
    e.target.value = ''; // Reset file input
  };
  
  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const saveCroppedImage = useCallback(async () => {
    if (croppedAreaPixels && imageToCrop) {
      try {
        const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
        setEmployee(prev => ({...prev, photo: croppedImage }));
        setIsCropModalOpen(false);
        toast({ title: 'Photo updated successfully!' });
      } catch (e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to crop image.' });
      }
    }
  }, [croppedAreaPixels, imageToCrop, toast]);


  return (
    <div className="bg-slate-50/70 min-h-screen">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b p-4 shadow-sm flex items-center justify-between">
          <div>
              <h1 className="text-xl font-bold">Edit Employee</h1>
              <p className="text-sm text-muted-foreground">Updating {employee.name || 'details'}</p>
          </div>
          <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => router.back()}>
                  Cancel
              </Button>
              <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
          </div>
      </header>
      <main className="p-4 md:p-6 lg:p-8">
        <div className="space-y-6 max-w-3xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Employee Details</CardTitle>
                    <CardDescription>Update the personal and professional details for this employee.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <div className="md:col-span-2 flex flex-col items-center gap-4">
                        <img src={employee?.photo || `https://api.dicebear.com/8.x/initials/svg?seed=${employee?.name}`} alt={employee?.name || ''} className="w-32 h-32 rounded-full object-cover bg-slate-200 ring-4 ring-primary/20" crossOrigin="anonymous"/>
                        <div className="flex gap-2">
                           <Button asChild variant="outline">
                             <label htmlFor="photo-upload" className="cursor-pointer flex items-center">
                               <UploadCloud className="mr-2 h-4 w-4" />
                               Upload Photo
                             </label>
                           </Button>
                           <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={onFileChange}/>
                        </div>
                      </div>
                      {employeeFields.map(key => renderField(key))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Family Members</CardTitle>
                    <CardDescription>Manage family members associated with this employee.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {(employee.family && employee.family.length > 0) ? (
                            employee.family.map((member, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50/80 backdrop-blur-sm">
                                    <div>
                                        <p className="font-medium">{member.name}</p>
                                        <p className="text-sm text-muted-foreground">{member.relation || 'N/A'}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenFamilyDialog(member, index)}>
                                            <EditIcon className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteFamilyMember(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground text-sm text-center py-4">No family members added.</p>
                        )}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" onClick={() => handleOpenFamilyDialog(null, null)}>
                        <UserPlus className="mr-2 h-4 w-4" /> Add Family Member
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </main>

        {/* Family Member Dialog */}
        <Dialog open={isFamilyDialogOpen} onOpenChange={(isOpen) => {
            if (!isOpen) {
                setCurrentMember(null);
                setCurrentMemberIndex(null);
            }
            setIsFamilyDialogOpen(isOpen);
        }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{currentMemberIndex !== null ? 'Edit' : 'Add'} Family Member</DialogTitle>
                    <DialogDescription>
                        Enter the details for the family member below.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" name="name" value={currentMember?.name || ''} onChange={handleFamilyMemberChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="relation" className="text-right">Relation</Label>
                        <Select onValueChange={(val) => handleFamilySelectChange('relation', val)} value={currentMember?.relation || ''}>
                            <SelectTrigger id="relation" className="col-span-3">
                                <SelectValue placeholder="Select Relation" />
                            </SelectTrigger>
                            <SelectContent>
                                {relationOptions.map(option => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="dob" className="text-right">Date of Birth</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "col-span-3 justify-start text-left font-normal",
                                    !currentMember?.dob && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {currentMember?.dob || "Pick a date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                captionLayout="dropdown-buttons" fromYear={1940} toYear={new Date().getFullYear()}
                                mode="single"
                                selected={currentMember?.dob ? parseDateString(currentMember.dob) : undefined}
                                onSelect={(date) => {
                                    const newDob = date ? formatDateForInput(date) : "";
                                    setCurrentMember((prev) => ({
                                        ...(prev as Partial<FamilyMember>),
                                        dob: newDob,
                                        memAge: calculateAge(newDob),
                                    }));
                                }}
                                initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="memAge" className="text-right">Age</Label>
                        <Input id="memAge" name="memAge" value={currentMember?.memAge || ''} onChange={handleFamilyMemberChange} className="col-span-3" readOnly />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="occupation" className="text-right">Occupation</Label>
                        <Input id="occupation" name="occupation" value={currentMember?.occupation || ''} onChange={handleFamilyMemberChange} className="col-span-3" />
                    </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="memberMobile" className="text-right">Mobile</Label>
                        <Input id="memberMobile" name="memberMobile" value={currentMember?.memberMobile || ''} onChange={handleFamilyMemberChange} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSaveFamilyMember}>Save Member</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        
        {/* Photo Crop Dialog */}
        <Dialog open={isCropModalOpen} onOpenChange={setIsCropModalOpen}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Crop Your Photo</DialogTitle>
                    <DialogDescription>Adjust the image below to get the perfect crop.</DialogDescription>
                </DialogHeader>
                <div className="relative w-full h-80 bg-slate-200 rounded-md">
                    {imageToCrop && (
                        <Cropper
                            image={imageToCrop}
                            crop={crop}
                            zoom={zoom}
                            rotation={0}
                            aspect={1}
                            minZoom={1}
                            maxZoom={3}
                            zoomSpeed={1}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                            cropShape="round"
                            style={{}}
                            classes={{}}
                            restrictPosition={true}
                            mediaProps={{}}
                            cropperProps={{}}
                            keyboardStep={5}
                        />
                    )}
                </div>
                <div className="grid gap-2">
                    <Label>Zoom</Label>
                    <Slider
                        min={1}
                        max={3}
                        step={0.1}
                        value={[zoom]}
                        onValueChange={(val) => setZoom(val[0])}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCropModalOpen(false)}>Cancel</Button>
                    <Button onClick={saveCroppedImage}>Save Photo</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
