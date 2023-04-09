import React, { useEffect, useRef, useState } from "react";
import { signInAnonymously } from "firebase/auth";
import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../utils/firebase";
import { api } from "../utils/api";

const Home = () => {
  const messageRef = useRef("");
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    console.log(messages);
  }, [messages]);

  useEffect(() => {
    const q = query(
      collection(db, "messages"),
      orderBy("created_at"),
      limit(50)
    );
    const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
      let messages = [];
      QuerySnapshot.forEach((doc) => {
        messages.push({ ...doc.data(), id: doc.id });
      });
      setMessages(messages);
    });
    return () => unsubscribe;
  }, []);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (name === "") {
      console.log("Name is empty");
      return;
    }
    if (messageRef.current.value.trim() === "") {
      alert("Enter valid message");
      return;
    }

    api({
      method: "POST",
      url: "/message",
      data: {
        message: messageRef.current.value,
        sender: name,
        room_id: 1,
      },
    })
      .then(({ data }) => {
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });
    /*
    event.preventDefault();
    if (name === "") {
      console.log("Name is empty");
      return;
    }
    if (messageRef.current.value.trim() === "") {
      alert("Enter valid message");
      return;
    }
    // const { uid, displayName, photoURL } = auth.currentUser;
    await addDoc(collection(db, "messages"), {
      message: messageRef.current.value,
      sender: name,
      room_id: "1",
      created_at: serverTimestamp(),
    });
    messageRef.current.value = "";
    */
  };

  return (
    <div>
      <h1>Home</h1>

      <h3>Name Input</h3>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <h3 className="text-red-600">Message Input</h3>
      <form onSubmit={sendMessage}>
        <input ref={messageRef} />
        <button type="submit">Send</button>
      </form>

      <h3>Chat</h3>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {messages?.map((message) => (
          <span
            key={message.id}
          >{`${message.sender}: ${message.message}`}</span>
        ))}
      </div>
    </div>
  );
};

export default Home;
