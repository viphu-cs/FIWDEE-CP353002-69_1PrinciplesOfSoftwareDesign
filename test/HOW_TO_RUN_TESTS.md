# วิธีรันเทสต์ FIWDEE ตั้งแต่เริ่มต้น

คู่มือนี้พาตั้งเครื่องใหม่จนรัน Unit Test (UT01–UT36) และ Integration Test (IT01–IT12) ได้ครบ ตัวอย่างคำสั่งเขียนสำหรับ **Windows PowerShell** และมีคำสั่ง macOS / Linux / Git Bash ให้ในตารางด้วย

| ชุดเทสต์ | ต้องใช้ฐานข้อมูลไหม | เวลาที่ใช้โดยประมาณ |
| --- | --- | --- |
| Unit Test (`UT*`) | ไม่ต้อง (ใช้ Mockito) | 15–30 วินาที |
| Integration Test (`@Tag("integration")`) | ต้องมี PostgreSQL ใน Docker | 1–3 นาที |

---

## 1. โปรแกรมที่ต้องติดตั้ง

| โปรแกรม | เวอร์ชัน | ใช้ทำอะไร | เช็กด้วยคำสั่ง |
| --- | --- | --- | --- |
| JDK | 17 | compile และรัน Spring Boot | `java -version` |
| Docker Desktop | ล่าสุด | รัน PostgreSQL สำหรับ Integration Test | `docker --version` |
| Git | ล่าสุด | ดึงโค้ด | `git --version` |
| VS Code + Extension Pack for Java | ล่าสุด | กดรันเทสต์ทีละเคสได้ (ไม่บังคับ) | – |

ไม่ต้องติดตั้ง Maven เอง โปรเจกต์มี Maven Wrapper (`mvnw` / `mvnw.cmd`) อยู่แล้ว

ถ้า `java -version` ไม่ใช่ 17 ให้ตั้ง `JAVA_HOME` ให้ชี้ไปที่ JDK 17 ก่อน

---

## 2. โครงสร้างโฟลเดอร์ที่เกี่ยวกับเทสต์

```
FIWDEE-CP353002-69_1PrinciplesOfSoftwareDesign/
├── code/
│   └── backend/                 ← รันคำสั่ง mvnw ที่นี่
│       ├── pom.xml              ← มี build-helper-maven-plugin ชี้ไปที่ test/code
│       └── mvnw, mvnw.cmd
├── test/
│   ├── README.md
│   ├── unit-test/               ← FIWDEE_UnitTest_Design.xlsx
│   ├── integration-test/        ← FIWDEE_IntegrationTest_Design.xlsx
│   ├── report/                  ← Test_Report.md
│   └── code/
│       ├── java/com/fiwdee/     ← โค้ดเทสต์ทั้งหมด (UT, IT, TestBase, TestData)
│       └── resources/
│           └── application-it.properties
├── docker-compose.yml
└── .github/workflows/ci.yml     ← GitHub Actions
```

Maven อ่านโค้ดเทสต์จาก `test/code/java` ผ่าน `build-helper-maven-plugin` ใน `code/backend/pom.xml` ต้องมี plugin นี้อยู่ใน `<build><plugins>` (ห้ามอยู่ใน `<pluginManagement>` หรืออยู่นอก `</build>`)

```xml
<plugin>
    <groupId>org.codehaus.mojo</groupId>
    <artifactId>build-helper-maven-plugin</artifactId>
    <version>3.6.0</version>
    <executions>
        <execution>
            <id>add-shared-test-sources</id>
            <phase>generate-test-sources</phase>
            <goals><goal>add-test-source</goal></goals>
            <configuration>
                <sources>
                    <source>${project.basedir}/../../test/code/java</source>
                </sources>
            </configuration>
        </execution>
        <execution>
            <id>add-shared-test-resources</id>
            <phase>generate-test-resources</phase>
            <goals><goal>add-test-resource</goal></goals>
            <configuration>
                <resources>
                    <resource>
                        <directory>${project.basedir}/../../test/code/resources</directory>
                    </resource>
                </resources>
            </configuration>
        </execution>
    </executions>
</plugin>
```

