import React, { useState } from "react";
import { Input, Button, Spacer, Link } from "@nextui-org/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authentication/AuthContext"; // Import useAuth hook

export default function Login() {
  const { login, setIsLoggedIn } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:2000/login",
        formData
      );
      if (response && response.data && response.data.user) {
        const { id, email, password, username } = response.data.user;
        login({ id, email, password, username });
        setIsLoggedIn(true);
        navigate("/");
        console.log("Login successful:", response.data.user);
      } else {
        console.error("Login response is invalid:", response);
      }
    } catch (error) {
      console.error("Error logging in:", error.response.data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto mt-10">
      <div className="mb-4">
        <Input
          size="sm"
          type="text"
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <Input
          size="sm"
          type="password"
          label="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />
      </div>
      <div className="flex justify-end">
        <Button
          type="button"
          color="error"
          className="mr-2 hover:bg-red-600"
          href="/"
          as={Link}
        >
          Cancel
        </Button>
        <Button type="submit" className="mr-2 hover:bg-blue-600">
          Login
        </Button>
      </div>
      <Spacer y={2} />
    </form>
  );
}
