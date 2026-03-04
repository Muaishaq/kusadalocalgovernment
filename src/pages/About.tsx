import { Award, Users, Target, Calendar } from "lucide-react";
import Layout from "@/components/Layout";

const milestones = [
  { year: "Education", desc: "Graduate of Political Science with a passion for public service" },
  { year: "Community", desc: "Over 10 years of grassroots community development in Kusada" },
  { year: "Leadership", desc: "Proven track record of transparent and accountable leadership" },
  { year: "Vision", desc: "Committed to building a prosperous Kusada for all citizens" },
];

const About = () => (
  <Layout>
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-black text-secondary-foreground mb-4">
          About <span className="text-gradient-gold">Aliyu Ismail</span>
        </h1>
        <p className="text-secondary-foreground/70 max-w-2xl mx-auto text-lg">
          A son of Kusada. A servant of the people. A leader for tomorrow.
        </p>
      </div>
    </section>

    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-6">The Man Behind the Mission</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Aliyu Ismail is a dedicated public servant born and raised in Kusada Local Government Area 
                of Katsina State, Nigeria. His deep understanding of the challenges facing the people of 
                Kusada drives his unwavering commitment to transformative governance.
              </p>
              <p>
                With extensive experience in community development and grassroots mobilization, 
                Aliyu has demonstrated a consistent ability to listen to the people, understand their needs, 
                and deliver practical solutions that make a real difference.
              </p>
              <p>
                His vision for Kusada is rooted in the belief that every citizen deserves access to 
                quality education, healthcare, security, and economic opportunities — regardless of 
                their background or circumstances.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {milestones.map((m) => (
              <div key={m.year} className="card-political p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-card-foreground">{m.year}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    <section className="py-16 bg-muted">
      <div className="container mx-auto px-4 text-center max-w-3xl">
        <h2 className="font-display text-3xl font-bold text-foreground mb-6">Core Values</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Target, label: "Integrity", desc: "Honesty and transparency in all dealings" },
            { icon: Users, label: "Service", desc: "Putting the people first, always" },
            { icon: Calendar, label: "Accountability", desc: "Delivering on every promise made" },
          ].map((v) => (
            <div key={v.label} className="card-political p-6 text-center">
              <v.icon className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-display font-semibold text-card-foreground mb-1">{v.label}</h3>
              <p className="text-sm text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </Layout>
);

export default About;
