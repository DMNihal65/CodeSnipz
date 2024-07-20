import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code, Star } from 'lucide-react';

const SnippetCard = ({ snippet }) => {
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
        <Button variant="ghost" size="sm">
          <Star className="mr-2 h-4 w-4" /> Favorite
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SnippetCard;