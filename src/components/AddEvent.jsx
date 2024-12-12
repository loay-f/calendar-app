import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";

const AddEvent = ({
                      eventModalOpen,
                      setEventModalOpen,
                      selectedDate,
                      newEvent,
                      setNewEvent,
                      handleAddEvent,
                      editingEvent
                  }) => {
    const handleInputChange = (field) => (e) => {
        setNewEvent(prev => ({...prev, [field]: e.target.value}));
    };

    const renderInputField = (label, id, type = 'text') => (
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={id} className="text-right">{label}</Label>
            <Input
                id={id}
                type={type}
                value={newEvent[id === 'description' ? 'description' : id] || ''}
                onChange={handleInputChange(id === 'description' ? 'description' : id)}
                className="col-span-3"
            />
        </div>
    );

    return (
        <Dialog open={eventModalOpen} onOpenChange={setEventModalOpen}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>
                        {editingEvent ? 'Edit Event' : 'Add Event'}
                        {selectedDate && ` - ${selectedDate.toLocaleDateString('default', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                        })}`}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {renderInputField('Event Name', 'name')}
                    {renderInputField('Start Time', 'startTime', 'time')}
                    {renderInputField('End Time', 'endTime', 'time')}
                    {renderInputField('Description', 'description')}
                </div>

                <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setEventModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleAddEvent}>
                        {editingEvent ? 'Update Event' : 'Add Event'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AddEvent;