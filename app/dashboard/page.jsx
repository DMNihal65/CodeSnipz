'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import SnippetCard from '@/components/snippets/SnippetCard';
import SnippetFormDialog from '@/components/snippets/SnippetFormDialog';

export default function DashboardPage() {
  const { user } = useUser();
  const [snippets, setSnippets] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchSnippets();
  }, []);

  const fetchSnippets = async () => {
    try {
      const response = await fetch('/api/snippets');
      if (response.ok) {
        const data = await response.json();
        setSnippets(data);
      }
    } catch (error) {
      console.error('Error fetching snippets:', error);
    }
  };

  const handleSnippetCreated = () => {
    fetchSnippets();
    setIsFormOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Welcome, {user?.firstName}</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Snippet
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {snippets.map((snippet) => (
          <SnippetCard key={snippet.id} snippet={snippet} />
        ))}
      </div>
      <SnippetFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSnippetCreated={handleSnippetCreated}
      />
    </div>
  );
}