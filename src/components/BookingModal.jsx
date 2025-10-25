import { useEffect, useState } from "react";
import { ref, push, set } from "firebase/database";
import { db } from "../firebase/firebase.init";

const BookingModal = ({ isOpen, onClose, slotNumber }) => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const timeSlots = [
        { label: "4:00 - 5:00 AM", start: 4, end: 5 },
        { label: "5:00 - 6:00 AM", start: 5, end: 6 },
        { label: "6:00 - 7:00 AM", start: 6, end: 7 },
        { label: "7:00 - 8:00 AM", start: 7, end: 8 },
        { label: "8:00 - 10:00 AM", start: 8, end: 10 },
        { label: "10:00 - 12:00 PM", start: 10, end: 12 },
        { label: "12:00 - 1:00 PM", start: 12, end: 13 },
        { label: "1:00 - 3:00 PM", start: 13, end: 15 },
        { label: "3:00 - 5:00 PM", start: 15, end: 17 },
        { label: "5:00 - 6:00 PM", start: 17, end: 18 },
        { label: "6:00 - 8:00 PM", start: 18, end: 20 },
        { label: "8:00 - 9:00 PM", start: 20, end: 21 },
    ];

    const ratePerHour = 1;
    const [selectedSlot, setSelectedSlot] = useState(timeSlots[0].label);
    const [date, setDate] = useState("");
    const [payment, setPayment] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const slot = timeSlots.find((s) => s.label === selectedSlot);
        if (slot) setPayment((slot.end - slot.start) * ratePerHour);
    }, [selectedSlot, timeSlots]);

    const handleBooking = async () => {
        if (!date) return alert("❗ Please select a date before confirming.");

        setLoading(true);

        try {
            // Create a unique booking ID inside "Bookings" node
            const bookingRef = push(ref(db, "Bookings"));

            await set(bookingRef, {
                slotNumber,
                date,
                time: selectedSlot,
                totalPayment: payment,
                createdAt: new Date().toISOString(),
                status: "confirmed",
            });

            alert(`✅ Booking Confirmed!
Slot: ${slotNumber}
Date: ${date}
Time: ${selectedSlot}
Total: €${payment}`);

            setDate("");
            setSelectedSlot(timeSlots[0].label);
            onClose();
        } catch (error) {
            console.error("Error saving booking:", error);
            alert("❌ Failed to save booking. Try again.");
        }

        setLoading(false);
    };




 
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-xl w-full max-w-md text-white relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl font-bold"
                >
                    &times;
                </button>
                <h2 className="text-2xl font-bold mb-4">Book Slot {slotNumber}</h2>
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block mb-1">Date:</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full p-2 rounded bg-gray-800 text-white"
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Select Time Slot:</label>
                        <select
                            value={selectedSlot}
                            onChange={(e) => setSelectedSlot(e.target.value)}
                            className="w-full p-2 rounded bg-gray-800 text-white"
                        >
                            {timeSlots.map((slot) => (
                                <option key={slot.label} value={slot.label}>
                                    {slot.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <p className="font-semibold">Payment: €{payment}</p>
                    <button
                        onClick={handleBooking}
                        disabled={loading}
                        className={`${loading ? "bg-gray-600" : "bg-blue-500 hover:bg-blue-600"
                            } text-white py-2 px-4 rounded mt-2`}
                    >
                        {loading ? "Saving..." : "Confirm Booking"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;
