'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import SnippetCard from '@/components/snippets/SnippetCard';

export default function FavoritesPage() {
  const { user } = useUser();
  const [snippets, setSnippets] = useState([]);

  useEffect(() => {
    fetchFavoriteSnippets();
  }, []);

  const fetchFavoriteSnippets = async () => {
    try {
      const response = await fetch('/api/snippets?favorite=true');
      if (response.ok) {
        const data = await response.json();
        setSnippets(data);
      }
    } catch (error) {
      console.error('Error fetching favorite snippets:', error);
    }
  };

  const handleSnippetUpdated = () => {
    fetchFavoriteSnippets();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Favorite Snippets</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {snippets.map((snippet) => (
          <SnippetCard key={snippet.id} snippet={snippet} onSnippetUpdated={handleSnippetUpdated} />
        ))}
      </div>
    </div>
  );
}
