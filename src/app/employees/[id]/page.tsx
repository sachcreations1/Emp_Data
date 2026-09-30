"use client";

import { useState, useEffect } from 'react';
import { getEmployee, deleteEmployees } from '@/lib/db';
import type { Employee } from '@/lib/types';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building, Briefcase, Cake, Droplets, Mail, Phone, CalendarDays, MapPin, Star, Smile, PhoneCall, Home, Hash, Heart, GraduationCap, Smartphone, UserCircle, Clock, CalendarOff, User, Trash2, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export default function EmployeeDetailPage() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { toast } = useToast();
  const [experience, setExperience] = useState<string>('N/A');
  const [retirementDate, setRetirementDate] = useState<string>('N/A');
  
  const formatDate = (dateString: string | undefined) => {
      if (!dateString) return 'N/A';
      try {
          // Handle DD-MM-YYYY format
          const parts = dateString.split(/[-/]/);
          if (parts.length !== 3) return dateString;
          const date = new Date(Date.UTC(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])));
          if(isNaN(date.getTime())) return dateString;
          return date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              timeZone: 'UTC'
          });
      } catch (e) {
          return dateString;
      }
  };

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        const foundEmployee = await getEmployee(id);
        if (foundEmployee) {
          setEmployee(foundEmployee);
        }
      }
      setIsLoaded(true);
    };

    loadData();

  }, [id]);

  useEffect(() => {
    if (!employee) return;
    
    const calculateExperience = (dojString: string | undefined): string => {
        if (!dojString) return 'N/A';
        const parts = dojString.split(/[-/]/);
        if(parts.length !== 3) return dojString;
        const doj = new Date(Date.UTC(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])));
        if (isNaN(doj.getTime())) return dojString;

        const today = new Date();
        let years = today.getUTCFullYear() - doj.getUTCFullYear();
        let months = today.getUTCMonth() - doj.getUTCMonth();
        if (months < 0 || (months === 0 && today.getUTCDate() < doj.getUTCDate())) {
            years--;
            months = (months + 12) % 12;
        }
        if (today.getUTCDate() < doj.getUTCDate() && months > 0) {
          months--;
        } else if (today.getUTCDate() < doj.getUTCDate() && months === 0) {
          months = 11;
        }

        return `${years} years, ${months} months`;
    };

    const calculateRetirementDate = (dobString: string | undefined): string => {
        if (!dobString) return 'N/A';
        const parts = dobString.split(/[-/]/);
        if(parts.length !== 3) return dobString;
        const dob = new Date(Date.UTC(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])));
        if (isNaN(dob.getTime())) return dobString;
        
        const retirementDate = new Date(dob);
        retirementDate.setUTCFullYear(retirementDate.getUTCFullYear() + 58);
        
        return formatDate(retirementDate.toISOString().split('T')[0]);
    };

    setExperience(calculateExperience(employee.doj));
    setRetirementDate(calculateRetirementDate(employee.dob));
    
  }, [employee]);

  const handleDelete = async () => {
    if (employee && confirm(`Are you sure you want to delete ${employee.name}? This action cannot be undone.`)) {
      await deleteEmployees([employee.id]);
      toast({ title: 'Employee Deleted', description: `${employee.name} has been removed from the directory.` });
      router.push('/');
    }
  };

    if (!isLoaded) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  if (!employee) {
    return <div className="flex items-center justify-center h-full">Employee not found.</div>;
  }

  const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | undefined | null }) => (
    <div className="flex items-start">
        <Icon className="mr-3 mt-1 h-5 w-5 text-muted-foreground flex-shrink-0" />
        <div>
            <p className="text-muted-foreground text-xs">{label}</p>
            <p className="font-medium">{value || 'N/A'}</p>
        </div>
    </div>
  );

  return (
      <div className="bg-transparent min-h-screen">
        <header className="sticky top-0 z-10 bg-destructive text-primary-foreground p-4 shadow-md flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-xl font-bold">{employee.name}</h1>
                    <p className="text-sm opacity-80">#{employee.empId}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => router.push(`/employees/${employee.id}/edit`)} className="hover:bg-white/20">
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit Employee</span>
                </Button>
                <Button onClick={handleDelete} variant="ghost" size="icon" className="hover:bg-white/20">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete Employee</span>
                </Button>
            </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8">
            <Card className="bg-white/75 backdrop-blur-sm">
            <CardHeader>
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <img src={employee.photo || `https://api.dicebear.com/8.x/initials/svg?seed=${employee.name}`} alt={employee.name} className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover bg-slate-200 ring-4 ring-primary/20" crossOrigin="anonymous" />
                    <div className="flex-1 w-full text-center md:text-left pt-4">
                        <CardTitle className="text-2xl md:text-3xl font-bold">{employee.name}</CardTitle>
                        <CardDescription className="text-base md:text-lg">#{employee.empId}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div>
                <h3 className="text-lg font-semibold mb-4 text-slate-800">Personal & Professional Details</h3>
                <div className="grid grid-cols-1 gap-y-4 md:grid-cols-2 md:gap-x-6 text-sm">
                    <DetailItem icon={Briefcase} label="Designation" value={employee.designation} />
                    <DetailItem icon={Star} label="Grade" value={employee.grade} />
                    <DetailItem icon={Building} label="Department" value={employee.department} />
                    <DetailItem icon={MapPin} label="Area" value={employee.area} />
                    <DetailItem icon={CalendarDays} label="Date of Joining" value={formatDate(employee.doj)} />
                    <DetailItem icon={Cake} label="Date of Birth" value={formatDate(employee.dob)} />
                    <DetailItem icon={User} label="Age" value={employee.age} />
                    <DetailItem icon={Clock} label="Total Experience" value={experience} />
                    <DetailItem icon={CalendarOff} label="Retirement Date (at 58)" value={retirementDate} />
                    <DetailItem icon={Smile} label="Gender" value={employee.gender} />
                    <DetailItem icon={Droplets} label="Blood Group" value={employee.bloodGroup} />
                    <DetailItem icon={GraduationCap} label="Education" value={employee.education} />
                    <DetailItem icon={Mail} label="Email" value={employee.email} />
                    <DetailItem icon={Phone} label="Phone" value={employee.phone} />
                    <DetailItem icon={PhoneCall} label="Emergency Contact" value={employee.emergencyContact} />
                    <DetailItem icon={Hash} label="UAN" value={employee.uan} />
                    <DetailItem icon={Home} label="Address" value={employee.address} />
                </div>
                </div>
                
                {employee.family && employee.family.length > 0 && (
                    <div className="mt-8">
                        <Separator />
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-4 text-slate-800">Family Members</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {employee.family.map((member: any, index: number) => (
                                    <div key={index} className="p-4 border rounded-xl shadow-sm bg-slate-50/65 backdrop-blur-sm">
                                        <p className="font-semibold text-primary mb-2">{member.name || 'N/A'}</p>
                                        <div className="space-y-3 text-sm">
                                            <DetailItem icon={Heart} label="Relation" value={member.relation} />
                                            <DetailItem icon={Cake} label="Date of Birth" value={formatDate(member.dob)} />
                                            <DetailItem icon={User} label="Age" value={member.memAge} />
                                            <DetailItem icon={Briefcase} label="Occupation" value={member.occupation} />
                                            <DetailItem icon={Smartphone} label="Mobile" value={member.memberMobile} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
            </Card>
        </main>
      </div>
  );
}
