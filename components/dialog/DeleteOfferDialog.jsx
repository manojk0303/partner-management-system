// components/admin/offers/DeleteOfferDialog.jsx
import { 
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  
  const DeleteOfferDialog = ({ open, onOpenChange, onConfirm, currentOffer }) => {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Offer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this offer? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 border rounded-md bg-gray-50">
            <h4 className="font-medium">{currentOffer?.title}</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {currentOffer?.description?.substring(0, 100)}
              {currentOffer?.description?.length > 100 ? '...' : ''}
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  export default DeleteOfferDialog;