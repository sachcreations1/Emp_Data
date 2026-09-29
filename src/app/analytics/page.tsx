
"use client";

import { useEffect, useState, useMemo } from 'react';
import { getEmployees } from '@/lib/db';
import type { Employee } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';
import { Users, User, UserCog, TrendingUp, FileDown, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const CHART_COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF4560", "#00E396", "#775DD0"];

const ageGroups = {
  '25-29': 0, '30-34': 0, '35-39': 0, '40-44': 0, '45-49': 0, '50-54': 0, '55-58': 0,
};


export default function AnalyticsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
        const data = await getEmployees();
        setEmployees(data);
    };
    loadData();
  }, []);

  const stats = useMemo(() => {
    const totalEmployees = employees.length;
    const totalMen = employees.filter(e => e.gender?.toLowerCase() === 'male').length;
    const totalWomen = employees.filter(e => e.gender?.toLowerCase() === 'female').length;
    
    const validAges = employees.map(e => parseInt(e.age || '0')).filter(age => age > 0);
    const avgAge = validAges.length > 0 ? (validAges.reduce((a, b) => a + b, 0) / validAges.length) : 0;

    return {
      totalEmployees,
      totalMen,
      totalWomen,
      avgAge: avgAge.toFixed(1),
    };
  }, [employees]);

  const chartData = useMemo(() => {
    const ageDistribution = { ...ageGroups };
    const ageYearDistribution: { [age: string]: number } = {};
    const areaDistribution: { [key: string]: number } = {};
    const maleAreaDistribution: { [key: string]: number } = {};
    const femaleAreaDistribution: { [key: string]: number } = {};
    const retirementYearDistribution: { [key: string]: number } = {};
    const departmentAnalysis: { [key: string]: number } = {};
    const bloodGroupDistribution: { [key: string]: number } = {};

    employees.forEach(emp => {
      const age = parseInt(emp.age || '0');
      if (age >= 25 && age <= 29) ageDistribution['25-29']++;
      else if (age >= 30 && age <= 34) ageDistribution['30-34']++;
      else if (age >= 35 && age <= 39) ageDistribution['35-39']++;
      else if (age >= 40 && age <= 44) ageDistribution['40-44']++;
      else if (age >= 45 && age <= 49) ageDistribution['45-49']++;
      else if (age >= 50 && age <= 54) ageDistribution['50-54']++;
      else if (age >= 55 && age <= 58) ageDistribution['55-58']++;
      if (Number.isFinite(age) && age > 0) {
        const ageYear = String(age);
        ageYearDistribution[ageYear] = (ageYearDistribution[ageYear] || 0) + 1;
      }

      if(emp.area) areaDistribution[emp.area] = (areaDistribution[emp.area] || 0) + 1;
      if (emp.area && emp.gender?.toLowerCase() === 'male') {
        maleAreaDistribution[emp.area] = (maleAreaDistribution[emp.area] || 0) + 1;
      }
      if (emp.area && emp.gender?.toLowerCase() === 'female') {
        femaleAreaDistribution[emp.area] = (femaleAreaDistribution[emp.area] || 0) + 1;
      }
      if (emp.dob) {
        const dateParts = emp.dob.split(/[-/]/);
        if (dateParts.length === 3) {
          const birthDate = new Date(Date.UTC(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0])));
          if (!Number.isNaN(birthDate.getTime())) {
            birthDate.setUTCFullYear(birthDate.getUTCFullYear() + 58);
            const retirementYear = String(birthDate.getUTCFullYear());
            retirementYearDistribution[retirementYear] = (retirementYearDistribution[retirementYear] || 0) + 1;
          }
        }
      }
      if(emp.department) departmentAnalysis[emp.department] = (departmentAnalysis[emp.department] || 0) + 1;
      if(emp.bloodGroup) bloodGroupDistribution[emp.bloodGroup] = (bloodGroupDistribution[emp.bloodGroup] || 0) + 1;
    });

    const formatChartData = (data: { [key: string]: number }) => Object.entries(data).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    return {
      age: Object.entries(ageDistribution)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      ageByYear: Object.entries(ageYearDistribution)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => Number(a.name) - Number(b.name)),
      area: formatChartData(areaDistribution),
      maleArea: formatChartData(maleAreaDistribution),
      femaleArea: formatChartData(femaleAreaDistribution),
      retirementByYear: Object.entries(retirementYearDistribution)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => Number(a.name) - Number(b.name)),
      department: formatChartData(departmentAnalysis),
      bloodGroup: formatChartData(bloodGroupDistribution),
    }
  }, [employees]);

  return (
    <div className="bg-transparent min-h-screen">
       <header className="sticky top-0 z-10 bg-destructive text-primary-foreground p-4 shadow-md flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold tracking-wider">WORKFORCE ANALYTICS</h1>
      </header>

      <main className="p-4 md:p-6 lg:p-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">TOTAL EMPLOYEES</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.totalEmployees}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">TOTAL MEN</CardTitle>
              <User className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.totalMen}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">TOTAL WOMEN</CardTitle>
              <UserCog className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.totalWomen}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AVG AGE</CardTitle>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.avgAge}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>AGE DISTRIBUTION</CardTitle>
              <CardDescription>5-YEAR INTERVAL ANALYSIS</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={chartData.age}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="value" position="top" />
                    {chartData.age.map((entry, index) => (
                      <Cell key={`age-group-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
            <Card className="col-span-1">
                <CardHeader>
                    <CardTitle>AREA DISTRIBUTION</CardTitle>
                    <CardDescription>SITE WORKFORCE DENSITY</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <RechartsBarChart data={chartData.area} layout="vertical">
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" width={250} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} interval={0} />
                            <Tooltip cursor={{fill: 'transparent'}} />
                            <Bar dataKey="value" layout="vertical" radius={[0, 4, 4, 0]} barSize={15}>
                                <LabelList dataKey="value" position="right" />
                                {chartData.area.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                            </Bar>
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>MALE BY AREA</CardTitle>
                    <CardDescription>MALE EMPLOYEE COUNT BY WORK SITE</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {chartData.maleArea.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsBarChart data={chartData.maleArea} layout="vertical">
                          <XAxis type="number" hide />
                          <YAxis type="category" dataKey="name" width={150} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} interval={0} />
                          <Tooltip cursor={{fill: 'transparent'}} />
                          <Bar dataKey="value" layout="vertical" radius={[0, 4, 4, 0]} barSize={15}>
                            <LabelList dataKey="value" position="right" />
                            {chartData.maleArea.map((entry, index) => (
                              <Cell key={`male-area-${entry.name}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Bar>
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">No male area data available.</p>
                    )}
                  </CardContent>
                </Card>
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>FEMALE BY AREA</CardTitle>
                    <CardDescription>FEMALE EMPLOYEE COUNT BY WORK SITE</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {chartData.femaleArea.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsBarChart data={chartData.femaleArea} layout="vertical">
                          <XAxis type="number" hide />
                          <YAxis type="category" dataKey="name" width={150} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} interval={0} />
                          <Tooltip cursor={{fill: 'transparent'}} />
                          <Bar dataKey="value" layout="vertical" radius={[0, 4, 4, 0]} barSize={15}>
                            <LabelList dataKey="value" position="right" />
                            {chartData.femaleArea.map((entry, index) => (
                              <Cell key={`female-area-${entry.name}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Bar>
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">No female area data available.</p>
                    )}
                  </CardContent>
                </Card>
            <Card className="col-span-1">
                <CardHeader>
                    <CardTitle>DEPARTMENT ANALYSIS</CardTitle>
                    <CardDescription>FUNCTIONAL ALLOCATION</CardDescription>
                </CardHeader>
                <CardContent>
                     <ResponsiveContainer width="100%" height={300}>
                        <RechartsBarChart data={chartData.department} layout="vertical">
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" width={150} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} interval={0}/>
                            <Tooltip cursor={{fill: 'transparent'}} />
                            <Bar dataKey="value" layout="vertical" radius={[0, 4, 4, 0]} barSize={15}>
                                <LabelList dataKey="value" position="right" />
                                {chartData.department.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                            </Bar>
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card className="col-span-1">
                <CardHeader>
                    <CardTitle>BLOOD GROUP DISTRIBUTION</CardTitle>
                    <CardDescription>MEDICAL PROFILE MAPPING</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <RechartsBarChart data={chartData.bloodGroup} layout="vertical">
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={80} interval={0} />
                            <Tooltip cursor={{fill: 'transparent'}} />
                            <Bar dataKey="value" layout="vertical" radius={[0, 4, 4, 0]} barSize={20}>
                                 <LabelList dataKey="value" position="right" />
                                 {chartData.bloodGroup.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                            </Bar>
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>RETIREMENTS BY YEAR</CardTitle>
            <CardDescription>EMPLOYEES REACHING RETIREMENT AGE 58</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.retirementByYear.length > 0 ? (
              <ResponsiveContainer width="100%" height={Math.max(360, chartData.retirementByYear.length * 44)}>
                <RechartsBarChart data={chartData.retirementByYear} layout="vertical" margin={{ left: 8, right: 28 }}>
                  <XAxis type="number" allowDecimals={false} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" width={72} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} interval={0} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="value" layout="vertical" radius={[0, 4, 4, 0]} barSize={26}>
                    <LabelList dataKey="value" position="right" />
                    {chartData.retirementByYear.map((entry, index) => (
                      <Cell key={`retirement-year-${entry.name}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-[360px] items-center justify-center text-sm text-muted-foreground">No retirement data available.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>EMPLOYEES BY AGE</CardTitle>
            <CardDescription>EMPLOYEE COUNT FOR EACH AGE IN YEARS</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.ageByYear.length > 0 ? (
              <ResponsiveContainer width="100%" height={Math.max(360, chartData.ageByYear.length * 40)}>
                <RechartsBarChart data={chartData.ageByYear} layout="vertical" margin={{ left: 8, right: 28 }}>
                  <XAxis type="number" allowDecimals={false} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" width={56} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} interval={0} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="value" layout="vertical" radius={[0, 4, 4, 0]} barSize={24}>
                    <LabelList dataKey="value" position="right" />
                    {chartData.ageByYear.map((entry, index) => (
                      <Cell key={`age-year-${entry.name}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-[360px] items-center justify-center text-sm text-muted-foreground">No age data available.</p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button size="lg" className="bg-destructive hover:bg-destructive/90">
            <FileDown className="mr-2 h-5 w-5" />
            Generate PDF Report
          </Button>
        </div>
      </main>
    </div>
  );
}
