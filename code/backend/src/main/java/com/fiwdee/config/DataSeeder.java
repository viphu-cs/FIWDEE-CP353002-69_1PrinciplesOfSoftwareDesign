package com.fiwdee.config;

import com.fiwdee.domain.entity.BusinessHours;
import com.fiwdee.domain.entity.Owner;
import com.fiwdee.domain.entity.Receptionist;
import com.fiwdee.domain.entity.Room;
import com.fiwdee.domain.entity.Service;
import com.fiwdee.domain.entity.ServiceDurationOption;
import com.fiwdee.domain.entity.Shop;
import com.fiwdee.domain.entity.Therapist;
import com.fiwdee.domain.entity.TherapistSchedule;
import com.fiwdee.domain.entity.TherapistSkill;
import com.fiwdee.domain.entity.WorkShift;
import com.fiwdee.domain.enums.DayOfWeek;
import com.fiwdee.domain.enums.RoomStatus;
import com.fiwdee.domain.enums.RoomType;
import com.fiwdee.domain.enums.UserRole;
import com.fiwdee.repository.BusinessHoursRepository;
import com.fiwdee.repository.OwnerRepository;
import com.fiwdee.repository.ReceptionistRepository;
import com.fiwdee.repository.RoomRepository;
import com.fiwdee.repository.ServiceRepository;
import com.fiwdee.repository.ShopRepository;
import com.fiwdee.repository.TherapistRepository;
import com.fiwdee.repository.TherapistScheduleRepository;
import com.fiwdee.repository.TherapistSkillRepository;
import com.fiwdee.repository.UserRepository;
import com.fiwdee.repository.WorkShiftRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Development-only starter records. All sample credentials below are for local development only. */
@Component
@Profile("!prod")
public class DataSeeder implements CommandLineRunner {

    // Development-only password for seeded test accounts. Never use this credential in production.
    private static final String TEST_PASSWORD = "pass123";
    private static final List<Integer> SERVICE_DURATIONS = List.of(60, 90, 120);

    private final ShopRepository shopRepository;
    private final BusinessHoursRepository businessHoursRepository;
    private final RoomRepository roomRepository;
    private final ServiceRepository serviceRepository;
    private final TherapistRepository therapistRepository;
    private final TherapistSkillRepository therapistSkillRepository;
    private final TherapistScheduleRepository scheduleRepository;
    private final WorkShiftRepository workShiftRepository;
    private final UserRepository userRepository;
    private final OwnerRepository ownerRepository;
    private final ReceptionistRepository receptionistRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(ShopRepository shopRepository, BusinessHoursRepository businessHoursRepository,
                      RoomRepository roomRepository, ServiceRepository serviceRepository,
                      TherapistRepository therapistRepository, TherapistSkillRepository therapistSkillRepository,
                      TherapistScheduleRepository scheduleRepository, WorkShiftRepository workShiftRepository,
                      UserRepository userRepository, OwnerRepository ownerRepository,
                      ReceptionistRepository receptionistRepository, PasswordEncoder passwordEncoder) {
        this.shopRepository = shopRepository;
        this.businessHoursRepository = businessHoursRepository;
        this.roomRepository = roomRepository;
        this.serviceRepository = serviceRepository;
        this.therapistRepository = therapistRepository;
        this.therapistSkillRepository = therapistSkillRepository;
        this.scheduleRepository = scheduleRepository;
        this.workShiftRepository = workShiftRepository;
        this.userRepository = userRepository;
        this.ownerRepository = ownerRepository;
        this.receptionistRepository = receptionistRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        Shop shop = seedShopAndHours();
        seedRooms();
        List<Service> services = seedServices();
        seedTherapistsAndSkills(services);
        seedSchedules();
        seedAdminAccounts();
    }

