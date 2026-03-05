import { Shield, Users, BarChart3, Settings, MapPin, Vote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SuperAdminDashboard = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {[
        { label: "Users", value: "0", icon: Users },
        { label: "Wards", value: "0", icon: MapPin },
        { label: "Polling Units", value: "0", icon: Vote },
        { label: "Elections", value: "0", icon: BarChart3 },
        { label: "Total Votes", value: "0", icon: BarChart3 },
        { label: "System Health", value: "OK", icon: Shield },
      ].map((item) => (
        <Card key={item.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">{item.label}</CardTitle>
            <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold font-display">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Administration</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm"><Users className="mr-2 h-4 w-4" /> Manage Users</Button>
          <Button variant="outline" size="sm"><MapPin className="mr-2 h-4 w-4" /> Manage Wards</Button>
          <Button variant="outline" size="sm"><Settings className="mr-2 h-4 w-4" /> System Settings</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Election Control</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" size="sm">
            <Vote className="mr-2 h-4 w-4" /> Create Election
          </Button>
          <Button variant="outline" size="sm"><BarChart3 className="mr-2 h-4 w-4" /> View Analytics</Button>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default SuperAdminDashboard;
