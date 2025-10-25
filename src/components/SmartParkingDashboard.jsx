import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import { FaCar, FaCarSide, FaDoorOpen } from "react-icons/fa";
import useAuth from "../hooks/useAuth";

// Firebase config
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET1,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

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

    useEffect(() => {
        const slot = timeSlots.find((s) => s.label === selectedSlot);
        if (slot) setPayment((slot.end - slot.start) * ratePerHour);
    }, [selectedSlot, timeSlots]);

    const handleBooking = () => {
        alert(`✅ Booking Confirmed:
Slot: ${slotNumber}
Date: ${date}
Time: ${selectedSlot}
Total: €${payment}`);
        onClose();
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
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mt-2"
                    >
                        Confirm Booking
                    </button>
                </div>
            </div>
        </div>
    );
};

const SmartParkingDashboard = () => {
    const [data, setData] = useState({});
    const [timers, setTimers] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const { user } = useAuth()

    // Firebase listener
    useEffect(() => {
        const parkingRef = ref(db, "Parking");
        onValue(parkingRef, (snapshot) => {
            const val = snapshot.val();
            if (val) setData(val);
            val.Slot2 = true;
        });
    }, []);

    // Start timers for occupied slots
    useEffect(() => {
        [1, 2, 3].forEach((i) => {
            const slotKey = `Slot${i}`;
            if (data[slotKey]) {
                const savedStart = localStorage.getItem(`timerStart_${slotKey}`);
                const savedDuration = localStorage.getItem(`timerDuration_${slotKey}`);
                if (savedStart && savedDuration) {
                    // calculate remaining time
                    const elapsed = Math.floor((Date.now() - Number(savedStart)) / 1000);
                    const remaining = Number(savedDuration) - elapsed;
                    if (remaining > 0) {
                        setTimers((prev) => ({ ...prev, [slotKey]: remaining }));
                    } else {
                        localStorage.removeItem(`timerStart_${slotKey}`);
                        localStorage.removeItem(`timerDuration_${slotKey}`);
                        setTimers((prev) => ({ ...prev, [slotKey]: 0 }));
                    }
                } else {
                    // start new timer
                    const startTime = Date.now();
                    localStorage.setItem(`timerStart_${slotKey}`, startTime);
                    localStorage.setItem(`timerDuration_${slotKey}`, 60);
                    setTimers((prev) => ({ ...prev, [slotKey]: 60 }));
                }
            }
        });
    }, [data]);

    // Timer interval
    useEffect(() => {
        const interval = setInterval(() => {
            setTimers((prev) => {
                const newTimers = { ...prev };
                Object.keys(newTimers).forEach((slot) => {
                    if (newTimers[slot] > 0) {
                        newTimers[slot] -= 1;
                    } else {
                        newTimers[slot] = 0;
                    }
                });
                return newTimers;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleBookNow = (slotNumber) => {
        setSelectedSlot(slotNumber);
        setModalOpen(true);
    };

    const gateStatus = data?.GateStatus || "CLOSED";
    const available = data?.AvailableSlots || 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col items-center justify-center px-4 py-10 mt-14">
            <h1 className="text-3xl md:text-5xl font-bold text-center mb-10 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Smart Parking Dashboard
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl">
                {[1, 2, 3].map((i) => {
                    const occupied = data[`Slot${i}`];
                    return (
                        <div
                            key={i}
                            className={`flex flex-col items-center justify-center p-6 rounded-2xl backdrop-blur-lg shadow-lg transition-transform transform hover:scale-105 duration-300 border
                ${occupied
                                    ? "bg-red-500/20 border-red-400"
                                    : "bg-green-500/20 border-green-400"
                                }`}
                        >
                            <FaCar
                                size={40}
                                className={`${occupied ? "text-red-400" : "text-green-400"}`}
                            />
                            <p className="mt-3 text-lg font-semibold">Slot {i}</p>
                            <span className="text-sm opacity-80 mt-1">
                                {occupied ? "Occupied" : "Empty"}
                            </span>
                            <div className="text-center mt-4 text-xl font-bold">
                                {timers[`Slot${i}`] > 0 ? `⏳ Time Left: ${timers[`Slot${i}`]}s` : ""}
                            </div>
                            {user ? (
                                <button
                                    onClick={() => handleBookNow(i)}
                                    className="mt-4 bg-blue-500 cursor-pointer hover:bg-blue-600 text-white py-2 px-4 rounded transition"
                                >
                                    Book Now
                                </button>
                            ) : (
                                <button
                                    disabled
                                    title="Please login to book"
                                    className="mt-4 bg-gray-500 text-white py-2 px-4 rounded cursor-not-allowed opacity-70"
                                >
                                    Book Now
                                </button>
                            )}

                        </div>
                    );
                })}

                <div
                    className={`flex flex-col items-center justify-center p-6 rounded-2xl backdrop-blur-lg shadow-lg transition-transform transform hover:scale-105 duration-300 border
            ${gateStatus === "OPEN"
                            ? "bg-green-500/20 border-green-400"
                            : "bg-red-500/20 border-red-400"
                        }`}
                >
                    <FaDoorOpen
                        size={40}
                        className={`${gateStatus === "OPEN" ? "text-green-400" : "text-red-400"}`}
                    />
                    <p className="mt-3 text-lg font-semibold">Gate</p>
                    <span className="text-sm opacity-80 mt-1">{gateStatus}</span>
                </div>

                <div className="flex flex-col items-center justify-center p-6 rounded-2xl backdrop-blur-lg shadow-lg transition-transform transform hover:scale-105 duration-300 border bg-blue-500/20 border-blue-400">
                    <FaCarSide size={40} className="text-blue-400" />
                    <p className="mt-3 text-lg font-semibold">Available Slots</p>
                    <span className="text-xl font-bold mt-1">{available}</span>
                </div>
            </div>

            <footer className="mt-10 text-gray-400 text-sm text-center">
                🚗 Smart Parking System | IoT Powered
            </footer>

            <BookingModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                slotNumber={selectedSlot}
            />
        </div>
    );
};

export default SmartParkingDashboard;
