import { Request, Response } from "express";
import { Event } from "../models/Event";
import { Worker } from "../models/Worker";
import { Workstation } from "../models/Workstation";

export const ingestEvent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const newEvent = new Event(req.body);
    await newEvent.save();

    res.status(201).json({
      message: "Event ingested successfully",
      event: newEvent,
    });
  } catch (error) {
    console.error("Ingestion Error:", error);
    res.status(500).json({ error: "Failed to ingest event" });
  }
};

export const getMetrics = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const workers = await Worker.find();
    const workstations = await Workstation.find();

    const events = await Event.find().sort({ timestamp: 1 });

    const workerStats: Record<string, any> = {};
    workers.forEach((w) => {
      workerStats[w.worker_id] = {
        name: w.name,
        activeTimeMinutes: 0,
        idleTimeMinutes: 0,
        totalUnits: 0,
        lastState: null,
        lastTimestamp: null,
      };
    });

    const stationStats: Record<string, any> = {};
    workstations.forEach((s) => {
      stationStats[s.station_id] = {
        name: s.name,
        totalUnits: 0,
        activeTimeMinutes: 0, 
      };
    });

    events.forEach((event) => {
      const { worker_id, workstation_id, event_type, timestamp, count } = event;
      const stats = workerStats[worker_id];

      if (!stats) return;  

      if (stats.lastTimestamp) {
        const timeDiffMs =
          new Date(timestamp).getTime() -
          new Date(stats.lastTimestamp).getTime();
        const timeDiffMinutes = timeDiffMs / (1000 * 60);

        if (stats.lastState === "working") {
          stats.activeTimeMinutes += timeDiffMinutes;
          if (stationStats[workstation_id]) {
            stationStats[workstation_id].activeTimeMinutes += timeDiffMinutes;
          }
        } else if (stats.lastState === "idle") {
          stats.idleTimeMinutes += timeDiffMinutes;
        }
      }

      if (event_type === "product_count") {
        stats.totalUnits += count || 0;
        if (stationStats[workstation_id]) {
          stationStats[workstation_id].totalUnits += count || 0;
        }
      } else {
        stats.lastState = event_type;
      }

      stats.lastTimestamp = timestamp;
    });

    let factoryTotalActive = 0;
    let factoryTotalUnits = 0;

    const formattedWorkers = Object.keys(workerStats).map((id) => {
      const w = workerStats[id];
      const totalTime = w.activeTimeMinutes + w.idleTimeMinutes;
      const utilization =
        totalTime > 0 ? (w.activeTimeMinutes / totalTime) * 100 : 0;

      factoryTotalActive += w.activeTimeMinutes;
      factoryTotalUnits += w.totalUnits;

      return {
        worker_id: id,
        name: w.name,
        activeTime: Math.round(w.activeTimeMinutes),
        idleTime: Math.round(w.idleTimeMinutes),
        utilizationPercentage: Math.round(utilization),
        totalUnits: w.totalUnits,
      };
    });

    const formattedStations = Object.keys(stationStats).map((id) => {
      const s = stationStats[id];
      return {
        station_id: id,
        name: s.name,
        totalUnits: s.totalUnits,
        activeTime: Math.round(s.activeTimeMinutes),
      };
    });

    res.status(200).json({
      factorySummary: {
        totalActiveTimeMinutes: Math.round(factoryTotalActive),
        totalUnitsProduced: factoryTotalUnits,
      },
      workers: formattedWorkers,
      workstations: formattedStations,
    });
  } catch (error) {
    console.error("Metrics Error:", error);
    res.status(500).json({ error: "Failed to calculate metrics" });
  }
};
