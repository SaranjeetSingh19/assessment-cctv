# 🏭 AI-Powered Worker Productivity Dashboard

A full-stack, containerized web application designed to ingest, process, and visualize AI-generated worker activity events from factory CCTV cameras.

**🚀 Live Demo:** [https://ai-cctv-dashboard.vercel.app/](https://ai-cctv-dashboard.vercel.app/)  
**📂 GitHub Repository:** [https://github.com/SaranjeetSingh19/assessment-cctv](https://github.com/SaranjeetSingh19/assessment-cctv)  

---

## 🏗️ 1. Architecture Overview (Edge → Backend → Dashboard)

This application follows a modern, decoupled architecture designed for high-write throughput and clean data visualization:

* **Edge (Data Producers):** The AI-powered CCTV computer vision system outputs structured JSON events. These devices act as clients, firing HTTP POST requests to our ingestion API whenever a state change or product count occurs.
* **Backend (Data Ingestion & Processing):** Built with **Node.js, Express, and TypeScript**. It serves two primary functions:
    1.  An Ingestion Engine (`POST /api/events`) to safely validate and write incoming camera data.
    2.  A Calculation Engine (`GET /api/metrics`) that dynamically computes time-deltas and utilization percentages.
* **Database (Storage):** **MongoDB** (hosted on Atlas). Chosen for its flexible document model, which naturally aligns with JSON event payloads, and its ability to handle high-velocity timeseries-style writes.
* **Dashboard (Visualization):** Built with **React.js, Vite, and Tailwind CSS**. A minimalist, industrial-themed frontend that polls the backend API and presents actionable metrics to factory managers.

---

## 🗄️ 2. Database Schema

The database consists of three core collections. MongoDB is ideal here as it allows us to store the exact JSON payload sent by the cameras without rigid structural migrations.

* **Workers:** `{ worker_id (String, Unique), name (String) }`
* **Workstations:** `{ station_id (String, Unique), name (String) }`
* **Events (The core timeseries data):**
    ```json
    {
      "timestamp": "Date",
      "worker_id": "String",
      "workstation_id": "String",
      "event_type": "Enum ['working', 'idle', 'absent', 'product_count']",
      "confidence": "Number",
      "count": "Number (Default: 0)"
    }
    ```

---

## 📊 3. Metric Definitions & Assumptions

The dashboard dynamically calculates metrics based on a continuous stream of events.

**Definitions:**
* **Active Time:** The total minutes a worker spent in the `working` state.
* **Idle Time:** The total minutes a worker spent in the `idle` state.
* **Utilization Percentage:** `(Active Time / (Active Time + Idle Time)) * 100`
* **Total Units:** The sum of the `count` field for all `product_count` events.

**Key Assumptions & Tradeoffs:**
1.  **Stateful Events:** We assume events act as state toggles. If Worker A is marked `working` at 10:00 AM and `idle` at 10:15 AM, the backend assumes 15 uninterrupted minutes of active time. 
2.  **Calculation on Read (Tradeoff):** Currently, the backend calculates metrics on the fly when the `GET /api/metrics` endpoint is hit. For a sample size of 6 workers, this is fast and ensures 100% accuracy. *Tradeoff:* For massive scale, this would be shifted to a CRON job or materialized view to pre-calculate metrics and reduce read latency.

---

## 🧠 4. Theoretical Architecture & Handling Edge Cases

### Data Reliability: Connectivity, Duplicates, and Out-of-Order Events
* **Intermittent Connectivity:** Edge devices (cameras) cannot rely on a perfect network. They must utilize a local buffer (e.g., a lightweight SQLite DB or MQTT client). If the factory network drops, events queue locally and are flushed to the backend in a batch once connection is restored.
* **Out-of-Order Timestamps:** Due to network latency, Event B might reach the server before Event A. To handle this safely, our backend does not rely on database insertion order. Instead, the metrics engine pulls events and sorts them chronologically by the `timestamp` field *before* calculating time deltas.
* **Duplicate Events:** If a camera retries a failed network request, it may send duplicate data. To solve this, we enforce **Idempotency** using a MongoDB compound unique index on `{ worker_id, workstation_id, timestamp, event_type }`. The database will automatically reject exact duplicates.

### AI Lifecycle: Versioning, Drift, and Retraining
* **Model Versioning:** The edge payload should be expanded to include a `"model_version": "v1.2.0"` key. This allows the backend to tag data sources, making it easy to filter out corrupt data if a specific model deployment behaves erratically.
* **Detecting Model Drift:** We actively monitor the `confidence` score of events over time. If the rolling average confidence score drops below a safe threshold (e.g., < 0.75), it indicates environmental changes (new lighting, new uniforms) and triggers an automated drift alert.
* **Triggering Retraining:** Frames that yield low-confidence scores at the edge are automatically routed to a secure S3 bucket. A "Human-in-the-Loop" pipeline annotates these edge-cases, injecting them into the dataset for the next model retraining epoch.

### Scaling Strategy (5 Cameras → 100+ Cameras → Multi-Site)
Our current REST API handles 5 cameras easily, but 100+ cameras streaming continuous events will overwhelm standard HTTP connections.
1.  **Event Driven Architecture (Kafka):** We would introduce **Apache Kafka** or **RabbitMQ** between the Edge and the Backend. Cameras publish payloads to a message queue. The Node.js backend consumes them at a controlled rate, guaranteeing zero data loss during high traffic spikes.
2.  **Horizontal Scaling:** We would containerize the Node.js API (already done via Docker) and deploy it to a Kubernetes cluster (EKS/AKS), utilizing Horizontal Pod Autoscalers to spin up more API instances based on CPU load.
3.  **Database Sharding:** As event data scales to millions of rows across multi-site factories, we would shard the MongoDB cluster using a compound shard key like `{ factory_id: 1, timestamp: 1 }` to maintain lightning-fast queries and isolate geographic data.

---

## 💻 5. Local Development & Containerization

This application is fully containerized for easy evaluation.

1. Ensure Docker and Docker Compose are installed on your machine.
2. Clone the repository and run:
   ```bash
   docker-compose up --build
