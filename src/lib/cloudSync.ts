// This is a placeholder for cloud sync functionality.
// The fetch call has been removed to ensure the app works fully offline without errors.

import { Employee } from "./types";
import { toast } from "@/hooks/use-toast";

export const syncToCloud = async (data: Employee[]) => {
  console.log("Cloud sync is disabled (offline mode). The following data was not synced:", data);
  toast({ title: "Offline Mode", description: "Cloud sync is not configured. Data is saved locally." });
  return Promise.resolve(); // prevent crash
};

export const getCloudData = async (): Promise<Employee[]> => {
  console.log("Cloud data fetch is disabled (offline mode).");
  return Promise.resolve([]);
};
