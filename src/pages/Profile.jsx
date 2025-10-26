import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import useAuth from "../hooks/useAuth";
import { db } from "../firebase/firebase.init";

const UserProfile = () => {
    const [bookings, setBookings] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        if (!user?.email) return;

        const bookingsRef = ref(db, "Bookings");
        onValue(bookingsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const userBookings = Object.entries(data)
                    .map(([id, value]) => ({ id, ...value }))
                    .filter((b) => b.email === user.email);
                setBookings(userBookings);
            } else {
                setBookings([]);
            }
        });
    }, [user]);

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-gray-200 bg-gray-900">
                <h2 className="text-xl font-semibold">Please login first 🔐</h2>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col items-center px-4 py-10">
            {/* ✅ User Info Card */}
            <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md text-center border border-gray-700 mb-10">
                <img
                    src={user.photoURL || "https://i.ibb.co/MBtjqXQ/no-avatar.gif"}
                    alt="User Avatar"
                    className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-500"
                />
                <h2 className="text-2xl font-bold mb-2">{user.displayName || "Unknown User"}</h2>
                <p className="text-gray-400 mb-4">{user.email}</p>

                <div className="bg-gray-700 p-4 rounded-lg text-left space-y-2">
                    <p><span className="font-semibold">Phone:</span> {user.phoneNumber || "N/A"}</p>
                    <p><span className="font-semibold">Joined:</span> {user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "Unknown"}</p>
                </div>
            </div>

            {/* ✅ Booking Table */}
            <div className="w-full max-w-4xl bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
                <h3 className="text-2xl font-semibold mb-4 text-center">My Bookings 📅</h3>

                {bookings.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse border border-gray-700">
                            <thead className="bg-gray-700 text-gray-300">
                                <tr>
                                    <th className="border border-gray-600 px-4 py-2">#</th>
                                    <th className="border border-gray-600 px-4 py-2">Slot</th>
                                    <th className="border border-gray-600 px-4 py-2">Date</th>
                                    <th className="border border-gray-600 px-4 py-2">Start</th>
                                    <th className="border border-gray-600 px-4 py-2">End</th>
                                    <th className="border border-gray-600 px-4 py-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((b, index) => (
                                    <tr key={b.id} className="hover:bg-gray-700 transition">
                                        <td className="border border-gray-600 px-4 py-2 text-center">{index + 1}</td>
                                        <td className="border border-gray-600 px-4 py-2 text-center">{b.slotNumber || "-"}</td>
                                        <td className="border border-gray-600 px-4 py-2 text-center">{b.date}</td>
                                        <td className="border border-gray-600 px-4 py-2 text-center">{b.startTime}</td>
                                        <td className="border border-gray-600 px-4 py-2 text-center">{b.endTime}</td>
                                        <td className="border border-gray-600 px-4 py-2 text-center">
                                            <span className={`px-3 py-1 rounded-full text-sm border ${b.status === "Completed"
                                                    ? "bg-green-600/30 text-green-400 border-green-400"
                                                    : "bg-yellow-600/30 text-yellow-400 border-yellow-400"
                                                }`}>
                                                {b.status || "Active"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-gray-400 py-4">No bookings found 😔</p>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
