import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Chat } from "./components/Chat";
import { Conversations } from "./components/Conversations";
import { Login } from "./components/Login";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthContextProvider } from "./contexts/AuthContext";
import { ActiveConversations } from "./components/ActiveConversations";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <AuthContextProvider>
                <Navbar />
            </AuthContextProvider>
          }
        >
          <Route path="" element={<ProtectedRoute><Conversations /></ProtectedRoute>}/>
          <Route path="chats/:conversationName" element={<ProtectedRoute><Chat /></ProtectedRoute>}/>
          
          
          <Route path="login/" element={<Login />} />
        </Route>
        <Route 
          path="conversations/"
          element={
            <ProtectedRoute>
              <ActiveConversations />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}