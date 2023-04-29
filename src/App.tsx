import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CompatClient, IMessage, Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';

const ENDPOINT = process.env.REACT_APP_SOCKET_URL as string;

interface Message {
  content: string;
  createdAt: string;
  isImportant: boolean;
  memoId: number;
  modifiedAt: string;
}

function App() {
  const client = useRef<CompatClient>();
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);

  const loadMessages = () => {
    axios
      .get('/workspace/memo-list/1', {
        baseURL: process.env.REACT_APP_API_URL,
      })
      .then((res) => {
        console.log(res.data);
        setMessages(res.data);
      });
  };

  const handleSubscribe = (message: IMessage) => {
    // const newMessage = JSON.parse(message.body);
    // console.log({ newMessage });
    // setMessages((prevMessages) => [...prevMessages, newMessage.content]);
  };

  const sendHandler = (e: React.FormEvent) => {
    e.preventDefault();
    client.current?.send(
      '/app/memo',
      {},
      JSON.stringify({
        workspaceId: 1,
        content: message,
      })
    );
    setMessage('');
    setTimeout(() => {
      loadMessages();
    }, 50);
  };

  const connectHandler = useCallback(() => {
    // client.current = Stomp.over(() => {
    //   const sock = new SockJS(ENDPOINT);
    //   return sock;
    // })
    client.current = Stomp.over(() => new SockJS(ENDPOINT));
    setMessages([]);
    client.current.connect({}, () => {
      console.log('asdfsadfsadfasgjklasdgklsjadgklasdjgklasdjgklsadjglasg');
      loadMessages();
      // client.current?.subscribe(`/sub/chat/room/${1}`, handleSubscribe);
    });
  }, []);

  useEffect(() => {
    connectHandler();
    return () => {
      client.current?.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>Chat App</h1>
      <div>
        {messages.map((message, index) => (
          <p key={index}>{message.content}</p>
        ))}
      </div>
      <form onSubmit={sendHandler}>
        <input
          type='text'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type='submit'>Send</button>
      </form>
    </div>
  );
}

export default App;
