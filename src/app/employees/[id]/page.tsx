"use client";

import { useState, useEffect, useRef } from 'react';
import { getEmployee, deleteEmployees } from '@/lib/db';
import type { Employee } from '@/lib/types';
import type { Template } from '@/lib/template';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Building, Briefcase, Cake, Droplets, Mail, Phone, CalendarDays, MapPin, Star, Smile, PhoneCall, Home, Hash, Heart, GraduationCap, Smartphone, UserCircle, Clock, CalendarOff, User, Trash2, CreditCard, Pencil, Download, Loader2 } from 'lucide-react';
import PrintIDCard from '@/components/PrintIDCard';
import { getTemplate } from '@/lib/template';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import { getTemplateFile } from '@/lib/idb';
import { Separator } from '@/components/ui/separator';

export default function EmployeeDetailPage() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { toast } = useToast();
  const objectUrlRef = useRef<{ front?: string; back?: string }>({});
  const [isDownloading, setIsDownloading] = useState(false);

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

      const positionalTemplate = getTemplate();
      
      try {
        const frontFile = await getTemplateFile('front');
        if (frontFile) {
          const url = URL.createObjectURL(frontFile);
          objectUrlRef.current.front = url;
          positionalTemplate.front.backgroundImage = url;
        }
      } catch(e) { console.error("Could not load front template from IDB", e)}

      try {
        const backFile = await getTemplateFile('back');
        if (backFile) {
          const url = URL.createObjectURL(backFile);
          objectUrlRef.current.back = url;
          positionalTemplate.back.backgroundImage = url;
        }
      } catch(e) { console.error("Could not load back template from IDB", e)}

      setTemplate(positionalTemplate);
      setIsLoaded(true);
    };

    loadData();

    return () => {
      if (objectUrlRef.current.front) URL.revokeObjectURL(objectUrlRef.current.front);
      if (objectUrlRef.current.back) URL.revokeObjectURL(objectUrlRef.current.back);
    };
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

  const downloadIdCardSide = async (side: 'front' | 'back') => {
    if (isDownloading) return;

    const sideTitle = side.charAt(0).toUpperCase() + side.slice(1);
    toast({ title: `Generating ${sideTitle} Card...`, description: "This may take a moment." });

    setIsDownloading(true);

    const elementId = side === 'front' ? 'card-export-front' : 'card-export-back';
    const cardWrapper = document.getElementById(elementId);

    if (!cardWrapper || !cardWrapper.firstChild) {
        toast({ variant: "destructive", title: "Download Failed", description: `Could not find card element to export.` });
        setIsDownloading(false);
        return;
    }

    try {
        const originalElement = cardWrapper.firstChild as HTMLElement;

        // Clone the element to render it off-screen, ensuring a consistent layout context.
        const clonedElement = originalElement.cloneNode(true) as HTMLElement;
        
        // Temporarily add the clone to the DOM off-screen. This is the key to preventing layout shifts.
        clonedElement.style.position = 'absolute';
        clonedElement.style.left = '-9999px';
        document.body.appendChild(clonedElement);

        const canvas = await html2canvas(clonedElement, { // Use the modified clone
            scale: 16, // High resolution
            useCORS: true,
            backgroundColor: null,
        });

        // Clean up by removing the clone from the DOM
        document.body.removeChild(clonedElement);

        canvas.toBlob((blob) => {
            if (!blob) {
                toast({ variant: 'destructive', title: 'Download Failed', description: 'Could not generate the card image.' });
                setIsDownloading(false);
                return;
            }
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `ID-Card-${employee?.empId}-${side}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            toast({ title: `${sideTitle} Download Started`, description: `Your ${side} ID card image is downloading.` });
            setIsDownloading(false);
        }, 'image/png');

    } catch (error) {
        console.error(`Failed to download ${side} ID card:`, error);
        toast({ variant: 'destructive', title: 'Download Failed', description: 'Could not generate the card image.' });
        setIsDownloading(false);
    }
  }


  if (!isLoaded || !template) {
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
    <Dialog>
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
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-white/20">
                        <CreditCard className="h-4 w-4" />
                        <span className="sr-only">View ID Card</span>
                    </Button>
                </DialogTrigger>
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
      <DialogContent className="max-w-4xl">
        <DialogHeader>
            <DialogTitle>ID Card for {employee.name}</DialogTitle>
            <DialogDescription>Front and back preview of the employee ID card.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 p-4 bg-muted/50 rounded-lg">
            <div id="card-export-front">
              <PrintIDCard emp={employee} template={template} side="front" />
            </div>
            <div id="card-export-back">
              <PrintIDCard emp={employee} template={template} side="back" />
            </div>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button onClick={() => downloadIdCardSide('front')} disabled={isDownloading}>
                {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Download Front
            </Button>
            <Button onClick={() => downloadIdCardSide('back')} variant="outline" disabled={isDownloading}>
                 {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Download Back
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
