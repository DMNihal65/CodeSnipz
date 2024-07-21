import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Editor } from '@monaco-editor/react';
import { useToast } from '@/components/ui/use-toast';
import { Autocomplete, TextField, Chip } from '@mui/material';
import axios from 'axios';
import { chatSession } from '@/utils/GeminiAiModel';

export default function SnippetFormDialog({ isOpen, onClose, onSnippetCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [existingTags, setExistingTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags');
        if (response.ok) {
          const tags = await response.json();
          setExistingTags(tags);
        } else {
          console.error('Failed to fetch tags');
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    fetchTags();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/snippets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description, code, language, tags: selectedTags.map(tag => tag.name) }),
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
        onClose();
        toast({
          title: "Success",
          description: "Snippet created successfully.",
        });
      } else {
        throw new Error('Failed to create snippet');
      }
    } catch (error) {
      console.error('Error creating snippet:', error);
      toast({
        title: "Error",
        description: "Failed to create snippet.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIComment = async () => {
    if (!code) {
      toast({
        title: "Error",
        description: "Code is empty.",
        variant: "destructive",
      });
      return;
    }
  
    setIsAIProcessing(true);
    try {
      console.log('Sending code to AI for commenting:', code);
  
      // Modify the prompt to request a simpler response format
      const prompt = `Here is a code snippet in ${language}:\n\n${code}\n\nPlease add comments to this code to explain its functionality. Return only the commented code, without any JSON formatting or additional text.`;
      
      // Send the prompt to the AI model
      const result = await chatSession.sendMessage(prompt);
  
      // Extract and log the raw response text
      const resultText = result.response.text();
      console.log('Raw result text:', resultText);
  
      // Clean up the response text
      const cleanedCode = resultText
        .replace(/^```[\s\S]*?\n/, '') // Remove opening code block markers
        .replace(/```$/, '')           // Remove closing code block markers
        .trim();                       // Remove any leading/trailing whitespace
  
      console.log('Cleaned commented code:', cleanedCode);
  
      if (cleanedCode) {
        setCode(cleanedCode);
        toast({
          title: "Success",
          description: "Code commented successfully.",
        });
      } else {
        throw new Error('No commented code found in the AI response.');
      }
    } catch (error) {
      console.error('Error getting AI comments:', error);
      toast({
        title: "Error",
        description: "Failed to get AI comments.",
        variant: "destructive",
      });
    } finally {
      setIsAIProcessing(false);
    }
  };
  
  
  


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-gradient-to-br from-blue-50 to-indigo-50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">Create New Snippet</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <Label htmlFor="language" className="text-sm font-medium text-gray-700">Language</Label>
                <Input
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <Label htmlFor="tags" className="text-sm font-medium text-gray-700">Tags</Label>
                <Autocomplete
                  multiple
                  freeSolo
                  id="tags"
                  options={existingTags.map(tag => tag.name)}
                  getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
                  value={selectedTags}
                  onChange={(event, newValue) => {
                    setSelectedTags(newValue.map(tag => (typeof tag === 'string' ? { name: tag } : tag)));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      placeholder="Add tags"
                      className="mt-1"
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={option.name || option}
                        {...getTagProps({ index })}
                        key={index}
                        className="bg-indigo-100 text-indigo-800"
                      />
                    ))
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="code" className="text-sm font-medium text-gray-700">Code</Label>
              <Editor
                height="400px"
                language={language.toLowerCase()}
                value={code}
                onChange={(value) => setCode(value)}
                options={{ minimap: { enabled: false }, fontSize: 14 }}
                className="mt-1 border rounded-md overflow-hidden"
              />
              <div className="flex justify-end mt-2">
                <Button
                  type="button"
                  onClick={handleAIComment}
                  disabled={isAIProcessing}
                  className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  {isAIProcessing ? 'Processing...' : 'Comment with AI'}
                </Button>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} className="px-4 py-2">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              {isLoading ? 'Creating...' : 'Create Snippet'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
