import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Editor } from '@monaco-editor/react';
import { useToast } from '@/components/ui/use-toast';
import { Chip } from '@mui/material';
import { Tag, Save, X, Loader2 } from 'lucide-react';

export default function SnippetEditDialog({ isOpen, onClose, snippetId, onSnippetUpdated }) {
  const [snippet, setSnippet] = useState(null);
  const [originalSnippet, setOriginalSnippet] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && snippetId) {
      fetchSnippet();
    }
  }, [isOpen, snippetId]);

  useEffect(() => {
    if (snippet && originalSnippet) {
      setHasChanges(JSON.stringify(snippet) !== JSON.stringify(originalSnippet));
    }
  }, [snippet, originalSnippet]);

  const fetchSnippet = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/snippets/${snippetId}`);
      if (!response.ok) throw new Error('Failed to fetch snippet');
      const data = await response.json();
      setSnippet(data);
      setOriginalSnippet(data);
    } catch (error) {
      console.error('Error fetching snippet:', error);
      toast({
        title: "Error",
        description: "Failed to fetch snippet details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSnippet(prev => ({ ...prev, [name]: value }));
  };

  const handleCodeChange = (value) => {
    setSnippet(prev => ({ ...prev, code: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`/api/snippets/${snippetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(snippet),
      });
      if (!response.ok) throw new Error('Failed to update snippet');
      const updatedSnippet = await response.json();
      setSnippet(updatedSnippet);
      setOriginalSnippet(updatedSnippet);
      onSnippetUpdated(updatedSnippet);
      toast({
        title: "Success",
        description: "Snippet updated successfully.",
      });
    } catch (error) {
      console.error('Error updating snippet:', error);
      toast({
        title: "Error",
        description: "Failed to update snippet.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !snippet) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!snippet) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Snippet</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={snippet.title}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={snippet.description}
                  onChange={handleInputChange}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="language" className="text-sm font-medium text-gray-700">Language</Label>
                <Input
                  id="language"
                  name="language"
                  value={snippet.language}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="tags" className="text-sm font-medium text-gray-700">Tags</Label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {snippet.tags && snippet.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      icon={<Tag size={14} />}
                      label={tag}
                      onDelete={() => {
                        const newTags = snippet.tags.filter((_, i) => i !== index);
                        setSnippet(prev => ({ ...prev, tags: newTags }));
                      }}
                      deleteIcon={<X size={14} />}
                    />
                  ))}
                  <Input
                    placeholder="Add tag and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value) {
                        e.preventDefault();
                        const newTags = [...snippet.tags, e.target.value];
                        setSnippet(prev => ({ ...prev, tags: newTags }));
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="code" className="text-sm font-medium text-gray-700">Code</Label>
              <div className="mt-1 border rounded-md overflow-hidden">
                <Editor
                  height="400px"
                  language={snippet.language.toLowerCase()}
                  value={snippet.code}
                  onChange={handleCodeChange}
                  options={{ minimap: { enabled: false }, fontSize: 14 }}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {hasChanges && (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2" size={16} />}
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}