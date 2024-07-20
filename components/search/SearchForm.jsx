'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const SearchForm = ({ onSearchResults }) => {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('');
  const [tagIds, setTagIds] = useState([]);
  const [tags, setTags] = useState([]);

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

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/snippets/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, language, tagIds }),
      });

      if (response.ok) {
        const searchResults = await response.json();
        onSearchResults(searchResults);
      } else {
        console.error('Search failed');
      }
    } catch (error) {
      console.error('Error performing search:', error);
    }
  };

  const handleTagChange = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setTagIds(value);
  };

  return (
    <form onSubmit={handleSearch} className="space-y-4">
      <div>
        <Label htmlFor="query">Search Query</Label>
        <Input
          id="query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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
        <Select
          id="tags"
          multiple
          value={tagIds}
          onChange={handleTagChange}
        >
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </Select>
      </div>
      <Button type="submit">
        Search
      </Button>
    </form>
  );
};

export default SearchForm;
