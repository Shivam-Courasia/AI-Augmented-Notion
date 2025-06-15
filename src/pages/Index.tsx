
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import NotionLanding from "@/components/NotionLanding";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/workspace');
    }
  }, [user, loading, navigate]);

  return <NotionLanding />;
};

export default Index;
