import mongoose from "mongoose";

const workerSchema = new mongoose.Schema({
  worker_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
});

export const Worker = mongoose.model("Worker", workerSchema);
