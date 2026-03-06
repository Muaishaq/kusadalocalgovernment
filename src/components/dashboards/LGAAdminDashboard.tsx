import { useEffect, useState } from "react";
import { BarChart3, Users, MapPin, TrendingUp, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface WardAggregate {
  wardName: string;
  totalVotes: number;
  puCount: number;
  verified: number;
  pending: number;
  partyBreakdown: Record<string, number>;
}

interface PUDetail {
  puName: string;
  puCode: string;
  wardName: string;
  party: string;
  votes: number;
  accredited: number | null;
  invalid: number | null;
  verified: boolean | null;
}

const LGAAdminDashboard = () => {
  const { user } = useAuth();
  const [wardAggregates, setWardAggregates] = useState<WardAggregate[]>([]);
  const [puDetails, setPuDetails] = useState<PUDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [lgaName, setLgaName] = useState("");
  const [parties, setParties] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Get assigned LGA
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("assigned_lga_id")
        .eq("user_id", user.id)
        .eq("role", "lga_admin")
        .single();

      const lgaId = roleData?.assigned_lga_id;
      if (!lgaId) {
        setLoading(false);
        return;
      }

      const { data: lga } = await supabase.from("lgas").select("name").eq("id", lgaId).single();
      setLgaName(lga?.name || "");

      // Get wards in this LGA
      const { data: wards } = await supabase.from("wards").select("id, name").eq("lga_id", lgaId);
      if (!wards || wards.length === 0) { setLoading(false); return; }

      const wardIds = wards.map((w) => w.id);
      const wardMap = Object.fromEntries(wards.map((w) => [w.id, w.name]));

      // Get PUs in these wards
      const { data: pus } = await supabase
        .from("polling_units")
        .select("id, name, code, ward_id")
        .in("ward_id", wardIds);

      if (!pus || pus.length === 0) { setLoading(false); return; }

      const puIds = pus.map((p) => p.id);
      const puMap = Object.fromEntries(pus.map((p) => [p.id, { name: p.name, code: p.code, wardId: p.ward_id }]));

      // Get votes & parties
      const [{ data: votes }, { data: partyData }] = await Promise.all([
        supabase.from("votes").select("*").in("polling_unit_id", puIds),
        supabase.from("parties").select("id, abbreviation"),
      ]);

      const partyMap = Object.fromEntries((partyData || []).map((p) => [p.id, p.abbreviation]));
      const allParties = [...new Set((partyData || []).map((p) => p.abbreviation))];
      setParties(allParties);

      // Build PU details
      const details: PUDetail[] = (votes || []).map((v) => ({
        puName: puMap[v.polling_unit_id]?.name || "Unknown",
        puCode: puMap[v.polling_unit_id]?.code || "",
        wardName: wardMap[puMap[v.polling_unit_id]?.wardId] || "Unknown",
        party: partyMap[v.party_id] || "Unknown",
        votes: v.votes_count,
        accredited: v.accredited_voters,
        invalid: v.invalid_votes,
        verified: v.is_verified,
      }));
      setPuDetails(details);

      // Build ward aggregates
      const aggMap: Record<string, WardAggregate> = {};
      for (const w of wards) {
        aggMap[w.id] = {
          wardName: w.name,
          totalVotes: 0,
          puCount: pus.filter((p) => p.ward_id === w.id).length,
          verified: 0,
          pending: 0,
          partyBreakdown: {},
        };
      }

      for (const v of votes || []) {
        const wardId = puMap[v.polling_unit_id]?.wardId;
        if (!wardId || !aggMap[wardId]) continue;
        aggMap[wardId].totalVotes += v.votes_count;
        const party = partyMap[v.party_id] || "Unknown";
        aggMap[wardId].partyBreakdown[party] = (aggMap[wardId].partyBreakdown[party] || 0) + v.votes_count;
        if (v.is_verified) aggMap[wardId].verified++;
        else aggMap[wardId].pending++;
      }

      setWardAggregates(Object.values(aggMap));
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const totalVotes = wardAggregates.reduce((s, w) => s + w.totalVotes, 0);
  const totalWards = wardAggregates.length;
  const totalPUs = wardAggregates.reduce((s, w) => s + w.puCount, 0);
  const totalVerified = wardAggregates.reduce((s, w) => s + w.verified, 0);
  const totalEntries = wardAggregates.reduce((s, w) => s + w.verified + w.pending, 0);

  // Chart data
  const chartData = wardAggregates
    .filter((w) => w.totalVotes > 0)
    .map((w) => ({ ward: w.wardName, ...w.partyBreakdown }));

  const chartConfig = Object.fromEntries(
    parties.map((p, i) => {
      const colors = [
        "hsl(var(--primary))",
        "hsl(var(--destructive))",
        "hsl(var(--accent))",
        "hsl(142 76% 36%)",
        "hsl(48 96% 53%)",
        "hsl(280 65% 60%)",
      ];
      return [p, { label: p, color: colors[i % colors.length] }];
    })
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {lgaName && <p className="text-sm font-medium text-primary">LGA: {lgaName}</p>}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Wards</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">{totalWards}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total PUs</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">{totalPUs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Votes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">{totalVotes.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verified</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">
              {totalEntries > 0 ? Math.round((totalVerified / totalEntries) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">{totalVerified} of {totalEntries} entries</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="chart" className="space-y-4">
        <TabsList>
          <TabsTrigger value="chart">Chart View</TabsTrigger>
          <TabsTrigger value="wards">Ward Summary</TabsTrigger>
          <TabsTrigger value="details">PU Breakdown</TabsTrigger>
        </TabsList>

        {/* Bar Chart */}
        <TabsContent value="chart">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Votes by Ward & Party</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4">No vote data available yet.</p>
              ) : (
                <ChartContainer config={chartConfig} className="h-[350px] w-full">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis dataKey="ward" angle={-35} textAnchor="end" fontSize={11} />
                    <YAxis fontSize={11} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    {parties.map((p) => (
                      <Bar key={p} dataKey={p} stackId="votes" fill={`var(--color-${p})`} radius={[2, 2, 0, 0]} />
                    ))}
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ward Summary Table */}
        <TabsContent value="wards">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Ward-Level Aggregates</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ward</TableHead>
                    <TableHead className="text-right">PUs</TableHead>
                    <TableHead className="text-right">Total Votes</TableHead>
                    {parties.map((p) => (
                      <TableHead key={p} className="text-right">{p}</TableHead>
                    ))}
                    <TableHead className="text-right">Verified</TableHead>
                    <TableHead className="text-right">Pending</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wardAggregates.map((w) => (
                    <TableRow key={w.wardName}>
                      <TableCell className="font-medium">{w.wardName}</TableCell>
                      <TableCell className="text-right font-mono">{w.puCount}</TableCell>
                      <TableCell className="text-right font-mono font-bold">{w.totalVotes.toLocaleString()}</TableCell>
                      {parties.map((p) => (
                        <TableCell key={p} className="text-right font-mono">
                          {(w.partyBreakdown[p] || 0).toLocaleString()}
                        </TableCell>
                      ))}
                      <TableCell className="text-right">
                        <Badge className="bg-primary/10 text-primary border-primary/20">{w.verified}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{w.pending}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PU Detail Table */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Individual PU Results</CardTitle>
            </CardHeader>
            <CardContent>
              {puDetails.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4">No results submitted yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ward</TableHead>
                      <TableHead>Polling Unit</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Party</TableHead>
                      <TableHead className="text-right">Votes</TableHead>
                      <TableHead className="text-right">Accredited</TableHead>
                      <TableHead className="text-right">Invalid</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {puDetails.map((r, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-muted-foreground text-sm">{r.wardName}</TableCell>
                        <TableCell className="font-medium">{r.puName}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{r.puCode}</TableCell>
                        <TableCell><Badge variant="outline">{r.party}</Badge></TableCell>
                        <TableCell className="text-right font-mono">{r.votes.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-mono">{r.accredited?.toLocaleString() ?? "—"}</TableCell>
                        <TableCell className="text-right font-mono">{r.invalid?.toLocaleString() ?? "—"}</TableCell>
                        <TableCell>
                          {r.verified ? (
                            <Badge className="bg-primary/10 text-primary border-primary/20">Verified</Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LGAAdminDashboard;
