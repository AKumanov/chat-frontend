import React, { useContext, useState } from 'react';
import useWebsocket, { ReadyState } from 'react-use-websocket';
import { AuthContext } from '../contexts/AuthContext';

export function Chat() {
  const { user } = useContext(AuthContext);
    const [welcomeMessage, setWelcomeMessage] = useState("");
  const { sendJsonMessage } = useWebsocket(user ? "ws://127.0.0.1:8000/": null, {queryParams: {token: user? user.token: ""}});

  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [messageHistory, setMessageHistory] = useState<any>([]);

  function handleChangeMessage(e: any) {
    setMessage(e.target.value);
  }

  function handleChangeName(e: any) {
    setName(e.target.value);
  }

  function handleSubmit() {
    sendJsonMessage({
      type: "chat_message",
      message,
      name
    });
    setName("");
    setMessage("");
  }

  const { readyState } = useWebsocket(user ? "ws://127.0.0.1:8000/" : null, {
    queryParams: {
      token: user ? user.token : "",
    },
    onOpen: () => {
      console.log("Connected!");
    },
    onClose: (event) => {
      console.log("Disconnected!");
      console.log(event.code)
    },
    onError: (e: Event) => {

      console.log(e)
    },
    onMessage: (e) => {
      const data = JSON.parse(e.data);

      switch (data.type) {
        case "welcome_message":
          setWelcomeMessage(data.message)
          break;
        case "chat_message_echo":
          setMessageHistory((prev:any) => prev.concat(data));
          break;
        default:
          console.error("Unkown message type!");
          break;
      }
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
      <p>{welcomeMessage}</p>
      <button
        className='bg-gray-300 px-3 py-1'
        onClick={() => {
          sendJsonMessage({
            type: "greeting",
            message: "Hi!"
          });
        }}
      >
        Say Hi
      </button>
      <input
        name="name"
        placeholder='Name'
        onChange={handleChangeName}
        value={name}
        className="shadow-sm sm:text-sm border-gray-300 bg-gray-100 rounded-md"/>
      <input
        name="message"
        placeholder='Message'
        onChange={handleChangeMessage}
        value={message}
        className="ml-2 shadow-sm sm:text-sm border-gray-300 bg-gray-100 rounded-md"/>
      <button className='ml-3 bg-gray-300 px-3 py-1' onClick={handleSubmit}>
        Submit
      </button>

    <hr />
    <ul>
      {messageHistory.map((message: any, idx: number) => (
        <div className='border border-gray-200 py-3 px-3' key={idx}>
          {message.name}: {message.message}
        </div>
      ))}
    </ul>
    
    </div>
  );


}