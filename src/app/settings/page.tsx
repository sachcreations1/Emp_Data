'use client';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { getEmployees, saveEmployees, wipeAllEmployeeData } from '@/lib/db';
import { syncToCloud, getCloudData } from '@/lib/sync';
import { importData, exportData } from '@/lib/backup';
import type { Employee } from '@/lib/types';
import { Trash2, Upload, Download, UploadCloud, Loader2, CloudDownload } from 'lucide-react';
import PinLockSettings from '@/components/PinLockSettings';

export default function SettingsPage() {
    const { toast } = useToast();
    const [isSyncing, setIsSyncing] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);

    const handleWipeData = async () => {
        if (confirm("Are you sure you want to delete ALL local data? This cannot be undone.")) {
            await wipeAllEmployeeData();
            toast({ title: "Data Wiped", description: "All local employee data has been deleted."});
        }
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        importData(file, (restoredData: Employee[]) => {
            // Force a refresh or notify user to refresh
            window.location.reload();
        });
        e.target.value = '';
    }

    const handleCloudSync = async () => {
        if (isSyncing) return;
        if (!confirm("This will overwrite your cloud data with your current local data. Proceed?")) return;

        setIsSyncing(true);
        try {
            const employees = await getEmployees();
            await syncToCloud(employees);
            toast({ title: "Cloud Sync Successful", description: "Your local data has been saved to the cloud." });
        } catch (error: any) {
            console.error("Cloud sync failed:", error);
            toast({ variant: "destructive", title: "Cloud Sync Failed", description: error.message || "Could not connect to the server." });
        } finally {
            setIsSyncing(false);
        }
    };

    const handleCloudRestore = async () => {
        if (isRestoring) return;
        if (!confirm("This will overwrite your local data with data from the cloud. Proceed?")) return;

        setIsRestoring(true);
        try {
            const employees = await getCloudData();
            await saveEmployees(employees);
            toast({ title: "Restore Successful", description: `${employees.length} records restored from the cloud. Reloading...` });
            window.location.reload();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Cloud Restore Failed", description: error.message || "Could not connect to the server." });
        } finally {
            setIsRestoring(false);
        }
    }


    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground mb-6">Manage your application data and preferences.</p>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Data Backup & Restore</CardTitle>
                        <CardDescription>Save your local data to a file or restore it from a backup.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-2">
                        <Button onClick={exportData} variant="outline"><Download className="mr-2 h-4 w-4" />Export Data</Button>
                        <Button asChild variant="outline">
                            <Label htmlFor="import-file" className="cursor-pointer flex items-center"><Upload className="mr-2 h-4 w-4" />Import Data</Label>
                        </Button>
                        <input type="file" id="import-file" accept=".json" className="hidden" onChange={handleImport} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Cloud Backup & Restore</CardTitle>
                        <CardDescription>Sync local data to the cloud, or restore cloud data locally.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        <Button onClick={handleCloudSync} disabled={isSyncing || isRestoring}>
                            {isSyncing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Syncing...
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="mr-2 h-4 w-4" />
                                    Sync to Cloud
                                </>
                            )}
                        </Button>
                         <Button onClick={handleCloudRestore} disabled={isSyncing || isRestoring} variant="outline">
                            {isRestoring ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Restoring...
                                </>
                            ) : (
                                <>
                                    <CloudDownload className="mr-2 h-4 w-4" />
                                    Restore from Cloud
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
                <PinLockSettings />
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle>Danger Zone</CardTitle>
                         <CardDescription className="text-destructive">These actions are permanent and cannot be undone.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleWipeData} variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Wipe All Local Data
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
