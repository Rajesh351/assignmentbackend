import mongoose from "mongoose";
const allEmail1 = new mongoose.Schema({
  usemail:{
    type: String, required: true
  }
}, { timestamps: true });


export const allEmail= mongoose.model('allEmail', allEmail1);