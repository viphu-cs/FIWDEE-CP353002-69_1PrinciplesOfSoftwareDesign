package com.fiwdee.config;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.entity.Customer;
import com.fiwdee.domain.entity.Payment;
import com.fiwdee.domain.entity.Room;
import com.fiwdee.domain.entity.Service;
import com.fiwdee.domain.entity.ServiceDurationOption;
import com.fiwdee.domain.entity.Shop;
import com.fiwdee.domain.entity.Therapist;
import com.fiwdee.domain.entity.User;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.domain.enums.PaymentMethod;
import com.fiwdee.domain.enums.PaymentStatus;
import com.fiwdee.domain.enums.RoomType;
import com.fiwdee.domain.enums.UserRole;
import com.fiwdee.repository.BookingRepository;
import com.fiwdee.repository.CustomerRepository;
import com.fiwdee.repository.PaymentRepository;
import com.fiwdee.repository.RoomRepository;
import com.fiwdee.repository.ServiceDurationOptionRepository;
import com.fiwdee.repository.ServiceRepository;
import com.fiwdee.repository.ShopRepository;
import com.fiwdee.repository.TherapistRepository;
import com.fiwdee.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Demo seed data so the customer booking-history page (#my-bookings) and profile
 * page are demonstrable before Dev 2's full DataSeeder (Task 1.7) and booking
 * creation endpoint (Task 2.4) land. Idempotent — every step checks for existing
 * rows first and only fills gaps, so it is safe to run alongside other seeders.
 * Disable with fiwdee.seed-demo-data=false.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DemoDataSeeder implements CommandLineRunner {

    private final ShopRepository shopRepository;
    private final RoomRepository roomRepository;
    private final ServiceRepository serviceRepository;
    private final ServiceDurationOptionRepository serviceDurationOptionRepository;
    private final TherapistRepository therapistRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${fiwdee.seed-demo-data:true}")
    private boolean seedDemoData;

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedDemoData) {
            return;
        }

        seedShopCatalog();
        seedTherapists();
        Customer customer = seedDemoCustomer();
        if (customer != null) {
            seedDemoBookings(customer);
        }
    }

    private void seedShopCatalog() {
        if (shopRepository.count() == 0) {
            shopRepository.save(Shop.builder()
                    .shopName("FIWDEE Massage")
                    .address("123 ถนนมิตรภาพ ตำบลในเมือง อำเภอเมือง ขอนแก่น 40000")
                    .phoneNumber("043-000-0000")
                    .description("สถานพักผ่อนและนวดบำบัดกลางเมืองขอนแก่น")
                    .build());
            log.info("Seeded demo shop");
        }

        if (roomRepository.count() == 0) {
            List<Room> rooms = List.of(
                    Room.builder().roomNumber("101").roomType(RoomType.SINGLE).capacity(1).build(),
                    Room.builder().roomNumber("102").roomType(RoomType.SINGLE).capacity(1).build(),
                    Room.builder().roomNumber("103").roomType(RoomType.SINGLE).capacity(1).build(),
                    Room.builder().roomNumber("201").roomType(RoomType.COUPLE).capacity(2).build(),
                    Room.builder().roomNumber("202").roomType(RoomType.COUPLE).capacity(2).build(),
                    Room.builder().roomNumber("301").roomType(RoomType.VIP).capacity(2).build());
            roomRepository.saveAll(rooms);
            log.info("Seeded {} demo rooms", rooms.size());
        }

        if (serviceRepository.count() == 0) {
            seedService("นวดไทยแผนโบราณ", "THAI_MASSAGE", RoomType.SINGLE,
                    new int[][] {{60, 350}, {90, 500}, {120, 650}});
            seedService("นวดอโรม่าบำบัด", "AROMA", RoomType.SINGLE,
                    new int[][] {{90, 800}, {120, 1100}});
            log.info("Seeded demo services with duration options");
        }
    }

    private void seedService(String serviceName, String category, RoomType roomType, int[][] options) {
        Service service = serviceRepository.save(Service.builder()
                .serviceCode("SVC-" + category)
                .serviceName(serviceName)
                .category(category)
                .requiredRoomType(roomType)
                .build());
        for (int[] option : options) {
            serviceDurationOptionRepository.save(ServiceDurationOption.builder()
                    .service(service)
                    .durationMinutes(option[0])
                    .price(BigDecimal.valueOf(option[1]))
                    .build());
        }
    }

    private void seedTherapists() {
        if (therapistRepository.count() > 0) {
            return;
        }
        List<Therapist> therapists = List.of(
                buildTherapist("therapist1@fiwdee-massage.co.th", "081-000-4444", "มาลี มือนวด", "มาลี", "นวดไทยแผนโบราณ อโรม่า"),
                buildTherapist("therapist2@fiwdee-massage.co.th", "081-000-5555", "ปรีชา ปลดปล่อย", "ปรีชา", "นวดตัวตึง กดจุดสมาธิ"),
                buildTherapist("therapist3@fiwdee-massage.co.th", "081-000-6666", "สมศรี สมดุล", "สมศรี", "นวดอโรม่า นวดหินร้อน"),
                buildTherapist("therapist4@fiwdee-massage.co.th", "081-000-7777", "จันทร์ เจ้าเวทย์", "จันทร์", "นวดไทย นวดเท้า"),
                buildTherapist("therapist5@fiwdee-massage.co.th", "081-000-8888", "บุญมี บำบัด", "บุญมี", "นวดคลายกล้ามเนื้อ"),
                buildTherapist("therapist6@fiwdee-massage.co.th", "081-000-9999", "วิไล วิเวก", "วิไล", "นวดอโรม่า สปาบำบัด"));
        therapistRepository.saveAll(therapists);
        log.info("Seeded {} demo therapists", therapists.size());
    }

    private Therapist buildTherapist(String email, String phone, String fullName, String nickname, String bio) {
        return Therapist.builder()
                .username(email)
                .email(email)
                .phoneNumber(phone)
                .fullName(fullName)
                .nickname(nickname)
                .bio(bio)
                .passwordHash(passwordEncoder.encode("therapist1234"))
                .role(UserRole.THERAPIST)
                .build();
    }

    private Customer seedDemoCustomer() {
        if (userRepository.existsByEmail("customer@test.com")) {
            User user = userRepository.findByEmail("customer@test.com").orElse(null);
            return user instanceof Customer existing ? existing : null;
        }
        Customer customer = customerRepository.save(Customer.builder()
                .username("customer@test.com")
                .email("customer@test.com")
                .phoneNumber("081-000-3333")
                .fullName("สมหญิง รักสุขภาพ")
                .passwordHash(passwordEncoder.encode("customer1234"))
                .role(UserRole.CUSTOMER)
                .healthNotes("ปวดบ่าและต้นคอเรื้อรัง หลีกเลี่ยงการกดแรงบริเวณกระดูกสันหลังส่วนเอว")
                .preferredPressure("MEDIUM")
                .build());
        log.info("Seeded demo CUSTOMER account: customer@test.com (password: customer1234)");
        return customer;
    }

    private void seedDemoBookings(Customer customer) {
        if (!customer.getBookings().isEmpty()) {
            return;
        }

        Service service = serviceRepository.findAll().stream().findFirst().orElse(null);
        Room room = roomRepository.findAll().stream().findFirst().orElse(null);
        Therapist therapist = therapistRepository.findAll().stream().findFirst().orElse(null);
        if (service == null || room == null || therapist == null) {
            log.warn("Demo bookings skipped — shop catalog is empty");
            return;
        }
        ServiceDurationOption option = service.getDurationOptions().stream().findFirst().orElse(null);
        if (option == null) {
            option = serviceDurationOptionRepository.findAll().stream()
                    .filter(o -> o.getService().getId().equals(service.getId()))
                    .findFirst()
                    .orElse(null);
        }
        if (option == null) {
            log.warn("Demo bookings skipped — no service duration options");
            return;
        }

        LocalDate today = LocalDate.now();
        createBooking(customer, therapist, room, service, option, "FIW-SEED-0001",
                at(today.minusDays(7), LocalTime.of(14, 0)), BookingStatus.COMPLETED, true);
        createBooking(customer, therapist, room, service, option, "FIW-SEED-0002",
                at(today.minusDays(3), LocalTime.of(10, 0)), BookingStatus.CANCELLED, false);
        createBooking(customer, therapist, room, service, option, "FIW-SEED-0003",
                at(today.plusDays(1), LocalTime.of(16, 0)), BookingStatus.CONFIRMED, false);
        createBooking(customer, therapist, room, service, option, "FIW-SEED-0004",
                at(today.plusDays(3), LocalTime.of(11, 0)), BookingStatus.PENDING, false);
        log.info("Seeded 4 demo bookings for customer@test.com");
    }

    private LocalDateTime at(LocalDate date, LocalTime time) {
        return LocalDateTime.of(date, time);
    }

    private void createBooking(Customer customer, Therapist therapist, Room room, Service service,
                               ServiceDurationOption option, String referenceCode,
                               LocalDateTime start, BookingStatus status, boolean withPayment) {
        LocalDateTime end = start.plusMinutes(option.getDurationMinutes());
        Booking booking = bookingRepository.save(Booking.builder()
                .bookingReferenceCode(referenceCode)
                .customer(customer)
                .therapist(therapist)
                .room(room)
                .service(service)
                .durationOption(option)
                .startDateTime(start)
                .endDateTime(end)
                .totalPrice(option.getPrice())
                .status(status)
                .bookingChannel("ONLINE")
                .specialNotes("ข้อมูลตัวอย่างสำหรับเดโม")
                .build());

        if (status == BookingStatus.COMPLETED) {
            booking.setActualStartTime(start);
            booking.setActualEndTime(end);
            bookingRepository.save(booking);

            // Payment is an immutable audit record — inserted once, never updated
            paymentRepository.save(Payment.builder()
                    .booking(booking)
                    .paymentReferenceCode("PAY-" + referenceCode)
                    .receiptNumber("RCP-" + referenceCode)
                    .grossAmount(option.getPrice())
                    .discountAmount(BigDecimal.ZERO)
                    .netAmount(option.getPrice())
                    .paymentMethod(PaymentMethod.QR_PROMPTPAY)
                    .paymentStatus(PaymentStatus.COMPLETED)
                    .paidAt(end)
                    .transactionNote("ชำระผ่านพร้อมเพย์ QR (ข้อมูลตัวอย่าง)")
                    .build());
        }
    }
}
