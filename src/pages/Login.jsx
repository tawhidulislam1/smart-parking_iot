import { Link } from "react-router-dom";

const Login = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white px-4">
      <div className="bg-gray-800 w-full max-w-md p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">
          Welcome Back 👋
        </h2>

        <form className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email Address"
            className="p-3 rounded-md bg-gray-700 border border-gray-600 focus:border-blue-400 focus:outline-none"
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="p-3 rounded-md bg-gray-700 border border-gray-600 focus:border-blue-400 focus:outline-none"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 py-3 rounded-md font-semibold transition"
          >
            Login
          </button>
        </form>

        <p className="text-center mt-4 text-gray-400">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-400 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
