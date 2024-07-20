import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SnippetForm from './SnippetForm';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react'; // Close icon

const SnippetFormDialog = ({ isOpen, onClose, onSnippetCreated }) => {
  return (
    <div>
     
    <Dialog open={isOpen} onOpenChange={onClose} className="relative">
      <DialogContent className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <DialogHeader className="flex justify-between items-center mb-4">
          <DialogTitle className="text-2xl font-semibold text-gray-900">Create New Snippet</DialogTitle>
          <Button
            variant="outline"
            size="icon"
            onClick={onClose}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full"
          >
            <X className="h-5 w-5 text-gray-600" />
          </Button>
        </DialogHeader>
        <SnippetForm onSnippetCreated={onSnippetCreated} />
      </DialogContent>
    </Dialog>


    </div>
  );
};

export default SnippetFormDialog;
