'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Editor } from '@monaco-editor/react';

export default function SnippetViewEditDialog({ isOpen, onClose, snippetId, onSnippetUpdated }) {
  const [snippet, setSnippet] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (snippetId) fetchSnippet();
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
        setTags(data.tags.join(', '));
      } else {
        setError('Failed to fetch snippet');
      }
    } catch (error) {
      setError('Error fetching snippet: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/snippets/${snippetId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description, code, language, tags: tags.split(',').map(tag => tag.trim()) }),
      });

      if (response.ok) {
        onSnippetUpdated();
        onClose();
      } else {
        setError('Failed to update snippet');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl mt-3">
        <DialogHeader>
          <DialogTitle>{snippet ? 'Edit Snippet' : 'Loading...'}</DialogTitle>
        </DialogHeader>
        {snippet ? (
          <form onSubmit={handleSubmit} className="flex space-x-6">
            <div className="flex flex-col w-1/3 space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="border border-gray-300 rounded-md p-2"
                />
              </div>
              <Button type="submit" disabled={isLoading} className="bg-blue-500 text-white rounded-md p-2">
                {isLoading ? 'Updating...' : 'Update Snippet'}
              </Button>
              {error && <p className="text-red-600">{error}</p>}
            </div>
            <div className="flex-grow">
              <Label htmlFor="code">Code</Label>
              <Editor
                height="600px"
                language={language.toLowerCase()}
                value={code}
                onChange={value => setCode(value)}
                options={{ minimap: { enabled: false }, fontSize: 14 }}
                className="border border-gray-300 rounded-md p-2"
              />
            </div>
          </form>
        ) : (
          <p>Loading snippet details...</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
