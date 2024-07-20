'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function SnippetViewEditDialog({ isOpen, onClose, snippetId, onSnippetUpdated }) {
  const [snippet, setSnippet] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && snippetId) {
      fetchSnippet();
    }
  }, [isOpen, snippetId]);

  const fetchSnippet = async () => {
    try {
      const response = await fetch(`/api/snippets/${snippetId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch snippet: ${response.statusText}`);
      }
      const data = await response.json();
      setSnippet(data);
      setTitle(data.title);
      setDescription(data.description);
      setCode(data.code);
      setLanguage(data.language);
      setTags(data.tags || '');
    } catch (error) {
      console.error('Error fetching snippet:', error);
      setError(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/snippets/${snippetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description, code, language, tags }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update snippet: ${response.statusText}`);
      }

      const result = await response.json();
      onSnippetUpdated(result);
      onClose();
    } catch (error) {
      console.error('Error updating snippet:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] w-full max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{snippet ? 'Edit Snippet' : 'Loading...'}</DialogTitle>
        </DialogHeader>
        {error && <div className="text-red-500">{error}</div>}
        {snippet && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="code">Code</Label>
              <Textarea
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                rows={10}
                className="font-mono"
              />
            </div>
            <div>
              <Label htmlFor="language">Language</Label>
              <Input
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
