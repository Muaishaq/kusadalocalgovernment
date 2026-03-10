import { useEffect, useState } from "react";
import { Shield, Users, BarChart3, MapPin, Vote, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserWithRole {
  userId: string;
  fullName: string | null;
  phone: string | null;
  roles: { role: AppRole; assignedWardId: string | null }[];
  createdAt: string;
}

interface Ward {
  id: string;
  name: string;
}

const ROLE_OPTIONS: AppRole[] = ["pu_admin", "ward_supervisor", "lga_admin", "auditor", "super_admin"];

const SuperAdminDashboard = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningRole, setAssigningRole] = useState<string | null>(null);
  const [stats, setStats] = useState({ users: 0, wards: 0, pus: 0, elections: 0, votes: 0 });
  const [wards, setWards] = useState<Ward[]>([]);
  const [pendingAssign, setPendingAssign] = useState<Record<string, { role: AppRole; wardId?: string }>>({});

  const fetchStats = async () => {
    const [wardRes, puRes, electionRes, voteRes] = await Promise.all([
      supabase.from("wards").select("id", { count: "exact", head: true }),
      supabase.from("polling_units").select("id", { count: "exact", head: true }),
      supabase.from("elections").select("id", { count: "exact", head: true }),
      supabase.from("votes").select("id", { count: "exact", head: true }),
    ]);
    setStats({
      users: 0,
      wards: wardRes.count || 0,
      pus: puRes.count || 0,
      elections: electionRes.count || 0,
      votes: voteRes.count || 0,
    });
  };

  const fetchWards = async () => {
    const { data } = await supabase.from("wards").select("id, name").order("name");
    setWards(data || []);
  };

  const fetchUsers = async () => {
    const [{ data: profiles }, { data: allRoles }] = await Promise.all([
      supabase.from("profiles").select("user_id, full_name, phone, created_at"),
      supabase.from("user_roles").select("user_id, role, assigned_ward_id"),
    ]);

    const roleMap: Record<string, { role: AppRole; assignedWardId: string | null }[]> = {};
    for (const r of allRoles || []) {
      if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
      roleMap[r.user_id].push({ role: r.role, assignedWardId: r.assigned_ward_id });
    }

    const mapped: UserWithRole[] = (profiles || []).map((p) => ({
      userId: p.user_id,
      fullName: p.full_name,
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
    fetchWards();
    fetchUsers();
  }, []);

  const handleRoleSelect = (userId: string, role: AppRole) => {
    if (role === "pu_admin") {
      setPendingAssign((prev) => ({ ...prev, [userId]: { role } }));
    } else {
      assignRole(userId, role);
    }
  };

  const handleWardSelect = (userId: string, wardId: string) => {
    setPendingAssign((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], wardId },
    }));
  };

  const assignRole = async (userId: string, role: AppRole, wardId?: string) => {
    setAssigningRole(userId);
    const insertData: any = { user_id: userId, role };
    if (role === "pu_admin" && wardId) {
      insertData.assigned_ward_id = wardId;
    }
    const { error } = await supabase.from("user_roles").insert(insertData);
    if (error) {
      toast({
        title: error.code === "23505" ? "Role already assigned" : "Error",
        description: error.code === "23505" ? `This user already has the ${role} role.` : error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Role assigned", description: `Successfully assigned ${role.replace("_", " ")} role.` });
      setPendingAssign((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      await fetchUsers();
    }
    setAssigningRole(null);
  };

  const confirmAssign = (userId: string) => {
    const pending = pendingAssign[userId];
    if (!pending || !pending.wardId) {
      toast({ title: "Select a ward", description: "You must select a ward for PU Admin role.", variant: "destructive" });
      return;
    }
    assignRole(userId, pending.role, pending.wardId);
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

  const getWardName = (wardId: string | null) => {
    if (!wardId) return null;
    return wards.find((w) => w.id === wardId)?.name || null;
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
                              key={r.role}
                              className="bg-primary/10 text-primary border-primary/20 cursor-pointer hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
                              onClick={() => handleRemoveRole(u.userId, r.role)}
                              title={`Click to remove ${r.role}`}
                            >
                              {r.role.replace("_", " ")}
                              {r.role === "pu_admin" && r.assignedWardId && (
                                <span className="ml-1 opacity-70">({getWardName(r.assignedWardId) || "ward"})</span>
                              )}
                              {" ×"}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {pendingAssign[u.userId]?.role === "pu_admin" ? (
                          <>
                            <Select onValueChange={(val) => handleWardSelect(u.userId, val)}>
                              <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Select ward..." />
                              </SelectTrigger>
                              <SelectContent>
                                {wards.map((w) => (
                                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              onClick={() => confirmAssign(u.userId)}
                              disabled={assigningRole === u.userId || !pendingAssign[u.userId]?.wardId}
                            >
                              Assign
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setPendingAssign((prev) => {
                                const next = { ...prev };
                                delete next[u.userId];
                                return next;
                              })}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Select
                            onValueChange={(val) => handleRoleSelect(u.userId, val as AppRole)}
                            disabled={assigningRole === u.userId}
                          >
                            <SelectTrigger className="w-[160px]">
                              <SelectValue placeholder="Add role..." />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLE_OPTIONS.filter((r) => !u.roles.some((ur) => ur.role === r)).map((r) => (
                                <SelectItem key={r} value={r}>
                                  {r.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
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
