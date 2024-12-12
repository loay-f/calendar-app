import {useState, useEffect} from "react";
import PropTypes from "prop-types";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Clock} from "lucide-react";
import {Input} from "@/components/ui/input";

const EventsSidebar = ({
                           events,
                           selectedDate,
                           setEvent,
                           setEventModalOpen,
                           prepareEditEvent,
                       }) => {
    const [searchKeyword, setSearchKeyword] = useState("");

    useEffect(() => {
        if (typeof events !== "object" || events === null) {
            console.error("Events must be an object");
            return;
        }

        Object.entries(events).forEach(([date, eventList]) => {
            if (!Array.isArray(eventList)) {
                console.error(`Events for date ${date} must be an array`);
                return;
            }

            eventList.forEach((event, index) => {
                if (typeof event.name !== "string") {
                    console.error(`Event at index ${index} for date ${date} is missing a valid name`);
                }
                if (typeof event.startTime !== "string") {
                    console.error(`Event at index ${index} for date ${date} is missing a valid startTime`);
                }
                if (typeof event.endTime !== "string") {
                    console.error(`Event at index ${index} for date ${date} is missing a valid endTime`);
                }
            });
        });
    }, [events]);

    const formatTheDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const filterEvents = (dateKey) => {
        if (!events[dateKey]) return [];
        return events[dateKey].filter(
            (event) =>
                event.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                (event.description &&
                    event.description.toLowerCase().includes(searchKeyword.toLowerCase()))
        );
    };

    const handleDeleteEvent = (dateKey, eventId) => {
        const updatedEvents = {...events};
        updatedEvents[dateKey] = updatedEvents[dateKey].filter((event) => event.id !== eventId);

        if (updatedEvents[dateKey].length === 0) {
            delete updatedEvents[dateKey];
        }

        setEvent(updatedEvents);
        localStorage.setItem("calendarEvents", JSON.stringify(updatedEvents));
    };

    const dayEvents = selectedDate ? filterEvents(formatTheDate(selectedDate)) : [];

    return (
        <div className="sm:w-80 w-full h-full bg-white border-l shadow-lg relative">
            <div className="p-4 border-b">
                <h2 className="text-xl font-bold text-gray-800">Upcoming Events</h2>
            </div>
            <div className="flex items-center my-4 space-x-2">
                <Input
                    className="rounded-none"
                    placeholder="Search events"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                />
            </div>
            <ScrollArea className="h-[calc(100vh-100px)] p-4">
                {!selectedDate ? (
                    <div className="text-center text-gray-500 py-4">Please select a date</div>
                ) : (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">
                            {formatTheDate(selectedDate)}
                        </h3>
                        {dayEvents.map((event, index) => (
                            <Card key={index} className="mb-4">
                                <CardHeader>
                                    <CardTitle className="text-base">{event.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center text-sm text-gray-600 mb-2">
                                        <Clock className="w-4 h-4 mr-2"/>
                                        {event.startTime} - {event.endTime}
                                    </div>
                                    <CardDescription className="text-sm">
                                        {event.description}
                                    </CardDescription>
                                    <CardFooter className="p-0 mt-5 flex gap-2 justify-end">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="size-5 cursor-pointer"
                                            onClick={() => prepareEditEvent(formatTheDate(selectedDate), event)}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 012.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
                                            />
                                        </svg>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="size-5 cursor-pointer"
                                            onClick={() => handleDeleteEvent(formatTheDate(selectedDate), event.id)}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M14.74 9L14.394 18m-4.788 0L9.26 9M9.968 5.79a48.108 48.108 0 00-3.478-.397m14.456.562a48.108 48.108 0 01-3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                            />
                                        </svg>
                                    </CardFooter>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </ScrollArea>
            <button
                className="absolute p-3 bg-emerald-500 bottom-10 right-10 rounded-md text-white cursor-pointer"
                onClick={() => setEventModalOpen(true)}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                </svg>
            </button>
        </div>
    );
};

EventsSidebar.propTypes = {
    events: PropTypes.object.isRequired,
    selectedDate: PropTypes.object,
    setEvent: PropTypes.func.isRequired,
    setEventModalOpen: PropTypes.func.isRequired,
    prepareEditEvent: PropTypes.func.isRequired,
};

export default EventsSidebar;
