import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SnippetForm from './SnippetForm';

const SnippetFormDialog = ({ isOpen, onClose, onSnippetCreated }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Snippet</DialogTitle>
        </DialogHeader>
        <SnippetForm onSnippetCreated={onSnippetCreated} />
      </DialogContent>
    </Dialog>
  );
};

export default SnippetFormDialog;