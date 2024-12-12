import {useState, useEffect} from "react";
import {Button} from "@/components/ui/button";
import AddEvent from "@/components/AddEvent";
import EventsSidebar from "@/components/EventsSidebar";
import {Download} from "lucide-react";

const App = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);
    const [editingEvent, setEditingEvent] = useState(null);
    const [eventModalOpen, setEventModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({
        name: "",
        startTime: "",
        endTime: "",
        description: "",
    });

    useEffect(() => {
        const storedEvents = localStorage.getItem("calendarEvents");
        if (storedEvents) setEvents(JSON.parse(storedEvents));
    }, []);

    const generateCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days = [];
        const endDate = new Date(lastDay);
        endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

        while (startDate <= endDate) {
            days.push(new Date(startDate));
            startDate.setDate(startDate.getDate() + 1);
        }
        return days;
    };

    const isToday = (date) => {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    const isSameMonth = (date, comparisonDate) =>
        date.getMonth() === comparisonDate.getMonth() &&
        date.getFullYear() === comparisonDate.getFullYear();

    const isSameDay = (date1, date2) =>
        date1 &&
        date2 &&
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear();

    const formatTheDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const resetEventForm = () => {
        setNewEvent({
            name: "",
            startTime: "",
            endTime: "",
            description: "",
        });
    };

    const renderCalendar = () => {
        const days = generateCalendarDays();
        return (
            <div className="grid grid-cols-7 gap-2 text-center">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="font-bold text-gray-600">
                        {day}
                    </div>
                ))}
                {days.map((day) => {
                    const dateKey = formatTheDate(day);
                    const hasEvents = events[dateKey];

                    return (
                        <div
                            key={day.toString()}
                            className={`p-2 border rounded-lg cursor-pointer relative ${
                                !isSameMonth(day, currentDate) ? "bg-gray-100 text-gray-400" : ""
                            } ${isToday(day) ? "border-2 border-blue-500" : ""} ${
                                isSameDay(day, selectedDate) ? "bg-blue-100" : ""
                            }`}
                            onClick={() => setSelectedDate(day)}
                            onDoubleClick={() => setEventModalOpen(true)}
                        >
                            <span className={isToday(day) ? "font-bold text-blue-600" : ""}>
                                {day.getDate()}
                            </span>
                            {hasEvents && (
                                <div className="absolute bottom-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const handleEditEvent = (dateKey, eventId, updatedEvent) => {
        const updatedEvents = {...events};
        updatedEvents[dateKey] = updatedEvents[dateKey].map((event) =>
            event.id === eventId ? {...event, ...updatedEvent} : event
        );

        setEvents(updatedEvents);
        localStorage.setItem("calendarEvents", JSON.stringify(updatedEvents));
        setEditingEvent(null);
        setEventModalOpen(false);
    };

    const prepareEditEvent = (dateKey, event) => {
        setSelectedDate(new Date(dateKey));
        setNewEvent({
            name: event.name,
            startTime: event.startTime,
            endTime: event.endTime,
            description: event.description || "",
        });
        setEditingEvent({dateKey, eventId: event.id});
        setEventModalOpen(true);
    };

    const handleAddOrUpdateEvent = () => {
        if (!newEvent.name || !newEvent.startTime || !newEvent.endTime) {
            alert("Please fill in all required fields");
            return;
        }

        const dateKey = formatTheDate(selectedDate);

        if (editingEvent) {
            handleEditEvent(editingEvent.dateKey, editingEvent.eventId, newEvent);
            return;
        }

        const dayEvents = events[dateKey] || [];
        const isOverlapping = dayEvents.some(
            (existingEvent) =>
                existingEvent.startTime < newEvent.endTime &&
                existingEvent.endTime > newEvent.startTime
        );

        if (isOverlapping) {
            alert("This event overlaps with an existing event");
            return;
        }

        const eventToAdd = {...newEvent, id: Date.now().toString()};
        const updatedEvents = {
            ...events,
            [dateKey]: [...dayEvents, eventToAdd],
        };

        setEvents(updatedEvents);
        localStorage.setItem("calendarEvents", JSON.stringify(updatedEvents));
        resetEventForm();
        setEventModalOpen(false);
    };

    const formatMonthYear = (date) =>
        date.toLocaleString("default", {month: "long", year: "numeric"});

    const exportMonthEvents = () => {
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const monthEvents = {};
        Object.keys(events).forEach((dateKey) => {
            const eventDate = new Date(dateKey);
            if (eventDate >= firstDay && eventDate <= lastDay) {
                monthEvents[dateKey] = events[dateKey];
            }
        });

        const jsonString = JSON.stringify(monthEvents, null, 2);
        const blob = new Blob([jsonString], {type: "application/json"});
        const fileName = `events-${currentDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
        })}.json`;
        const downloadLink = document.createElement("a");

        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    return (
        <div className="flex flex-col-reverse gap-10 items-center sm:items-start sm:gap-0 sm:flex-row">
            <EventsSidebar
                events={events}
                setEvent={setEvents}
                selectedDate={selectedDate}
                setEventModalOpen={setEventModalOpen}
                prepareEditEvent={prepareEditEvent}
            />
            <div className="w-9/12 mx-auto p-6 bg-white shadow-lg rounded-lg">
                <div className="flex justify-between items-center mb-6">
                    <Button
                        variant="outline"
                        onClick={() =>
                            setCurrentDate(
                                new Date(currentDate.setMonth(currentDate.getMonth() - 1))
                            )
                        }
                    >
                        Previous
                    </Button>
                    <h2 className="text-2xl font-bold">{formatMonthYear(currentDate)}</h2>
                    <Button
                        variant="outline"
                        onClick={() =>
                            setCurrentDate(
                                new Date(currentDate.setMonth(currentDate.getMonth() + 1))
                            )
                        }
                    >
                        Next
                    </Button>
                </div>
                {renderCalendar()}
                <AddEvent
                    eventModalOpen={eventModalOpen}
                    setEventModalOpen={setEventModalOpen}
                    selectedDate={selectedDate}
                    newEvent={newEvent}
                    setNewEvent={setNewEvent}
                    handleAddEvent={handleAddOrUpdateEvent}
                    editingEvent={editingEvent}
                />
                <div className="absolute bottom-4 right-4">
                    <Button
                        variant="outline"
                        className="bg-[#074799] text-white hover:bg-[#062750]"
                        onClick={exportMonthEvents}
                        title="Export events for this month"
                    >
                        <Download/>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default App;
