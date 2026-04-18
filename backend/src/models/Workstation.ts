import mongoose from "mongoose";

const workstationSchema = new mongoose.Schema({
  station_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
});

export const Workstation = mongoose.model("Workstation", workstationSchema);