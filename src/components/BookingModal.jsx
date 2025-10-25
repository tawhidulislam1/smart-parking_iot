import { useEffect, useState } from "react";
import { ref, push, set, onValue } from "firebase/database";
import { db } from "../firebase/firebase.init";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const BookingModal = ({ isOpen, onClose, slotNumber }) => {
    const { user } = useAuth();
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [payment, setPayment] = useState(0);
    const [loading, setLoading] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [activeSlots, setActiveSlots] = useState([]);
    const navigate = useNavigate();

    const ratePerHour = 1;

    useEffect(() => {
        const bookingRef = ref(db, "Bookings");

        onValue(bookingRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const bookingArray = Object.entries(data).map(([id, value]) => ({
                    id,
                    ...value,
                }));
                setBookings(bookingArray);
            } else {
                setBookings([]);
            }
        });
    }, []);
    useEffect(() => {
        if (!bookings || bookings.length === 0) return;

        const now = new Date();

        const activeBookings = bookings.filter(booking => {
            const startDateTime = new Date(`${booking.date}T${booking.startTime}:00`);
            const endDateTime = new Date(`${booking.date}T${booking.endTime}:00`);

            return now >= startDateTime && now <= endDateTime;
        });

        const slots = activeBookings.map(b => b.slotNumber);
        setActiveSlots(slots);

    }, [bookings]);

    useEffect(() => {
        if (!startTime || !endTime) {
            setPayment(0);
            return;
        }

        const [startH, startM] = startTime.split(":").map(Number);
        const [endH, endM] = endTime.split(":").map(Number);

        let startTotal = startH * 60 + startM;
        let endTotal = endH * 60 + endM;

        if (endTotal <= startTotal) {
            endTotal += 24 * 60; 
        }

        const durationMinutes = endTotal - startTotal;
        const hours = durationMinutes / 60;

        const calculatedPayment = Math.ceil(hours) * ratePerHour;
        setPayment(calculatedPayment);

    }, [startTime, endTime]);

    const handleBooking = async () => {
        if (!date) return alert("❗ Please select a date.");
        if (!startTime || !endTime) return alert("❗ Please select start and end time.");
        if (!user) {
            navigate("/login");
            return;
        }

        setLoading(true);

        try {
         
            const isSlotTaken = bookings.some(b => {
                if (b.slotNumber !== slotNumber) return false;

                const existingStart = new Date(`${b.date}T${b.startTime}:00`);
                const existingEnd = new Date(`${b.date}T${b.endTime}:00`);

                const newStart = new Date(`${date}T${startTime}:00`);
                const newEnd = new Date(`${date}T${endTime}:00`);

                return (newStart < existingEnd && newEnd > existingStart);
            });

            if (isSlotTaken) {
                alert(`❌ Slot ${slotNumber} is already booked for this `);
                setLoading(false);
                return;
            }

            const bookingRef = push(ref(db, "Bookings"));

            await set(bookingRef, {
                slotNumber,
                date,
                startTime,
                endTime,
                email: user?.email,
                totalPayment: payment,
                createdAt: new Date().toISOString(),
                status: "confirmed",
            });

            alert(`✅ Booking Confirmed!
Slot: ${slotNumber}
Date: ${date}
Time: ${startTime} - ${endTime}
Total: €${payment}`);

            // Reset form
            setDate("");
            setStartTime("");
            setEndTime("");
            setPayment(0);
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
                            min={new Date().toISOString().split("T")[0]}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full p-2 rounded bg-gray-800 text-white"
                        />
                    </div>

                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="block mb-1">Start Time:</label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full p-2 rounded bg-gray-800 text-white"
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block mb-1">End Time:</label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full p-2 rounded bg-gray-800 text-white"
                            />
                        </div>
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
