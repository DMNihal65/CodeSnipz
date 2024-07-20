// pages/dashboard/favorites/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import SnippetCard from '@/components/snippets/SnippetCard';
import { Loader2Icon } from 'lucide-react';

const FavoritesPage = () => {
  const { user } = useUser();
  const [favoriteSnippets, setFavoriteSnippets] = useState([]);
  const [loading , isLoading] = useState(true);

  useEffect(() => {
    fetchFavoriteSnippets();
  }, []);

  const fetchFavoriteSnippets = async () => {
    try {
      const response = await fetch('/api/snippets/favorites');
      if (response.ok) {
        const data = await response.json();
        console.log("favsss")
        console.log(data);
        // Filter snippets by the isFavorite is true 
        const favoriteSnippets = data.filter(snippet => snippet.isFavorite);
        isLoading(false);
        setFavoriteSnippets(favoriteSnippets);
      }
    } catch (error) {
      console.error('Error fetching favorite snippets:', error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Favorite Snippets</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {favoriteSnippets.length > 0 ? (
          favoriteSnippets.map((snippet) => (
            <SnippetCard key={snippet.id} snippet={snippet} onSnippetUpdated={fetchFavoriteSnippets} />
          ))
        ) : (
          <div>{loading ? <Loader2Icon className='animate-spin '></Loader2Icon> : null}</div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
