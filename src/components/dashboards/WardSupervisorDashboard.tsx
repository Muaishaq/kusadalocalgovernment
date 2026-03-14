import { useEffect, useState } from "react";
import { Eye, CheckCircle, AlertTriangle, BarChart3, Loader2, FileImage, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PUResult {
  polling_unit_name: string;
  polling_unit_code: string;
  party_abbreviation: string;
  votes_count: number;
  accredited_voters: number | null;
  invalid_votes: number | null;
  is_verified: boolean | null;
  submitted_at: string;
  photo_proof_url: string | null;
}

const WardSupervisorDashboard = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<PUResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [wardName, setWardName] = useState("");
  const [proofUrl, setProofUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchResults = async () => {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("assigned_ward_id")
        .eq("user_id", user.id)
        .eq("role", "ward_supervisor")
        .single();

      const wardId = roleData?.assigned_ward_id;
      if (!wardId) { setLoading(false); return; }

      const { data: ward } = await supabase.from("wards").select("name").eq("id", wardId).single();
      setWardName(ward?.name || "");

      const { data: pus } = await supabase.from("polling_units").select("id, name, code").eq("ward_id", wardId);
      if (!pus || pus.length === 0) { setLoading(false); return; }

      const puIds = pus.map((p) => p.id);

      const [{ data: votes }, { data: parties }] = await Promise.all([
        supabase
          .from("votes")
          .select("polling_unit_id, party_id, votes_count, accredited_voters, invalid_votes, is_verified, created_at, photo_proof_url")
          .in("polling_unit_id", puIds),
        supabase.from("parties").select("id, abbreviation"),
      ]);

      const partyMap = Object.fromEntries((parties || []).map((p) => [p.id, p.abbreviation]));
      const puMap = Object.fromEntries(pus.map((p) => [p.id, { name: p.name, code: p.code }]));

      const mapped: PUResult[] = (votes || []).map((v) => ({
        polling_unit_name: puMap[v.polling_unit_id]?.name || "Unknown",
        polling_unit_code: puMap[v.polling_unit_id]?.code || "",
        party_abbreviation: partyMap[v.party_id] || "Unknown",
        votes_count: v.votes_count,
        accredited_voters: v.accredited_voters,
        invalid_votes: v.invalid_votes,
        is_verified: v.is_verified,
        submitted_at: v.created_at,
        photo_proof_url: v.photo_proof_url,
      }));

      setResults(mapped);
      setLoading(false);
    };

    fetchResults();
  }, [user]);

  const totalVotes = results.reduce((sum, r) => sum + r.votes_count, 0);
  const totalVerified = results.filter((r) => r.is_verified).length;
  const uniquePUs = new Set(results.map((r) => r.polling_unit_code)).size;

  const partyTotals = results.reduce<Record<string, number>>((acc, r) => {
    acc[r.party_abbreviation] = (acc[r.party_abbreviation] || 0) + r.votes_count;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {wardName && <p className="text-sm font-medium text-primary">Ward: {wardName}</p>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Polling Units</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">{uniquePUs}</div>
            <p className="text-xs text-muted-foreground">with results</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Votes</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">{totalVotes.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">{totalVerified}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">{results.length - totalVerified}</div>
          </CardContent>
        </Card>
      </div>

      {Object.keys(partyTotals).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="font-display text-lg">Aggregate Results by Party</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Object.entries(partyTotals).sort((a, b) => b[1] - a[1]).map(([party, votes]) => (
                <div key={party} className="rounded-lg border bg-card p-4 text-center">
                  <p className="text-xs font-medium text-muted-foreground">{party}</p>
                  <p className="text-xl font-bold font-display mt-1">{votes.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="font-display text-lg">Polling Unit Breakdown</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : results.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">No results submitted yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Polling Unit</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead className="text-right">Votes</TableHead>
                  <TableHead className="text-right">Accredited</TableHead>
                  <TableHead className="text-right">Invalid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Proof</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{r.polling_unit_name}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{r.polling_unit_code}</TableCell>
                    <TableCell><Badge variant="outline">{r.party_abbreviation}</Badge></TableCell>
                    <TableCell className="text-right font-mono">{r.votes_count.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">{r.accredited_voters?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell className="text-right font-mono">{r.invalid_votes?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell>
                      {r.is_verified ? (
                        <Badge className="bg-primary/10 text-primary border-primary/20">Verified</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {r.photo_proof_url ? (
                        <Button size="sm" variant="ghost" onClick={() => setProofUrl(r.photo_proof_url)}>
                          <FileImage className="h-4 w-4 mr-1" /> View
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-xs">None</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Proof Viewer Modal */}
      <Dialog open={!!proofUrl} onOpenChange={(open) => !open && setProofUrl(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <FileImage className="h-5 w-5" /> Result Sheet Proof
            </DialogTitle>
          </DialogHeader>
          {proofUrl && (
            proofUrl.endsWith(".pdf") ? (
              <iframe src={proofUrl} className="w-full h-[70vh] rounded-lg border" title="Proof document" />
            ) : (
              <img src={proofUrl} alt="Result sheet proof" className="w-full max-h-[70vh] object-contain rounded-lg" />
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WardSupervisorDashboard;
