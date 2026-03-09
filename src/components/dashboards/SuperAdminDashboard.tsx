import { useEffect, useState } from "react";
import { Shield, Users, BarChart3, Settings, MapPin, Vote, Loader2, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserWithRole {
  userId: string;
  fullName: string | null;
  email: string;
  phone: string | null;
  roles: AppRole[];
  createdAt: string;
}

const ROLE_OPTIONS: AppRole[] = ["pu_admin", "ward_supervisor", "lga_admin", "auditor", "super_admin"];

const SuperAdminDashboard = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningRole, setAssigningRole] = useState<string | null>(null);
  const [stats, setStats] = useState({ users: 0, wards: 0, pus: 0, elections: 0, votes: 0 });

  const fetchStats = async () => {
    const [wardRes, puRes, electionRes, voteRes] = await Promise.all([
      supabase.from("wards").select("id", { count: "exact", head: true }),
      supabase.from("polling_units").select("id", { count: "exact", head: true }),
      supabase.from("elections").select("id", { count: "exact", head: true }),
      supabase.from("votes").select("id", { count: "exact", head: true }),
    ]);
    setStats({
      users: 0, // will be set from profiles
      wards: wardRes.count || 0,
      pus: puRes.count || 0,
      elections: electionRes.count || 0,
      votes: voteRes.count || 0,
    });
  };

  const fetchUsers = async () => {
    // Get all profiles
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, full_name, phone, created_at");

    if (profileError) {
      console.error("Error fetching profiles:", profileError);
      setLoading(false);
      return;
    }

    // Get all roles
    const { data: allRoles } = await supabase.from("user_roles").select("user_id, role");

    const roleMap: Record<string, AppRole[]> = {};
    for (const r of allRoles || []) {
      if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
      roleMap[r.user_id].push(r.role);
    }

    const mapped: UserWithRole[] = (profiles || []).map((p) => ({
      userId: p.user_id,
      fullName: p.full_name,
      email: "", // we don't have access to auth.users email from client
      phone: p.phone,
      roles: roleMap[p.user_id] || [],
      createdAt: p.created_at,
    }));

    setUsers(mapped);
    setStats((prev) => ({ ...prev, users: mapped.length }));
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  const handleAssignRole = async (userId: string, role: AppRole) => {
    setAssigningRole(userId);
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) {
      if (error.code === "23505") {
        toast({ title: "Role already assigned", description: `This user already has the ${role} role.`, variant: "destructive" });
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    } else {
      toast({ title: "Role assigned", description: `Successfully assigned ${role.replace("_", " ")} role.` });
      await fetchUsers();
    }
    setAssigningRole(null);
  };

  const handleRemoveRole = async (userId: string, role: AppRole) => {
    setAssigningRole(userId);
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Role removed", description: `Removed ${role.replace("_", " ")} role.` });
      await fetchUsers();
    }
    setAssigningRole(null);
  };

  const statCards = [
    { label: "Users", value: stats.users.toString(), icon: Users },
    { label: "Wards", value: stats.wards.toString(), icon: MapPin },
    { label: "Polling Units", value: stats.pus.toString(), icon: Vote },
    { label: "Elections", value: stats.elections.toString(), icon: BarChart3 },
    { label: "Total Votes", value: stats.votes.toString(), icon: BarChart3 },
    { label: "System Health", value: "OK", icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((item) => (
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

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Users className="h-5 w-5" /> User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground text-sm">No registered users found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Current Roles</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Assign Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.userId}>
                    <TableCell className="font-medium">{u.fullName || "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{u.phone || "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {u.roles.length === 0 ? (
                          <Badge variant="secondary">No role</Badge>
                        ) : (
                          u.roles.map((r) => (
                            <Badge
                              key={r}
                              className="bg-primary/10 text-primary border-primary/20 cursor-pointer hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
                              onClick={() => handleRemoveRole(u.userId, r)}
                              title={`Click to remove ${r}`}
                            >
                              {r.replace("_", " ")} ×
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Select
                        onValueChange={(val) => handleAssignRole(u.userId, val as AppRole)}
                        disabled={assigningRole === u.userId}
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue placeholder="Add role..." />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.filter((r) => !u.roles.includes(r)).map((r) => (
                            <SelectItem key={r} value={r}>
                              {r.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminDashboard;