    private Shop seedShopAndHours() {
        Shop shop = shopRepository.findFirstByIsActiveTrueOrderByIdAsc().orElseGet(() -> {
            Shop fresh = new Shop();
            fresh.setShopName("FIWDEE Massage");
            fresh.setAddress("Khon Kaen, Thailand");
            fresh.setPhoneNumber("043000001");
            fresh.setDescription("Massage and wellness shop");
            fresh.setIsActive(true);
            return shopRepository.save(fresh);
        });

        List<BusinessHours> existing = businessHoursRepository.findByShopId(shop.getId());
        for (DayOfWeek day : DayOfWeek.values()) {
            boolean hasDay = existing.stream().anyMatch(hours -> hours.getDayOfWeek() == day);
            if (!hasDay) {
                BusinessHours hours = new BusinessHours();
                hours.setShop(shop);
                hours.setDayOfWeek(day);
                hours.setOpenTime(LocalTime.of(10, 0));
                hours.setCloseTime(LocalTime.of(22, 0));
                hours.setIsClosed(false);
                businessHoursRepository.save(hours);
            }
        }
        return shop;
    }

    private void seedRooms() {
        List<RoomType> types = List.of(RoomType.SINGLE, RoomType.SINGLE, RoomType.COUPLE,
                RoomType.COUPLE, RoomType.VIP, RoomType.FOOT_MASSAGE);
        for (int index = 1; index <= 6; index++) {
            String number = "Room " + index;
            if (roomRepository.findByRoomNumberIgnoreCase(number).isPresent()) continue;
            Room room = new Room();
            room.setRoomNumber(number);
            room.setRoomType(types.get(index - 1));
            room.setCapacity(room.getRoomType() == RoomType.COUPLE ? 2 : 1);
            room.setRoomStatus(RoomStatus.AVAILABLE);
            room.setCleaningBufferMinutes(15);
            room.setIsActive(true);
            roomRepository.save(room);
        }
    }

    private List<Service> seedServices() {
        List<ServiceSeed> seeds = List.of(
                new ServiceSeed("THAI", "Thai Massage", "Traditional Thai massage", "Traditional", RoomType.SINGLE,
                        List.of("500.00", "700.00", "900.00")),
                new ServiceSeed("AROMA", "Aroma Massage", "Aromatherapy massage", "Aromatherapy", RoomType.SINGLE,
                        List.of("700.00", "950.00", "1200.00")),
                new ServiceSeed("HOT_OIL", "Warm Oil Massage", "Warm oil massage", "Oil", RoomType.VIP,
                        List.of("800.00", "1100.00", "1400.00")),
                new ServiceSeed("FOOT", "Foot Massage", "Relaxing foot massage", "Foot", RoomType.FOOT_MASSAGE,
                        List.of("400.00", "550.00", "700.00")));
        return seeds.stream().map(this::seedService).toList();
    }

    private Service seedService(ServiceSeed seed) {
        Service service = serviceRepository.findByServiceCodeIgnoreCase(seed.code()).orElseGet(Service::new);
        if (service.getId() == null) {
            service.setServiceCode(seed.code());
            service.setServiceName(seed.name());
            service.setDescription(seed.description());
            service.setCategory(seed.category());
            service.setRequiredRoomType(seed.roomType());
            service.setIsActive(true);
            service = serviceRepository.save(service);
        }
        List<ServiceDurationOption> existing = service.getDurationOptions();
        for (int index = 0; index < SERVICE_DURATIONS.size(); index++) {
            int duration = SERVICE_DURATIONS.get(index);
            boolean hasDuration = existing.stream().anyMatch(option -> option.getDurationMinutes() == duration);
            if (!hasDuration) {
                ServiceDurationOption option = new ServiceDurationOption();
                option.setService(service);
                option.setDurationMinutes(duration);
                option.setPrice(new BigDecimal(seed.prices().get(index)));
                option.setIsActive(true);
                service.getDurationOptions().add(option);
            }
        }
        return serviceRepository.save(service);
    }

