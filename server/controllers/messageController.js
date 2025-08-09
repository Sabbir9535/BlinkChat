import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";
import { encryptAES, decryptAES } from "../lib/aes.js";

// Get all users except the logged in user
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    const filterUsers = await User.find({ _id: { $ne: userId } }).select("-password");

    // count for messages for not seen
    const unseenMessages = {};
    const promises = filterUsers.map(async (user) => {
      const messages = await Message.find({ senderId: user._id, receiverId: userId, seen: false });
      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length;
      }
    });
    await Promise.all(promises);
    res.json({ success: true, users: filterUsers, unseenMessages });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get all messages for selected user (send encrypted, client will decrypt)
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    });

    await Message.updateMany({ senderId: selectedUserId, receiverId: myId }, { seen: true });
    res.json({ success: true, messages }); // send encrypted text
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// api to mark message as seen using message id
export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndUpdate(id, { seen: true });
    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// send message to selected user (decrypt from client, encrypt before save)
export const sendMessage = async (req, res) => {
  try {
    let { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl;

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // Only decrypt/encrypt text, not image
    let decryptedText = text ? decryptAES(text) : undefined;
    let encryptedText = decryptedText ? encryptAES(decryptedText) : undefined;

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text: encryptedText,
      image: imageUrl,
    });

    // Emit the new message to the receiver's socket (encrypted text)
    const reciverSocketId = userSocketMap[receiverId];
    if (reciverSocketId) {
      io.to(reciverSocketId).emit("newMessage", {
        ...newMessage.toObject(),
        text: newMessage.text,
      });
    }

    res.json({
      success: true,
      newMessage: {
        ...newMessage.toObject(),
        text: newMessage.text,
      },
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};