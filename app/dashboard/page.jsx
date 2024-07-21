'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import SnippetCard from '@/components/snippets/SnippetCard';
import SnippetFormDialog from '@/components/snippets/SnippetFormDialog';
import SnippetViewEditDialog from '@/components/snippets/SnippetViewEditDialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

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
    fetchSnippets();
  }, []);

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

// Ensure that snippet and snippet.tags are defined
const tags = [...new Set(snippets.flatMap(snippet => snippet.tags ? snippet.tags.map(tag => tag.name) : []))];


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Welcome, {user?.firstName}</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Snippet
        </Button>
      </div>

      <div className="mb-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-grow">
          <Input
            placeholder="Search snippets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
            icon={<Search className="h-4 w-4 text-gray-400" />}
          />
        </div>
        <Select
          value={filterLanguage}
          onChange={(e) => setFilterLanguage(e.target.value)}
          className="w-full md:w-48"
        >
          <option value="">All Languages</option>
          {languages.map((lang) => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </Select>
        <Select
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
          className="w-full md:w-48"
        >
          <option value="">All Tags</option>
          {tags.map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <SnippetCard key={index} snippet={null} />
          ))}
        </div>
      ) : filteredSnippets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
}