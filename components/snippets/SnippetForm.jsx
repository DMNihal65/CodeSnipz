'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Editor } from '@monaco-editor/react';

export default function SnippetForm({ onSnippetCreated, existingTags = [] }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tags, setTags] = useState(existingTags);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags');
      if (response.ok) {
        const data = await response.json();
        setTags(data);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/snippets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description, code, language, tags: selectedTags }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Snippet created:', result);
        setTitle('');
        setDescription('');
        setCode('');
        setLanguage('');
        setSelectedTags([]);
        onSnippetCreated();
      } else {
        console.error('Failed to create snippet');
      }
    } catch (error) {
      console.error('Error creating snippet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagChange = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedTags(value);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row p-6 space-y-6 md:space-y-0 md:space-x-6 bg-white rounded-lg shadow-lg">
      <div className="flex flex-col w-full md:w-1/3 space-y-4">
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
          <Select
            id="tags"
            multiple
            value={selectedTags}
            onChange={handleTagChange}
            className="border border-gray-300 rounded-md p-2"
          >
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" disabled={isLoading} className="bg-blue-500 text-white rounded-md p-2">
          {isLoading ? 'Creating...' : 'Create Snippet'}
        </Button>
      </div>
      <div className="flex-grow">
        <Label htmlFor="code">Code</Label>
        <div className="h-96 border border-gray-300 rounded-md p-2"> {/* Fixed height for the editor container */}
          <Editor
            height="100%"
            language={language.toLowerCase()}
            value={code}
            onChange={value => setCode(value)}
            options={{ minimap: { enabled: false }, fontSize: 14 }}
          />
        </div>
      </div>
    </form>
  );
}
