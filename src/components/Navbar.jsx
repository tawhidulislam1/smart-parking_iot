import { useState } from "react";
import { Link } from "react-router-dom";
import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa";

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState(null); // change to actual auth state later

    const toggleMenu = () => setMenuOpen(!menuOpen);

    return (
        <nav className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3">
                {/* Logo */}
                <Link to="/" className="text-2xl font-bold text-blue-600">
                    Smart Parking
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-6">
                    {!user ? (
                        <>
                            <Link
                                to="/login"
                                className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                            >
                                Register
                            </Link>
                        </>
                    ) : (
                        <div className="relative group cursor-pointer">
                            <FaUserCircle className="text-3xl text-gray-700 hover:text-blue-600" />
                            {/* Dropdown (optional) */}
                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition">
                                <Link
                                    to="/profile"
                                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                >
                                    Profile
                                </Link>
                                <button
                                    onClick={() => setUser(null)}
                                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={toggleMenu}
                    className="md:hidden text-2xl text-gray-700 focus:outline-none"
                >
                    {menuOpen ? <FaTimes /> : <FaBars />}
                </button>
            </div>

            {/* Mobile Dropdown Menu */}
            {menuOpen && (
                <div className="md:hidden bg-white shadow-lg border-t">
                    <div className="flex flex-col items-center py-4 space-y-3">
                        {!user ? (
                            <>
                                <Link
                                    to="/login"
                                    className="text-gray-700 hover:text-blue-600 font-medium"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="text-gray-700 hover:text-blue-600 font-medium"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Register
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/profile"
                                    className="text-gray-700 hover:text-blue-600 font-medium"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Profile
                                </Link>
                                <button
                                    onClick={() => {
                                        setUser(null);
                                        setMenuOpen(false);
                                    }}
                                    className="text-gray-700 hover:text-blue-600 font-medium"
                                >
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
