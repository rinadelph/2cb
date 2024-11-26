import { Layout } from "@/components/Layout";
import { useState } from "react";
import { BarChart, ChevronDown, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { date: '01 Sep', views: 4000, commissionClicks: 2400, conversions: 240 },
  { date: '05 Sep', views: 3000, commissionClicks: 1398, conversions: 139 },
  { date: '10 Sep', views: 2000, commissionClicks: 9800, conversions: 980 },
  { date: '15 Sep', views: 2780, commissionClicks: 3908, conversions: 390 },
  { date: '20 Sep', views: 1890, commissionClicks: 4800, conversions: 480 },
  { date: '25 Sep', views: 2390, commissionClicks: 3800, conversions: 380 },
  { date: '30 Sep', views: 3490, commissionClicks: 4300, conversions: 430 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-800 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("Last 30 days");

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto p-6 space-y-8">
        {/* Implementation Notice */}
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Analytics Implementation in Progress</AlertTitle>
          <AlertDescription className="text-blue-700">
            We're currently implementing real-time analytics. The data shown below is for demonstration purposes.
          </AlertDescription>
        </Alert>

        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Analytics Overview</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {timeRange} <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setTimeRange("Last 7 days")}>
                Last 7 days
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setTimeRange("Last 30 days")}>
                Last 30 days
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setTimeRange("Last 3 months")}>
                Last 3 months
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">254</div>
              <p className="text-xs text-muted-foreground">+12 from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45,231</div>
              <p className="text-xs text-muted-foreground">+20.1% from last week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commission Views</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,203</div>
              <p className="text-xs text-muted-foreground">+18% this week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversions</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">328</div>
              <p className="text-xs text-muted-foreground">+5.3% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Listing Performance Overview</CardTitle>
            <CardDescription>Compare views, commission clicks, and conversions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stackId="1" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    name="Views" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="commissionClicks" 
                    stackId="1" 
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    name="Commission Clicks" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="conversions" 
                    stackId="1" 
                    stroke="#ffc658" 
                    fill="#ffc658" 
                    name="Conversions" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Listings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Listings</CardTitle>
              <CardDescription>Listings with the highest conversion rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { address: "123 Main St, Anytown, USA", views: 1200, commissionClicks: 45, conversions: 15, price: "$450,000" },
                  { address: "456 Elm St, Somewhere, USA", views: 980, commissionClicks: 32, conversions: 12, price: "$375,000" },
                  { address: "789 Oak Ave, Elsewhere, USA", views: 850, commissionClicks: 28, conversions: 10, price: "$525,000" },
                ].map((listing, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{listing.address}</p>
                      <p className="text-sm text-muted-foreground">{listing.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{listing.views} views</p>
                      <p className="text-sm text-muted-foreground">{listing.commissionClicks} commission clicks</p>
                      <p className="text-sm font-medium text-green-600">{listing.conversions} conversions</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest interactions with your listings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: "view", address: "123 Main St", time: "2 minutes ago" },
                  { type: "commission", address: "456 Elm St", time: "15 minutes ago" },
                  { type: "conversion", address: "789 Oak Ave", time: "1 hour ago" },
                  { type: "view", address: "321 Pine St", time: "2 hours ago" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{activity.address}</p>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
} 