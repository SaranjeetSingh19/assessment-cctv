import type { Request, Response } from "express";
import { Worker } from "../models/Worker";
import { Workstation } from "../models/Workstation"
import { Event } from "../models/Event";

export const seedDatabase = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Wipe existing data so we don't get duplicates
    await Worker.deleteMany({});
    await Workstation.deleteMany({});
    await Event.deleteMany({});

    // 2. Create 6 Workers
    const workers = [
      { worker_id: "W1", name: "Saranjeet" },
      { worker_id: "W2", name: "John Doe" },
      { worker_id: "W3", name: "Jane Smith" },
      { worker_id: "W4", name: "Alice Johnson" },
      { worker_id: "W5", name: "Bob Brown" },
      { worker_id: "W6", name: "Charlie Davis" }
    ];
    await Worker.insertMany(workers);

    // 3. Create 6 Workstations
    const workstations = [
      { station_id: "S1", name: "Assembly Line A" },
      { station_id: "S2", name: "Assembly Line B" },
      { station_id: "S3", name: "Packaging Station 1" },
      { station_id: "S4", name: "Packaging Station 2" },
      { station_id: "S5", name: "Quality Control Alpha" },
      { station_id: "S6", name: "Quality Control Beta" }
    ];
    await Workstation.insertMany(workstations);

    const events = [
      {
        timestamp: new Date("2026-01-15T10:00:00Z"),
        worker_id: "W1",
        workstation_id: "S1",
        event_type: "working",
        confidence: 0.95
      },
      {
        timestamp: new Date("2026-01-15T10:15:00Z"),
        worker_id: "W1",
        workstation_id: "S1",
        event_type: "idle",
        confidence: 0.90
      },
      {
        timestamp: new Date("2026-01-15T10:20:00Z"),
        worker_id: "W1",
        workstation_id: "S1",
        event_type: "product_count",
        confidence: 0.99,
        count: 5
      }
    ];
    await Event.insertMany(events);

    res.status(200).json({ message: "Database successfully seeded with dummy data!" });
  } catch (error) {
    console.error("Seeding Error:", error);
    res.status(500).json({ error: "Failed to seed database" });
  }
};