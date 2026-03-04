import { useState } from "react";
import { MapPin, Search, Building } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Layout from "@/components/Layout";
import { lgas, getPollingUnitsByLGA } from "@/data/pollingUnits";

const Directory = () => {
  const [selectedLGA, setSelectedLGA] = useState("Kusada");
  const [search, setSearch] = useState("");

  const units = getPollingUnitsByLGA(selectedLGA);
  const filtered = units.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.ward.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <MapPin className="w-10 h-10 text-accent mx-auto mb-4" />
          <h1 className="font-display text-4xl md:text-5xl font-black text-secondary-foreground mb-4">
            Find Your <span className="text-gradient-gold">Polling Unit</span>
          </h1>
          <p className="text-secondary-foreground/70 max-w-xl mx-auto">
            Select your Local Government Area to find all registered polling units in Katsina State.
          </p>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground mb-2 block">Local Government Area</label>
              <Select value={selectedLGA} onValueChange={(v) => { setSelectedLGA(v); setSearch(""); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select LGA" />
                </SelectTrigger>
                <SelectContent>
                  {lgas.map((lga) => (
                    <SelectItem key={lga.name} value={lga.name}>
                      {lga.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or ward..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="mb-4 flex items-center gap-2">
            <Building className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              {filtered.length} polling unit{filtered.length !== 1 ? "s" : ""} found in <strong className="text-foreground">{selectedLGA}</strong>
            </span>
          </div>

          {filtered.length > 0 ? (
            <div className="grid gap-3">
              {filtered.map((unit) => (
                <div key={unit.id} className="card-political p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-card-foreground truncate">{unit.name}</h3>
                    <p className="text-sm text-muted-foreground">Ward: {unit.ward} • ID: {unit.id}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No polling units found{search ? " matching your search" : " for this LGA"}.</p>
              <p className="text-sm mt-1">Data will be expanded when connected to the database.</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Directory;
