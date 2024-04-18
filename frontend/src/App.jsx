import "./App.css";
import * as React from "react";
import { NextUIProvider } from "@nextui-org/react";
import Nav from "./components/Nav";
import Signup from "./components/Signup";
import Caard from "./components/Caard";
import {Route,Routes} from "react-router-dom";
import Login from "./components/Login";
function App() {
  return (
    <NextUIProvider>
      <Nav/>
      <Routes>
        <Route exact path="/" element={<Caard/>} />
        <Route  path="https://notesapp-git-main-badal-sharmas-projects.vercel.app/signup" element={<Signup/>} />
        <Route  path="https://notesapp-git-main-badal-sharmas-projects.vercel.app/login" element={<Login/>} />
      </Routes>
    </NextUIProvider>
  );
}

export default App;
