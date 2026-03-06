import { ClipboardList, Upload, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import OfflineStatusBar from "@/components/OfflineStatusBar";

const PUAdminDashboard = () => (
  <div className="space-y-6">
    <OfflineStatusBar />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Pending Submissions</CardTitle>
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-display">0</div>
          <p className="text-xs text-muted-foreground">votes awaiting entry</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Submitted</CardTitle>
          <Upload className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-display">0</div>
          <p className="text-xs text-muted-foreground">results uploaded</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Verified</CardTitle>
          <CheckCircle className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-display">0</div>
          <p className="text-xs text-muted-foreground">confirmed by supervisor</p>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle className="font-display">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <ClipboardList className="mr-2 h-4 w-4" /> Enter Vote Results
        </Button>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" /> Upload Proof Photo
        </Button>
      </CardContent>
    </Card>
  </div>
);

export default PUAdminDashboard;
