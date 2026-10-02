import mongoose, { Schema, Document, Model } from "mongoose";

// Interface para el modelo de usuario
export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  createdAt: Date;
  updatedAt: Date;
}

// Creación del esquema de usuario
const UserSchema: Schema<IUser> = new Schema(
  {
    _id: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    avatar: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

// Exportación del modelo de usuario
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
