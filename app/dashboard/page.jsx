'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Plus, Search, Code, Tag, X } from 'lucide-react';
import SnippetCard from '@/components/snippets/SnippetCard';
import SnippetFormDialog from '@/components/snippets/SnippetFormDialog';
import SnippetViewEditDialog from '@/components/snippets/SnippetViewEditDialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

export default function DashboardPage() {
  const { user } = useUser();
  const [snippets, setSnippets] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewEditDialogOpen, setViewEditDialogOpen] = useState(false);
  const [currentSnippetId, setCurrentSnippetId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchSnippets();
    }
  }, [user]);

  const fetchSnippets = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/snippets');
      if (response.ok) {
        const data = await response.json();
        setSnippets(data);
      }
    } catch (error) {
      console.error('Error fetching snippets:', error);
      toast({
        title: "Error",
        description: "Failed to fetch snippets.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSnippetCreated = () => {
    fetchSnippets();
    setIsFormOpen(false);
    toast({
      title: "Success",
      description: "Snippet created successfully.",
    });
  };

  const handleSnippetUpdated = (updatedSnippet) => {
    setSnippets((prevSnippets) =>
      prevSnippets.map((snippet) =>
        snippet.id === updatedSnippet.id ? updatedSnippet : snippet
      )
    );
    setViewEditDialogOpen(false);
    toast({
      title: "Success",
      description: "Snippet updated successfully.",
    });
  };

  const handleDeleteSnippet = async (snippetId) => {
    try {
      const response = await fetch(`/api/snippets/${snippetId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setSnippets((prevSnippets) => prevSnippets.filter((snippet) => snippet.id !== snippetId));
        toast({
          title: "Success",
          description: "Snippet moved to trash.",
        });
      } else {
        throw new Error('Failed to delete snippet');
      }
    } catch (error) {
      console.error('Error deleting snippet:', error);
      toast({
        title: "Error",
        description: "Failed to delete snippet.",
        variant: "destructive",
      });
    }
  };

  const filteredSnippets = snippets.filter((snippet) => {
    const matchesSearch = snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLanguage = filterLanguage ? snippet.language.toLowerCase() === filterLanguage.toLowerCase() : true;
    const matchesTag = filterTag ? snippet.tags.some(tag => tag.name.toLowerCase() === filterTag.toLowerCase()) : true;
    return matchesSearch && matchesLanguage && matchesTag;
  });

  const languages = [...new Set(snippets.map(snippet => snippet.language))];
  const tags = [...new Set(snippets.flatMap(snippet => snippet.tags ? snippet.tags.map(tag => tag.name) : []))];

  return (
    <div className="container mx-auto px-4 py-8">
      {user ? (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-3xl font-bold">Welcome, {user.firstName}</h1>
            <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> New Snippet
            </Button>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-grow relative">
              <Input
                placeholder="Search snippets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Code className="mr-2 h-4 w-4" />
                    {filterLanguage || 'Language'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56">
                  <div className="grid gap-2">
                    <Button variant="ghost" onClick={() => setFilterLanguage('')} className="justify-start">
                      All Languages
                    </Button>
                    {languages.map((lang) => (
                      <Button key={lang} variant="ghost" onClick={() => setFilterLanguage(lang)} className="justify-start">
                        {lang}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Tag className="mr-2 h-4 w-4" />
                    {filterTag || 'Tag'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56">
                  <div className="grid gap-2">
                    <Button variant="ghost" onClick={() => setFilterTag('')} className="justify-start">
                      All Tags
                    </Button>
                    {tags.map((tag) => (
                      <Button key={tag} variant="ghost" onClick={() => setFilterTag(tag)} className="justify-start">
                        {tag}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {(filterLanguage || filterTag) && (
            <div className="mb-4 flex flex-wrap gap-2">
              {filterLanguage && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setFilterLanguage('')}
                  className="flex items-center gap-2"
                >
                  <Code className="h-4 w-4" />
                  {filterLanguage}
                  <X className="h-4 w-4" />
                </Button>
              )}
              {filterTag && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setFilterTag('')}
                  className="flex items-center gap-2"
                >
                  <Tag className="h-4 w-4" />
                  {filterTag}
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <SnippetCard key={index} snippet={null} />
              ))}
            </div>
          ) : filteredSnippets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSnippets.map((snippet) => (
                <SnippetCard
                  key={snippet.id}
                  snippet={snippet}
                  onEdit={() => {
                    setCurrentSnippetId(snippet.id);
                    setViewEditDialogOpen(true);
                  }}
                  onDelete={handleDeleteSnippet}
                  onSnippetUpdated={fetchSnippets}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">No snippets found. Create a new one!</p>
            </div>
          )}

          <SnippetFormDialog
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSnippetCreated={handleSnippetCreated}
            existingTags={tags.map((tag, index) => ({ id: index, name: tag }))}
          />
          <SnippetViewEditDialog
            isOpen={viewEditDialogOpen}
            onClose={() => setViewEditDialogOpen(false)}
            snippetId={currentSnippetId}
            onSnippetUpdated={handleSnippetUpdated}
          />
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">Please sign in to view your dashboard.</p>
        </div>
      )}
    </div>
  );
}