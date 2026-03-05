import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DefaultDashboard = () => (
  <Card>
    <CardHeader>
      <CardTitle className="font-display flex items-center gap-2">
        <Info className="h-5 w-5 text-primary" />
        No Role Assigned
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">
        Your account does not have an assigned role yet. Please contact a Super Admin to be assigned 
        as a PU Admin, Ward Supervisor, LGA Admin, or Auditor.
      </p>
    </CardContent>
  </Card>
);

export default DefaultDashboard;
