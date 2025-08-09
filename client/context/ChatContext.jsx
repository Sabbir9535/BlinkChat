import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";
import { encryptAES, decryptAES } from "../src/lib/aes";

export const chatContext = createContext();
export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setselectedUser] = useState(null);
  const [unseenMessages, setUnseenMessage] = useState({});
  const { socket, axios } = useContext(AuthContext);

  // Get all users for sidebar
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessage(data.unseenMessages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Get messages for selected user (decrypt here)
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        // Decrypt all messages before setting
        const decryptedMessages = data.messages.map((msg) => ({
          ...msg,
          text: msg.text ? decryptAES(msg.text) : "",
        }));
        setMessages(decryptedMessages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Send message to selected user (encrypt before sending)
  const sendMessage = async (messageData) => {
    try {
      let dataToSend = { ...messageData };
      if (dataToSend.text) {
        dataToSend.text = encryptAES(dataToSend.text);
      }
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        dataToSend
      );
      if (data.success) {
        // Decrypt message before adding to state
        if (data.newMessage.text) {
          data.newMessage.text = decryptAES(data.newMessage.text);
        }
        setMessages((prevMessages) => [...prevMessages, data.newMessage]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Subscribe to messages for selected user (decrypt incoming)
  const subscribeToMessages = async () => {
    if (!socket) return;
    socket.on("newMessage", (newMessage) => {
      if (newMessage.text) {
        newMessage.text = decryptAES(newMessage.text);
      }
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        setUnseenMessage((prevUnseenMessages) => ({
          ...prevUnseenMessages,
          [newMessage.senderId]: prevUnseenMessages[newMessage.senderId]
            ? prevUnseenMessages[newMessage.senderId] + 1
            : 1,
        }));
      }
    });
  };

  // Unsubscribe from messages
  const unsubscribeFromMessages = () => {
    if (socket) socket.off("newMessage");
  };

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
    // eslint-disable-next-line
  }, [socket, selectedUser]);

  const value = {
    messages,
    users,
    selectedUser,
    getUsers,
    getMessages,
    sendMessage,
    setselectedUser,
    unseenMessages,
    setUnseenMessage,
  };

  return (
    <chatContext.Provider value={value}>{children}</chatContext.Provider>
  );
};