import React from 'react';
import useWebsocket, { ReadyState } from "react-use-websocket";

export default function App() {
  const { readyState } = useWebsocket("ws://localhost:8000", {
    onOpen: () => {
      console.log("Connected!");
    },
    onClose: (event) => {
      console.log("Disconnected!");
      console.log(event.code)
    },
    onError: (e: Event) => {
      // e.preventDefault()
    },
    onMessage: (e: Event) => {
      console.log(e);
    }
  
  });

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated"
  }[readyState];
  
  return (
    <div>
      <span>The WebSocket is currently {connectionStatus}</span>
    </div>
  );

}

