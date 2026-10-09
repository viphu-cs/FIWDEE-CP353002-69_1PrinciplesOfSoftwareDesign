# FIWDEE Massage Management & Booking System
## UML Deployment Diagram Specification
### (Cloud PaaS Architecture: Vercel + Render + Supabase)

---

## 1. Executive Summary & Purpose

เอกสารฉบับนี้จัดทำขึ้นเพื่อนำเสนอ **UML Deployment Diagram Specification ฉบับสมบูรณ์** สำหรับระบบ **FIWDEE Massage Management & Booking System** ภายใต้รูปแบบ **สถาปัตยกรรมคลาวด์แบบกระจายศูนย์ (Cloud PaaS Multi-Provider Serverless & Container Architecture)** ซึ่งเป็นสถาปัตยกรรม Production ที่ให้บริการฟรี 100% (Zero-Cost Cloud Deployment) โดยแยกหน้าที่การประมวลผลและการจัดเก็บข้อมูลออกตามแพลตฟอร์มคลาวด์ที่เหมาะสมที่สุด:

1. **Frontend Hosting (Edge CDN):** [Vercel Global Edge Network](https://vercel.com) — ให้บริการ React 19 SPA แบบกระจายตัวทั่วโลกด้วยความเร็วสูง
2. **Backend Application (Container Runtime):** [Render.com Cloud Platform](https://render.com) (Singapore Region) — รัน Docker Container ของ Spring Boot 4.1.1 (Java 17)
3. **Relational Database (Serverless Database):** [Supabase Cloud Platform](https://supabase.com) (Singapore Region) — ให้บริการฐานข้อมูล PostgreSQL 16 พร้อมระบบ Connection Pooler (Supavisor)

โดยเชื่อมโยงกับเอกสารและไฟล์คอนฟิกหลักของระบบ:
- [Component Diagram Specification (`doc/component-diagram.md`)](file:///C:/Users/Viphu/Desktop/University/PrinciplesOfSoftwareDesign/FIWDEE-CP353002-69_1PrinciplesOfSoftwareDesign/doc/component-diagram.md)
- [Spring Boot Backend Dockerfile (`code/backend/Dockerfile`)](file:///C:/Users/Viphu/Desktop/University/PrinciplesOfSoftwareDesign/FIWDEE-CP353002-69_1PrinciplesOfSoftwareDesign/code/backend/Dockerfile)
- [Spring Application Properties (`code/backend/src/main/resources/application.properties`)](file:///C:/Users/Viphu/Desktop/University/PrinciplesOfSoftwareDesign/FIWDEE-CP353002-69_1PrinciplesOfSoftwareDesign/code/backend/src/main/resources/application.properties)
- [Frontend API Abstraction (`code/frontend/src/lib/api.js`)](file:///C:/Users/Viphu/Desktop/University/PrinciplesOfSoftwareDesign/FIWDEE-CP353002-69_1PrinciplesOfSoftwareDesign/code/frontend/src/lib/api.js)

* ไฟล์นิยาม PlantUML: [deployment-diagram.puml](file:///C:/Users/Viphu/Desktop/University/PrinciplesOfSoftwareDesign/FIWDEE-CP353002-69_1PrinciplesOfSoftwareDesign/doc/diagrams/deployment-diagram.puml)

---

## 2. โครงสร้างสถาปัตยกรรมระบบ (Cloud PaaS Multi-Provider Topology)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT TIER (USER DEVICES)                      │
│        Customer Smartphone, Receptionist PC, Therapist Mobile          │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │ 1. ดึงไฟล์ Static SPA           │ 2. เรียกใช้งาน REST API
                   │    (HTTPS / TLS 1.3)            │    (HTTPS / JSON + JWT)
                   ▼                                 ▼
┌─────────────────────────────────────┐   ┌──────────────────────────────┐
│       VERCEL GLOBAL EDGE CDN        │   │    RENDER.COM (SINGAPORE)    │
│  React 19 SPA (Static Web Assets)   │   │  Spring Boot Web Service     │
│  Domain: https://fiwdee.vercel.app  │   │  Domain: https://...onrender │
└─────────────────────────────────────┘   └──────────────┬───────────────┘
                                                         │ 3. สืบค้น/บันทึกข้อมูล
                                                         │    (PostgreSQL Protocol / TLS)
                                                         ▼
                                          ┌──────────────────────────────┐
                                          │     SUPABASE (SINGAPORE)     │
                                          │  Supavisor Pooler (Port 5432)│
                                          │  PostgreSQL 16 (18 Tables)   │
                                          └──────────────────────────────┘
```

---

## 3. UML Deployment Diagram (Mermaid)

```mermaid
graph TB
    subgraph ClientDevices ["1. Client Tier (อุปกรณ์ของผู้ใช้งาน)"]
        CustomerDevice["«device»<br>Customer Device<br>(Smartphone / PC Browser)"]
        ReceptionistWorkstation["«device»<br>Receptionist Workstation<br>(Desktop Browser)"]
        TherapistMobile["«device»<br>Therapist Device<br>(Mobile Browser)"]
    end

    subgraph VercelCloud ["2. Frontend Edge CDN Tier (Vercel Platform)"]
        subgraph VercelEdgeNode ["«execution environment»<br>Vercel Edge Node (Global Anycast CDN)<br>Domain: https://fiwdee.vercel.app"]
            VercelSSL["TLS 1.3 / HTTPS Termination<br>(Automatic SSL Certificate)"]
            ReactBundle["«artifact»<br>React 19 SPA Bundle<br>(index.html, JS Modules, Tailwind CSS)"]
            VercelConfig["«artifact»<br>vercel.json<br>(SPA Rewrite Routing)"]
            
            VercelSSL --> ReactBundle
            VercelConfig -.-> ReactBundle
        end
    end

    subgraph RenderCloud ["3. Backend Application Tier (Render.com Platform)"]
        subgraph RenderRegion ["«node»<br>Cloud Data Center: Singapore (ap-southeast-1)<br>Host: https://fiwdee-backend.onrender.com"]
            RenderSSL["Render Reverse Proxy & SSL Gateway<br>(Port 443 / HTTPS)"]
            
            subgraph BackendContainer ["«execution environment»<br>Linux Container (Docker Runtime: 512 MB RAM)<br>Base Image: eclipse-temurin:17-jre-jammy"]
                Port8080["Internal Port: 8080"]
                AppJar["«artifact»<br>app.jar<br>(Spring Boot 4.1.1 Application)"]
                HikariPool["«component»<br>HikariCP Connection Pool<br>(Max 10 Active Connections)"]
                
                Port8080 --> AppJar
                AppJar --> HikariPool
            end

            subgraph EnvVars ["Injected Environment Variables"]
                Env1["SPRING_DATASOURCE_URL"]
                Env2["SPRING_DATASOURCE_USERNAME"]
                Env3["SPRING_DATASOURCE_PASSWORD"]
                Env4["FIWDEE_JWT_SECRET"]
                Env5["SPRING_JPA_HIBERNATE_DDL_AUTO=update"]
            end
            
            RenderSSL --> Port8080
            EnvVars -.-> AppJar
        end
    end

    subgraph SupabaseCloud ["4. Database Tier (Supabase Cloud Platform)"]
        subgraph SupabaseRegion ["«node»<br>AWS Cloud Data Center: Singapore (ap-southeast-1)<br>Host: aws-0-ap-southeast-1.pooler.supabase.com"]
            Supavisor["«execution environment»<br>Supavisor Connection Pooler (Session Mode)<br>Port: 5432 (IPv4 & IPv6 Supported)"]
            
            subgraph PostgresEngine ["«database system»<br>PostgreSQL 16 Serverless Engine"]
                FiwdeeDB[("«database»<br>Database: postgres (Schema: public)<br>18 Relational Tables")]
                DBStorage["«storage»<br>NVMe SSD Storage (500 MB Free Tier)"]
                
                FiwdeeDB --- DBStorage
            end
            
            Supavisor --> FiwdeeDB
        end
    end

    %% Client Interactions
    CustomerDevice -->|1. GET / (HTTPS: 443)| VercelSSL
    ReceptionistWorkstation -->|1. GET / (HTTPS: 443)| VercelSSL
    TherapistMobile -->|1. GET / (HTTPS: 443)| VercelSSL

    CustomerDevice -->|2. REST API Calls (HTTPS: 443 + JWT)| RenderSSL
    ReceptionistWorkstation -->|2. REST API Calls (HTTPS: 443 + JWT)| RenderSSL
    TherapistMobile -->|2. REST API Calls (HTTPS: 443 + JWT)| RenderSSL

    %% Backend to Database
    HikariPool -->|3. PostgreSQL Wire Protocol over TLS (Port 5432)| Supavisor
```

---

## 4. รายละเอียดของแต่ละโหนดและอาร์ติแฟกต์ (Nodes & Artifacts Breakdown)

### 4.1 Client Tier Nodes (โหนดผู้ใช้งาน)
- **Customer Smartphone / Laptop:** ใช้งานระบบจองคิวออนไลน์ ดูแคตตาล็อกบริการ และชำระเงินผ่านเบราว์เซอร์
- **Receptionist Workstation:** ใช้งานระบบหน้าร้านบนคอมพิวเตอร์ตั้งโต๊ะ จัดการคิว เช็คอินลูกค้า และบันทึกการชำระเงิน
- **Therapist Mobile Device:** โทรศัพท์มือถือของหมอนวดสำหรับดูตารางงานประจำวันและกดยืนยันเริ่ม-จบบริการ

### 4.2 Frontend Edge CDN Node — Vercel Platform
- **Execution Environment:** Vercel Global Edge Network (Edge CDN Nodes กระจายตัวทั่วโลก มี PoP ใกล้ประเทศไทย)
- **Domain & SSL:** ได้รับโดเมน HTTPS อัตโนมัติ เช่น `https://fiwdee.vercel.app` ผ่านใบรับรอง Let's Encrypt (TLS 1.3)
- **Deployed Artifact:**
  - `dist/` (React 19 SPA Bundle): ไฟล์ HTML, JavaScript ES Modules, และ Tailwind CSS 4 ที่บิลด์เรียบร้อยแล้ว
  - `vercel.json`: กฎการทำ URL Rewriting เพื่อรองรับ Single Page Application Routing ไม่ให้เกิด HTTP 404 เมื่อ Refresh หน้าเว็บ
- **Client Configuration:** กำหนด Environment Variable `VITE_API_URL` ชี้ไปยัง Backend API บน Render.com (`https://fiwdee-backend.onrender.com/api`)

### 4.3 Backend Application Node — Render.com Web Service
- **Execution Environment:** Docker Container (Linux Ubuntu Jammy) มีทรัพยากร 512 MB RAM, 0.1 CPU Shared
- **Data Center Region:** Singapore (`ap-southeast-1`) เพื่อความเร็วสูงสุดในการเชื่อมต่อไปยังผู้ใช้ในประเทศไทย
- **Domain & Networking:** มี Reverse Proxy ภายนอกรองรับ HTTPS (Port 443) และส่งต่อภายในเข้าพอร์ต 8080 ของคอนเทนเนอร์
- **Deployed Artifact:**
  - `app.jar`: ไฟล์ Executable JAR ของ Spring Boot 4.1.1 (Java 17) บรรจุโมดูล:
    - **Security & JWT Filter:** ตรวจสอบความถูกต้องของ Token
    - **Core Booking Engine:** จัดการ Concurrency และ Optimistic Locking (`@Version`)
    - **Availability Engine:** คำนวณช่วงเวลาว่างของห้องและหมอนวดพร้อมกันเวลาทำความสะอาดห้อง 15 นาที
    - **Payment & Strategy Factory:** จัดการกระบวนการชำระเงินและคำนวณส่วนลดโปรโมชัน
    - **HikariCP Connection Pool:** จัดการและควบคุมจำนวน Connection สู่ Supabase ไม่ให้เกินขีดจำกัด
- **Dynamic Configuration (Injected via Render):**
  - `SPRING_DATASOURCE_URL`: ชี้ไปยัง Supabase Pooler พร้อมพารามิเตอร์ `sslmode=require`
  - `SPRING_DATASOURCE_USERNAME` / `SPRING_DATASOURCE_PASSWORD`
  - `FIWDEE_JWT_SECRET`: คีย์ลับสำหรับลงนามและตรวจสอบความถูกต้องของ JWT Token

### 4.4 Database Server Node — Supabase Platform
- **Execution Environment:** Managed PostgreSQL 16 บนโครงสร้างคลาวด์ AWS (Singapore Region)
- **Connection Gateway (Supavisor):** ให้บริการผ่านโฮสต์ Pooler `aws-0-ap-southeast-1.pooler.supabase.com` ที่พอร์ต `5432` ในโหมด Session Mode ซึ่งรองรับทั้งการเชื่อมต่อแบบ IPv4 และ IPv6 ป้องกันปัญหา Connection Timeout ของคลาวด์ภายนอก
- **Database Storage & Schema:**
  - ฐานข้อมูล: `postgres` ภายใต้ Schema `public`
  - บรรจุตารางทั้งหมด **18 ตาราง** ที่สร้างขึ้นโดยอัตโนมัติผ่าน Hibernate DDL (`update`)
  - รองรับการรักษา Referential Integrity (Foreign Keys, Unique Constraints, Cascade Rules) และ Transactional Isolation

---

## 5. ตารางวิเคราะห์เส้นทางการสื่อสารและโปรโตคอล (Network Protocols & Ports Matrix)

| Source Node | Destination Node | Target Port | Protocol | Data Exchanged | Security & Encryption |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **Client Browser** | **Vercel Edge CDN** | `443` | HTTPS / HTTP/3 | Static HTML, JavaScript, CSS, Images | TLS 1.3, Automatic HSTS |
| **Client Browser** | **Render.com Backend** | `443` | HTTPS / REST | JSON Payloads (`/api/auth/*`, `/api/bookings/*`, etc.) | JWT Bearer Token, Spring Security RBAC |
| **Render.com Backend** | **Supabase Pooler** | `5432` | TCP / PostgreSQL Wire | SQL Queries, JPA Transactions, DDL Updates | SSL Mode Require (`sslmode=require` บน TLS) |

---

## 6. ขอบเขตความปลอดภัยและการปฏิบัติตามมาตรฐานสากล (Security Boundaries)

1. **End-to-End Encryption (E2EE in Transit):**
   - ทุกช่องทางการสื่อสาร ตั้งแต่ Client $\rightarrow$ Vercel, Client $\rightarrow$ Render, และ Render $\rightarrow$ Supabase ได้รับการเข้ารหัสข้อมูลด้วย **TLS (Transport Layer Security)** ทั้งหมด ไม่มีข้อมูลที่ส่งผ่านระบบเครือข่ายเป็น Plaintext
2. **Stateless Authentication & Zero Session Hijacking:**
   - ระบบใช้สถาปัตยกรรม Stateless REST API ผู้ใช้ต้องแนบ JWT Bearer Token ใน HTTP Header ทุกครั้ง ทำให้ไม่ต้องมีการแชร์ Cookie หรือ Session ข้าม Server ขจัดปัญหา CSRF
3. **Cross-Origin Resource Sharing (CORS):**
   - คอนฟิกูเรชันใน [`SecurityConfig.java`](file:///C:/Users/Viphu/Desktop/University/PrinciplesOfSoftwareDesign/FIWDEE-CP353002-69_1PrinciplesOfSoftwareDesign/code/backend/src/main/java/com/fiwdee/config/SecurityConfig.java) อนุญาตการสื่อสารระหว่างโดเมน Vercel (`*.vercel.app`) และ Backend บน Render (`*.onrender.com`) อย่างถูกต้อง
4. **Environment Secret Isolation:**
   - รหัสผ่านฐานข้อมูลและ JWT Secret Key ถูกจัดเก็บใน Secure Environment Store ของ Render.com เท่านั้น ไม่มีการ Hard-code ลงใน Git Repository
