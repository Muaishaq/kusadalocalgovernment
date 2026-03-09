import { useEffect, useState } from "react";
import { Info, Vote, Calendar, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface ElectionInfo {
  id: string;
  name: string;
  election_type: string;
  election_date: string;
  status: string;
}

const DefaultDashboard = () => {
  const [elections, setElections] = useState<ElectionInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("elections")
      .select("id, name, election_type, election_date, status")
      .order("election_date", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setElections(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Welcome to the Election Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your account does not have a specific role assigned yet. You can view basic election information below.
            Contact a Super Admin to be assigned a role (PU Admin, Ward Supervisor, LGA Admin, or Auditor).
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Elections
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : elections.length === 0 ? (
            <p className="text-muted-foreground text-sm">No elections have been created yet.</p>
          ) : (
            <div className="space-y-3">
              {elections.map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
                  <div>
                    <p className="font-medium text-card-foreground">{e.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {e.election_type} • {new Date(e.election_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={e.status === "active" ? "default" : "secondary"}>
                    {e.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DefaultDashboard;
