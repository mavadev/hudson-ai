import mongoose, { Schema, type Document, type Model } from "mongoose";
import { IMessage, MessageSchema } from "./Message";

// Interface para el modelo de chat
export interface IChat extends Document {
  _id: string;
  name: string;
  messages: IMessage[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Creación del esquema de chat
const ChatSchema = new Schema<IChat>(
  {
    name: {
      type: String,
      trim: true,
      default: "",
    },
    messages: {
      type: [MessageSchema],
      default: [],
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Exportación del modelo de chat
export const Chat: Model<IChat> =
  mongoose.models.Chat || mongoose.model<IChat>("Chat", ChatSchema);
export default Chat;
