import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true },
  worker_id: { type: String, required: true },  
  workstation_id: { type: String, required: true },
  event_type: {
    type: String,
    required: true,
    enum: ["working", "idle", "absent", "product_count"],
  },
  confidence: { type: Number, required: true },
  count: { type: Number, default: 0 },  
});

export const Event = mongoose.model("Event", eventSchema);