**ห้ามมีไฟล์เทสต์ชื่อเดียวกันซ้ำ** ใน `code/backend/src/test/java` ไม่อย่างนั้นจะขึ้น `duplicate class`

---

## 3. ดึงโค้ดและเข้าโฟลเดอร์ backend

```powershell
git clone <url ของ repo>
cd FIWDEE-CP353002-69_1PrinciplesOfSoftwareDesign
```

ทุกคำสั่ง `mvnw` ในคู่มือนี้รันที่ `code\backend`

```powershell
cd code\backend
```

---

## 4. รัน Unit Test

ไม่ต้องเปิด Docker

| ต้องการ | Windows PowerShell | macOS / Linux / Git Bash |
| --- | --- | --- |
| Unit Test ทั้งหมด | `.\mvnw.cmd clean test "-Dtest=UT*"` | `./mvnw clean test -Dtest="UT*"` |
| ไฟล์เดียว | `.\mvnw.cmd test "-Dtest=UT05*"` | `./mvnw test -Dtest="UT05*"` |
| เคสเดียว | `.\mvnw.cmd test "-Dtest=UT05*#tc005"` | `./mvnw test -Dtest="UT05*#tc005"` |

ใน PowerShell ต้องครอบเครื่องหมายคำพูดทั้ง argument (`"-Dtest=UT*"`) ถ้าเขียน `-Dtest="UT*"` PowerShell จะตัด argument ผิด

ผลที่ควรได้:

```
[INFO] Tests run: 3xx, Failures: 0, Errors: 0, Skipped: 0 หรือ 1
[INFO] BUILD SUCCESS
```

`Skipped: 1` คือ UT26-TC010 ที่ปิดไว้ด้วย `@Disabled` จนกว่าทีมจะเพิ่มพารามิเตอร์ผู้ใช้ให้ `submitReview` (DEF-010) ถือเป็นผลปกติ

---

## 5. เตรียมฐานข้อมูลสำหรับ Integration Test (ทำครั้งแรกครั้งเดียว)

### 5.1 เปิด PostgreSQL

เปิด Docker Desktop รอจนขึ้น **Engine running** แล้วรันที่ root ของ repo

```powershell
cd ..\..
docker compose up -d postgres
docker ps --filter "name=fiwdee-postgres"
```

คอลัมน์ STATUS ต้องเป็น `Up ... (healthy)` ไม่จำเป็นต้องเปิด backend หรือ frontend

### 5.2 สร้างฐาน `fiwdee_test`

Integration Test ใช้ฐานแยกจากฐานใช้งานจริง (`fiwdee_db`) จะได้ไม่ทับข้อมูลกัน

```powershell
docker exec fiwdee-postgres createdb -U postgres fiwdee_test
```

ถ้าขึ้น `database "fiwdee_test" already exists` แปลว่าสร้างไว้แล้ว ข้ามได้

### 5.3 ตรวจว่าล็อกอินด้วยรหัส `postgres` ได้

เทสต์ต่อ `localhost:5432` ด้วย user `postgres` รหัส `postgres` (ตั้งไว้ใน `test/code/resources/application-it.properties`)

```powershell
docker run --rm postgres:16-alpine psql "postgresql://postgres:postgres@host.docker.internal:5432/fiwdee_test" -c "select 1"
```

ต้องได้ตารางที่มีเลข `1` ถ้าขึ้น `password authentication failed` ให้ดูหัวข้อ 9

### 5.4 ค่าที่เปลี่ยนได้

ถ้าฐานไม่ได้อยู่ที่ค่าเริ่มต้น ตั้งตัวแปรก่อนรันได้ (ต้องตั้งใหม่ทุกครั้งที่เปิด PowerShell หน้าต่างใหม่)

```powershell
$env:IT_DB_URL = "jdbc:postgresql://localhost:5433/fiwdee_test"
$env:IT_DB_USER = "postgres"
$env:IT_DB_PASSWORD = "รหัสของคุณ"
```

