import { BookOpen, GraduationCap, Heart, Shield, Landmark, Droplets, Zap, Tractor } from "lucide-react";
import Layout from "@/components/Layout";

const manifestoItems = [
  {
    icon: GraduationCap,
    title: "Quality Education",
    points: [
      "Renovate and equip all primary and secondary schools in Kusada",
      "Provide scholarships for indigent students",
      "Establish adult literacy programs across all wards",
      "Partner with TVET institutions for skills acquisition",
    ],
  },
  {
    icon: Heart,
    title: "Healthcare For All",
    points: [
      "Upgrade Primary Healthcare Centers in every ward",
      "Free maternal and child healthcare services",
      "Deploy mobile health clinics to remote areas",
      "Health insurance support for vulnerable populations",
    ],
  },
  {
    icon: Shield,
    title: "Security & Peace",
    points: [
      "Strengthen community policing initiatives",
      "Empower vigilante groups with proper training",
      "Conflict resolution and peacebuilding programs",
      "Install street lighting in key areas",
    ],
  },
  {
    icon: Landmark,
    title: "Good Governance",
    points: [
      "Transparent budgeting and open governance",
      "Regular town hall meetings with constituents",
      "Anti-corruption task force",
      "Youth and women inclusion in decision-making",
    ],
  },
  {
    icon: Droplets,
    title: "Water & Sanitation",
    points: [
      "Drill boreholes in underserved communities",
      "Construct modern sanitation facilities",
      "Water treatment and quality assurance",
      "Environmental sanitation campaigns",
    ],
  },
  {
    icon: Tractor,
    title: "Agriculture & Economy",
    points: [
      "Provide subsidized farming inputs to local farmers",
      "Establish agro-processing centers",
      "Youth empowerment through agricultural training",
      "Micro-credit schemes for small businesses",
    ],
  },
];

const Manifesto = () => (
  <Layout>
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <BookOpen className="w-8 h-8 text-accent" />
          <h1 className="font-display text-4xl md:text-5xl font-black text-secondary-foreground">
            Our <span className="text-gradient-gold">Manifesto</span>
          </h1>
        </div>
        <p className="text-secondary-foreground/70 max-w-2xl mx-auto text-lg">
          A comprehensive plan for the transformation of Kusada Local Government Area, 
          Katsina State. Our commitment to the people.
        </p>
      </div>
    </section>

    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="space-y-8">
          {manifestoItems.map((item, i) => (
            <div key={item.title} className="card-political p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">
                    <span className="text-primary mr-2">{String(i + 1).padStart(2, "0")}.</span>
                    {item.title}
                  </h2>
                  <ul className="space-y-2">
                    {item.points.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </Layout>
);

export default Manifesto;
