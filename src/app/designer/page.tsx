
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { getTemplate, saveTemplate, defaultTemplate } from '@/lib/template';
import type { Template } from '@/lib/template';
import type { Employee } from '@/lib/types';
import { getEmployees } from '@/lib/db';
import { getTemplateFile } from '@/lib/idb';
import html2canvas from 'html2canvas';

import DragEditor from '@/components/DragEditor';
import PrintIDCard from '@/components/PrintIDCard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, RotateCcw, Save, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function DesignerPage() {
  const [template, setTemplate] = useState<Template>(defaultTemplate);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const objectUrlRef = useRef<{ front?: string; back?: string }>({});
  const [activeTab, setActiveTab] = useState('front');
  const [isDownloading, setIsDownloading] = useState(false);


  useEffect(() => {
    // Load employees and template data
    const loadData = async () => {
      const emps = await getEmployees();
      setEmployees(emps);
      if (emps.length > 0) {
        setSelectedEmployee(emps[0]);
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
    };

    loadData();

    // Cleanup object URLs on unmount
    return () => {
      if (objectUrlRef.current.front) URL.revokeObjectURL(objectUrlRef.current.front);
      if (objectUrlRef.current.back) URL.revokeObjectURL(objectUrlRef.current.back);
    };
  }, []); 


  const handleSave = () => {
    // Create a clean version of the template for localStorage (without blob URLs)
    const templateToSave: Template = {
      ...template,
      front: { ...template.front, backgroundImage: "" },
      back: { ...template.back, backgroundImage: "" },
    };

    saveTemplate(templateToSave);
    toast({
      title: 'Template Saved',
      description: 'Your ID card layout has been updated.',
    });
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the template to its default layout?')) {
      setTemplate(defaultTemplate);
      saveTemplate(defaultTemplate);
      toast({
        title: 'Template Reset',
        description: 'The layout has been restored to the default. Reload the page to remove background images.',
      });
    }
  };

  const handleSelectEmployee = (id: string) => {
    const employee = employees.find((emp) => emp.id === id);
    if (employee) {
      setSelectedEmployee(employee);
    }
  };

  const handleDownload = async () => {
    if (isDownloading) return;

    const side = activeTab as 'front' | 'back';
    const elementId = side === 'front' ? 'id-card-preview' : 'id-card-preview-back';
    const cardElement = document.getElementById(elementId);

    if (!cardElement || !selectedEmployee) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not find the card preview to download.',
      });
      return;
    }
    
    const sideTitle = side.charAt(0).toUpperCase() + side.slice(1);
    toast({ title: `Generating ${sideTitle} Card...`, description: "This may take a moment." });

    setIsDownloading(true);

    try {
      const originalElement = cardElement.querySelector('div') as HTMLElement;
      if (!originalElement) {
        throw new Error('Card preview content not found');
      }

      // Clone the element to modify it for rendering without affecting the UI
      const clonedElement = originalElement.cloneNode(true) as HTMLElement;
      
      // The designer outlines have a very specific style. We'll find them.
      const borderedElements = clonedElement.querySelectorAll<HTMLElement>('[style*="border: 1px dashed"]');
      
      // Remove the border from each cloned element
      borderedElements.forEach(el => {
        el.style.border = 'none';
      });

      // Temporarily add the clone to the DOM off-screen, which can help html2canvas with layouting.
      clonedElement.style.position = 'absolute';
      clonedElement.style.left = '-9999px';
      document.body.appendChild(clonedElement);

      const canvas = await html2canvas(clonedElement, { // Use the modified clone
        scale: 16, // Produces approx. 5168x8192 resolution
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
        link.download = `ID-Card-${selectedEmployee.empId}-${side}.png`;
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
  };

  const EmployeeSelector = (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div>
            <label className="text-sm font-medium text-muted-foreground">EMPLOYEE SAMPLE</label>
            <Select
            onValueChange={handleSelectEmployee}
            value={selectedEmployee?.id || ''}
            >
            <SelectTrigger>
                <SelectValue placeholder="Select an employee" />
            </SelectTrigger>
            <SelectContent>
                {employees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                    {emp.name}
                </SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>
        <Button variant="outline" className="w-full" onClick={handleReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset Design
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-destructive text-primary-foreground p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">ID CARD DESIGNER</h1>
            <p className="text-sm opacity-80">HARDWARE IDENTITY PROTOCOL</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleSave}>
            <Save className="h-5 w-5" />
          </Button>
          <Button variant="secondary" size="icon" onClick={handleDownload} disabled={isDownloading}>
            {isDownloading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-slate-100/80 backdrop-blur-sm p-4 lg:p-6 flex-1">
        <Tabs defaultValue="front" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-center mb-6">
            <TabsList>
              <TabsTrigger value="front">Front Side</TabsTrigger>
              <TabsTrigger value="back">Back Side</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="front">
            <div className="grid lg:grid-cols-3 gap-6 items-start">
              {/* Left Column: Controls */}
              <div className="lg:col-span-1 flex flex-col gap-6 lg:h-[calc(100vh-12rem)] overflow-y-auto pr-2 order-last lg:order-first">
                {EmployeeSelector}
                <DragEditor template={template} setTemplate={setTemplate} side="front"/>
              </div>

              {/* Right Column: Preview */}
              <div className="lg:col-span-2 sticky top-6 flex items-center justify-center order-first lg:order-last">
                 <div id="id-card-preview">
                    {selectedEmployee && <PrintIDCard emp={selectedEmployee} template={template} side="front" setTemplate={setTemplate} isDesigner />}
                 </div>
              </div>
            </div>
          </TabsContent>
           <TabsContent value="back">
            <div className="grid lg:grid-cols-3 gap-6 items-start">
              {/* Left Column: Controls */}
              <div className="lg:col-span-1 flex flex-col gap-6 lg:h-[calc(100vh-12rem)] overflow-y-auto pr-2 order-last lg:order-first">
                {EmployeeSelector}
                <DragEditor template={template} setTemplate={setTemplate} side="back"/>
              </div>

              {/* Right Column: Preview */}
              <div className="lg:col-span-2 sticky top-6 flex items-center justify-center order-first lg:order-last">
                 <div id="id-card-preview-back">
                    {selectedEmployee && <PrintIDCard emp={selectedEmployee} template={template} side="back" setTemplate={setTemplate} isDesigner />}
                 </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
