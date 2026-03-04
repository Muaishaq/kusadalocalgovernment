export interface PollingUnit {
  id: string;
  name: string;
  ward: string;
  lga: string;
}

export interface LGA {
  name: string;
  state: string;
}

// Katsina State LGAs
export const lgas: LGA[] = [
  { name: "Bakori", state: "Katsina" },
  { name: "Batagarawa", state: "Katsina" },
  { name: "Batsari", state: "Katsina" },
  { name: "Baure", state: "Katsina" },
  { name: "Bindawa", state: "Katsina" },
  { name: "Charanchi", state: "Katsina" },
  { name: "Dan Musa", state: "Katsina" },
  { name: "Dandume", state: "Katsina" },
  { name: "Danja", state: "Katsina" },
  { name: "Daura", state: "Katsina" },
  { name: "Dutsi", state: "Katsina" },
  { name: "Dutsin-Ma", state: "Katsina" },
  { name: "Faskari", state: "Katsina" },
  { name: "Funtua", state: "Katsina" },
  { name: "Ingawa", state: "Katsina" },
  { name: "Jibia", state: "Katsina" },
  { name: "Kafur", state: "Katsina" },
  { name: "Kaita", state: "Katsina" },
  { name: "Kankara", state: "Katsina" },
  { name: "Kankia", state: "Katsina" },
  { name: "Katsina", state: "Katsina" },
  { name: "Kurfi", state: "Katsina" },
  { name: "Kusada", state: "Katsina" },
  { name: "Mai'Adua", state: "Katsina" },
  { name: "Malumfashi", state: "Katsina" },
  { name: "Mani", state: "Katsina" },
  { name: "Mashi", state: "Katsina" },
  { name: "Matazu", state: "Katsina" },
  { name: "Musawa", state: "Katsina" },
  { name: "Rimi", state: "Katsina" },
  { name: "Sabuwa", state: "Katsina" },
  { name: "Safana", state: "Katsina" },
  { name: "Sandamu", state: "Katsina" },
  { name: "Zango", state: "Katsina" },
];

// Sample polling units for Kusada and a few other LGAs
export const pollingUnits: PollingUnit[] = [
  // Kusada
  { id: "KUS-001", name: "Kusada Central Primary School", ward: "Kusada", lga: "Kusada" },
  { id: "KUS-002", name: "Kusada Town Hall", ward: "Kusada", lga: "Kusada" },
  { id: "KUS-003", name: "Garhi Primary School", ward: "Garhi", lga: "Kusada" },
  { id: "KUS-004", name: "Garhi Market Square", ward: "Garhi", lga: "Kusada" },
  { id: "KUS-005", name: "Burdugau Primary School", ward: "Burdugau", lga: "Kusada" },
  { id: "KUS-006", name: "Burdugau Village Head's House", ward: "Burdugau", lga: "Kusada" },
  { id: "KUS-007", name: "Kanawa Islamiyya School", ward: "Kanawa", lga: "Kusada" },
  { id: "KUS-008", name: "Kanawa Junction", ward: "Kanawa", lga: "Kusada" },
  { id: "KUS-009", name: "Wurma Primary School", ward: "Wurma", lga: "Kusada" },
  { id: "KUS-010", name: "Wurma Community Center", ward: "Wurma", lga: "Kusada" },
  { id: "KUS-011", name: "Mazoji Primary School", ward: "Mazoji", lga: "Kusada" },
  { id: "KUS-012", name: "Mazoji Market", ward: "Mazoji", lga: "Kusada" },
  { id: "KUS-013", name: "Dandire Village Square", ward: "Dandire", lga: "Kusada" },
  { id: "KUS-014", name: "Dandire Primary School", ward: "Dandire", lga: "Kusada" },
  { id: "KUS-015", name: "Jikamshi Primary School", ward: "Jikamshi", lga: "Kusada" },
  // Katsina LGA
  { id: "KAT-001", name: "Katsina Central Mosque Area", ward: "Katsina A", lga: "Katsina" },
  { id: "KAT-002", name: "GRA Primary School", ward: "Katsina B", lga: "Katsina" },
  { id: "KAT-003", name: "Kofar Marusa Primary School", ward: "Kofar Marusa", lga: "Katsina" },
  // Daura LGA
  { id: "DAU-001", name: "Daura Central Primary School", ward: "Daura A", lga: "Daura" },
  { id: "DAU-002", name: "Sandamu Road Junction", ward: "Daura B", lga: "Daura" },
  // Funtua LGA
  { id: "FUN-001", name: "Funtua Central Market", ward: "Funtua A", lga: "Funtua" },
  { id: "FUN-002", name: "Funtua Railway Station", ward: "Funtua B", lga: "Funtua" },
  // Malumfashi
  { id: "MAL-001", name: "Malumfashi Town Hall", ward: "Malumfashi A", lga: "Malumfashi" },
  // Dutsin-Ma
  { id: "DUT-001", name: "Dutsin-Ma Central School", ward: "Dutsin-Ma A", lga: "Dutsin-Ma" },
];

export function getPollingUnitsByLGA(lgaName: string): PollingUnit[] {
  return pollingUnits.filter((pu) => pu.lga === lgaName);
}
