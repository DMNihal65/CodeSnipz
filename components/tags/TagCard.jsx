import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';

const TagCard = ({ tag, onDelete }) => {
  return (
    <Card className="relative">
      <CardContent>
        <h2 className="text-lg font-semibold">{tag.name}</h2>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="absolute top-2 right-2" onClick={() => onDelete(tag.id)}>
          <Trash2 className="w-5 h-5" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TagCard;
