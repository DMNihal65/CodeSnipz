'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Editor } from '@monaco-editor/react';
import { useToast } from '@/components/ui/use-toast';
import { Autocomplete, TextField, Chip } from '@mui/material';

export default function SnippetViewEditDialog({ isOpen, onClose, snippetId, onSnippetUpdated }) {
  const [snippet, setSnippet] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('');
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (snippetId) {
      setSnippet(null); // Reset snippet to show loading state
      fetchSnippet();
    }
  }, [snippetId]);

  const fetchSnippet = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/snippets/${snippetId}`);
      if (response.ok) {
        const data = await response.json();
        setSnippet(data);
        setTitle(data.title);
        setDescription(data.description);
        setCode(data.code);
        setLanguage(data.language);
        setSelectedTags(data.tags || []);
      } else {
        throw new Error('Failed to fetch snippet');
      }
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

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags');
      if (response.ok) {
        const data = await response.json();
        setTags(data);
      } else {
        throw new Error('Failed to fetch tags');
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`/api/snippets/${snippetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description, code, language, tags: selectedTags }),
      });

      if (response.ok) {
        const updatedSnippet = await response.json();
        onSnippetUpdated(updatedSnippet);
        setIsEditing(false);
        toast({
          title: "Success",
          description: "Snippet updated successfully.",
        });
      } else {
        throw new Error('Failed to update snippet');
      }
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Snippet' : 'View Snippet'}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-xl text-gray-600">Loading snippet...</p>
          </div>
        ) : (
          snippet && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      readOnly={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      readOnly={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Input
                      id="language"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      readOnly={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Autocomplete
                      multiple
                      id="tags"
                      options={tags.map(tag => tag.name)}
                      freeSolo
                      value={selectedTags}
                      onChange={(event, newValue) => {
                        setSelectedTags(newValue);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          placeholder="Add tags"
                          disabled={!isEditing}
                        />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            label={option}
                            {...getTagProps({ index })}
                            key={index}
                            onDelete={isEditing ? () => {
                              setSelectedTags(selectedTags.filter(tag => tag !== option));
                            } : undefined}
                          />
                        ))
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="code">Code</Label>
                  <Editor
                    height="400px"
                    language={language.toLowerCase()}
                    value={code}
                    onChange={(value) => setCode(value)}
                    options={{ readOnly: !isEditing, minimap: { enabled: false }, fontSize: 14 }}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                {isEditing ? (
                  <>
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Updating...' : 'Update Snippet'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button type="button" variant="outline" onClick={onClose}>
                      Close
                    </Button>
                    <Button type="button" onClick={() => setIsEditing(true)}>
                      Edit Snippet
                    </Button>
                  </>
                )}
              </div>
            </form>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