---

## 6. รัน Integration Test

กลับไปที่ `code\backend` แล้วลองรันชุดเล็กก่อนเพื่อเช็กการเชื่อมต่อ

```powershell
cd code\backend
.\mvnw.cmd clean test "-Dtest=IT03*"
```

ถ้า IT03 ผ่านครบ ค่อยรันทั้งชุด

| ต้องการ | Windows PowerShell | macOS / Linux / Git Bash |
| --- | --- | --- |
| Integration Test ทั้งหมด | `.\mvnw.cmd test "-Dgroups=integration"` | `./mvnw test -Dgroups=integration` |
| ไฟล์เดียว | `.\mvnw.cmd test "-Dtest=IT11*"` | `./mvnw test -Dtest="IT11*"` |
| ข้ามเคสที่ผูกกับ defect ที่ยังไม่แก้ | เติม `"-DexcludedGroups=known-defect"` | เติม `-DexcludedGroups=known-defect` |

สิ่งที่เกิดขึ้นตอนรัน:

1. Spring เปิดแอปจริงหนึ่งครั้งด้วย profile `it` แล้วใช้ร่วมกันทุกคลาส
2. Hibernate สร้างตารางใหม่ใน `fiwdee_test` (`ddl-auto=create-drop`) และไม่ใช้ `schema.sql` / `data.sql` ของแอป
3. `ItBaselineSeeder` ใส่ข้อมูลตั้งต้น: `owner` / `receptionist` / `therapist1`–`therapist6` (รหัส `pass123`), Room 1–6, บริการ THAI, AROMA, HOT_OIL, FOOT และเวลาทำการ 10:00–22:00
4. ทุกเคสล้างข้อมูลการจอง การชำระเงิน คิว และรีวิวทั้งก่อนและหลังรัน

เคสที่ใช้ "วันนี้" (IT10, IT11 บางเคส) จะข้ามตัวเองช่วง 23:50–00:00 และแสดงเป็น Skipped ถือเป็นผลปกติ

หลังรันเสร็จ ปิดฐานด้วย `docker compose stop postgres` (อย่าใช้ `down -v` เพราะจะลบฐาน `fiwdee_test` ทิ้ง)

---

## 7. รันทุกเทสต์ในครั้งเดียว

เปิด PostgreSQL ตามหัวข้อ 5 ก่อน แล้วรัน

```powershell
.\mvnw.cmd clean test
```

---

## 8. รันจาก VS Code (กดปุ่ม)

1. ติดตั้ง **Extension Pack for Java**
2. File → Open Folder → เลือก**โฟลเดอร์ root ของ repo** (ไม่ใช่ `code/backend` เพราะจะมองไม่เห็น `test/`)
3. `Ctrl+Shift+P` → **Java: Clean Java Language Server Workspace** → Restart and delete แล้วรอจนแถบล่างขึ้น Java: Ready
4. เปิดไอคอนรูปขวดทดลอง (Testing) ที่แถบซ้าย
   - ▶▶ ด้านบน = รันทุกเทสต์
   - ▶ ข้างชื่อคลาสหรือชื่อเคส = รันเฉพาะตัวนั้น
   - ในไฟล์โค้ด กด **Run Test** / **Debug Test** ที่อยู่เหนือ `@Test` ได้
5. รันซ้ำเฉพาะตัวที่ fail: เมนู `...` → **Rerun Failed Tests**

ถ้าอยากมีปุ่มที่ข้ามเคส known-defect ให้สร้าง `.vscode/settings.json` ที่ root

```json
{
  "java.test.config": [
    { "name": "All tests", "workingDirectory": "${workspaceFolder}/code/backend" },
    {
      "name": "Skip known-defect",
      "workingDirectory": "${workspaceFolder}/code/backend",
      "filters": { "tagExpressions": ["!known-defect"] }
    }
  ]
}
```

แล้วเลือกชุดด้วย `Ctrl+Shift+P` → **Java: Select Test Configuration**

---

