import React, { useEffect, useContext, useState, useCallback } from "react";
import io from "socket.io-client";
import config from "../../../config";
import LatestMessagesContext from "../../../contexts/LatestMessages/LatestMessages";
import INITIAL_BOTTY_MESSAGE from "../../../common/constants/initialBottyMessage";
import TypingMessage from "./TypingMessage";
import Header from "./Header";
import Footer from "./Footer";
import Message from "./Message";
import "../styles/_messages.scss";

const user = {
  YOU: "me",
  BOTTY: "bot",
};

const INITIAL_MESSAGE = {
  message: INITIAL_BOTTY_MESSAGE,
  id: Date.now(),
  user: user.BOTTY,
};

const socket = io(config.BOT_SERVER_ENDPOINT, {
  transports: ["websocket", "polling", "flashsocket"],
});

function scrollToBottom() {
  const list = document.getElementById("message-list");
  list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
}

function Messages() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [botTyping, setBotTyping] = useState(false);
  const { setLatestMessage } = useContext(LatestMessagesContext);

  useEffect(() => {
    socket.off("bot-message");
    socket.on("bot-message", (message) => {
      setBotTyping(false);
      setMessages([...messages, { message, user: user.BOTTY, id: Date.now() }]);
      setLatestMessage(user.BOTTY, message);
      scrollToBottom();
    });
  }, [messages, setLatestMessage]);

  const sendMessage = useCallback(() => {
    if (!message) return;
    setMessages([...messages, { message, user: user.YOU, id: Date.now() }]);
    scrollToBottom();
    socket.emit("user-message", message);
    setMessage("");
  }, [messages, message]);

  const onChangeMessage = (e) => {
    setMessage(e.target.value);
  };

  return (
    <div className="messages">
      <Header />
      <div className="messages__list" id="message-list">
        {messages.map((message, index) => (
          <React.Fragment key={message.id}>
            <Message
              message={message}
              nextMessage={messages[index + 1]}
              botTyping={botTyping}
            />
          </React.Fragment>
        ))}
        {botTyping ? <TypingMessage /> : null}
      </div>
      <Footer
        message={message}
        sendMessage={sendMessage}
        onChangeMessage={onChangeMessage}
      />
    </div>
  );
}

export default Messages;
