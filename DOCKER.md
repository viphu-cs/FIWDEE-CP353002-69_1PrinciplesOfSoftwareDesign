# FIWDEE Docker Setup & Guide

ระบบบริหารจัดการร้านนวดและระบบจองคิวออนไลน์ **FIWDEE** รองรับการรันผ่าน **Docker** และ **Docker Compose** ครอบคลุมทั้ง **PostgreSQL Database**, **Spring Boot Backend (Java 17)** และ **React Frontend (Nginx)**

---

## 🏗️ โครงสร้าง Docker ในโปรเจกต์

```
├── docker-compose.yml              # รวมบริการ PostgreSQL + Backend + Frontend
├── .env.example                    # ไฟล์แม่แบบตัวแปร Environment
├── DOCKER.md                       # คู่มือการใช้งาน Docker
│
├── code/
│   ├── backend/
│   │   ├── Dockerfile              # Multi-stage build (Temurin JDK 17 -> JRE 17 Alpine)
│   │   └── .dockerignore
│   └── frontend/
│       ├── Dockerfile              # Multi-stage build (Node 20 Alpine -> Nginx Alpine)
│       ├── nginx.conf              # Reverse proxy /api/ ไปยัง backend + SPA fallback
│       └── .dockerignore
```

---

## 🚀 วิธีการใช้งาน (Getting Started)

### 1. รันทั้งระบบ (Full-Stack Mode: Database + Backend + Frontend)
รันคำสั่งที่ Root Directory ของโปรเจกต์:

```bash
docker compose up --build -d
```

เมื่อระบบเริ่มทำงานเรียบร้อย:
* **Frontend (React Client):** [http://localhost:3000](http://localhost:3000)
* **Backend REST API:** [http://localhost:8080](http://localhost:8080)
* **PostgreSQL Database:** `localhost:5432` (Database: `fiwdee_db`, User: `postgres`, Password: `postgres`)

---

### 2. รันเฉพาะ Database สำหรับ Local Development
เหมาะสำหรับเวลาที่ทีมต้องการเขียนโค้ดและรัน Spring Boot / Vite ในเครื่องตนเอง:

```bash
docker compose up postgres -d
```
จากนั้น:
* **รัน Backend:** เปิดโฟลเดอร์ `code/backend` แล้วรัน `.\mvnw.cmd spring-boot:run` (Windows) หรือ `./mvnw spring-boot:run` (Mac/Linux)
* **รัน Frontend:** เปิดโฟลเดอร์ `code/frontend` แล้วรัน `npm run dev`

---

### 3. คำสั่ง Docker ที่ใช้งานบ่อย

| คำสั่ง | คำอธิบาย |
| :--- | :--- |
| `docker compose up -d` | เริ่มทำงานคอนเทนเนอร์ทั้งหมดในโหมด Background |
| `docker compose up --build -d` | สั่ง Re-build Image ใหม่และเริ่มรัน |
| `docker compose down` | หยุดและลบคอนเทนเนอร์ทั้งหมด (ข้อมูลใน DB ยังคงอยู่) |
| `docker compose down -v` | หยุดและลบคอนเทนเนอร์พร้อม**ลบข้อมูลใน Database ทั้งหมด** |
| `docker compose logs -f` | ดู Live Logs ของทุกคอนเทนเนอร์ |
| `docker compose logs -f backend` | ดู Live Logs เฉพาะ Spring Boot Backend |
| `docker compose logs -f frontend` | ดู Live Logs เฉพาะ React Frontend |
| `docker compose ps` | ตรวจสอบสถานะของคอนเทนเนอร์ทั้งหมด |

---

## ⚙️ การตั้งค่าพอร์ตและตัวแปร (Environment Variables)

หากต้องการเปลี่ยนพอร์ตหรือรหัสผ่าน ให้คัดลอกไฟล์ `.env.example` เป็น `.env`:

```bash
cp .env.example .env
```
และปรับค่าตามต้องการ:
```env
POSTGRES_DB=fiwdee_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432

BACKEND_PORT=8080
FRONTEND_PORT=3000
```
