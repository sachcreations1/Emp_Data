import type { Employee } from './types';
import { toast } from '@/hooks/use-toast';
import { getEmployees, saveEmployees } from './db';

export const exportData = async () => {
  const data = await getEmployees();

  if (!data || data.length === 0) {
    toast({ variant: "destructive", title: "No data to export."});
    return;
  }

  const blob = new Blob([JSON.stringify(data)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `stafflink_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast({ title: "Success", description: "Data exported successfully." });
};

export const importData = (file: File, onComplete: (data: Employee[]) => void) => {
  const reader = new FileReader();

  reader.onload = async () => {
    try {
        const dataString = reader.result as string;
        const data = JSON.parse(dataString) as Employee[];
        if(Array.isArray(data) && data.every(item => 'id' in item && 'name' in item && 'empId' in item)) {
          await saveEmployees(data);
          onComplete(data);
          toast({ title: "Success", description: "Data restored from backup." });
        } else {
           toast({ variant: "destructive", title: "Invalid File", description: "The backup file is not in the correct format."});
        }
    } catch(e) {
        toast({ variant: "destructive", title: "Import Failed", description: "The file could not be read."});
    }
  };

  reader.readAsText(file);
};
