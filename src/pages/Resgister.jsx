import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import useAuth from "../hooks/useAuth";

const Register = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { createUser, updateUser } = useAuth(); 
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        try {
            const res = await createUser(data.email, data.password);
   

            await updateUser(data.name);
            Swal.fire({
                title: "Account Created!",
                text: "Welcome aboard 🚗",
                icon: "success",
                confirmButtonColor: "#3b82f6",
            });

            navigate("/");
        } catch (error) {
            console.error("Error:", error.message);
            Swal.fire({
                title: "Error!",
                text: error.message,
                icon: "error",
                confirmButtonColor: "#ef4444",
            });
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white px-4">
            <div className="bg-gray-800 w-full max-w-md p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold text-center mb-6">
                    Create an Account ✨
                </h2>

                {/* ✅ Connected form */}
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <input
                        {...register("name", { required: "Full Name is required" })}
                        type="text"
                        placeholder="Full Name"
                        className="p-3 rounded-md bg-gray-700 border border-gray-600 focus:border-blue-400 focus:outline-none"
                    />
                    {errors.name && <p className="text-red-400 text-sm">{errors.name.message}</p>}

                    <input
                        {...register("email", { required: "Email is required" })}
                        type="email"
                        placeholder="Email Address"
                        className="p-3 rounded-md bg-gray-700 border border-gray-600 focus:border-blue-400 focus:outline-none"
                    />
                    {errors.email && <p className="text-red-400 text-sm">{errors.email.message}</p>}

                    <input
                        {...register("password", { required: "Password is required", minLength: 6 })}
                        type="password"
                        placeholder="Password"
                        className="p-3 rounded-md bg-gray-700 border border-gray-600 focus:border-blue-400 focus:outline-none"
                    />
                    {errors.password && <p className="text-red-400 text-sm">{errors.password.message}</p>}

                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 py-3 rounded-md font-semibold transition"
                    >
                        Register
                    </button>
                </form>

                <p className="text-center mt-4 text-gray-400">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-400 hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
