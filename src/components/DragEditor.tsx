
'use client';
import type { Template } from "@/lib/template";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";


interface DragEditorProps {
    template: Template;
    setTemplate: (template: Template) => void;
    side: 'front' | 'back';
}

export default function DragEditor({ template, setTemplate, side }: DragEditorProps) {
  
  const handleSliderChange = (key: string, field: string, value: number) => {
    setTemplate({
        ...template,
        [side]: {
            ...template[side],
            [key]: {
                ...(template[side] as any)[key],
                [field]: value,
            }
        }
    });
  };

  const handleValueChange = (key: string, field: string, value: string | number) => {
    setTemplate({
        ...template,
        [side]: {
            ...template[side],
            [key]: {
                ...(template[side] as any)[key],
                [field]: value,
            }
        }
    });
  }

  const handleGlobalSliderChange = (field: 'globalOffsetX' | 'globalOffsetY', value: number) => {
    setTemplate({
        ...template,
        [side]: {
            ...template[side],
            [field]: value,
        }
    });
  };

  const renderControls = (key: string) => {
    const el = (template[side] as any)[key];
    if (!el) return null;

    return (
        <div className="space-y-4">
             {Object.hasOwn(el, 'x') && (
                 <div className="grid gap-2">
                     <div className="flex justify-between items-center">
                        <Label htmlFor={`${key}-x`}>Position X</Label>
                         <Input 
                             className="w-16 h-8 text-center"
                             type="number" 
                             value={el.x}
                             onChange={(e) => handleValueChange(key, 'x', parseInt(e.target.value))}
                         />
                    </div>
                    <Slider id={`${key}-x`} min={-100} max={400} value={[el.x]} onValueChange={([val]) => handleSliderChange(key, 'x', val)} />
                </div>
            )}
            {Object.hasOwn(el, 'y') && (
                 <div className="grid gap-2">
                     <div className="flex justify-between items-center">
                        <Label htmlFor={`${key}-y`}>Position Y</Label>
                         <Input 
                             className="w-16 h-8 text-center"
                             type="number" 
                             value={el.y}
                             onChange={(e) => handleValueChange(key, 'y', parseInt(e.target.value))}
                         />
                    </div>
                    <Slider id={`${key}-y`} min={0} max={512} value={[el.y]} onValueChange={([val]) => handleSliderChange(key, 'y', val)} />
                </div>
            )}
            {Object.hasOwn(el, 'size') && (
                 <div className="grid gap-2">
                     <div className="flex justify-between items-center">
                        <Label htmlFor={`${key}-size`}>Size</Label>
                         <Input 
                             className="w-16 h-8 text-center"
                             type="number" 
                             value={el.size}
                             onChange={(e) => handleValueChange(key, 'size', parseInt(e.target.value))}
                         />
                    </div>
                    <Slider id={`${key}-size`} min={10} max={300} value={[el.size]} onValueChange={([val]) => handleSliderChange(key, 'size', val)} />
                </div>
            )}
            {Object.hasOwn(el, 'fontSize') && (
                 <>
                    <div className="grid gap-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor={`${key}-fontSize`}>Font Size</Label>
                            <Input
                                className="w-16 h-8 text-center"
                                type="number"
                                value={el.fontSize}
                                onChange={(e) => handleValueChange(key, 'fontSize', parseInt(e.target.value))}
                            />
                        </div>
                        <Slider id={`${key}-fontSize`} min={8} max={72} value={[el.fontSize]} onValueChange={([val]) => handleSliderChange(key, 'fontSize', val)} />
                    </div>
                     <div className="grid gap-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor={`${key}-fontWeight`}>Font Weight</Label>
                            <Input
                                className="w-16 h-8 text-center"
                                type="number"
                                step="100"
                                value={el.fontWeight}
                                onChange={(e) => handleValueChange(key, 'fontWeight', parseInt(e.target.value))}
                            />
                        </div>
                        <Slider id={`${key}-fontWeight`} min={100} max={900} step={100} value={[el.fontWeight]} onValueChange={([val]) => handleSliderChange(key, 'fontWeight', val)} />
                    </div>
                    <div className="grid gap-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor={`${key}-width`}>Text Box Width</Label>
                            <Input
                                className="w-16 h-8 text-center"
                                type="number"
                                value={el.width ?? ''}
                                onChange={(e) => handleValueChange(key, 'width', e.target.value ? parseInt(e.target.value) : 0)}
                            />
                        </div>
                        <Slider id={`${key}-width`} min={50} max={400} value={[el.width ?? 250]} onValueChange={([val]) => handleSliderChange(key, 'width', val)} />
                    </div>
                     <div className="grid gap-2">
                        <Label>Text Align</Label>
                        <div className="flex gap-1">
                            <Button
                            size="icon"
                            variant={el.textAlign === 'left' ? 'secondary' : 'ghost'}
                            onClick={() => handleValueChange(key, 'textAlign', 'left')}
                            >
                            <AlignLeft className="h-4 w-4" />
                            </Button>
                            <Button
                            size="icon"
                            variant={el.textAlign === 'center' ? 'secondary' : 'ghost'}
                            onClick={() => handleValueChange(key, 'textAlign', 'center')}
                            >
                            <AlignCenter className="h-4 w-4" />
                            </Button>
                            <Button
                            size="icon"
                            variant={el.textAlign === 'right' ? 'secondary' : 'ghost'}
                            onClick={() => handleValueChange(key, 'textAlign', 'right')}
                            >
                            <AlignRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor={`${key}-color`}>Font Color</Label>
                            <Input
                                id={`${key}-color`}
                                type="color"
                                value={el.color}
                                onChange={(e) => handleValueChange(key, 'color', e.target.value)}
                                className="w-16 h-8 p-1 cursor-pointer"
                            />
                        </div>
                    </div>
                 </>
            )}
        </div>
    )
  }

  const elements = Object.keys(template[side]).filter(k => !['backgroundImage', 'globalOffsetX', 'globalOffsetY'].includes(k));

  const elementLabels: Record<string, string> = {
    photo: 'Employee Photo',
    name: 'Employee Name',
    designation: 'Designation',
    department: 'Department',
    empId: 'Employee ID',
    dojLabel: 'DOJ Label',
    dojValue: 'DOJ Value',
    bloodGroupLabel: 'Blood Group Label',
    bloodGroupValue: 'Blood Group Value',
    phoneLabel: 'Phone Label',
    phoneValue: 'Phone Value',
    emergencyContactLabel: 'Emergency Contact Label',
    emergencyContactValue: 'Emergency Contact Value',
    addressLabel: 'Address Label',
    addressValue: 'Address Value',
    authorisedSign: 'Authorised Sign',
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-bold mb-4">CONTROLS ({side === 'front' ? 'Front' : 'Back'} Side)</h2>
        <Accordion type="single" collapsible className="w-full mb-4">
            <AccordionItem value="global-controls">
                <AccordionTrigger>Global Position</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                    <div className="grid gap-2">
                        <div className="flex justify-between items-center">
                           <Label>Global X Offset</Label>
                            <Input 
                                className="w-16 h-8 text-center"
                                type="number" 
                                value={template[side].globalOffsetX || 0}
                                onChange={(e) => handleGlobalSliderChange('globalOffsetX', parseInt(e.target.value))}
                            />
                       </div>
                       <Slider min={-200} max={200} value={[template[side].globalOffsetX || 0]} onValueChange={([val]) => handleGlobalSliderChange('globalOffsetX', val)} />
                   </div>
                   <div className="grid gap-2">
                        <div className="flex justify-between items-center">
                           <Label>Global Y Offset</Label>
                            <Input 
                                className="w-16 h-8 text-center"
                                type="number" 
                                value={template[side].globalOffsetY || 0}
                                onChange={(e) => handleGlobalSliderChange('globalOffsetY', parseInt(e.target.value))}
                            />
                       </div>
                       <Slider min={-200} max={200} value={[template[side].globalOffsetY || 0]} onValueChange={([val]) => handleGlobalSliderChange('globalOffsetY', val)} />
                   </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>

        <Accordion type="multiple" defaultValue={['name']} className="w-full">
            {elements.map(key => {
                if (!elementLabels[key]) return null;
                return (
                    <AccordionItem value={key} key={key}>
                        <AccordionTrigger>{elementLabels[key]}</AccordionTrigger>
                        <AccordionContent>
                            {renderControls(key)}
                        </AccordionContent>
                    </AccordionItem>
                );
            })}
        </Accordion>
    </div>
  );
}
