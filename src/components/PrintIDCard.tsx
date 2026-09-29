
'use client';
import type { Employee } from "@/lib/types";
import { Template } from "@/lib/template";
import React from 'react';

interface PrintIDCardProps {
  emp: Employee;
  template: Template;
  side?: 'front' | 'back';
  setTemplate?: (template: Template) => void;
  isDesigner?: boolean;
}

export default function PrintIDCard({ emp, template, side = 'front', setTemplate, isDesigner = false }: PrintIDCardProps) {
  if (!emp || !template) return null;

  const handleDragEnd = (e: React.DragEvent, key: string) => {
    if (!setTemplate || !isDesigner) return;
    
    e.preventDefault();

    const cardContainer = (e.currentTarget as HTMLElement).parentElement;
    if (!cardContainer) return;

    const containerRect = cardContainer.getBoundingClientRect();

    let x = e.clientX - containerRect.left;
    let y = e.clientY - containerRect.top;
    
    const newTemplate = JSON.parse(JSON.stringify(template));

    (newTemplate[side] as any)[key].x = Math.round(x);
    (newTemplate[side] as any)[key].y = Math.round(y);
    
    setTemplate(newTemplate);
  };


  const currentSideTemplate = template[side];
  
  const renderFront = () => {
    const t = template.front;
    const globalOffsetX = t.globalOffsetX || 0;
    const globalOffsetY = t.globalOffsetY || 0;
    const displayName = emp.name.split(' ').slice(0, 2).join(' ');
    const designerBorderStyle = isDesigner ? `1px dashed #FFD700` : 'none';
    
    return (
      <>
        {/* Photo */}
        <div 
          draggable={isDesigner}
          onDragEnd={(e) => handleDragEnd(e, 'photo')}
          style={{
            position: 'absolute',
            left: `${t.photo.x}px`,
            top: `${t.photo.y}px`,
            width: `${t.photo.size}px`,
            height: `${t.photo.size}px`,
            borderRadius: '50%',
            backgroundColor: '#e2e8f0', // slate-200
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            cursor: isDesigner ? 'move' : 'default',
            border: designerBorderStyle,
            zIndex: 1
        }}>
          <img 
              src={emp.photo || `https://api.dicebear.com/8.x/initials/svg?seed=${emp.name}`} 
              alt={emp.name}
              style={{ 
              width: `100%`,
              height: `100%`,
              objectFit: 'cover',
              }} 
              crossOrigin="anonymous"
              draggable={false}
          />
        </div>
        
        {/* Name */}
        <div 
        draggable={isDesigner}
        onDragEnd={(e) => handleDragEnd(e, 'name')}
        style={{
            position: 'absolute',
            left: `${t.name.x + globalOffsetX}px`,
            top: `${t.name.y + globalOffsetY}px`,
            fontSize: `${t.name.fontSize}px`,
            fontWeight: t.name.fontWeight,
            color: t.name.color,
            textAlign: t.name.textAlign || 'center',
            width: `${t.name.width || 323}px`,
            wordWrap: 'break-word',
            cursor: isDesigner ? 'move' : 'default',
            border: designerBorderStyle,
            padding: isDesigner ? '2px' : '0',
            zIndex: 1
        }}>
            {displayName}
        </div>
        
        {/* Designation */}
        <div 
        draggable={isDesigner}
        onDragEnd={(e) => handleDragEnd(e, 'designation')}
        style={{
            position: 'absolute',
            left: `${t.designation.x + globalOffsetX}px`,
            top: `${t.designation.y + globalOffsetY}px`,
            fontSize: `${t.designation.fontSize}px`,
            fontWeight: t.designation.fontWeight,
            color: t.designation.color,
            textAlign: t.designation.textAlign || 'left',
            width: `${t.designation.width || 250}px`,
            wordWrap: 'break-word',
            cursor: isDesigner ? 'move' : 'default',
            border: designerBorderStyle,
            padding: isDesigner ? '2px' : '0',
            zIndex: 1
        }}>
            {`Designation : ${emp.designation || 'N/A'}`}
        </div>

        {/* Emp ID */}
        <div 
        draggable={isDesigner}
        onDragEnd={(e) => handleDragEnd(e, 'empId')}
        style={{
            position: 'absolute',
            left: `${t.empId.x + globalOffsetX}px`,
            top: `${t.empId.y + globalOffsetY}px`,
            fontSize: `${t.empId.fontSize}px`,
            fontWeight: t.empId.fontWeight,
            color: t.empId.color,
            textAlign: t.empId.textAlign || 'left',
            width: `${t.empId.width || 250}px`,
            wordWrap: 'break-word',
            cursor: isDesigner ? 'move' : 'default',
            border: designerBorderStyle,
            padding: isDesigner ? '2px' : '0',
            zIndex: 1
        }}>
            {`Emp ID : ${emp.empId || 'N/A'}`}
        </div>
        
        {/* Department */}
        <div 
            draggable={isDesigner}
            onDragEnd={(e) => handleDragEnd(e, 'department')}
            style={{
                position: 'absolute',
                left: `${t.department.x + globalOffsetX}px`,
                top: `${t.department.y + globalOffsetY}px`,
                fontSize: `${t.department.fontSize}px`,
                fontWeight: t.department.fontWeight,
                color: t.department.color,
                textAlign: t.department.textAlign || 'left',
                width: `${t.department.width || 250}px`,
                wordWrap: 'break-word',
                cursor: isDesigner ? 'move' : 'default',
                border: designerBorderStyle,
                padding: isDesigner ? '2px' : '0',
                zIndex: 1
            }}>
            {`Department : ${emp.department || 'N/A'}`}
        </div>
      </>
    );
  };

  const renderBack = () => {
    const t = template.back as any;
    if (!t) return null;
    const globalOffsetX = t.globalOffsetX || 0;
    const globalOffsetY = t.globalOffsetY || 0;
    const designerBorderStyle = isDesigner ? `1px dashed #FFD700` : 'none';
    
    const fields = [
      { dataKey: 'doj', labelKey: 'dojLabel', valueKey: 'dojValue', defaultLabel: 'Date of Joining' },
      { dataKey: 'bloodGroup', labelKey: 'bloodGroupLabel', valueKey: 'bloodGroupValue', defaultLabel: 'Blood Group' },
      { dataKey: 'phone', labelKey: 'phoneLabel', valueKey: 'phoneValue', defaultLabel: 'Mobile No.' },
      { dataKey: 'emergencyContact', labelKey: 'emergencyContactLabel', valueKey: 'emergencyContactValue', defaultLabel: 'Emergency No.' },
      { dataKey: 'address', labelKey: 'addressLabel', valueKey: 'addressValue', defaultLabel: 'Address' },
    ];
    
    return (
      <>
        {fields.map(({ dataKey, labelKey, valueKey, defaultLabel }) => {
          const labelElement = t[labelKey];
          const valueElement = t[valueKey];
          if (!labelElement || !valueElement) return null;

          const value = (emp as any)[dataKey] || 'N/A';
          
          const displayValue = `: ${value}`;

          return (
            <React.Fragment key={dataKey}>
              {/* Label */}
              <div 
                key={labelKey} 
                draggable={isDesigner}
                onDragEnd={(e) => handleDragEnd(e, labelKey)}
                style={{
                  position: 'absolute',
                  left: `${labelElement.x + globalOffsetX}px`,
                  top: `${labelElement.y + globalOffsetY}px`,
                  fontSize: `${labelElement.fontSize}px`,
                  fontWeight: labelElement.fontWeight,
                  color: labelElement.color,
                  textAlign: labelElement.textAlign || 'left',
                  width: `${labelElement.width}px`,
                  wordWrap: 'break-word',
                  cursor: isDesigner ? 'move' : 'default',
                  border: designerBorderStyle,
                  padding: isDesigner ? '2px' : '0',
                  zIndex: 1
                }}
              >
                {defaultLabel}
              </div>
              {/* Value */}
              <div 
                key={valueKey}
                draggable={isDesigner}
                onDragEnd={(e) => handleDragEnd(e, valueKey)}
                style={{
                  position: 'absolute',
                  left: `${valueElement.x + globalOffsetX}px`,
                  top: `${valueElement.y + globalOffsetY}px`,
                  fontSize: `${valueElement.fontSize}px`,
                  fontWeight: valueElement.fontWeight,
                  color: valueElement.color,
                  textAlign: valueElement.textAlign || 'left',
                  width: `${valueElement.width}px`,
                  wordWrap: 'break-word',
                  cursor: isDesigner ? 'move' : 'default',
                  border: designerBorderStyle,
                  padding: isDesigner ? '2px' : '0',
                  zIndex: 1
                }}
              >
                {displayValue}
              </div>
            </React.Fragment>
          );
        })}
        {t.authorisedSign && (
          <div
            draggable={isDesigner}
            onDragEnd={(e) => handleDragEnd(e, 'authorisedSign')}
            style={{
              position: 'absolute',
              left: `${t.authorisedSign.x + globalOffsetX}px`,
              top: `${t.authorisedSign.y + globalOffsetY}px`,
              fontSize: `${t.authorisedSign.fontSize}px`,
              fontWeight: t.authorisedSign.fontWeight,
              color: t.authorisedSign.color,
              textAlign: t.authorisedSign.textAlign || 'center',
              width: `${t.authorisedSign.width || 323}px`,
              wordWrap: 'break-word',
              cursor: isDesigner ? 'move' : 'default',
              border: designerBorderStyle,
              padding: isDesigner ? '2px' : '0',
              zIndex: 1
            }}
          >
            Authorised Sign
          </div>
        )}
      </>
    );
  };

  return (
    <div
      style={{
        width: "323px",
        height: "512px",
        fontFamily: "sans-serif",
        borderRadius: "18px",
        overflow: "hidden",
        boxSizing: "border-box",
        position: "relative",
        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
        backgroundColor: side === 'back' ? '#363636' : 'white'
      }}
    >
      {currentSideTemplate.backgroundImage && (
        <img
          src={currentSideTemplate.backgroundImage}
          alt="ID Card background"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0
          }}
          crossOrigin="anonymous"
        />
      )}
      {side === 'front' ? renderFront() : renderBack()}
    </div>
  );
}
