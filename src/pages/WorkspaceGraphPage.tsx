import { useLocation, useNavigate } from "react-router-dom";
import KnowledgeGraph from "@/components/workspace/KnowledgeGraph";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export default function WorkspaceGraphPage() {
  const { user } = useAuth();
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPages = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('user_id', user.id);
      setPages(data || []);
      setLoading(false);
    };
    fetchPages();
  }, [user]);

  if (loading) return <div className="flex items-center justify-center h-full">Loading graph...</div>;

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <div className="flex items-center p-4 border-b bg-white">
        <Button variant="ghost" onClick={() => navigate('/workspace')}>{'< Back to Workspace'}</Button>
        <h2 className="text-2xl font-bold ml-4">Knowledge Graph</h2>
      </div>
      <div className="flex-1">
        <KnowledgeGraph pages={pages} />
      </div>
    </div>
  );
}
