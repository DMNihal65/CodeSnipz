import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code, Heart, Star, Edit, Trash2 } from 'lucide-react';
import { Editor } from '@monaco-editor/react';
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

const SnippetCard = ({ snippet, onSnippetUpdated, onEdit, onDelete }) => {
  const [isFavorite, setIsFavorite] = useState(snippet?.isFavorite || false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsFavorite(snippet?.isFavorite || false);
  }, [snippet]);

  const handleFavorite = async () => {
    if (!snippet) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/snippets/${snippet.id}/favorite`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isFavorite: !isFavorite }),
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
        if (onSnippetUpdated) onSnippetUpdated();
        toast({
          title: "Success",
          description: `Snippet ${isFavorite ? 'removed from' : 'added to'} favorites.`,
        });
      } else {
        throw new Error('Failed to update snippet');
      }
    } catch (error) {
      console.error('Error updating snippet:', error);
      toast({
        title: "Error",
        description: "Failed to update favorite status.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!snippet) {
    return <SnippetCardSkeleton />;
  }

  return (
    <Card className="w-full shadow-lg border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold text-gray-800">{snippet.title}</CardTitle>
          <Badge variant="secondary" className="text-sm">
            {snippet.language}
          </Badge>
        </div>
        <CardDescription className="text-sm text-gray-600 mt-2">{snippet.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <Editor
          height="200px"
          language={snippet.language.toLowerCase()}
          value={snippet.code}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
            theme: 'vs-light',
          }}
        />
      </CardContent>
      <CardFooter className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 flex flex-wrap justify-between items-center gap-2">
        <div className="flex flex-wrap gap-2">
          {(snippet.tags || []).map((tag, index) => (
            <Badge key={index} variant="outline" className="bg-yellow-200">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={onEdit} className="bg-white hover:bg-gray-100">
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFavorite}
            disabled={isLoading}
            className={`bg-white hover:bg-gray-100 ${isFavorite ? 'text-red-500' : 'text-gray-500'}`}
          >
            {isFavorite ? <FaHeart className="mr-2 h-4 w-4" /> : <FaRegHeart className="mr-2 h-4 w-4" />}
            {isFavorite ? 'Favorited' : 'Favorite'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(snippet.id)} className="bg-white hover:bg-gray-100 text-gray-500">
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

const SnippetCardSkeleton = () => (
  <Card className="w-full shadow-lg border border-gray-200 rounded-lg overflow-hidden">
    <CardHeader className="bg-gray-50 p-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/4 mt-2" />
    </CardHeader>
    <CardContent className="p-4">
      <Skeleton className="h-[200px] w-full" />
    </CardContent>
    <CardFooter className="bg-gray-50 p-4 flex justify-between items-center">
      <Skeleton className="h-8 w-1/4" />
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </CardFooter>
  </Card>
);

export default SnippetCard;
