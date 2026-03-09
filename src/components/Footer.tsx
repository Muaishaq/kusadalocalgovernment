import { Link } from "react-router-dom";
import { MapPin, Phone, Mail } from "lucide-react";

const Footer = () => (
  <footer className="bg-secondary text-secondary-foreground">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-display text-xl font-bold mb-4">Aliyu Kabir Kusada</h3>
          <p className="text-secondary-foreground/70 text-sm leading-relaxed">
            Dedicated to transforming Kusada Local Government and Katsina State through integrity, 
            development, and people-centered governance.
          </p>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-4">Quick Links</h4>
          <div className="flex flex-col gap-2 text-sm text-secondary-foreground/70">
            <Link to="/manifesto" className="hover:text-primary transition-colors">Manifesto</Link>
            <Link to="/about" className="hover:text-primary transition-colors">About</Link>
            <Link to="/directory" className="hover:text-primary transition-colors">Find Polling Unit</Link>
            <Link to="/register" className="hover:text-primary transition-colors">Join the Campaign</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-4">Contact</h4>
          <div className="flex flex-col gap-3 text-sm text-secondary-foreground/70">
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Kusada, Katsina State</span>
            <span className="flex items-center gap-2"><Phone className="w-4 h-4" /> +234 800 000 0000</span>
            <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> info@aliyuismail.ng</span>
          </div>
        </div>
      </div>
      <div className="border-t border-secondary-foreground/10 mt-8 pt-6 text-center text-xs text-secondary-foreground/50">
        © {new Date().getFullYear()} Aliyu Ismail Campaign. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
