'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import SnippetCard from '@/components/snippets/SnippetCard';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TagPage = () => {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { tag } = useParams();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (tag) {
      fetchSnippetsByTag(decodeURIComponent(tag));
    }
  }, [tag]);

  const fetchSnippetsByTag = async (tagName) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tag/${tagName}`);
      if (response.ok) {
        const data = await response.json();
        setSnippets(data);
      } else {
        throw new Error('Failed to fetch snippets');
      }
    } catch (error) {
      console.error('Error fetching snippets:', error);
      toast({
        title: "Error",
        description: "Failed to fetch snippets for this tag.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-gray-500 mb-4" />
        <p className="text-gray-500">Loading snippets...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Snippets for Tag: <span className="text-blue-600">{decodeURIComponent(tag)}</span>
        </h1>
        <Button
          onClick={() => router.push('/dashboard/tags')}
          variant="outline"
          className="text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tags
        </Button>
      </div>
      {snippets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {snippets.map((snippet) => (
            <SnippetCard key={snippet.id} snippet={snippet} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-8">No snippets found for this tag.</p>
      )}
    </div>
  );
};

export default TagPage;