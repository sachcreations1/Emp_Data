'use client';
import { useState, useEffect } from 'react';
import { getEmployees } from "@/lib/db";
import type { Employee } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Printer } from 'lucide-react';
import PrintIDCard from '@/components/PrintIDCard';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { getTemplate, defaultTemplate, type Template } from '@/lib/template';

export default function IDCardPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [template, setTemplate] = useState<Template>(defaultTemplate);

    useEffect(() => {
        const loadData = async () => {
            const emps = await getEmployees();
            setEmployees(emps);
            if (emps.length > 0) {
                setSelectedEmployee(emps[0]);
            }
            setTemplate(getTemplate());
        };
        loadData();
    }, []);

    const handleSelectEmployee = (id: string) => {
        const employee = employees.find(emp => emp.id === id);
        if (employee) {
            setSelectedEmployee(employee);
        }
    };
    
    const downloadPDF = async (elementId: string) => {
        const element = document.getElementById(elementId);
        if (!element) return;
        const canvas = await html2canvas(element, { scale: 3, useCORS: true });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: [85.6, 54]
        });

        pdf.addImage(imgData, "PNG", 0, 0, 85.6, 54);
        pdf.save(`${selectedEmployee?.name || 'employee'}-id-card.pdf`);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">ID Card Generator</h1>
            <p className="text-muted-foreground mb-6">Preview and download individual employee ID cards.</p>
            <Card>
                <CardHeader>
                    <CardTitle>Generate & Download ID Card</CardTitle>
                    <CardDescription>Select an employee to see their ID card, then download it as a PDF.</CardDescription>
                    <div className="flex gap-4 items-center pt-4">
                        <Select onValueChange={handleSelectEmployee} value={selectedEmployee?.id || ''}>
                            <SelectTrigger className="w-[280px]">
                                <SelectValue placeholder="Select an employee" />
                            </SelectTrigger>
                            <SelectContent>
                                {employees.map(emp => (
                                    <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={() => downloadPDF('id-card-to-print')} disabled={!selectedEmployee}>
                            <Printer className="mr-2 h-4 w-4" /> Download PDF
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex items-center justify-center p-6 bg-slate-200/50 rounded-b-lg min-h-[300px]">
                    {selectedEmployee ? (
                        <div id="id-card-to-print">
                           <PrintIDCard emp={selectedEmployee} template={template} />
                        </div>
                    ) : (
                        <div className="text-muted-foreground">
                            <p>No employees found. Add one on the Employees page.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
