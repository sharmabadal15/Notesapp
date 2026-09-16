import "./App.css";
import * as React from "react";
import { NextUIProvider } from "@nextui-org/react";
import Nav from "./components/Nav";
import Signup from "./components/Signup";
import NoteCard from "./components/NoteCard";
import { Route, Routes } from "react-router-dom";
import Login from "./components/Login";

function App() {
  return (
    <NextUIProvider>
      <Nav />
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route exact path="/" element={<NoteCard />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </NextUIProvider>
  );
}

export default App;
