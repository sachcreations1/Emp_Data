
"use client";

import { useEffect, useState } from 'react';
import { getEmployees } from '@/lib/db';
import type { Employee } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface RetirementEmployee {
  employee: Employee;
  retirementDate: Date;
  retirementDateString: string;
}

export default function RetirementPage() {
  const [sortedEmployees, setSortedEmployees] = useState<RetirementEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    });
  };

  useEffect(() => {
    const loadData = async () => {
        const employees = await getEmployees();

        const retirementList = employees
        .map(emp => {
            if (!emp.dob) return null;
            // Handle DD-MM-YYYY format
            const parts = emp.dob.split(/[-/]/);
            if(parts.length !== 3) return null;
            
            // new Date(year, monthIndex, day)
            // assuming DD-MM-YYYY
            const dob = new Date(Date.UTC(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])));

            if (isNaN(dob.getTime())) return null;

            const retirementDate = new Date(dob);
            retirementDate.setUTCFullYear(retirementDate.getUTCFullYear() + 58);

            return {
            employee: emp,
            retirementDate: retirementDate,
            retirementDateString: formatDate(retirementDate)
            };
        })
        .filter((item): item is RetirementEmployee => item !== null)
        .sort((a, b) => a.retirementDate.getTime() - b.retirementDate.getTime());
        
        setSortedEmployees(retirementList);
        setIsLoading(false);
    };
    loadData();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen">
      <header className="sticky top-0 z-10 bg-destructive text-primary-foreground p-4 shadow-md flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
            <h1 className="text-xl font-bold tracking-wider">RETIREMENT</h1>
            <p className="text-sm opacity-80">PROJECTION (58Y POLICY)</p>
        </div>
      </header>

      <main className="p-4 md:p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-slate-700">
            <Clock className="h-5 w-5 text-muted-foreground"/>
            Timeline
        </h2>

        {isLoading ? (
          <div className="text-center text-muted-foreground py-10">Loading retirement data...</div>
        ) : sortedEmployees.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">No employees with valid date of birth found.</div>
        ) : (
          <Card>
            <CardContent className="p-0">
                <div className="divide-y divide-border">
                    <div className="flex justify-between items-center p-4 font-semibold text-xs text-muted-foreground bg-slate-100 rounded-t-lg uppercase tracking-wider">
                        <div className="w-1/2">STAFF DETAILS</div>
                        <div className="w-1/2 text-right">RETIREMENT DATE</div>
                    </div>
                    {sortedEmployees.map(({ employee, retirementDateString }) => (
                        <div key={employee.id} className="flex justify-between items-center p-3 hover:bg-slate-50 cursor-pointer" onClick={() => router.push(`/employees/${employee.id}`)}>
                            <div className="flex items-center gap-4 w-1/2">
                                <img
                                    src={employee.photo || `https://api.dicebear.com/8.x/initials/svg?seed=${employee.name}`}
                                    alt={employee.name}
                                    className="w-10 h-10 rounded-full object-cover bg-slate-200"
                                    crossOrigin="anonymous"
                                />
                                <div>
                                    <p className="font-medium text-sm">{employee.name}</p>
                                    <p className="text-xs text-muted-foreground">{employee.empId}</p>
                                </div>
                            </div>
                            <div className="w-1/2 text-right flex items-center justify-end gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground"/>
                                <span>{retirementDateString}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
