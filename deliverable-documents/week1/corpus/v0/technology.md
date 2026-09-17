# Title: Technology Stack Selection
# type: ARCHITECTURE
# version: 1.0
# status: ACTIVE
# effectivedate: 03/09/2026

# Technology Stack Selection

*   **Frontend UI:** React SPA tailored for desktop sales POS terminals, stock manager and regional manager dashboards.
*   **Backend Services:** Node.js (TypeScript) with Fastify for lightweight, speedy I/O processing. 
*   **Database:** PostgreSQL managed via AWS RDS to handle relational constraints, composite index optimizations, and explicit isolation levels (`Serializable` or row-level `SELECT ... FOR UPDATE`).
*   **Event Broker:** Redis Pub/Sub for low-latency message streaming between services.


# Infraestructure

- Backend runs over EKS microservices containers.

- Backend endpoints inject events in a Kafka queque to be processed, to support traffic spikes.