## 9. อ่านผลและแก้ปัญหาที่พบบ่อย

ผลรายคลาสอยู่ที่ `code/backend/target/surefire-reports/` (`TEST-*.xml` ใช้เป็นหลักฐานใน Test Report ได้) ท้าย log มีสรุป `Tests run / Failures / Errors / Skipped` และรายชื่อเคสที่ไม่ผ่านอยู่ใต้ `[ERROR] Failures:` กับ `[ERROR] Errors:`

| อาการ | สาเหตุ | วิธีแก้ |
| --- | --- | --- |
| `./mvnw : The term './mvnw' is not recognized` | รันผิดโฟลเดอร์ หรือใช้ PowerShell | `cd code\backend` แล้วใช้ `.\mvnw.cmd` |
| `No tests matching pattern "UT05*" were executed` | Maven ไม่เห็น `test/code/java` | เช็กว่ามี build-helper ใน `<build><plugins>` ใน log ต้องเห็น `build-helper:3.6.0:add-test-source ... added` |
| `Non-parseable POM ... Unrecognised tag: 'plugin'` | วาง `<plugin>` นอก `<plugins>` | ย้ายเข้าไปก่อน `</plugins>` |
| `duplicate class: com.fiwdee...` | มีไฟล์เทสต์ชื่อซ้ำทั้งใน `src/test/java` และ `test/code/java` | ลบตัวที่ซ้ำให้เหลือที่เดียว |
| `skip non existing resourceDirectory ...test\code\resources` | ไม่มี `application-it.properties` | วางไฟล์ไว้ที่ `test/code/resources/` |
| `Bookings can be made at most 14 days in advance` ใน UT01/02/04 | ใช้ไฟล์เทสต์เวอร์ชันเก่าที่ไม่มี `freezeClock()` | ใช้เวอร์ชันล่าสุด และรันด้วย `clean` |
| `password authentication failed for user "postgres"` | มี PostgreSQL ของ Windows แย่งพอร์ต 5432 หรือรหัสใน Docker ไม่ใช่ `postgres` | รัน `netstat -ano \| findstr ":5432"` ถ้าเป็น postgres ของ Windows ให้ `Stop-Service` ถ้าเป็น Docker ให้รัน `docker exec fiwdee-postgres psql -U postgres -c "ALTER USER postgres PASSWORD 'postgres';"` |
| `Connection refused` | ยังไม่ได้เปิด Docker / postgres | ทำหัวข้อ 5.1 |
| `database "fiwdee_test" does not exist` | ยังไม่สร้างฐาน | ทำหัวข้อ 5.2 |
| `ApplicationContext failure threshold (1) exceeded` ทุกเคส | เปิดแอปไม่ขึ้นตั้งแต่เคสแรก | เลื่อนขึ้นไปหา `Caused by:` ตัวล่างสุดของเคสแรก ส่วนใหญ่เป็นเรื่องฐานข้อมูล |
| `Mockito is currently self-attaching...` / `A Java agent has been loaded dynamically` | คำเตือนจาก JDK ไม่ใช่ error | ไม่ต้องแก้ ผลเทสต์ไม่เปลี่ยน |
| แก้โค้ดแล้ว error เดิมยังขึ้น | ยังไม่ได้ Save หรือมี `.class` เก่าค้าง | `Ctrl+S` แล้วรันด้วย `clean` |

---

## 10. ลำดับที่แนะนำทุกครั้งที่แก้โค้ด

1. `.\mvnw.cmd clean test "-Dtest=UT*"` ต้องไม่มี Failures / Errors
2. เปิด postgres แล้ว `.\mvnw.cmd test "-Dgroups=integration"`
3. ถ้ามีเคสเปลี่ยนจากผ่านเป็นไม่ผ่าน ถือเป็น regression ให้ย้อนดูสิ่งที่เพิ่งแก้
4. กรอกผล (Actual Result / Status) ลงไฟล์ Excel ใน `test/unit-test` และ `test/integration-test` แล้วอัปเดต `test/report/Test_Report.md`
