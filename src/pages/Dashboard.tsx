import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import PUAdminDashboard from "@/components/dashboards/PUAdminDashboard";
import WardSupervisorDashboard from "@/components/dashboards/WardSupervisorDashboard";
import LGAAdminDashboard from "@/components/dashboards/LGAAdminDashboard";
import AuditorDashboard from "@/components/dashboards/AuditorDashboard";
import SuperAdminDashboard from "@/components/dashboards/SuperAdminDashboard";
import DefaultDashboard from "@/components/dashboards/DefaultDashboard";

const Dashboard = () => {
  const { user, roles, profile, loading } = useAuth();

  if (!loading && !user) return <Navigate to="/login" replace />;

  const renderDashboard = () => {
    if (roles.includes("super_admin")) return <SuperAdminDashboard />;
    if (roles.includes("lga_admin")) return <LGAAdminDashboard />;
    if (roles.includes("ward_supervisor")) return <WardSupervisorDashboard />;
    if (roles.includes("auditor")) return <AuditorDashboard />;
    if (roles.includes("pu_admin")) return <PUAdminDashboard />;
    return <DefaultDashboard />;
  };

  return (
    <Layout>
      <section className="py-20 min-h-[80vh] bg-muted">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground">
              Welcome, {profile?.full_name || "User"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {roles.length > 0
                ? `Role: ${roles.map((r) => r.replace("_", " ").toUpperCase()).join(", ")}`
                : "No role assigned — contact an administrator."}
            </p>
          </div>
          {renderDashboard()}
        </div>
      </section>
    </Layout>
  );
};

export default Dashboard;
