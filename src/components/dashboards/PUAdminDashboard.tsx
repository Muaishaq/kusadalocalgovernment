import { useEffect, useState, useRef } from "react";
import { ClipboardList, Upload, CheckCircle, Loader2, MapPin, Send, Camera } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import OfflineStatusBar from "@/components/OfflineStatusBar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface PollingUnit {
  id: string;
  name: string;
  code: string;
  registered_voters: number | null;
}

interface Party {
  id: string;
  name: string;
  abbreviation: string;
}

interface Election {
  id: string;
  name: string;
}

interface VoteEntry {
  partyId: string;
  count: string;
}

const PUAdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [wardName, setWardName] = useState("");
  const [pollingUnits, setPollingUnits] = useState<PollingUnit[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPU, setSelectedPU] = useState<PollingUnit | null>(null);
  const [selectedPUId, setSelectedPUId] = useState("");
  const [selectedElection, setSelectedElection] = useState("");
  const [voteEntries, setVoteEntries] = useState<VoteEntry[]>([]);
  const [accreditedVoters, setAccreditedVoters] = useState("");
  const [invalidVotes, setInvalidVotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedPUs, setSubmittedPUs] = useState<Set<string>>(new Set());
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("assigned_ward_id")
          .eq("user_id", user.id)
          .eq("role", "pu_admin")
          .single();

        if (roleError || !roleData?.assigned_ward_id) {
          console.error("Role fetch error:", roleError);
          setLoading(false);
          return;
        }

        const wardId = roleData.assigned_ward_id;

        const [wardRes, puRes, partyRes, electionRes] = await Promise.all([
          supabase.from("wards").select("name").eq("id", wardId).single(),
          supabase.from("polling_units").select("id, name, code, registered_voters").eq("ward_id", wardId).order("name"),
          supabase.from("parties").select("id, name, abbreviation").order("abbreviation"),
          supabase.from("elections").select("id, name").eq("status", "ongoing"),
        ]);

        setWardName(wardRes.data?.name || "");
        setPollingUnits(puRes.data || []);
        setParties(partyRes.data || []);
        setElections(electionRes.data || []);

        if (electionRes.data?.length) {
          const electionId = electionRes.data[0].id;
          setSelectedElection(electionId);

          const { data: existingVotes } = await supabase
            .from("votes")
            .select("polling_unit_id")
            .eq("election_id", electionId)
            .eq("submitted_by", user.id);

          if (existingVotes) {
            setSubmittedPUs(new Set(existingVotes.map((v) => v.polling_unit_id)));
          }
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handlePUSelect = (puId: string) => {
    setSelectedPUId(puId);
    const pu = pollingUnits.find((p) => p.id === puId);
    if (pu) {
      setSelectedPU(pu);
      setVoteEntries(parties.map((p) => ({ partyId: p.id, count: "" })));
      setAccreditedVoters("");
      setInvalidVotes("");
      setProofFile(null);
      setProofPreview(null);
      setDialogOpen(true);
    }
  };

  const updateVoteCount = (partyId: string, count: string) => {
    setVoteEntries((prev) => prev.map((e) => (e.partyId === partyId ? { ...e, count } : e)));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      toast({ title: "Invalid file", description: "Please upload an image or PDF.", variant: "destructive" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 10MB.", variant: "destructive" });
      return;
    }

    setProofFile(file);
    if (file.type.startsWith("image/")) {
      setProofPreview(URL.createObjectURL(file));
    } else {
      setProofPreview(null);
    }
  };

  const uploadProof = async (): Promise<string | null> => {
    if (!proofFile || !user || !selectedPU) return null;

    setUploading(true);
    const ext = proofFile.name.split(".").pop();
    const path = `${user.id}/${selectedPU.id}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("vote-proofs")
      .upload(path, proofFile, { cacheControl: "3600", upsert: false });

    setUploading(false);

    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return null;
    }

    const { data: urlData } = supabase.storage.from("vote-proofs").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleSubmitVotes = async () => {
    if (!selectedPU || !selectedElection || !user) return;

    const hasVotes = voteEntries.some((e) => e.count && parseInt(e.count) > 0);
    if (!hasVotes) {
      toast({ title: "Enter vote counts", description: "Please enter at least one party's vote count.", variant: "destructive" });
      return;
    }

    if (!proofFile) {
      toast({ title: "Proof required", description: "Please upload a photo/scan of the result sheet.", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    const proofUrl = await uploadProof();
    if (!proofUrl) {
      setSubmitting(false);
      return;
    }

    const inserts = voteEntries
      .filter((e) => e.count && parseInt(e.count) >= 0)
      .map((e) => ({
        election_id: selectedElection,
        polling_unit_id: selectedPU.id,
        party_id: e.partyId,
        votes_count: parseInt(e.count),
        submitted_by: user.id,
        accredited_voters: accreditedVoters ? parseInt(accreditedVoters) : null,
        invalid_votes: invalidVotes ? parseInt(invalidVotes) : null,
        photo_proof_url: proofUrl,
      }));

    const { error } = await supabase.from("votes").insert(inserts);

    if (error) {
      toast({ title: "Submission failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Votes submitted", description: `Results for ${selectedPU.name} recorded with proof.` });
      setSubmittedPUs((prev) => new Set([...prev, selectedPU.id]));
      setDialogOpen(false);
      setSelectedPU(null);
      setSelectedPUId("");
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!wardName) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No ward has been assigned to your account. Contact the Super Admin.</p>
        </CardContent>
      </Card>
    );
  }

  const pendingCount = pollingUnits.length - submittedPUs.size;
  const availablePUs = pollingUnits.filter((pu) => !submittedPUs.has(pu.id));

  return (
    <div className="space-y-6">
      <OfflineStatusBar />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Submissions</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">polling units awaiting entry</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Submitted</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">{submittedPUs.size}</div>
            <p className="text-xs text-muted-foreground">results uploaded</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assigned Ward</CardTitle>
            <MapPin className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">{wardName}</div>
            <p className="text-xs text-muted-foreground">Kusada LGA</p>
          </CardContent>
        </Card>
      </div>

      {/* Polling Unit Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <MapPin className="h-5 w-5" /> Select Polling Unit — {wardName} Ward
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {elections.length === 0 && (
            <p className="text-muted-foreground text-sm">No active election found. Vote entry is disabled.</p>
          )}

          {pollingUnits.length === 0 ? (
            <p className="text-muted-foreground text-sm">No polling units found for this ward.</p>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Choose a Polling Unit to submit results</Label>
                <Select
                  value={selectedPUId}
                  onValueChange={handlePUSelect}
                  disabled={elections.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a polling unit..." />
                  </SelectTrigger>
                  <SelectContent>
                    {pollingUnits.map((pu) => {
                      const submitted = submittedPUs.has(pu.id);
                      return (
                        <SelectItem key={pu.id} value={pu.id} disabled={submitted}>
                          {pu.code} — {pu.name} {submitted ? "✓" : ""} ({pu.registered_voters ?? 0} voters)
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Status overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {pollingUnits.map((pu) => {
                  const submitted = submittedPUs.has(pu.id);
                  return (
                    <div
                      key={pu.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        submitted
                          ? "bg-primary/5 border-primary/20"
                          : "bg-card hover:bg-accent/50 border-border"
                      }`}
                      onClick={() => !submitted && elections.length > 0 && handlePUSelect(pu.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-muted-foreground">{pu.code}</span>
                        {submitted ? (
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" /> Done
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Pending</Badge>
                        )}
                      </div>
                      <p className="font-medium text-sm mt-1">{pu.name}</p>
                      <p className="text-xs text-muted-foreground">{pu.registered_voters ?? 0} registered voters</p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Vote Entry Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { setDialogOpen(false); setSelectedPU(null); setSelectedPUId(""); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              Enter Vote Results — {selectedPU?.name}
            </DialogTitle>
            <p className="text-xs text-muted-foreground">{selectedPU?.code}</p>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Accredited Voters</Label>
                <Input type="number" min="0" value={accreditedVoters} onChange={(e) => setAccreditedVoters(e.target.value)} placeholder="0" />
              </div>
              <div>
                <Label>Invalid/Void Votes</Label>
                <Input type="number" min="0" value={invalidVotes} onChange={(e) => setInvalidVotes(e.target.value)} placeholder="0" />
              </div>
            </div>

            <div className="border rounded-lg divide-y">
              {parties.map((party) => {
                const entry = voteEntries.find((e) => e.partyId === party.id);
                return (
                  <div key={party.id} className="flex items-center justify-between p-3">
                    <div>
                      <span className="font-semibold text-sm">{party.abbreviation}</span>
                      <span className="text-muted-foreground text-xs ml-2">{party.name}</span>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      className="w-24 text-right"
                      value={entry?.count || ""}
                      onChange={(e) => updateVoteCount(party.id, e.target.value)}
                      placeholder="0"
                    />
                  </div>
                );
              })}
            </div>

            {/* Photo Proof Upload */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Camera className="h-4 w-4" /> Result Sheet Proof <span className="text-destructive">*</span>
              </Label>
              <p className="text-xs text-muted-foreground">Upload a clear photo or scan of the official result sheet.</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4 mr-2" />
                {proofFile ? proofFile.name : "Take Photo / Upload Document"}
              </Button>
              {proofPreview && (
                <img
                  src={proofPreview}
                  alt="Result sheet preview"
                  className="w-full max-h-48 object-contain rounded-lg border"
                />
              )}
              {proofFile && !proofPreview && (
                <div className="p-3 rounded-lg border bg-muted text-sm text-muted-foreground text-center">
                  PDF document selected: {proofFile.name}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); setSelectedPU(null); setSelectedPUId(""); }}>Cancel</Button>
            <Button onClick={handleSubmitVotes} disabled={submitting || uploading}>
              {(submitting || uploading) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Submit Results
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PUAdminDashboard;
