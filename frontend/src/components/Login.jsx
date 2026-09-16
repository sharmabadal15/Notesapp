import React, { useState } from "react";
import { Input, Button, Link } from "@nextui-org/react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authentication/AuthContext";
import { Mail, Lock, ArrowRight } from "react-feather";

export default function Login() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/login", formData);
      if (response.data?.user && response.data?.token) {
        const { id, email, username } = response.data.user;
        login({ id, email, username }, response.data.token);
        navigate("/");
      } else {
        setError("Unexpected response from server");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
            <Lock size={20} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-white/40 text-sm">
            Sign in to continue to your notes
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="glass rounded-2xl p-8 space-y-5"
        >
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <Input
            type="email"
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            variant="bordered"
            size="lg"
            startContent={<Mail size={16} className="text-white/30" />}
            classNames={{
              inputWrapper:
                "border-white/10 hover:border-white/20 bg-white/5 group-data-[focus=true]:border-violet-500/50",
              input: "text-white/90",
              label: "text-white/40",
            }}
          />

          <Input
            type="password"
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            variant="bordered"
            size="lg"
            startContent={<Lock size={16} className="text-white/30" />}
            classNames={{
              inputWrapper:
                "border-white/10 hover:border-white/20 bg-white/5 group-data-[focus=true]:border-violet-500/50",
              input: "text-white/90",
              label: "text-white/40",
            }}
          />

          <Button
            type="submit"
            isLoading={loading}
            size="lg"
            radius="full"
            className="w-full bg-gradient-to-r from-violet-600 to-blue-600 text-white font-medium shadow-lg shadow-violet-500/20 mt-2"
            endContent={!loading && <ArrowRight size={16} />}
          >
            Sign In
          </Button>

          <p className="text-center text-sm text-white/30 pt-2">
            Don't have an account?{" "}
            <Link
              href="/signup"
              size="sm"
              className="text-violet-400 hover:text-violet-300"
            >
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
