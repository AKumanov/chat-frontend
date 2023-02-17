import React, { useContext, useState } from 'react';
import useWebsocket, { ReadyState } from 'react-use-websocket';
import { AuthContext } from '../contexts/AuthContext';
import { useParams } from "react-router-dom";
import { MessageModel } from '../models/Message';
import { Message } from './Message';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ChatLoader } from './ChatLLoader';

export function Chat() {
  const [page, setPage] = useState(2);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const { conversationName } = useParams();
  const { user } = useContext(AuthContext);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const { sendJsonMessage } = useWebsocket(user ? `ws://127.0.0.1:8000/${conversationName}`: null, {queryParams: {token: user? user.token: ""}});

  const [message, setMessage] = useState("");
  const [messageHistory, setMessageHistory] = useState<any>([]);

  function handleChangeMessage(e: any) {
    setMessage(e.target.value);
  }

  function handleSubmit() {
    sendJsonMessage({
      type: "chat_message",
      message,
    });
    setMessage("");
  }

  async function fetchMessages() {
    const apiRes = await fetch(
      `http://127.0.0.1:8000/api/messages/?conversation=${conversationName}&page=${page}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`
        }
      }
    );
    if(apiRes.status === 200) {
      const data: {
        count: number;
        next: string | null;
        previous: string | null;
        results: MessageModel[];
      } = await apiRes.json();
      setHasMoreMessages(data.next !== null);
      setPage(page + 1);
      setMessageHistory((prev: MessageModel[]) => prev.concat(data.results));
    }
  }

  const { readyState } = useWebsocket(user ? `ws://127.0.0.1:8000/${conversationName}` : null, {
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
          setMessageHistory((prev: any) => [data.message, ...prev]);
          break;
        case "last_50_messages":
          setMessageHistory(data.messages);
          setHasMoreMessages(data.has_more);
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
          <div
            id="scrollableDiv"
            className='h-[20rem] mt-3 flex flex-col-reverse relative w-full border border-gray-200 overflow-y-auto p-6'
          >
            <div>
              <InfiniteScroll
                dataLength={messageHistory.length}
                next={fetchMessages}
                className="flex flex-col-reverse"
                inverse={true}
                hasMore={hasMoreMessages}
                loader={<ChatLoader />}
                scrollableTarget="scrollableDiv"
              >
                {messageHistory.map((message: MessageModel) => (
                  <Message key={message.id} message={message}/>
                ))}
              </InfiniteScroll>
            </div>
          </div>
    </div>
  );


}