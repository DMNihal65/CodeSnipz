import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code, Heart, Star } from 'lucide-react';
import { useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { FaRegHeart } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";

const SnippetCard = ({ snippet, onSnippetUpdated, onEdit }) => {
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
    <Card className="w-full shadow-lg border border-gray-200 rounded-lg overflow-hidden">
      <CardHeader className="bg-gray-50 p-4">
        <CardTitle className="text-xl font-semibold text-gray-800">{snippet.title}</CardTitle>
        <CardDescription className="text-sm text-gray-600">{snippet.language}</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <Editor
          height="200px"
          language={snippet.language.toLowerCase()}
          value={snippet.code}
          options={{ readOnly: true, minimap: { enabled: false }, fontSize: 14 }}
        />
      </CardContent>
      <CardFooter className="bg-gray-50 p-4 flex justify-between items-center">
        <div className="flex space-x-2">
          {(snippet.tags || []).map((tag, index) => (
            <span key={index} className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
              <img src={`/icons/${tag.name.toLowerCase()}.svg`} alt={tag.name} className="h-4 w-4 mr-1" />
              {tag.name}
            </span>
          ))}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Code className="mr-2 h-4 w-4" /> View/Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={handleFavorite}>
            {isFavorite ? <FaHeart className="mr-2 h-4 w-4 text-red-500" /> : <FaRegHeart className="mr-2 h-4 w-4 text-slate-700" />} Favorite
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SnippetCard;
