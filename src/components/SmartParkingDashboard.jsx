import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import { FaCar, FaCarSide, FaDoorOpen } from "react-icons/fa";

import BookingModal from "./BookingModal";

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



const SmartParkingDashboard = () => {
    const [data, setData] = useState({});
    const [timers, setTimers] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [activeSlots, setActiveSlots] = useState([]);

    useEffect(() => {
        if (!bookings || bookings.length === 0) return;

        const now = new Date();

        const activeBookings = bookings.filter(booking => {
            let startDateTime = new Date(`${booking.date}T${booking.startTime}:00`);
            let endDateTime = new Date(`${booking.date}T${booking.endTime}:00`);


            return now >= startDateTime && now <= endDateTime;
        });

        const activeIds = activeBookings.map(b => b.id);


        const slots = activeBookings.map(b => b.slotNumber);
        setActiveSlots(slots);

        // console.log("Active Booking IDs:", activeIds);
        // console.log("Active Slots:", slots);

    }, [bookings]);




    useEffect(() => {
        const parkingRef = ref(db, "Parking");
        onValue(parkingRef, (snapshot) => {
            const val = snapshot.val();
            if (val) setData(val);
        });
    }, []);

    useEffect(() => {
        [1, 2, 3].forEach((i) => {
            const slotKey = `Slot${i}`;
            if (data[slotKey]) {
                const savedStart = localStorage.getItem(`timerStart_${slotKey}`);
                const savedDuration = localStorage.getItem(`timerDuration_${slotKey}`);
                if (savedStart && savedDuration) {
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

                    const startTime = Date.now();
                    localStorage.setItem(`timerStart_${slotKey}`, startTime);
                    localStorage.setItem(`timerDuration_${slotKey}`, 60);
                    setTimers((prev) => ({ ...prev, [slotKey]: 60 }));
                }
            }
        });
    }, [data]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimers((prev) => {
                const newTimers = { ...prev };

                Object.keys(newTimers).forEach((slot) => {
                    if (newTimers[slot] > 0) {
                        newTimers[slot] -= 1;
                        if (newTimers[slot] === 0) {
                            alert(`⏰ Slot ${slot.replace("Slot", "")} er 1 minute is finished!`);
                        }

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
    const gateStatus = data?.GateStatus || "CLOSED";

    const totalSlots = 3;

    const bookedFromActive = activeSlots.map(b => b.slotNumber);

    const bookedFromData = ["Slot1", "Slot2", "Slot3"].filter(slot => data?.[slot] === true);

    const allBooked = new Set([...bookedFromActive, ...bookedFromData]);

    const available = totalSlots - allBooked.size;


    return (<>
        <BookingModal></BookingModal>
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
                            <span className="text-xl opacity-80 mt-1">
                                {
                                    activeSlots.includes(i) ? 'Already Booked Now' : ''
                                }

                            </span>
                            <div className="text-center mt-4 text-xl font-bold">
                                {timers[`Slot${i}`] > 0 ? `⏳ Time Left: ${timers[`Slot${i}`]}s` : ""}
                            </div>
                            <button
                                onClick={() => handleBookNow(i)}
                                className="mt-4 bg-blue-500 cursor-pointer hover:bg-blue-600 text-white py-2 px-4 rounded transition"
                            >
                                Book Now
                            </button>


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
    </>
    );
};

export default SmartParkingDashboard;
