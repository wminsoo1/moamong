package com.buddi.api.global.config;

import com.buddi.api.room.entity.Room;
import com.buddi.api.room.entity.RoomMemberRole;
import com.buddi.api.room.repository.RoomRepository;
import com.buddi.api.shareditem.entity.SharedItem;
import com.buddi.api.shareditem.entity.SharedItemCategory;
import com.buddi.api.shareditem.repository.SharedItemRepository;
import com.buddi.api.spending.entity.RecurringSpending;
import com.buddi.api.spending.entity.Spending;
import com.buddi.api.spending.entity.SpendingType;
import com.buddi.api.spending.repository.RecurringSpendingRepository;
import com.buddi.api.spending.repository.SpendingRepository;
import com.buddi.api.user.entity.Category;
import com.buddi.api.user.entity.User;
import com.buddi.api.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.function.Consumer;

@Component
@RequiredArgsConstructor
@Profile("dev")
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SpendingRepository spendingRepository;
    private final RecurringSpendingRepository recurringSpendingRepository;
    private final RoomRepository roomRepository;
    private final SharedItemRepository sharedItemRepository;

    @Override
    @Transactional
    public void run(String... args) {
        initSystemRoom();
        initDummyUsers();
        initDummySpendings();
        initRecurringSpendings();
        initTestRoom();
        initExtraTestRooms();
        initSharedItems();
        initBulkData();
    }

    private void initSystemRoom() {
        if (roomRepository.findFirstByIsSystemTrue().isPresent()) return;
        Room system = Room.createSystem("전체 공유방");
        roomRepository.save(system);
    }

    private void initDummyUsers() {
        createIfAbsent("test001", "테스트친구", "testfriend", user -> {
            user.addCategory("유튜브",     SpendingType.EXPENSE, "HOUSING");
            user.addCategory("츄르", SpendingType.EXPENSE, "PETS");
            user.addCategory("해외주식", SpendingType.INCOME,  "INVESTMENT");
        });
        createIfAbsent("test002", "쇼핑왕민준", "minjun", user -> {
            user.addCategory("아이패드", SpendingType.EXPENSE, "BIG_SPENDING");
            user.addCategory("나이키",     SpendingType.EXPENSE, "FASHION");
            user.addCategory("중고폰판매", SpendingType.INCOME,  "ETC");
        });
        createIfAbsent("test003", "건강러지수", "jisu", user -> {
            user.addCategory("단백질쉐이크",  SpendingType.EXPENSE, "HEALTH");
            user.addCategory("요가복",  SpendingType.EXPENSE, "FASHION");
            user.addCategory("강연료",  SpendingType.INCOME,  "EMPLOYMENT");
        });
    }

    private void initRecurringSpendings() {
        userRepository.findByProviderAndProviderId("dummy", "test001").ifPresent(user -> {
            if (!recurringSpendingRepository.findByUserIdOrderByDayOfMonth(user.getId()).isEmpty()) return;
            Long uid = user.getId();
            recurringSpendingRepository.saveAll(List.of(
                RecurringSpending.of(uid, SpendingType.EXPENSE, "주거", "HOUSING",   800_000L, 25, LocalDate.of(2024, 1, 25), null,                       "월세"),
                RecurringSpending.of(uid, SpendingType.EXPENSE, "통신", "HOUSING",    13_900L,  4, LocalDate.of(2023, 6,  4), null,                       "넷플릭스"),
                RecurringSpending.of(uid, SpendingType.EXPENSE, "통신", "HOUSING",     9_900L, 11, LocalDate.of(2024, 3, 11), null,                       "유튜브 프리미엄"),
                RecurringSpending.of(uid, SpendingType.EXPENSE, "건강관리", "HEALTH",  55_000L,  1, LocalDate.of(2025, 1,  1), null,                       "헬스장 월정액"),
                RecurringSpending.of(uid, SpendingType.INCOME,  "임대수익", "INVESTMENT", 350_000L, 5, LocalDate.of(2024, 6,  5), LocalDate.of(2026, 12, 5), "원룸 월세 수입")
            ));
        });
    }

    private void initTestRoom() {
        User testfriend = userRepository.findByProviderAndProviderId("dummy", "test001").orElse(null);
        User minjun     = userRepository.findByProviderAndProviderId("dummy", "test002").orElse(null);
        User jisu       = userRepository.findByProviderAndProviderId("dummy", "test003").orElse(null);
        if (testfriend == null || minjun == null || jisu == null) return;
        if (!roomRepository.findByUserId(testfriend.getId()).isEmpty()) return;

        // 3인 방
        Room room1 = Room.create(testfriend.getId(), "우리 셋 방");
        room1.addMember(testfriend.getId(), RoomMemberRole.OWNER);
        room1.addMember(minjun.getId(), RoomMemberRole.MEMBER);
        room1.addMember(jisu.getId(), RoomMemberRole.MEMBER);
        roomRepository.save(room1);

        // test001 + test002 둘이서 방
        Room room2 = Room.create(minjun.getId(), "패션 공유방");
        room2.addMember(minjun.getId(), RoomMemberRole.OWNER);
        room2.addMember(testfriend.getId(), RoomMemberRole.MEMBER);
        roomRepository.save(room2);

        // test002 + test003 둘이서 방
        Room room3 = Room.create(jisu.getId(), "운동 모임");
        room3.addMember(jisu.getId(), RoomMemberRole.OWNER);
        room3.addMember(minjun.getId(), RoomMemberRole.MEMBER);
        roomRepository.save(room3);

    }

    private void initExtraTestRooms() {
        User testfriend = userRepository.findByProviderAndProviderId("dummy", "test001").orElse(null);
        User minjun     = userRepository.findByProviderAndProviderId("dummy", "test002").orElse(null);
        User jisu       = userRepository.findByProviderAndProviderId("dummy", "test003").orElse(null);
        if (testfriend == null || minjun == null || jisu == null) return;

        List<String> existingNames = roomRepository.findByUserId(testfriend.getId())
                .stream().map(Room::getName).toList();

        if (!existingNames.contains("건강 챌린지")) {
            Room r = Room.create(testfriend.getId(), "건강 챌린지");
            r.addMember(testfriend.getId(), RoomMemberRole.OWNER);
            r.addMember(jisu.getId(), RoomMemberRole.MEMBER);
            roomRepository.save(r);
        }

        if (!existingNames.contains("나만의 위시리스트")) {
            Room r = Room.create(testfriend.getId(), "나만의 위시리스트");
            r.addMember(testfriend.getId(), RoomMemberRole.OWNER);
            roomRepository.save(r);
        }

        if (!existingNames.contains("핫딜 공유방")) {
            Room r = Room.create(minjun.getId(), "핫딜 공유방");
            r.addMember(minjun.getId(), RoomMemberRole.OWNER);
            r.addMember(testfriend.getId(), RoomMemberRole.MEMBER);
            r.addMember(jisu.getId(), RoomMemberRole.MEMBER);
            roomRepository.save(r);
        }
    }

    private void initSharedItems() {
        User testfriend = userRepository.findByProviderAndProviderId("dummy", "test001").orElse(null);
        User minjun     = userRepository.findByProviderAndProviderId("dummy", "test002").orElse(null);
        User jisu       = userRepository.findByProviderAndProviderId("dummy", "test003").orElse(null);
        if (testfriend == null || minjun == null || jisu == null) return;

        List<Room> rooms = roomRepository.findByUserId(testfriend.getId());
        if (rooms.isEmpty()) return;
        if (sharedItemRepository.count() > 0) return;

        List<Long> roomIds = List.of(rooms.get(0).getId());
        LocalDate start = LocalDate.of(2026, 5, 1);
        LocalDate end   = LocalDate.of(2026, 5, 31);

        Long tfId = testfriend.getId(), mjId = minjun.getId(), jiId = jisu.getId();

        List<Spending> tfSpendings = spendingRepository.findByUserIdAndDateBetweenOrderByDateDesc(tfId, start, end);
        tfSpendings.stream().filter(s -> s.getAmount() == 55000L).findFirst().ifPresent(s -> {
            SharedItem item = shareSpending(s, tfId, roomIds, "이거 진짜 핵가성비", "https://musinsa.com/item/1001", "무신사 스탠다드 후드집업", "https://image.msscdn.net/images/goods_img/20221031/2909092/2909092_6_500.jpg", SharedItemCategory.FASHION);
            item.toggleReaction(mjId, "❤️");
            item.toggleReaction(jiId, "❤️");
        });
        tfSpendings.stream().filter(s -> s.getAmount() == 145000L).findFirst().ifPresent(s -> {
            SharedItem item = shareSpending(s, tfId, roomIds, "나이키 역대급 세일 중", "https://musinsa.com/item/1002", "나이키 에어맥스 270", "https://image.msscdn.net/images/goods_img/20230824/3527587/3527587_6_500.jpg", SharedItemCategory.SPORTS);
            item.toggleReaction(mjId, "❤️");
            item.toggleReaction(jiId, "❤️");
        });

        List<Spending> mjSpendings = spendingRepository.findByUserIdAndDateBetweenOrderByDateDesc(mjId, start, end);
        mjSpendings.stream().filter(s -> s.getAmount() == 132000L).findFirst().ifPresent(s -> {
            SharedItem item = shareSpending(s, mjId, roomIds, "완전 핵인싸템 ㅋㅋ", "https://musinsa.com/item/2001", "아크테릭스 자켓", "https://image.msscdn.net/images/goods_img/20240108/3783510/3783510_6_500.jpg", SharedItemCategory.FASHION);
            item.toggleReaction(tfId, "❤️");
            item.toggleReaction(jiId, "❤️");
        });
        mjSpendings.stream().filter(s -> s.getAmount() == 245000L).findFirst().ifPresent(s -> {
            SharedItem item = shareSpending(s, mjId, roomIds, "이거 보고 반했음", "https://musinsa.com/item/2002", "우영미 오버핏 셔츠", "https://image.msscdn.net/images/goods_img/20230707/3425393/3425393_6_500.jpg", SharedItemCategory.FASHION);
            item.toggleReaction(tfId, "❤️");
            item.toggleReaction(jiId, "❤️");
        });

        List<Spending> jiSpendings = spendingRepository.findByUserIdAndDateBetweenOrderByDateDesc(jiId, start, end);
        jiSpendings.stream().filter(s -> s.getAmount() == 89000L).findFirst().ifPresent(s -> {
            SharedItem item = shareSpending(s, jiId, roomIds, "단백질 이거 최고임", "https://coupang.com/item/3001", "머슬팜 단백질 파우더 5kg", "https://thumbnail7.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/2022/08/11/14/5/c8e2a3e2-3b1a-4f6e-8f2a-1e3c4d5e6f7a.jpg", SharedItemCategory.SPORTS);
            item.toggleReaction(tfId, "❤️");
            item.toggleReaction(mjId, "❤️");
        });
    }

    private SharedItem shareSpending(Spending spending, Long userId, List<Long> roomIds, String memo, String url, String title, String imageUrl, SharedItemCategory category) {
        String shareGroupId = java.util.UUID.randomUUID().toString();
        SharedItem first = null;
        for (Long roomId : roomIds) {
            SharedItem item = SharedItem.of(userId, title, url, imageUrl, memo, category, spending.getId(), spending.getAmount(), false, shareGroupId);
            sharedItemRepository.save(item);
            item.shareToRoom(roomId);
            if (first == null) first = item;
        }
        return first;
    }

    private void initBulkData() {
        if (userRepository.findByProviderAndProviderId("bulk", "bulk001").isPresent()) return;

        Random random = new Random(42);
        LocalDate startDate = LocalDate.of(2024, 1, 1);

        for (int i = 1; i <= 50; i++) {
            User user = User.createWithDefaults("bulk", String.format("bulk%03d", i), "부하테스터" + i);
            user.assignUsername("bulk" + i);
            user.initDefaults();
            userRepository.save(user);

            List<Category> categories = user.getCategories();
            List<Spending> spendings = new ArrayList<>();
            for (int j = 0; j < 300; j++) {
                Category cat = categories.get(random.nextInt(categories.size()));
                long amount = (random.nextInt(100) + 1) * 1000L;
                LocalDate date = startDate.plusDays(random.nextInt(730));
                spendings.add(Spending.of(user.getId(), SpendingType.EXPENSE, cat.getName(), cat.getParentGroupKey(), amount, date, null, null));
            }
            spendingRepository.saveAll(spendings);
        }
    }

    private void createIfAbsent(String providerId, String nickname, String username, Consumer<User> customCategories) {
        if (userRepository.findByProviderAndProviderId("dummy", providerId).isPresent()) return;
        User user = User.createWithDefaults("dummy", providerId, nickname);
        user.assignUsername(username);
        user.initDefaults();
        customCategories.accept(user);
        userRepository.save(user);
        roomRepository.findFirstByIsSystemTrue()
                .ifPresent(room -> room.addMember(user.getId(), RoomMemberRole.MEMBER));
    }

    private void initDummySpendings() {
        userRepository.findByProviderAndProviderId("dummy", "test001").ifPresent(user -> {
            if (spendingRepository.existsByUserId(user.getId())) return;
            spendingRepository.saveAll(List.of(
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "식사",      12000L, LocalDate.of(2026, 5,  1), "편의점 점심"),
                buildSpending(user, SpendingType.EXPENSE, "TRANSPORT", "대중교통",   4500L, LocalDate.of(2026, 5,  1), "지하철 정기권"),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "식사",      38000L, LocalDate.of(2026, 5,  2), "친구들이랑 삼겹살"),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",   "의류",      55000L, LocalDate.of(2026, 5,  3), "후드집업"),
                buildSpending(user, SpendingType.EXPENSE, "HOUSING",   "통신",      13900L, LocalDate.of(2026, 5,  4), "넷플릭스 구독"),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "식사",       8500L, LocalDate.of(2026, 5,  5), "김밥 + 라면"),
                buildSpending(user, SpendingType.EXPENSE, "TRANSPORT", "대중교통",   3000L, LocalDate.of(2026, 5,  5), "버스 충전"),
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  25000L, LocalDate.of(2026, 5,  7), "헬스장 1일권"),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "식사",      15000L, LocalDate.of(2026, 5,  8), "혼자 점심 파스타"),
                buildSpending(user, SpendingType.EXPENSE, "PETS",      "사료/간식", 45000L, LocalDate.of(2026, 5,  9), "강아지 사료 + 간식"),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",   "의류",      89000L, LocalDate.of(2026, 5,  9), "반팔 2장"),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "카페",       9500L, LocalDate.of(2026, 5, 10), "카페 아메리카노"),
                buildSpending(user, SpendingType.EXPENSE, "LEISURE",   "문화생활",  22000L, LocalDate.of(2026, 5, 10), "영화 관람"),
                buildSpending(user, SpendingType.EXPENSE, "HOUSING",   "통신",       9900L, LocalDate.of(2026, 5, 11), "유튜브 프리미엄"),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",   "의류",     145000L, LocalDate.of(2026, 5, 14), "나이키 운동화"),
                buildSpending(user, SpendingType.EXPENSE, "PETS",      "용품",      32000L, LocalDate.of(2026, 5, 16), "강아지 미용"),
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  38000L, LocalDate.of(2026, 5, 18), "약국 영양제"),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",   "의류",      78000L, LocalDate.of(2026, 5, 20), "청바지"),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "식사",      22000L, LocalDate.of(2026, 5, 21), "저녁 치킨"),
                buildSpending(user, SpendingType.EXPENSE, "DAILY_GOODS","생필품",   15000L, LocalDate.of(2026, 5, 22), "다이소 생활용품"),
                buildSpending(user, SpendingType.EXPENSE, "TRAVEL",    "국내",     280000L, LocalDate.of(2026, 5, 24), "제주도 숙박 예약"),
                buildSpending(user, SpendingType.INCOME,  "EMPLOYMENT","월급",    2400000L, LocalDate.of(2026, 5,  1), "5월 월급"),
                buildSpending(user, SpendingType.INCOME,  "INVESTMENT","임대수익",  350000L, LocalDate.of(2026, 5,  5), "원룸 월세"),
                buildSpending(user, SpendingType.INCOME,  "ETC",       "용돈",     150000L, LocalDate.of(2026, 5, 10), "부모님 용돈"),
                buildSpending(user, SpendingType.INCOME,  "ETC",       "중고판매",  80000L, LocalDate.of(2026, 5, 12), "중고거래 수익"),
                buildSpending(user, SpendingType.INCOME,  "EMPLOYMENT","성과급",   300000L, LocalDate.of(2026, 5, 15), "과외 수입"),
                buildSpending(user, SpendingType.INCOME,  "EMPLOYMENT","성과급",    55000L, LocalDate.of(2026, 5, 18), "블로그 원고료"),
                buildSpending(user, SpendingType.INCOME,  "INVESTMENT","배당금",   500000L, LocalDate.of(2026, 5, 20), "주식 배당금"),
                buildSpending(user, SpendingType.INCOME,  "ETC",       "생일용돈", 120000L, LocalDate.of(2026, 5, 25), "생일 선물 용돈"),
                // 6월
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "식사",      14000L, LocalDate.of(2026, 6,  2), "점심 국밥"),
                buildSpending(user, SpendingType.EXPENSE, "TRANSPORT", "대중교통",   4500L, LocalDate.of(2026, 6,  2), "지하철 정기권"),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "카페",       8000L, LocalDate.of(2026, 6,  3), "아이스 아메리카노"),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "식사",      42000L, LocalDate.of(2026, 6,  5), "가족 외식"),
                buildSpending(user, SpendingType.EXPENSE, "HOUSING",   "통신",      13900L, LocalDate.of(2026, 6,  6), "넷플릭스 구독"),
                buildSpending(user, SpendingType.EXPENSE, "PETS",      "사료/간식", 38000L, LocalDate.of(2026, 6,  7), "강아지 간식 + 장난감"),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",   "의류",      62000L, LocalDate.of(2026, 6,  9), "반바지 구매"),
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  25000L, LocalDate.of(2026, 6, 10), "헬스장 1일권"),
                buildSpending(user, SpendingType.EXPENSE, "LEISURE",   "문화생활",  18000L, LocalDate.of(2026, 6, 12), "영화 관람"),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "식사",      11000L, LocalDate.of(2026, 6, 13), "편의점 저녁"),
                buildSpending(user, SpendingType.EXPENSE, "HOUSING",   "통신",       9900L, LocalDate.of(2026, 6, 14), "유튜브 프리미엄"),
                buildSpending(user, SpendingType.EXPENSE, "TRANSPORT", "대중교통",   3000L, LocalDate.of(2026, 6, 15), "버스 충전"),
                buildSpending(user, SpendingType.EXPENSE, "PETS",      "병원",      55000L, LocalDate.of(2026, 6, 17), "강아지 병원 검진"),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "카페",      12000L, LocalDate.of(2026, 6, 18), "케이크 + 음료"),
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  32000L, LocalDate.of(2026, 6, 20), "비타민 C 영양제"),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "식사",      28000L, LocalDate.of(2026, 6, 21), "친구 저녁 삼겹살"),
                buildSpending(user, SpendingType.EXPENSE, "TRAVEL",    "국내",     120000L, LocalDate.of(2026, 6, 25), "강원도 당일치기"),
                buildSpending(user, SpendingType.EXPENSE, "DAILY_GOODS","생필품",   22000L, LocalDate.of(2026, 6, 27), "생활용품 마트"),
                buildSpending(user, SpendingType.INCOME,  "EMPLOYMENT","월급",    2400000L, LocalDate.of(2026, 6,  1), "6월 월급"),
                buildSpending(user, SpendingType.INCOME,  "INVESTMENT","임대수익",  350000L, LocalDate.of(2026, 6,  5), "원룸 월세"),
                buildSpending(user, SpendingType.INCOME,  "EMPLOYMENT","성과급",   250000L, LocalDate.of(2026, 6, 14), "6월 과외 수입"),
                buildSpending(user, SpendingType.INCOME,  "ETC",       "용돈",      50000L, LocalDate.of(2026, 6, 20), "소액 용돈")
            ));
        });

        userRepository.findByProviderAndProviderId("dummy", "test002").ifPresent(user -> {
            if (spendingRepository.existsByUserId(user.getId())) return;
            spendingRepository.saveAll(List.of(
                buildSpending(user, SpendingType.EXPENSE, "FASHION",     "의류",     132000L, LocalDate.of(2026, 5,  2), "아크테릭스 자켓"),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",        "식사",      18500L, LocalDate.of(2026, 5,  3), "스시 오마카세"),
                buildSpending(user, SpendingType.EXPENSE, "BIG_SPENDING","전자기기", 890000L, LocalDate.of(2026, 5,  4), "에어팟 프로 4"),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",     "의류",      67000L, LocalDate.of(2026, 5,  6), "조거 팬츠"),
                buildSpending(user, SpendingType.EXPENSE, "TRANSPORT",   "차량",       3200L, LocalDate.of(2026, 5,  8), "택시"),
                buildSpending(user, SpendingType.EXPENSE, "BIG_SPENDING","전자기기",  35000L, LocalDate.of(2026, 5, 10), "게이밍 마우스 패드"),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",     "의류",     245000L, LocalDate.of(2026, 5, 11), "우영미 셔츠"),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",        "식사",      32000L, LocalDate.of(2026, 5, 13), "팀 점심 회식"),
                buildSpending(user, SpendingType.EXPENSE, "LEISURE",     "문화생활",  45000L, LocalDate.of(2026, 5, 15), "콘서트 티켓"),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",     "기타쇼핑", 560000L, LocalDate.of(2026, 5, 16), "구찌 카드지갑"),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",     "의류",      98000L, LocalDate.of(2026, 5, 17), "스니커즈"),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",        "식사",      14000L, LocalDate.of(2026, 5, 19), "편의점 저녁"),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",     "의류",      56000L, LocalDate.of(2026, 5, 21), "반팔 티셔츠"),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",     "기타쇼핑", 320000L, LocalDate.of(2026, 5, 23), "메종마르지엘라 향수"),
                buildSpending(user, SpendingType.INCOME,  "EMPLOYMENT",  "월급",    3200000L, LocalDate.of(2026, 5,  1), "5월 월급"),
                buildSpending(user, SpendingType.INCOME,  "ETC",         "기타수입", 180000L, LocalDate.of(2026, 5,  9), "한정판 스니커즈 리셀"),
                buildSpending(user, SpendingType.INCOME,  "EMPLOYMENT",  "성과급",   500000L, LocalDate.of(2026, 5, 15), "프리랜서 수입"),
                buildSpending(user, SpendingType.INCOME,  "ETC",         "기타수입", 240000L, LocalDate.of(2026, 5, 22), "빈티지 재킷 리셀"),
                // 6월
                buildSpending(user, SpendingType.EXPENSE, "FASHION",     "의류",     178000L, LocalDate.of(2026, 6,  1), "발렌시아가 반팔"),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",        "식사",      22000L, LocalDate.of(2026, 6,  3), "스테이크 런치"),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",     "기타쇼핑", 320000L, LocalDate.of(2026, 6,  5), "크롬하츠 반지"),
                buildSpending(user, SpendingType.EXPENSE, "BIG_SPENDING","전자기기", 129000L, LocalDate.of(2026, 6,  7), "무선 이어폰 케이스"),
                buildSpending(user, SpendingType.EXPENSE, "TRANSPORT",   "차량",       5800L, LocalDate.of(2026, 6,  9), "심야 택시"),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",     "기타쇼핑", 890000L, LocalDate.of(2026, 6, 10), "보테가베네타 카드지갑"),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",        "식사",      35000L, LocalDate.of(2026, 6, 12), "오마카세 점심"),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",     "의류",      88000L, LocalDate.of(2026, 6, 14), "린넨 셔츠"),
                buildSpending(user, SpendingType.EXPENSE, "LEISURE",     "문화생활",  55000L, LocalDate.of(2026, 6, 16), "뮤지컬 티켓"),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",     "의류",      67000L, LocalDate.of(2026, 6, 18), "에센셜 반바지"),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",        "식사",      18000L, LocalDate.of(2026, 6, 20), "편의점 + 카페"),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",     "의류",     145000L, LocalDate.of(2026, 6, 22), "뉴발란스 574"),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",     "기타쇼핑", 450000L, LocalDate.of(2026, 6, 25), "톰브라운 양말 세트"),
                buildSpending(user, SpendingType.INCOME,  "EMPLOYMENT",  "월급",    3200000L, LocalDate.of(2026, 6,  1), "6월 월급"),
                buildSpending(user, SpendingType.INCOME,  "ETC",         "기타수입", 320000L, LocalDate.of(2026, 6, 13), "조던 리셀"),
                buildSpending(user, SpendingType.INCOME,  "EMPLOYMENT",  "성과급",   600000L, LocalDate.of(2026, 6, 20), "외주 디자인")
            ));
        });

        userRepository.findByProviderAndProviderId("dummy", "test003").ifPresent(user -> {
            if (spendingRepository.existsByUserId(user.getId())) return;
            spendingRepository.saveAll(List.of(
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  55000L, LocalDate.of(2026, 5,  1), "필라테스 월정액"),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "식사",      12000L, LocalDate.of(2026, 5,  2), "샐러드 + 닭가슴살"),
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  48000L, LocalDate.of(2026, 5,  3), "크레아틴 + BCAA"),
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  89000L, LocalDate.of(2026, 5,  5), "단백질 파우더 5kg"),
                buildSpending(user, SpendingType.EXPENSE, "TRANSPORT", "대중교통",   2800L, LocalDate.of(2026, 5,  7), "버스"),
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  32000L, LocalDate.of(2026, 5,  8), "마그네슘 + 비타민D"),
                buildSpending(user, SpendingType.EXPENSE, "LEISURE",   "문화생활",  28000L, LocalDate.of(2026, 5,  9), "전시회 관람"),
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  43000L, LocalDate.of(2026, 5, 12), "요가 수업"),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "식사",      16500L, LocalDate.of(2026, 5, 14), "그릭요거트 + 과일"),
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  72000L, LocalDate.of(2026, 5, 16), "러닝화"),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",   "의류",      89000L, LocalDate.of(2026, 5, 18), "나이키 드라이핏 레깅스"),
                buildSpending(user, SpendingType.EXPENSE, "TRANSPORT", "대중교통",   4100L, LocalDate.of(2026, 5, 19), "지하철"),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",   "의류",      65000L, LocalDate.of(2026, 5, 21), "압박 스포츠 양말 세트"),
                buildSpending(user, SpendingType.EXPENSE, "SOCIAL",    "선물",      21000L, LocalDate.of(2026, 5, 22), "생일 선물"),
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  55000L, LocalDate.of(2026, 5, 25), "오메가3 + 콜라겐"),
                buildSpending(user, SpendingType.INCOME,  "EMPLOYMENT","월급",    2800000L, LocalDate.of(2026, 5,  1), "5월 월급"),
                buildSpending(user, SpendingType.INCOME,  "EMPLOYMENT","성과급",   400000L, LocalDate.of(2026, 5, 11), "퍼스널 트레이닝 4회"),
                buildSpending(user, SpendingType.INCOME,  "EMPLOYMENT","성과급",   200000L, LocalDate.of(2026, 5, 20), "필라테스 강사 알바"),
                buildSpending(user, SpendingType.INCOME,  "EMPLOYMENT","성과급",   200000L, LocalDate.of(2026, 5, 27), "PT 추가 수업"),
                // 6월
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  55000L, LocalDate.of(2026, 6,  1), "필라테스 6월 정기권"),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "식사",      13500L, LocalDate.of(2026, 6,  2), "닭가슴살 샐러드"),
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  52000L, LocalDate.of(2026, 6,  4), "단백질 파우더 2kg"),
                buildSpending(user, SpendingType.EXPENSE, "TRANSPORT", "대중교통",   2800L, LocalDate.of(2026, 6,  5), "버스"),
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  28000L, LocalDate.of(2026, 6,  7), "글루타민 + 아르기닌"),
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  35000L, LocalDate.of(2026, 6,  9), "요가 주 2회 수업"),
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "병원",      18000L, LocalDate.of(2026, 6, 10), "근육통 파스"),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "식사",      15000L, LocalDate.of(2026, 6, 11), "현미밥 + 두부 정식"),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",   "의류",      75000L, LocalDate.of(2026, 6, 13), "젝시믹스 레깅스"),
                buildSpending(user, SpendingType.EXPENSE, "LEISURE",   "문화생활",  15000L, LocalDate.of(2026, 6, 15), "넷플릭스 영화"),
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  45000L, LocalDate.of(2026, 6, 17), "오메가3 + 마그네슘"),
                buildSpending(user, SpendingType.EXPENSE, "TRANSPORT", "대중교통",   4100L, LocalDate.of(2026, 6, 18), "지하철"),
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  48000L, LocalDate.of(2026, 6, 20), "크로스핏 체험"),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "식사",      11000L, LocalDate.of(2026, 6, 22), "두유 + 과일"),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",   "의류",      58000L, LocalDate.of(2026, 6, 24), "러닝 반바지"),
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  39000L, LocalDate.of(2026, 6, 26), "비타민D + 아연"),
                buildSpending(user, SpendingType.INCOME,  "EMPLOYMENT","월급",    2800000L, LocalDate.of(2026, 6,  1), "6월 월급"),
                buildSpending(user, SpendingType.INCOME,  "EMPLOYMENT","성과급",   600000L, LocalDate.of(2026, 6, 10), "PT 6회 패키지"),
                buildSpending(user, SpendingType.INCOME,  "EMPLOYMENT","성과급",   250000L, LocalDate.of(2026, 6, 22), "필라테스 특강 강사")
            ));
        });
    }

    private Spending buildSpending(User user, SpendingType type, String groupKey, String categoryName, long amount, LocalDate date, String memo) {
        Category cat = user.getCategories().stream()
                .filter(c -> c.getName().equals(categoryName) && c.getType() == type && c.getParentGroupKey().equals(groupKey))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("카테고리 없음: [" + groupKey + "] " + categoryName));
        return Spending.of(user.getId(), type, cat.getName(), cat.getParentGroupKey(), amount, date, memo, null);
    }
}
