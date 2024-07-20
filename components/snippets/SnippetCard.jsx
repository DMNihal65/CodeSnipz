import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code, FileHeartIcon, Heart, Sparkles, Star } from 'lucide-react';
import { useState } from 'react';

const StarFill = (props) => (
  <svg {...props} fill="currentColor">
    <Star />
  </svg>
);

const SnippetCard = ({ snippet, onSnippetUpdated }) => {
  const [isFavorite, setIsFavorite] = useState(snippet.isFavorite);

  const handleFavorite = async () => {
    try {
      const response = await fetch('/api/snippets', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: snippet.id, isFavorite: !isFavorite }),
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
        if (onSnippetUpdated) onSnippetUpdated();
      } else {
        console.error('Failed to update snippet');
      }
    } catch (error) {
      console.error('Error updating snippet:', error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{snippet.title}</CardTitle>
        <CardDescription>{snippet.language}</CardDescription>
      </CardHeader>
      <CardContent>
        <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
          <code>{snippet.code.slice(0, 100)}...</code>
        </pre>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm">
          <Code className="mr-2 h-4 w-4" /> View
        </Button>
        <Button variant="ghost" size="sm" onClick={handleFavorite}>
          {isFavorite ? <Sparkles className="mr-2 h-4 w-4" /> : <Star className="mr-2 h-4 w-4" />} Favorite
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SnippetCard;
