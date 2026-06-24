package com.buddi.api.global.config;

import com.buddi.api.card.entity.*;
import com.buddi.api.card.repository.CardRepository;
import com.buddi.api.card.repository.SearchAliasRepository;
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
import java.time.LocalDateTime;
import java.time.LocalTime;
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
    private final CardRepository cardRepository;
    private final SearchAliasRepository searchAliasRepository;

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
        initSpendingInteractions();
        initHealthChallengeInteractions();
        initBulkData();
        initCards();
        initSearchAliases();
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
            SharedItem item = shareSpending(s, tfId, roomIds, "이거 진짜 핵가성비", "https://musinsa.com/item/1001", "무신사 스탠다드 후드집업", "https://image.msscdn.net/images/goods_img/20221031/2909092/2909092_6_500.jpg", SharedItemCategory.BEAUTY);
            item.toggleReaction(mjId, "❤️");
            item.toggleReaction(jiId, "❤️");
        });
        tfSpendings.stream().filter(s -> s.getAmount() == 145000L).findFirst().ifPresent(s -> {
            SharedItem item = shareSpending(s, tfId, roomIds, "나이키 역대급 세일 중", "https://musinsa.com/item/1002", "나이키 에어맥스 270", "https://image.msscdn.net/images/goods_img/20230824/3527587/3527587_6_500.jpg", SharedItemCategory.ETC);
            item.toggleReaction(mjId, "❤️");
            item.toggleReaction(jiId, "❤️");
        });

        List<Spending> mjSpendings = spendingRepository.findByUserIdAndDateBetweenOrderByDateDesc(mjId, start, end);
        mjSpendings.stream().filter(s -> s.getAmount() == 132000L).findFirst().ifPresent(s -> {
            SharedItem item = shareSpending(s, mjId, roomIds, "완전 핵인싸템 ㅋㅋ", "https://musinsa.com/item/2001", "아크테릭스 자켓", "https://image.msscdn.net/images/goods_img/20240108/3783510/3783510_6_500.jpg", SharedItemCategory.BEAUTY);
            item.toggleReaction(tfId, "❤️");
            item.toggleReaction(jiId, "❤️");
        });
        mjSpendings.stream().filter(s -> s.getAmount() == 245000L).findFirst().ifPresent(s -> {
            SharedItem item = shareSpending(s, mjId, roomIds, "이거 보고 반했음", "https://musinsa.com/item/2002", "우영미 오버핏 셔츠", "https://image.msscdn.net/images/goods_img/20230707/3425393/3425393_6_500.jpg", SharedItemCategory.BEAUTY);
            item.toggleReaction(tfId, "❤️");
            item.toggleReaction(jiId, "❤️");
        });

        List<Spending> jiSpendings = spendingRepository.findByUserIdAndDateBetweenOrderByDateDesc(jiId, start, end);
        jiSpendings.stream().filter(s -> s.getAmount() == 89000L).findFirst().ifPresent(s -> {
            SharedItem item = shareSpending(s, jiId, roomIds, "단백질 이거 최고임", "https://coupang.com/item/3001", "머슬팜 단백질 파우더 5kg", "https://thumbnail7.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/2022/08/11/14/5/c8e2a3e2-3b1a-4f6e-8f2a-1e3c4d5e6f7a.jpg", SharedItemCategory.FOOD);
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

    private void initSpendingInteractions() {
        User testfriend = userRepository.findByProviderAndProviderId("dummy", "test001").orElse(null);
        User minjun     = userRepository.findByProviderAndProviderId("dummy", "test002").orElse(null);
        User jisu       = userRepository.findByProviderAndProviderId("dummy", "test003").orElse(null);
        if (testfriend == null || minjun == null || jisu == null) return;

        Long room1Id = roomRepository.findByUserId(testfriend.getId()).stream()
                .filter(r -> "우리 셋 방".equals(r.getName()))
                .map(r -> r.getId())
                .findFirst().orElse(1L);

        LocalDate may1  = LocalDate.of(2026, 5, 1);
        LocalDate may31 = LocalDate.of(2026, 5, 31);

        List<Spending> tfSpendings = spendingRepository.findByUserIdAndDateBetweenOrderByDateDesc(testfriend.getId(), may1, may31);
        List<Spending> mjSpendings = spendingRepository.findByUserIdAndDateBetweenOrderByDateDesc(minjun.getId(),     may1, may31);
        List<Spending> jiSpendings = spendingRepository.findByUserIdAndDateBetweenOrderByDateDesc(jisu.getId(),      may1, may31);
        if (tfSpendings.isEmpty() || mjSpendings.isEmpty() || jiSpendings.isEmpty()) return;

        // 멱등성: 이미 댓글이 있으면 스킵
        Spending firstTarget = tfSpendings.stream().filter(s -> "후드집업".equals(s.getMemo())).findFirst().orElse(null);
        if (firstTarget == null) return;
        Spending check = spendingRepository.findByIdWithComments(firstTarget.getId()).orElse(null);
        if (check != null && !check.getComments().isEmpty()) return;

        Long tfId = testfriend.getId(), mjId = minjun.getId(), jiId = jisu.getId();

        // test001 후드집업 — 댓글 3개 + 좋아요 2개
        tfSpendings.stream().filter(s -> "후드집업".equals(s.getMemo())).findFirst().ifPresent(s -> {
            Spending sp = spendingRepository.findById(s.getId()).orElseThrow();
            sp.addComment(room1Id, mjId, "이거 무신사 세일 때 샀어? 나도 살까 봐");
            sp.addComment(room1Id, jiId, "색깔 뭐야? 나도 비슷한 거 찾고 있었는데");
            sp.addComment(room1Id, tfId, "그레이! 39% 할인 때 득템 ㅋㅋ");
            sp.toggleLike(room1Id, mjId);
            sp.toggleLike(room1Id, jiId);
            spendingRepository.save(sp);
        });

        // test001 나이키 운동화 — 댓글 2개 + 좋아요 2개
        tfSpendings.stream().filter(s -> "나이키 운동화".equals(s.getMemo())).findFirst().ifPresent(s -> {
            Spending sp = spendingRepository.findById(s.getId()).orElseThrow();
            sp.addComment(room1Id, mjId, "이거 얼마야? 나도 사고 싶었는데");
            sp.addComment(room1Id, jiId, "러닝화야? 완전 좋아 보인다");
            sp.toggleLike(room1Id, mjId);
            sp.toggleLike(room1Id, jiId);
            spendingRepository.save(sp);
        });

        // test002 아크테릭스 자켓 — 댓글 2개 + 좋아요 2개
        mjSpendings.stream().filter(s -> "아크테릭스 자켓".equals(s.getMemo())).findFirst().ifPresent(s -> {
            Spending sp = spendingRepository.findById(s.getId()).orElseThrow();
            sp.addComment(room1Id, tfId, "이거 진짜 갖고 싶었는데ㅠㅠ 어디서 샀어?");
            sp.addComment(room1Id, jiId, "부럽다 ㅋㅋ 나중에 실물 보여줘");
            sp.toggleLike(room1Id, tfId);
            sp.toggleLike(room1Id, jiId);
            spendingRepository.save(sp);
        });

        // test002 우영미 셔츠 — 댓글 2개 + 좋아요 1개
        mjSpendings.stream().filter(s -> "우영미 셔츠".equals(s.getMemo())).findFirst().ifPresent(s -> {
            Spending sp = spendingRepository.findById(s.getId()).orElseThrow();
            sp.addComment(room1Id, tfId, "이거 얼마야...? 고퀄이다");
            sp.addComment(room1Id, jiId, "진짜 명품 감성 ㅋㅋ");
            sp.toggleLike(room1Id, tfId);
            spendingRepository.save(sp);
        });

        // test003 단백질 파우더 5kg — 댓글 3개 + 좋아요 2개
        jiSpendings.stream().filter(s -> "단백질 파우더 5kg".equals(s.getMemo())).findFirst().ifPresent(s -> {
            Spending sp = spendingRepository.findById(s.getId()).orElseThrow();
            sp.addComment(room1Id, tfId, "이거 맛있어? 나도 운동 시작하려는데");
            sp.addComment(room1Id, mjId, "5kg이나 샀어? 진지하네 ㅋㅋ");
            sp.addComment(room1Id, jiId, "초코맛 추천! 물이랑 섞으면 맛있음");
            sp.toggleLike(room1Id, tfId);
            sp.toggleLike(room1Id, mjId);
            spendingRepository.save(sp);
        });
    }

    private void initHealthChallengeInteractions() {
        User testfriend = userRepository.findByProviderAndProviderId("dummy", "test001").orElse(null);
        User jisu       = userRepository.findByProviderAndProviderId("dummy", "test003").orElse(null);
        if (testfriend == null || jisu == null) return;

        Long room1Id = roomRepository.findByUserId(testfriend.getId()).stream()
                .filter(r -> "우리 셋 방".equals(r.getName()))
                .map(r -> r.getId())
                .findFirst().orElse(1L);

        LocalDate jun1  = LocalDate.of(2026, 6, 1);
        LocalDate jun30 = LocalDate.of(2026, 6, 30);

        List<Spending> tfSpendings = spendingRepository.findByUserIdAndDateBetweenOrderByDateDesc(testfriend.getId(), jun1, jun30);
        List<Spending> jiSpendings = spendingRepository.findByUserIdAndDateBetweenOrderByDateDesc(jisu.getId(),      jun1, jun30);
        if (tfSpendings.isEmpty() || jiSpendings.isEmpty()) return;

        // 멱등성: 헬스장 1일권에 이미 댓글이 있으면 스킵
        Spending idempotencyCheck = tfSpendings.stream().filter(s -> "헬스장 1일권".equals(s.getMemo())).findFirst().orElse(null);
        if (idempotencyCheck == null) return;
        Spending withComments = spendingRepository.findByIdWithComments(idempotencyCheck.getId()).orElse(null);
        if (withComments != null && !withComments.getComments().isEmpty()) return;

        Long tfId = testfriend.getId(), jiId = jisu.getId();

        // ── jisu 현미밥 + 두부 정식 (6/11, 최신) ──
        jiSpendings.stream().filter(s -> "현미밥 + 두부 정식".equals(s.getMemo())).findFirst().ifPresent(s -> {
            Spending sp = spendingRepository.findById(s.getId()).orElseThrow();
            sp.addComment(room1Id, tfId, "건강식 제대로 먹네 나도 본받아야겠다");
            sp.addComment(room1Id, jiId, "요즘 탄단지 맞춰서 먹으려고 ㅎㅎ 어렵진 않아");
            sp.toggleLike(room1Id, tfId);
            spendingRepository.save(sp);
        });

        // ── jisu 두유 + 과일 (6/11, 최신) ──
        jiSpendings.stream().filter(s -> "두유 + 과일".equals(s.getMemo())).findFirst().ifPresent(s -> {
            Spending sp = spendingRepository.findById(s.getId()).orElseThrow();
            sp.addComment(room1Id, tfId, "아침 루틴 완전 좋다 나도 해봐야지");
            sp.toggleLike(room1Id, tfId);
            spendingRepository.save(sp);
        });

        // ── testfriend 헬스장 1일권 (6/10) ──
        tfSpendings.stream().filter(s -> "헬스장 1일권".equals(s.getMemo())).findFirst().ifPresent(s -> {
            Spending sp = spendingRepository.findById(s.getId()).orElseThrow();
            sp.addComment(room1Id, jiId, "드디어!! 어떤 운동 했어?");
            sp.addComment(room1Id, tfId, "가슴이랑 삼두 했음 ㅋㅋ 생각보다 힘들더라");
            sp.addComment(room1Id, jiId, "ㅋㅋㅋ 꾸준히 하면 돼 우리 같이 자극받자");
            sp.toggleLike(room1Id, jiId);
            spendingRepository.save(sp);
        });

        // ── testfriend 친구 저녁 삼겹살 (6/10) ──
        tfSpendings.stream().filter(s -> "친구 저녁 삼겹살".equals(s.getMemo())).findFirst().ifPresent(s -> {
            Spending sp = spendingRepository.findById(s.getId()).orElseThrow();
            sp.addComment(room1Id, jiId, "헬스하고 바로 삼겹살?? ㅋㅋㅋㅋ 보상심리인가");
            sp.addComment(room1Id, tfId, "치팅데이라고 생각해 😂");
            sp.toggleLike(room1Id, jiId);
            spendingRepository.save(sp);
        });

        // ── jisu 근육통 파스 (6/10) ──
        jiSpendings.stream().filter(s -> "근육통 파스".equals(s.getMemo())).findFirst().ifPresent(s -> {
            Spending sp = spendingRepository.findById(s.getId()).orElseThrow();
            sp.addComment(room1Id, tfId, "크로스핏 후유증이야? ㅋㅋ 괜찮아?");
            sp.addComment(room1Id, jiId, "허벅지가 죽을 것 같아... 내일 회복되겠지");
            sp.toggleLike(room1Id, tfId);
            spendingRepository.save(sp);
        });

        // ── jisu 크로스핏 체험 (6/9) ──
        jiSpendings.stream().filter(s -> "크로스핏 체험".equals(s.getMemo())).findFirst().ifPresent(s -> {
            Spending sp = spendingRepository.findById(s.getId()).orElseThrow();
            sp.addComment(room1Id, tfId, "크로스핏 어때? 나도 해보고 싶었는데");
            sp.addComment(room1Id, jiId, "생각보다 재밌어! 강도가 세서 같이 가면 좋을 것 같아");
            sp.toggleLike(room1Id, tfId);
            spendingRepository.save(sp);
        });
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
                // 4월
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "식사",      9500L,  LocalDate.of(2026, 4,  1), "편의점 점심",        12, 30),
                buildSpending(user, SpendingType.EXPENSE, "TRANSPORT", "대중교통",  4500L,  LocalDate.of(2026, 4,  1), "지하철 정기권",       8, 15),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "카페",      6500L,  LocalDate.of(2026, 4,  2), "아메리카노",         10, 30),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "식사",      32000L, LocalDate.of(2026, 4,  3), "친구들이랑 파스타",  19,  0),
                buildSpending(user, SpendingType.EXPENSE, "HOUSING",   "통신",      13900L, LocalDate.of(2026, 4,  4), "넷플릭스 구독",       9,  0),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "식사",      8000L,  LocalDate.of(2026, 4,  5), "김밥천국",           12, 45),
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  25000L, LocalDate.of(2026, 4,  7), "헬스장 1일권",        7, 30),
                buildSpending(user, SpendingType.EXPENSE, "PETS",      "사료/간식", 42000L, LocalDate.of(2026, 4,  8), "강아지 사료",        11,  0),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "식사",      15500L, LocalDate.of(2026, 4,  9), "혼자 점심 우동",     12,  0),
                buildSpending(user, SpendingType.EXPENSE, "LEISURE",   "문화생활",  22000L, LocalDate.of(2026, 4, 10), "영화 관람",          15,  0),
                buildSpending(user, SpendingType.EXPENSE, "HOUSING",   "통신",       9900L, LocalDate.of(2026, 4, 11), "유튜브 프리미엄",     9,  0),
                buildSpending(user, SpendingType.EXPENSE, "TRANSPORT", "대중교통",  3000L,  LocalDate.of(2026, 4, 12), "버스 충전",           8, 30),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",   "의류",      65000L, LocalDate.of(2026, 4, 13), "봄 자켓",            14,  0),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "식사",      24000L, LocalDate.of(2026, 4, 15), "저녁 삼겹살",        19, 30),
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  35000L, LocalDate.of(2026, 4, 16), "약국 비타민",        16,  0),
                buildSpending(user, SpendingType.EXPENSE, "PETS",      "용품",      28000L, LocalDate.of(2026, 4, 17), "강아지 장난감",      11, 30),
                buildSpending(user, SpendingType.EXPENSE, "DAILY_GOODS","생필품",   18000L, LocalDate.of(2026, 4, 19), "마트 장보기",        13,  0),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "카페",       8500L, LocalDate.of(2026, 4, 21), "카페 라떼",          10, 30),
                buildSpending(user, SpendingType.EXPENSE, "SOCIAL",    "경조사",    50000L, LocalDate.of(2026, 4, 22), "친구 결혼식 축의금", 11,  0),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "식사",      16000L, LocalDate.of(2026, 4, 24), "점심 국밥",          12, 30),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",   "의류",      42000L, LocalDate.of(2026, 4, 26), "봄 티셔츠 2장",      15,  0),
                buildSpending(user, SpendingType.EXPENSE, "HOUSING",   "월세",     800000L, LocalDate.of(2026, 4, 25), "월세",               9,  0),
                buildSpending(user, SpendingType.EXPENSE, "TRAVEL",    "국내",      95000L, LocalDate.of(2026, 4, 28), "당일 여행 교통비",    8,  0),
                buildSpending(user, SpendingType.INCOME,  "EMPLOYMENT","월급",    2400000L, LocalDate.of(2026, 4,  1), "4월 월급",            9,  0),
                buildSpending(user, SpendingType.INCOME,  "INVESTMENT","임대수익",  350000L, LocalDate.of(2026, 4,  5), "원룸 월세",          10,  0),
                buildSpending(user, SpendingType.INCOME,  "ETC",       "용돈",     100000L, LocalDate.of(2026, 4, 10), "부모님 용돈",        11,  0),
                buildSpending(user, SpendingType.INCOME,  "EMPLOYMENT","성과급",   200000L, LocalDate.of(2026, 4, 18), "과외 수입",          18,  0),
                buildSpending(user, SpendingType.INCOME,  "INVESTMENT","배당금",   150000L, LocalDate.of(2026, 4, 25), "주식 배당금",         9, 30),
                // 5월
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "식사",      12000L, LocalDate.of(2026, 5,  1), "편의점 점심",       12, 30),
                buildSpending(user, SpendingType.EXPENSE, "TRANSPORT", "대중교통",   4500L, LocalDate.of(2026, 5,  1), "지하철 정기권",      8, 15),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "식사",      38000L, LocalDate.of(2026, 5,  2), "친구들이랑 삼겹살", 19, 30),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",   "의류",      55000L, LocalDate.of(2026, 5,  3), "후드집업",          14, 20),
                buildSpending(user, SpendingType.EXPENSE, "HOUSING",   "통신",      13900L, LocalDate.of(2026, 5,  4), "넷플릭스 구독",      9,  0),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "식사",       8500L, LocalDate.of(2026, 5,  5), "김밥 + 라면",       12, 45),
                buildSpending(user, SpendingType.EXPENSE, "TRANSPORT", "대중교통",   3000L, LocalDate.of(2026, 5,  5), "버스 충전",          8, 30),
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  25000L, LocalDate.of(2026, 5,  7), "헬스장 1일권",       7, 30),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "식사",      15000L, LocalDate.of(2026, 5,  8), "혼자 점심 파스타",  12,  0),
                buildSpending(user, SpendingType.EXPENSE, "PETS",      "사료/간식", 45000L, LocalDate.of(2026, 5,  9), "강아지 사료 + 간식",11,  0),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",   "의류",      89000L, LocalDate.of(2026, 5,  9), "반팔 2장",          15, 30),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "카페",       9500L, LocalDate.of(2026, 5, 10), "카페 아메리카노",   10, 30),
                buildSpending(user, SpendingType.EXPENSE, "LEISURE",   "문화생활",  22000L, LocalDate.of(2026, 5, 10), "영화 관람",         15,  0),
                buildSpending(user, SpendingType.EXPENSE, "HOUSING",   "통신",       9900L, LocalDate.of(2026, 5, 11), "유튜브 프리미엄",    9,  0),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",   "의류",     145000L, LocalDate.of(2026, 5, 14), "나이키 운동화",     13,  0),
                buildSpending(user, SpendingType.EXPENSE, "PETS",      "용품",      32000L, LocalDate.of(2026, 5, 16), "강아지 미용",       11, 30),
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  38000L, LocalDate.of(2026, 5, 18), "약국 영양제",       16,  0),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",   "의류",      78000L, LocalDate.of(2026, 5, 20), "청바지",            14, 30),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "식사",      22000L, LocalDate.of(2026, 5, 21), "저녁 치킨",         20,  0),
                buildSpending(user, SpendingType.EXPENSE, "DAILY_GOODS","생필품",   15000L, LocalDate.of(2026, 5, 22), "다이소 생활용품",   13, 30),
                buildSpending(user, SpendingType.EXPENSE, "TRAVEL",    "국내",     280000L, LocalDate.of(2026, 5, 24), "제주도 숙박 예약",  21,  0),
                buildSpending(user, SpendingType.INCOME,  "EMPLOYMENT","월급",    2400000L, LocalDate.of(2026, 5,  1), "5월 월급",           9,  0),
                buildSpending(user, SpendingType.INCOME,  "INVESTMENT","임대수익",  350000L, LocalDate.of(2026, 5,  5), "원룸 월세",         10,  0),
                buildSpending(user, SpendingType.INCOME,  "ETC",       "용돈",     150000L, LocalDate.of(2026, 5, 10), "부모님 용돈",       11,  0),
                buildSpending(user, SpendingType.INCOME,  "ETC",       "중고판매",  80000L, LocalDate.of(2026, 5, 12), "중고거래 수익",     14,  0),
                buildSpending(user, SpendingType.INCOME,  "EMPLOYMENT","성과급",   300000L, LocalDate.of(2026, 5, 15), "과외 수입",         18,  0),
                buildSpending(user, SpendingType.INCOME,  "EMPLOYMENT","성과급",    55000L, LocalDate.of(2026, 5, 18), "블로그 원고료",     10,  0),
                buildSpending(user, SpendingType.INCOME,  "INVESTMENT","배당금",   500000L, LocalDate.of(2026, 5, 20), "주식 배당금",        9, 30),
                buildSpending(user, SpendingType.INCOME,  "ETC",       "생일용돈", 120000L, LocalDate.of(2026, 5, 25), "생일 선물 용돈",    16,  0),
                // 6월
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "식사",      14000L, LocalDate.of(2026, 6,  2), "점심 국밥",         12, 30),
                buildSpending(user, SpendingType.EXPENSE, "TRANSPORT", "대중교통",   4500L, LocalDate.of(2026, 6,  2), "지하철 정기권",      8, 15),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "카페",       8000L, LocalDate.of(2026, 6,  3), "아이스 아메리카노", 10, 30),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "식사",      42000L, LocalDate.of(2026, 6,  5), "가족 외식",         19,  0),
                buildSpending(user, SpendingType.EXPENSE, "HOUSING",   "통신",      13900L, LocalDate.of(2026, 6,  6), "넷플릭스 구독",      9,  0),
                buildSpending(user, SpendingType.EXPENSE, "PETS",      "사료/간식", 38000L, LocalDate.of(2026, 6,  7), "강아지 간식 + 장난감",11, 0),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",   "의류",      62000L, LocalDate.of(2026, 6,  9), "반바지 구매",       14, 30),
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  25000L, LocalDate.of(2026, 6, 10), "헬스장 1일권",       7, 30),
                buildSpending(user, SpendingType.EXPENSE, "LEISURE",   "문화생활",  18000L, LocalDate.of(2026, 6, 1), "영화 관람",         15,  0),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "식사",      11000L, LocalDate.of(2026, 6, 2), "편의점 저녁",       19, 30),
                buildSpending(user, SpendingType.EXPENSE, "HOUSING",   "통신",       9900L, LocalDate.of(2026, 6, 3), "유튜브 프리미엄",    9,  0),
                buildSpending(user, SpendingType.EXPENSE, "TRANSPORT", "대중교통",   3000L, LocalDate.of(2026, 6, 4), "버스 충전",          8, 30),
                buildSpending(user, SpendingType.EXPENSE, "PETS",      "병원",      55000L, LocalDate.of(2026, 6, 6), "강아지 병원 검진",  10,  0),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "카페",      12000L, LocalDate.of(2026, 6, 7), "케이크 + 음료",     16, 30),
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  32000L, LocalDate.of(2026, 6, 9), "비타민 C 영양제",   15,  0),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "식사",      28000L, LocalDate.of(2026, 6, 10), "친구 저녁 삼겹살",  19, 30),
                buildSpending(user, SpendingType.EXPENSE, "TRAVEL",    "국내",     120000L, LocalDate.of(2026, 6, 3), "강원도 당일치기",    7,  0),
                buildSpending(user, SpendingType.EXPENSE, "DAILY_GOODS","생필품",   22000L, LocalDate.of(2026, 6, 5), "생활용품 마트",     13,  0),
                buildSpending(user, SpendingType.INCOME,  "EMPLOYMENT","월급",    2400000L, LocalDate.of(2026, 6,  1), "6월 월급",           9,  0),
                buildSpending(user, SpendingType.INCOME,  "INVESTMENT","임대수익",  350000L, LocalDate.of(2026, 6,  5), "원룸 월세",         10,  0),
                buildSpending(user, SpendingType.INCOME,  "EMPLOYMENT","성과급",   250000L, LocalDate.of(2026, 6, 3), "6월 과외 수입",     18,  0),
                buildSpending(user, SpendingType.INCOME,  "ETC",       "용돈",      50000L, LocalDate.of(2026, 6, 9), "소액 용돈",         11,  0)
            ));
        });

        userRepository.findByProviderAndProviderId("dummy", "test002").ifPresent(user -> {
            if (spendingRepository.existsByUserId(user.getId())) return;
            spendingRepository.saveAll(List.of(
                buildSpending(user, SpendingType.EXPENSE, "FASHION",     "의류",     132000L, LocalDate.of(2026, 5,  2), "아크테릭스 자켓",       14, 30),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",        "식사",      18500L, LocalDate.of(2026, 5,  3), "스시 오마카세",          12, 30),
                buildSpending(user, SpendingType.EXPENSE, "BIG_SPENDING","전자기기", 890000L, LocalDate.of(2026, 5,  4), "에어팟 프로 4",          11,  0),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",     "의류",      67000L, LocalDate.of(2026, 5,  6), "조거 팬츠",              15,  0),
                buildSpending(user, SpendingType.EXPENSE, "TRANSPORT",   "차량",       3200L, LocalDate.of(2026, 5,  8), "택시",                   23, 30),
                buildSpending(user, SpendingType.EXPENSE, "BIG_SPENDING","전자기기",  35000L, LocalDate.of(2026, 5, 10), "게이밍 마우스 패드",     22,  0),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",     "의류",     245000L, LocalDate.of(2026, 5, 11), "우영미 셔츠",            14,  0),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",        "식사",      32000L, LocalDate.of(2026, 5, 13), "팀 점심 회식",           12, 30),
                buildSpending(user, SpendingType.EXPENSE, "LEISURE",     "문화생활",  45000L, LocalDate.of(2026, 5, 15), "콘서트 티켓",            20,  0),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",     "기타쇼핑", 560000L, LocalDate.of(2026, 5, 16), "구찌 카드지갑",          15, 30),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",     "의류",      98000L, LocalDate.of(2026, 5, 17), "스니커즈",               16,  0),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",        "식사",      14000L, LocalDate.of(2026, 5, 19), "편의점 저녁",            20, 30),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",     "의류",      56000L, LocalDate.of(2026, 5, 21), "반팔 티셔츠",            13,  0),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",     "기타쇼핑", 320000L, LocalDate.of(2026, 5, 23), "메종마르지엘라 향수",    16, 30),
                buildSpending(user, SpendingType.INCOME,  "EMPLOYMENT",  "월급",    3200000L, LocalDate.of(2026, 5,  1), "5월 월급",                9,  0),
                buildSpending(user, SpendingType.INCOME,  "ETC",         "기타수입", 180000L, LocalDate.of(2026, 5,  9), "한정판 스니커즈 리셀",   14,  0),
                buildSpending(user, SpendingType.INCOME,  "EMPLOYMENT",  "성과급",   500000L, LocalDate.of(2026, 5, 15), "프리랜서 수입",          18,  0),
                buildSpending(user, SpendingType.INCOME,  "ETC",         "기타수입", 240000L, LocalDate.of(2026, 5, 22), "빈티지 재킷 리셀",       15,  0),
                // 6월
                buildSpending(user, SpendingType.EXPENSE, "FASHION",     "의류",     178000L, LocalDate.of(2026, 6,  1), "발렌시아가 반팔",        14,  0),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",        "식사",      22000L, LocalDate.of(2026, 6,  3), "스테이크 런치",          12,  0),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",     "기타쇼핑", 320000L, LocalDate.of(2026, 6,  5), "크롬하츠 반지",          16, 30),
                buildSpending(user, SpendingType.EXPENSE, "BIG_SPENDING","전자기기", 129000L, LocalDate.of(2026, 6,  7), "무선 이어폰 케이스",     11,  0),
                buildSpending(user, SpendingType.EXPENSE, "TRANSPORT",   "차량",       5800L, LocalDate.of(2026, 6,  9), "심야 택시",               1, 30),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",     "기타쇼핑", 890000L, LocalDate.of(2026, 6, 10), "보테가베네타 카드지갑",  15,  0),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",        "식사",      35000L, LocalDate.of(2026, 6, 1), "오마카세 점심",          12, 30),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",     "의류",      88000L, LocalDate.of(2026, 6, 3), "린넨 셔츠",              14,  0),
                buildSpending(user, SpendingType.EXPENSE, "LEISURE",     "문화생활",  55000L, LocalDate.of(2026, 6, 5), "뮤지컬 티켓",            19, 30),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",     "의류",      67000L, LocalDate.of(2026, 6, 7), "에센셜 반바지",          15, 30),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",        "식사",      18000L, LocalDate.of(2026, 6, 9), "편의점 + 카페",          21,  0),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",     "의류",     145000L, LocalDate.of(2026, 6, 11), "뉴발란스 574",           14, 30),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",     "기타쇼핑", 450000L, LocalDate.of(2026, 6, 3), "톰브라운 양말 세트",     16,  0),
                buildSpending(user, SpendingType.INCOME,  "EMPLOYMENT",  "월급",    3200000L, LocalDate.of(2026, 6,  1), "6월 월급",                9,  0),
                buildSpending(user, SpendingType.INCOME,  "ETC",         "기타수입", 320000L, LocalDate.of(2026, 6, 2), "조던 리셀",              14, 30),
                buildSpending(user, SpendingType.INCOME,  "EMPLOYMENT",  "성과급",   600000L, LocalDate.of(2026, 6, 9), "외주 디자인",            19,  0)
            ));
        });

        userRepository.findByProviderAndProviderId("dummy", "test003").ifPresent(user -> {
            if (spendingRepository.existsByUserId(user.getId())) return;
            spendingRepository.saveAll(List.of(
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  55000L, LocalDate.of(2026, 5,  1), "필라테스 월정액",         9,  0),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "식사",      12000L, LocalDate.of(2026, 5,  2), "샐러드 + 닭가슴살",      12, 30),
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  48000L, LocalDate.of(2026, 5,  3), "크레아틴 + BCAA",         8,  0),
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  89000L, LocalDate.of(2026, 5,  5), "단백질 파우더 5kg",      10, 30),
                buildSpending(user, SpendingType.EXPENSE, "TRANSPORT", "대중교통",   2800L, LocalDate.of(2026, 5,  7), "버스",                    7, 45),
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  32000L, LocalDate.of(2026, 5,  8), "마그네슘 + 비타민D",      9,  0),
                buildSpending(user, SpendingType.EXPENSE, "LEISURE",   "문화생활",  28000L, LocalDate.of(2026, 5,  9), "전시회 관람",            15,  0),
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  43000L, LocalDate.of(2026, 5, 12), "요가 수업",              10,  0),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "식사",      16500L, LocalDate.of(2026, 5, 14), "그릭요거트 + 과일",       8,  0),
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  72000L, LocalDate.of(2026, 5, 16), "러닝화",                 14,  0),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",   "의류",      89000L, LocalDate.of(2026, 5, 18), "나이키 드라이핏 레깅스", 15, 30),
                buildSpending(user, SpendingType.EXPENSE, "TRANSPORT", "대중교통",   4100L, LocalDate.of(2026, 5, 19), "지하철",                  7, 30),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",   "의류",      65000L, LocalDate.of(2026, 5, 21), "압박 스포츠 양말 세트",  16,  0),
                buildSpending(user, SpendingType.EXPENSE, "SOCIAL",    "선물",      21000L, LocalDate.of(2026, 5, 22), "생일 선물",              13,  0),
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  55000L, LocalDate.of(2026, 5, 25), "오메가3 + 콜라겐",        9, 30),
                buildSpending(user, SpendingType.INCOME,  "EMPLOYMENT","월급",    2800000L, LocalDate.of(2026, 5,  1), "5월 월급",                9,  0),
                buildSpending(user, SpendingType.INCOME,  "EMPLOYMENT","성과급",   400000L, LocalDate.of(2026, 5, 11), "퍼스널 트레이닝 4회",    18,  0),
                buildSpending(user, SpendingType.INCOME,  "EMPLOYMENT","성과급",   200000L, LocalDate.of(2026, 5, 20), "필라테스 강사 알바",     18,  0),
                buildSpending(user, SpendingType.INCOME,  "EMPLOYMENT","성과급",   200000L, LocalDate.of(2026, 5, 27), "PT 추가 수업",           18,  0),
                // 6월
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  55000L, LocalDate.of(2026, 6,  1), "필라테스 6월 정기권",     9,  0),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "식사",      13500L, LocalDate.of(2026, 6,  2), "닭가슴살 샐러드",        12, 30),
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  52000L, LocalDate.of(2026, 6,  4), "단백질 파우더 2kg",      10, 30),
                buildSpending(user, SpendingType.EXPENSE, "TRANSPORT", "대중교통",   2800L, LocalDate.of(2026, 6,  5), "버스",                    7, 45),
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  28000L, LocalDate.of(2026, 6,  7), "글루타민 + 아르기닌",     8,  0),
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  35000L, LocalDate.of(2026, 6,  9), "요가 주 2회 수업",       10,  0),
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "병원",      18000L, LocalDate.of(2026, 6, 10), "근육통 파스",            16,  0),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "식사",      15000L, LocalDate.of(2026, 6, 11), "현미밥 + 두부 정식",     12,  0),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",   "의류",      75000L, LocalDate.of(2026, 6, 2), "젝시믹스 레깅스",        15, 30),
                buildSpending(user, SpendingType.EXPENSE, "LEISURE",   "문화생활",  15000L, LocalDate.of(2026, 6, 4), "넷플릭스 영화",          21,  0),
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  45000L, LocalDate.of(2026, 6, 6), "오메가3 + 마그네슘",      9,  0),
                buildSpending(user, SpendingType.EXPENSE, "TRANSPORT", "대중교통",   4100L, LocalDate.of(2026, 6, 7), "지하철",                  7, 30),
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  48000L, LocalDate.of(2026, 6, 9), "크로스핏 체험",          10,  0),
                buildSpending(user, SpendingType.EXPENSE, "FOOD",      "식사",      11000L, LocalDate.of(2026, 6, 11), "두유 + 과일",             8,  0),
                buildSpending(user, SpendingType.EXPENSE, "FASHION",   "의류",      58000L, LocalDate.of(2026, 6, 2), "러닝 반바지",            14, 30),
                buildSpending(user, SpendingType.EXPENSE, "HEALTH",    "건강관리",  39000L, LocalDate.of(2026, 6, 4), "비타민D + 아연",          9, 30),
                buildSpending(user, SpendingType.INCOME,  "EMPLOYMENT","월급",    2800000L, LocalDate.of(2026, 6,  1), "6월 월급",                9,  0),
                buildSpending(user, SpendingType.INCOME,  "EMPLOYMENT","성과급",   600000L, LocalDate.of(2026, 6, 10), "PT 6회 패키지",          18,  0),
                buildSpending(user, SpendingType.INCOME,  "EMPLOYMENT","성과급",   250000L, LocalDate.of(2026, 6, 11), "필라테스 특강 강사",     18,  0)
            ));
        });
    }

    private void initCards() {
        if (cardRepository.count() > 0) return;

        // 1. 신한카드 Mr.Life
        Card mrLife = Card.of("신한카드 Mr.Life", "신한카드", 15000, 18000, 300000, null, null);
        BenefitGroup mrLifeBasic = mrLife.addBenefitGroup(BenefitGroupType.FIXED, "기본", 1);
        mrLifeBasic.addBenefit("공과금", "[\"전기요금\",\"도시가스\",\"SKT\",\"KT\",\"LG U+\"]", DiscountType.PERCENT, 10.0, null, 5000, 50000, null, 1, null, null, "{\"monthly_limit_by_tier\":{\"300000\":3000,\"500000\":7000,\"1000000\":10000},\"exclude\":[\"알뜰폰\"]}");
        mrLifeBasic.addBenefit("편의점", null, DiscountType.PERCENT, 10.0, null, 1000, 10000, 5, 1, null, null, "{\"monthly_limit_by_tier\":{\"300000\":10000,\"500000\":20000,\"1000000\":30000}}");
        mrLifeBasic.addBenefit("병원/약국", null, DiscountType.PERCENT, 10.0, null, 1000, 10000, 5, 1, null, null, "{\"monthly_limit_by_tier\":{\"300000\":10000,\"500000\":20000,\"1000000\":30000},\"exclude\":[\"동물병원\"]}");
        mrLifeBasic.addBenefit("세탁소", null, DiscountType.PERCENT, 10.0, null, 1000, 10000, 5, 1, null, null, "{\"monthly_limit_by_tier\":{\"300000\":10000,\"500000\":20000,\"1000000\":30000}}");
        mrLifeBasic.addBenefit("온라인쇼핑", "[\"옥션\",\"G마켓\",\"AK몰\",\"11번가\",\"위메프\",\"쿠팡\"]", DiscountType.PERCENT, 10.0, null, 1000, 10000, 10, 1, "NIGHT(21-09)", null, "{\"monthly_limit_by_tier\":{\"300000\":10000,\"500000\":20000,\"1000000\":30000}}");
        mrLifeBasic.addBenefit("택시", null, DiscountType.PERCENT, 10.0, null, 1000, 10000, 10, 1, "NIGHT(21-09)", null, "{\"monthly_limit_by_tier\":{\"300000\":10000,\"500000\":20000,\"1000000\":30000}}");
        mrLifeBasic.addBenefit("음식점/카페", null, DiscountType.PERCENT, 10.0, null, 1000, 10000, 10, 1, "NIGHT(21-09)", null, "{\"monthly_limit_by_tier\":{\"300000\":10000,\"500000\":20000,\"1000000\":30000},\"include\":[\"한식\",\"양식\",\"일식\",\"중식\",\"뷔페\",\"일반대중음식점\",\"패스트푸드\",\"커피전문점\"]}");
        mrLifeBasic.addBenefit("대형마트", "[\"이마트\",\"홈플러스\",\"롯데마트\"]", DiscountType.PERCENT, 10.0, null, 5000, null, null, 1, "WEEKEND", null, "{\"monthly_limit_by_tier\":{\"300000\":3000,\"500000\":7000,\"1000000\":10000},\"exclude\":[\"상품권\"]}");
        mrLifeBasic.addBenefit("주유소", "[\"SK에너지\",\"GS칼텍스\",\"HD현대오일뱅크\",\"에스오일\"]", DiscountType.WON_PER_LITER, 60.0, null, null, 300000, null, 1, "WEEKEND", null, "{\"monthly_limit_by_tier\":{\"300000\":3000,\"500000\":7000,\"1000000\":10000},\"exclude\":[\"LPG\"]}");
        cardRepository.save(mrLife);

        // 2. 신한카드 Deep Oil
        Card deepOil = Card.of("신한카드 Deep Oil", "신한카드", 10000, 13000, null, null, null);
        BenefitGroup deepOilBasic = deepOil.addBenefitGroup(BenefitGroupType.FIXED, "기본", 1);
        deepOilBasic.addBenefit("주유소", "[\"SK에너지\",\"GS칼텍스\",\"HD현대오일뱅크\",\"에스오일\"]", DiscountType.PERCENT, 10.0, null, null, null, null, null, null, null, "{\"note\":\"무실적, 전 브랜드 적용\"}");
        deepOilBasic.addBenefit("자동차정비", "[\"스피드메이트\"]", DiscountType.PERCENT, 10.0, null, null, null, null, null, null, null, null);
        deepOilBasic.addBenefit("주차장", null, DiscountType.PERCENT, 10.0, null, null, null, null, null, null, null, "{\"note\":\"신한카드 가맹점 업종 기준 주차장에 한함\"}");
        deepOilBasic.addBenefit("편의점", null, DiscountType.PERCENT, 5.0, null, null, null, null, null, null, null, null);
        deepOilBasic.addBenefit("카페", null, DiscountType.PERCENT, 5.0, null, null, null, null, null, null, null, null);
        deepOilBasic.addBenefit("택시", null, DiscountType.PERCENT, 5.0, null, null, null, null, null, null, null, null);
        deepOilBasic.addBenefit("영화관", "[\"CGV\",\"롯데시네마\",\"메가박스\"]", DiscountType.WON, 5000.0, null, 5000, null, null, null, null, null, null);
        cardRepository.save(deepOil);

        // 3. 신한카드 Discount Plan+
        Card discountPlan = Card.of("신한카드 Discount Plan+", "신한카드", 50000, 50000, 300000, PrevMonthExcludeType.DISCOUNT_AMOUNT_ONLY, null);
        BenefitGroup daily = discountPlan.addBenefitGroup(BenefitGroupType.FIXED, "Daily Plan", 1);
        daily.addBenefit("음식점", null, DiscountType.PERCENT, 10.0, null, 2000, 30000, null, 1, null, null, "{\"monthly_limit_by_tier\":{\"300000\":10000,\"500000\":20000,\"1000000\":40000}}");
        daily.addBenefit("카페", null, DiscountType.PERCENT, 10.0, null, 2000, null, null, 1, null, null, "{\"monthly_limit_by_tier\":{\"300000\":10000,\"500000\":20000,\"1000000\":40000}}");
        daily.addBenefit("편의점", null, DiscountType.PERCENT, 10.0, null, 2000, null, null, 1, null, null, "{\"monthly_limit_by_tier\":{\"300000\":10000,\"500000\":20000,\"1000000\":40000}}");
        daily.addBenefit("대형마트", "[\"이마트\",\"롯데마트\"]", DiscountType.PERCENT, 10.0, null, 2000, null, null, 1, null, null, "{\"note\":\"홈플러스 제외(법인회생)\",\"monthly_limit_by_tier\":{\"300000\":10000,\"500000\":20000,\"1000000\":40000}}");
        daily.addBenefit("주유소", "[\"SK에너지\",\"GS칼텍스\",\"HD현대오일뱅크\",\"에스오일\"]", DiscountType.PERCENT, 5.0, null, 2000, null, null, 1, null, null, "{\"monthly_limit_by_tier\":{\"300000\":10000,\"500000\":20000,\"1000000\":40000}}");
        BenefitGroup monthly = discountPlan.addBenefitGroup(BenefitGroupType.FIXED, "Monthly Plan", 1);
        monthly.addBenefit("공과금", "[\"전기요금\",\"도시가스\",\"SKT\",\"KT\",\"LG U+\"]", DiscountType.PERCENT, 20.0, null, null, null, null, 1, null, null, "{\"note\":\"정기결제 건, 월 1회\"}");
        monthly.addBenefit("OTT", "[\"넷플릭스\",\"유튜브프리미엄\",\"왓챠\",\"티빙\",\"웨이브\",\"쿠팡플레이\",\"디즈니플러스\"]", DiscountType.PERCENT, 20.0, null, null, null, null, 1, null, null, "{\"note\":\"정기결제 건, 월 1회\"}");
        monthly.addBenefit("스피드메이트", "[\"스피드메이트\"]", DiscountType.PERCENT, 20.0, null, null, null, 1, null, null, null, "{\"note\":\"연 3회, 오프라인 현장 할인\"}");
        cardRepository.save(discountPlan);

        // 4. KB국민 My WE:SH
        Card myWesh = Card.of("KB국민 My WE:SH", "KB국민카드", 15000, 15000, 400000, PrevMonthExcludeType.FULL_DISCOUNTED_TXN, null);
        BenefitGroup sincerely = myWesh.addBenefitGroup(BenefitGroupType.FIXED, "나한테 진심", 1);
        sincerely.addBenefit("KB Pay", null, DiscountType.PERCENT, 10.0, 5000, 2500, null, null, null, null, null, "{\"note\":\"국내 가맹점 KB Pay 결제에 한함\"}");
        sincerely.addBenefit("음식점/편의점", "[\"GS25\",\"CU\"]", DiscountType.PERCENT, 10.0, 5000, 2500, null, null, null, null, null, null);
        sincerely.addBenefit("통신요금", null, DiscountType.PERCENT, 10.0, 5000, 2500, null, null, null, null, null, null);
        sincerely.addBenefit("OTT", null, DiscountType.PERCENT, 30.0, 5000, 2500, null, null, null, null, null, "{\"note\":\"정기결제 건에 한함\"}");
        BenefitGroup moreSincerely = myWesh.addBenefitGroup(BenefitGroupType.SELECT, "더욱 진심", 1);
        moreSincerely.addBenefit("배달앱/카페", "[\"배달의민족\",\"요기요\",\"마켓컬리\"]", DiscountType.PERCENT, 5.0, 5000, null, null, null, null, null, null, "{\"select_label\":\"먹는데 진심\",\"exclude\":[\"쿠팡이츠\"]}");
        moreSincerely.addBenefit("택시/카페", null, DiscountType.PERCENT, 5.0, 5000, null, null, null, null, null, null, "{\"select_label\":\"노는데 진심\"}");
        moreSincerely.addBenefit("영화관", "[\"CGV\",\"롯데시네마\",\"메가박스\"]", DiscountType.PERCENT, 30.0, 5000, null, null, 4, null, null, null, "{\"select_label\":\"노는데 진심\",\"annual_limit\":20000}");
        moreSincerely.addBenefit("미용/스포츠/올리브영", "[\"올리브영\",\"교보문고\",\"YES24\"]", DiscountType.PERCENT, 5.0, 10000, null, null, null, null, null, null, "{\"select_label\":\"관리에 진심\",\"include\":[\"미용실\",\"스포츠센터\",\"골프장\",\"수영장\",\"요가\",\"볼링장\"]}");
        cardRepository.save(myWesh);

        // 5. KB국민 쿠팡 와우카드
        Card coupangWow = Card.of("KB국민 쿠팡 와우카드", "KB국민카드", 5000, null, null, null, null);
        BenefitGroup coupangBasic = coupangWow.addBenefitGroup(BenefitGroupType.FIXED, "기본", 1);
        coupangBasic.addBenefit("쿠팡", "[\"쿠팡\"]", DiscountType.PERCENT, 5.0, 10000, null, null, null, null, null, null, "{\"note\":\"쿠팡 앱/웹 결제, 로켓배송·로켓프레시 포함\"}");
        coupangBasic.addBenefit("쿠팡이츠", "[\"쿠팡이츠\"]", DiscountType.PERCENT, 5.0, 5000, null, null, null, null, null, null, null);
        coupangBasic.addBenefit("쿠팡플레이", "[\"쿠팡플레이\"]", DiscountType.PERCENT, 5.0, 3000, null, null, null, null, null, null, null);
        cardRepository.save(coupangWow);

        // 6. 삼성카드 taptap O
        Card taptap = Card.of("삼성카드 taptap O", "삼성카드", 10000, 10000, 300000, PrevMonthExcludeType.FULL_DISCOUNTED_TXN, null);
        BenefitGroup taptapBasic = taptap.addBenefitGroup(BenefitGroupType.FIXED, "기본", 1);
        taptapBasic.addBenefit("대중교통", null, DiscountType.PERCENT, 10.0, 5000, null, null, null, null, null, null, "{\"note\":\"버스·지하철·택시 통합 한도 5,000원\"}");
        taptapBasic.addBenefit("통신요금", "[\"SKT\",\"KT\",\"LG U+\"]", DiscountType.PERCENT, 10.0, 5000, null, null, null, null, null, null, "{\"auto_debit_only\":true,\"note\":\"통신3사 자동납부 연결 시\"}");
        taptapBasic.addBenefit("영화관", "[\"CGV\",\"롯데시네마\"]", DiscountType.WON, 5000.0, null, 5000, 10000, 2, 1, null, null, "{\"annual_count\":12,\"note\":\"1만원 이상 결제\"}");
        BenefitGroup lifestyle = taptap.addBenefitGroup(BenefitGroupType.SELECT, "라이프스타일 패키지", 1);
        lifestyle.addBenefit("카페", "[\"스타벅스\"]", DiscountType.PERCENT, 50.0, 10000, null, null, null, null, null, null, "{\"select_label\":\"패키지1~3(스타벅스50%)\"}");
        lifestyle.addBenefit("온라인쇼핑", "[\"옥션\",\"G마켓\"]", DiscountType.PERCENT, 7.0, null, null, null, null, null, null, null, "{\"select_label\":\"패키지1(오픈마켓7%)\"}");
        lifestyle.addBenefit("온라인쇼핑", "[\"쿠팡\"]", DiscountType.PERCENT, 7.0, null, null, null, null, null, null, null, "{\"select_label\":\"패키지2(소셜커머스7%)\"}");
        lifestyle.addBenefit("온라인쇼핑", "[\"무신사\",\"W컨셉\",\"지그재그\"]", DiscountType.PERCENT, 7.0, null, null, null, null, null, null, null, "{\"select_label\":\"패키지3(트렌디숍7%)\"}");
        lifestyle.addBenefit("카페", null, DiscountType.PERCENT, 30.0, 5000, null, null, null, null, null, null, "{\"select_label\":\"패키지4~6(커피전문점30%)\"}");
        cardRepository.save(taptap);

        // 7. 우리카드 카드의정석2
        Card woori2 = Card.of("우리카드 카드의정석2", "우리카드", 12000, null, 500000, null, null);
        BenefitGroup woori2Basic = woori2.addBenefitGroup(BenefitGroupType.FIXED, "기본", 1);
        woori2Basic.addBenefit("전 가맹점", null, DiscountType.PERCENT, 1.2, null, null, null, null, null, null, null, "{\"note\":\"국내외 전 가맹점, 무이자할부·세금·상품권 제외\",\"quarterly_bonus\":\"분기 이용실적에 따라 최대 15,000원 추가 할인\"}");
        cardRepository.save(woori2);

        // 8. 우리카드 카드의정석 POINT
        Card wooriPoint = Card.of("우리카드 카드의정석 POINT", "우리카드", 12000, null, null, null, null);
        BenefitGroup wooriPointBasic = wooriPoint.addBenefitGroup(BenefitGroupType.FIXED, "기본", 1);
        wooriPointBasic.addBenefit("전 가맹점", null, DiscountType.POINT, 0.8, null, null, null, null, null, null, null, "{\"note\":\"무실적, 전 가맹점 0.8% 포인트 적립\"}");
        wooriPointBasic.addBenefit("온라인간편결제", "[\"카카오페이\",\"네이버페이\",\"우리WON페이\"]", DiscountType.POINT, 2.0, null, null, null, null, null, null, 400000, "{\"note\":\"전월실적 40만원 이상 시 추가 적립\"}");
        cardRepository.save(wooriPoint);
    }

    private void initSearchAliases() {
        if (searchAliasRepository.count() > 0) return;
        searchAliasRepository.saveAll(List.of(
            SearchAlias.of("넷플릭스", "OTT", "넷플릭스"),
            SearchAlias.of("왓챠", "OTT", "왓챠"),
            SearchAlias.of("웨이브", "OTT", "웨이브"),
            SearchAlias.of("유튜브", "OTT", "유튜브프리미엄"),
            SearchAlias.of("티빙", "OTT", "티빙"),
            SearchAlias.of("버스", "대중교통", null),
            SearchAlias.of("지하철", "대중교통", null),
            SearchAlias.of("롯데마트", "대형마트", "롯데마트"),
            SearchAlias.of("이마트", "대형마트", "이마트"),
            SearchAlias.of("코스트코", "대형마트", "코스트코"),
            SearchAlias.of("홈플러스", "대형마트", "홈플러스"),
            SearchAlias.of("올리브영", "미용/드럭스토어", "올리브영"),
            SearchAlias.of("올영", "미용/드럭스토어", "올리브영"),
            SearchAlias.of("머리", "미용실", null),
            SearchAlias.of("미용실", "미용실", null),
            SearchAlias.of("배민", "배달앱", "배달의민족"),
            SearchAlias.of("요기요", "배달앱", "요기요"),
            SearchAlias.of("쿠이", "배달앱", "쿠팡이츠"),
            SearchAlias.of("PT", "스포츠센터", null),
            SearchAlias.of("수영", "스포츠센터", null),
            SearchAlias.of("필라테스", "스포츠센터", null),
            SearchAlias.of("헬스", "스포츠센터", null),
            SearchAlias.of("CGV", "영화관", "CGV"),
            SearchAlias.of("롯시", "영화관", "롯데시네마"),
            SearchAlias.of("메박", "영화관", "메가박스"),
            SearchAlias.of("교보문고", "온라인서점/도서", "교보문고"),
            SearchAlias.of("예스24", "온라인서점/도서", "YES24"),
            SearchAlias.of("11번가", "온라인쇼핑", "11번가"),
            SearchAlias.of("무신사", "온라인쇼핑", "무신사"),
            SearchAlias.of("지마켓", "온라인쇼핑", "G마켓"),
            SearchAlias.of("쿠팡", "온라인쇼핑", "쿠팡"),
            SearchAlias.of("스피드메이트", "자동차정비", "스피드메이트"),
            SearchAlias.of("다이소", "잡화", "다이소"),
            SearchAlias.of("기름", "주유소", null),
            SearchAlias.of("주유", "주유소", null),
            SearchAlias.of("메가커피", "카페", "메가MGC커피"),
            SearchAlias.of("빽다방", "카페", "빽다방"),
            SearchAlias.of("스벅", "카페", "스타벅스"),
            SearchAlias.of("이디야", "카페", "이디야"),
            SearchAlias.of("컴포즈", "카페", "컴포즈커피"),
            SearchAlias.of("투썸", "카페", "투썸플레이스"),
            SearchAlias.of("카카오택시", "택시", null),
            SearchAlias.of("택시", "택시", null),
            SearchAlias.of("KT", "통신요금", "KT"),
            SearchAlias.of("LG", "통신요금", "LG U+"),
            SearchAlias.of("SKT", "통신요금", "SKT"),
            SearchAlias.of("통신비", "통신요금", null),
            SearchAlias.of("미니스톱", "편의점", "미니스톱"),
            SearchAlias.of("세븐", "편의점", "세븐일레븐"),
            SearchAlias.of("씨유", "편의점", "CU"),
            SearchAlias.of("지에스", "편의점", "GS25")
        ));
    }

    private Spending buildSpending(User user, SpendingType type, String groupKey, String categoryName, long amount, LocalDate date, String memo, int hour, int minute) {
        Category cat = user.getCategories().stream()
                .filter(c -> c.getName().equals(categoryName) && c.getType() == type && c.getParentGroupKey().equals(groupKey))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("카테고리 없음: [" + groupKey + "] " + categoryName));
        return Spending.of(user.getId(), type, cat.getName(), cat.getParentGroupKey(), amount, date, memo, null,
                LocalDateTime.of(date, LocalTime.of(hour, minute)));
    }
}
