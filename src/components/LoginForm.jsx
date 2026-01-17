import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";

const STATIC_ADMIN = {
  username: "admin",
  email: "rabab.jayed25@gmail.com",
  password: "Admin@123",
};

const LoginForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [popup, setPopup] = useState({
    show: false,
    type: "",
    message: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { login, password } = formData;

    setTimeout(() => {
      const isValidLogin =
        (login === STATIC_ADMIN.email ||
          login === STATIC_ADMIN.username) &&
        password === STATIC_ADMIN.password;

      if (isValidLogin) {
        localStorage.setItem("adminToken", "STATIC_ADMIN_TOKEN");
        localStorage.setItem(
          "adminUser",
          JSON.stringify({
            name: STATIC_ADMIN.username,
            email: STATIC_ADMIN.email,
            role: "admin",
          })
        );

        setPopup({
          show: true,
          type: "success",
          message: `Login Successful! Welcome ${STATIC_ADMIN.email} 👋`,
        });

        setTimeout(() => {
          setPopup({ show: false, type: "", message: "" });
          navigate("/dashboard");
        }, 1000);
      } else {
        setError("Invalid admin credentials!");
        setPopup({
          show: true,
          type: "error",
          message: "Invalid credentials! Try again.",
        });

        setTimeout(
          () => setPopup({ show: false, type: "", message: "" }),
          2000
        );
      }

      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col items-center justify-center px-4">
      <div className="mb-8">
        <img
          src="/image1.png"
          alt="Logo"
          className="h-40 object-contain"
        />
      </div>
      <div className="w-full max-w-md bg-white border border-gray-200 shadow-md rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-[#0A1E3A] mb-6">
          Admin Dashboard
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[#0A1E3A] font-medium mb-1 text-sm">
              Username or Email
            </label>
            <input
              type="text"
              name="login"
              value={formData.login}
              onChange={handleChange}
              required
              placeholder="admin or admin@swapstreet.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8901d] focus:outline-none"
            />
          </div>

          <div className="relative">
            <label className="block text-[#0A1E3A] font-medium mb-1 text-sm">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8901d] focus:outline-none pr-10"
            />
            <button
              type="button"
              onClick={toggleShowPassword}
              className="absolute right-3 top-8 text-gray-500 hover:text-[#c8901d]"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0A1E3A] hover:bg-[#112d58] text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>

      {popup.show && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg text-white shadow-lg transition ${
            popup.type === "success"
              ? "bg-[#0A1E3A]"
              : "bg-red-500"
          }`}
        >
          {popup.message}
        </div>
      )}
    </div>
  );
};

export default LoginForm;
