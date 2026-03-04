import { Link } from "react-router-dom";
import { ArrowRight, Users, MapPin, BookOpen, Heart, Shield, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import heroBg from "@/assets/hero-bg.jpg";

const parties = [
  { name: "APC", full: "All Progressives Congress", color: "bg-primary" },
  { name: "PDP", full: "Peoples Democratic Party", color: "bg-destructive" },
  { name: "LP", full: "Labour Party", color: "bg-accent" },
];

const priorities = [
  { icon: Lightbulb, title: "Education", desc: "Quality education for every child in Kusada" },
  { icon: Heart, title: "Healthcare", desc: "Accessible healthcare facilities across all wards" },
  { icon: Shield, title: "Security", desc: "Community-driven safety and peace initiatives" },
  { icon: MapPin, title: "Infrastructure", desc: "Roads, water, and electricity for rural communities" },
];

const Index = () => (
  <Layout>
    {/* Hero */}
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <img src={heroBg} alt="Campaign rally" className="absolute inset-0 w-full h-full object-cover" />
      <div className="hero-gradient absolute inset-0" />
      <div className="relative z-10 container mx-auto px-4 text-center">
        <p className="text-primary-foreground/80 text-sm font-body tracking-[0.3em] uppercase mb-4">
          Kusada • Katsina State
        </p>
        <h1 className="font-display text-5xl md:text-7xl font-black text-primary-foreground mb-4 leading-tight">
          Aliyu <span className="text-gradient-gold">Ismail</span>
        </h1>
        <p className="text-primary-foreground/90 text-lg md:text-xl max-w-2xl mx-auto mb-8 font-body leading-relaxed">
          A new vision for Kusada. Together, we build a future of progress, 
          accountability, and prosperity for every citizen.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/manifesto">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8">
              Read Manifesto <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <Link to="/register">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-base px-8 font-semibold">
              Join the Movement
            </Button>
          </Link>
        </div>
      </div>
    </section>

    {/* Parties */}
    <section className="py-12 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-center text-2xl font-bold mb-8 text-foreground">Major Political Parties</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {parties.map((p) => (
            <div key={p.name} className="card-political p-6 text-center">
              <div className={`w-12 h-12 rounded-full ${p.color} mx-auto mb-3 flex items-center justify-center`}>
                <span className="text-primary-foreground font-display font-bold text-sm">{p.name}</span>
              </div>
              <h3 className="font-display font-semibold text-card-foreground">{p.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{p.full}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Priorities */}
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">Our Priorities</h2>
        <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">
          Key areas of focus for the people of Kusada Local Government
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {priorities.map((item) => (
            <div key={item.title} className="card-political p-6 text-center group">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <item.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg text-card-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-secondary-foreground mb-4">
          Be Part of the Change
        </h2>
        <p className="text-secondary-foreground/70 max-w-lg mx-auto mb-8">
          Volunteer, donate, or simply spread the word. Every action counts towards a better Kusada.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 font-semibold">
              <Users className="mr-2 w-4 h-4" /> Become a Volunteer
            </Button>
          </Link>
          <Link to="/directory">
            <Button size="lg" variant="outline" className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10 px-8">
              <MapPin className="mr-2 w-4 h-4" /> Find Your Polling Unit
            </Button>
          </Link>
        </div>
      </div>
    </section>
  </Layout>
);

export default Index;
