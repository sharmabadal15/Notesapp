import React, { useState } from "react";
import { Input, Button, Spacer, Link } from "@nextui-org/react";
import axios from "axios";
import { useAuth } from "../authentication/AuthContext"; // Import useAuth hook
import { useNavigate } from "react-router-dom"; // Import useNavigate hook

export default function Signup() {
  const { login } = useAuth(); // Import the login function from the authentication context
  const navigate = useNavigate(); // Import the navigate function

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://notesapp-fvg3.vercel.app/addusers",
        formData
      );
      if (response.data && response.data.message === "Signup successful") {
        // Signup was successful, proceed with login and redirect
        const userData = response.data.user; // Extract user data from response
        login(userData); // Trigger login process with user data
        navigate("/"); // Redirect to home page
        console.log("Signup successful:", userData);
      } else {
        // Signup failed or response is unexpected
        console.error("Signup failed:", response.data.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };
  
  

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto mt-10">
      <div className="mb-4">
        <Input
          size="sm"
          type="text"
          label="UserName"
          name="username"
          value={formData.username}
          onChange={handleChange}
        />
      </div>
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
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />
      </div>
      <div className="flex justify-end">
        <Button
          type="button"
          auto
          color="error"
          className="mr-2 hover:bg-red-600"
          href="/"
          as={Link}
        >
          Cancel
        </Button>
        <Button type="submit" auto className="mr-2 hover:bg-blue-600">
          Sign Up
        </Button>
      </div>
      <Spacer y={2} />
    </form>
  );
}

