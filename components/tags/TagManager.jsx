'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const TagManager = ({ onTagCreated }) => {
  const [tags, setTags] = useState([]);
  const [tagName, setTagName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleTagCreation = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: tagName }),
      });

      if (response.ok) {
        const newTag = await response.json();
        setTags((prevTags) => [...prevTags, newTag]);
        setTagName('');
        onTagCreated(newTag);
      } else {
        console.error('Failed to create tag');
      }
    } catch (error) {
      console.error('Error creating tag:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleTagCreation} className="space-y-4">
        <div>
          <Label htmlFor="tagName">New Tag</Label>
          <Input
            id="tagName"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Tag'}
        </Button>
      </form>
      <div className="mt-4">
        <h3 className="text-lg font-bold">Existing Tags</h3>
        <ul className="space-y-2">
          {tags.map((tag) => (
            <li key={tag.id} className="p-2 bg-gray-100 rounded">
              {tag.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TagManager;