    private void seedTherapistsAndSkills(List<Service> services) {
        List<TherapistSeed> seeds = List.of(
                new TherapistSeed("therapist1", "Therapist One", "Mali", List.of(0, 3)),
                new TherapistSeed("therapist2", "Therapist Two", "Dao", List.of(0, 1)),
                new TherapistSeed("therapist3", "Therapist Three", "Pim", List.of(1, 2)),
                new TherapistSeed("therapist4", "Therapist Four", "Nok", List.of(0, 2)),
                new TherapistSeed("therapist5", "Therapist Five", "Fah", List.of(1, 3)),
                new TherapistSeed("therapist6", "Therapist Six", "Nam", List.of(0, 1, 2, 3)));
        for (int index = 0; index < seeds.size(); index++) {
            TherapistSeed seed = seeds.get(index);
            int therapistIndex = index;
            Therapist therapist = therapistRepository.findAll().stream()
                    .filter(item -> seed.username().equals(item.getUsername())).findFirst().orElseGet(() -> {
                        Therapist fresh = new Therapist();
                        fresh.setUsername(seed.username());
                        fresh.setPasswordHash(passwordEncoder.encode(TEST_PASSWORD));
                        fresh.setFullName(seed.fullName());
                        fresh.setEmail(seed.username() + "@fiwdee.local");
                        fresh.setPhoneNumber("08000000" + (therapistIndex + 1));
                        fresh.setRole(UserRole.THERAPIST);
                        fresh.setIsActive(true);
                        fresh.setNickname(seed.nickname());
                        fresh.setBio("Massage therapist specializing in wellness treatments.");
                        fresh.setCommissionRate(new BigDecimal("0.00"));
                        fresh.setEmploymentStatus("ACTIVE");
                        fresh.setAverageRating(BigDecimal.ZERO);
                        return therapistRepository.save(fresh);
                    });
            List<TherapistSkill> existingSkills = therapistSkillRepository.findByTherapistId(therapist.getId());
            for (Integer serviceIndex : seed.serviceIndexes()) {
                Service service = services.get(serviceIndex);
                boolean exists = existingSkills.stream().anyMatch(skill -> skill.getService().getId().equals(service.getId()));
                if (!exists) {
                    TherapistSkill skill = new TherapistSkill();
                    skill.setTherapist(therapist);
                    skill.setService(service);
                    skill.setSkillLevel("STANDARD");
                    skill.setIsCertified(false);
                    therapistSkillRepository.save(skill);
                }
            }
        }
    }

    private void seedSchedules() {
        LocalDate sampleDate = LocalDate.of(2099, 1, 1);
        List<Therapist> therapists = therapistRepository.findAll();
        for (Therapist therapist : therapists) {
            if (scheduleRepository.findByTherapistIdAndScheduleDate(therapist.getId(), sampleDate).isPresent()) continue;
            TherapistSchedule schedule = new TherapistSchedule();
            schedule.setTherapist(therapist);
            schedule.setScheduleDate(sampleDate);
            schedule.setIsDayOff(false);
            schedule.setNotes("Development sample schedule");
            schedule = scheduleRepository.save(schedule);
            WorkShift shift = new WorkShift();
            shift.setSchedule(schedule);
            shift.setShiftName("Day Shift");
            shift.setStartTime(LocalTime.of(10, 0));
            shift.setEndTime(LocalTime.of(18, 0));
            shift.setShiftStatus("ACTIVE");
            workShiftRepository.save(shift);
        }
    }

    private void seedAdminAccounts() {
        if (!userRepository.existsByUsername("owner")) {
            Owner owner = new Owner();
            owner.setUsername("owner");
            owner.setPasswordHash(passwordEncoder.encode(TEST_PASSWORD));
            owner.setFullName("FIWDEE Owner");
            owner.setEmail("owner@fiwdee.local");
            owner.setPhoneNumber("0800000001");
            owner.setRole(UserRole.OWNER);
            owner.setIsActive(true);
            owner.setManagementLevel("EXECUTIVE");
            ownerRepository.save(owner);
        }
        if (!userRepository.existsByUsername("receptionist")) {
            Receptionist receptionist = new Receptionist();
            receptionist.setUsername("receptionist");
            receptionist.setPasswordHash(passwordEncoder.encode(TEST_PASSWORD));
            receptionist.setFullName("FIWDEE Receptionist");
            receptionist.setEmail("receptionist@fiwdee.local");
            receptionist.setPhoneNumber("0800000002");
            receptionist.setRole(UserRole.RECEPTIONIST);
            receptionist.setIsActive(true);
            receptionist.setStaffCode("STAFF-SEED-01");
            receptionist.setCounterStation("Front Desk");
            receptionistRepository.save(receptionist);
        }
    }

    private record ServiceSeed(String code, String name, String description, String category,
                               RoomType roomType, List<String> prices) {}
    private record TherapistSeed(String username, String fullName, String nickname, List<Integer> serviceIndexes) {}
}
