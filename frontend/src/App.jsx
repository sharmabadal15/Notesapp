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
        <Route  path="/signup" element={<Signup/>} />
        <Route  path="/login" element={<Login/>} />
      </Routes>
    </NextUIProvider>
  );
}

export default App;
