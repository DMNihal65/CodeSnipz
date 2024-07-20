'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Plus, Edit } from 'lucide-react';
import SnippetCard from '@/components/snippets/SnippetCard';
import SnippetFormDialog from '@/components/snippets/SnippetFormDialog';
import SnippetViewEditDialog from '@/components/snippets/SnippetViewEditDialog';

export default function DashboardPage() {
  const { user } = useUser();
  const [snippets, setSnippets] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewEditDialogOpen, setViewEditDialogOpen] = useState(false);
  const [currentSnippetId, setCurrentSnippetId] = useState(null);

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

  const handleSnippetUpdated = (updatedSnippet) => {
    setSnippets((prevSnippets) =>
      prevSnippets.map((snippet) =>
        snippet.id === updatedSnippet.id ? updatedSnippet : snippet
      )
    );
    setViewEditDialogOpen(false);
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
          <div key={snippet.id} className="relative">
            <SnippetCard
              snippet={snippet}
              onEdit={() => {
                setCurrentSnippetId(snippet.id);
                setViewEditDialogOpen(true);
              }}
            />
            <Button
              onClick={() => {
                setCurrentSnippetId(snippet.id);
                setViewEditDialogOpen(true);
              }}
              className="absolute top-2 right-2"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
      <SnippetFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSnippetCreated={handleSnippetCreated}
      />
      <SnippetViewEditDialog
        isOpen={viewEditDialogOpen}
        onClose={() => setViewEditDialogOpen(false)}
        snippetId={currentSnippetId}
        onSnippetUpdated={handleSnippetUpdated}
      />
    </div>
  );
}
