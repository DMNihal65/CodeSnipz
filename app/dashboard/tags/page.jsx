"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tag, Trash2, Plus, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const TagCard = ({ tag, onDelete, onClick }) => (
  <Card className="relative hover:shadow-md transition-shadow duration-200">
    <CardContent className="p-4 flex items-center justify-between">
      <button
        onClick={() => onClick(tag)}
        className="flex items-center space-x-2 text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
      >
        <Tag className="w-5 h-5" />
        <span>{tag.name}</span>
      </button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(tag.id)}
        className="text-gray-400 hover:text-red-600 transition-colors duration-200"
      >
        <Trash2 className="w-5 h-5" />
      </Button>
    </CardContent>
  </Card>
);

const TagSkeleton = () => (
  <Card className="relative">
    <CardContent className="p-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Skeleton className="w-5 h-5 rounded-full" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="w-8 h-8 rounded-full" />
    </CardContent>
  </Card>
);

const TagsPage = () => {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setIsLoading(true);
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
      toast({
        title: "Error",
        description: "Failed to fetch tags. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    setIsAdding(true);
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newTag.trim() }),
      });

      if (response.ok) {
        const addedTag = await response.json();
        setTags([...tags, addedTag]);
        setNewTag('');
        toast({
          title: "Success",
          description: "Tag added successfully.",
        });
      } else {
        throw new Error('Failed to add tag');
      }
    } catch (error) {
      console.error('Error adding tag:', error);
      toast({
        title: "Error",
        description: "Failed to add tag. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteTag = async (tagId) => {
    try {
      const response = await fetch('/api/tags', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: tagId }),
      });

      if (response.ok) {
        setTags(tags.filter(tag => tag.id !== tagId));
        toast({
          title: "Success",
          description: "Tag deleted successfully.",
        });
      } else {
        throw new Error('Failed to delete tag');
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast({
        title: "Error",
        description: "Failed to delete tag. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTagClick = (tag) => {
    router.push(`/dashboard/tags/${tag.name}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Tags Management</h1>
      <form onSubmit={handleAddTag} className="flex space-x-4 mb-8">
        <Input
          type="text"
          placeholder="Enter new tag name"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          className="flex-grow"
          required
        />
        <Button type="submit" disabled={isAdding} className="bg-blue-600 hover:bg-blue-700 text-white">
          {isAdding ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Plus className="w-5 h-5 mr-2" />
          )}
          Add Tag
        </Button>
      </form>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <TagSkeleton key={index} />
          ))
        ) : tags.length > 0 ? (
          tags.map(tag => (
            <TagCard
              key={tag.id}
              tag={tag}
              onDelete={handleDeleteTag}
              onClick={handleTagClick}
            />
          ))
        ) : (
          <p className="text-gray-500 col-span-full text-center py-4">No tags found. Add your first tag above!</p>
        )}
      </div>
    </div>
  );
};

export default TagsPage;