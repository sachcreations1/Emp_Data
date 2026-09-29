"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Shield, LogIn, Trash2 } from "lucide-react";

export default function AdminPage() {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("admin_auth");
    if (saved === "true") {
      setAuth(true);
    }
    setLoading(false);
  }, []);

  const login = () => {
    if (pass === "admin123") {
      localStorage.setItem("admin_auth", "true");
      setAuth(true);
      toast({ title: "Success", description: "Logged in successfully." });
    } else {
      toast({
        title: "Error",
        description: "Incorrect password.",
        variant: "destructive",
      });
    }
  };

  const handleWipeData = () => {
    if (confirm("Are you sure you want to delete ALL application data? This cannot be undone.")) {
      localStorage.clear();
      toast({ title: "Success", description: "All application data has been wiped." });
      // Also clear admin auth so they have to log in again
      setAuth(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    setAuth(false);
    toast({ title: "Logged Out", description: "You have been logged out." });
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!auth) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="mx-auto bg-slate-100 p-3 rounded-full w-fit mb-2">
              <Shield className="w-8 h-8 text-slate-600" />
            </div>
            <CardTitle>Admin Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && login()}
            />
            <Button onClick={login} className="w-full">
              <LogIn className="mr-2 h-4 w-4" /> Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <Button onClick={handleLogout} variant="outline">Logout</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">These actions are destructive and cannot be reverted.</p>
          <Button onClick={handleWipeData} variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" /> Wipe All Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
