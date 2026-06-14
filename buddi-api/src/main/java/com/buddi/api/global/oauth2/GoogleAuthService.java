package com.buddi.api.global.oauth2;

import com.buddi.api.room.entity.Room;
import com.buddi.api.room.entity.RoomMemberRole;
import com.buddi.api.room.repository.RoomRepository;
import com.buddi.api.user.entity.User;
import com.buddi.api.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GoogleAuthService {

    private static final String PROVIDER = "google";
    private static final String GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo?id_token=";

    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    public record AuthResult(Long userId, boolean isNewUser) {}

    @Transactional
    public AuthResult authenticate(String idToken) {
        Map<String, Object> tokenInfo = verifyIdToken(idToken);

        String providerId = (String) tokenInfo.get("sub");
        if (providerId == null) throw new IllegalArgumentException("Google 사용자 ID를 찾을 수 없습니다");

        String name = (String) tokenInfo.get("name");
        String nickname = (name != null && !name.isBlank()) ? name : "구글 사용자";

        Optional<User> existing = userRepository.findByProviderAndProviderId(PROVIDER, providerId);
        boolean isNew = existing.isEmpty();

        User user = existing.map(u -> {
            if (u.isDeleted()) u.reactivate();
            return u;
        }).orElseGet(() -> {
            User newUser = User.createWithDefaults(PROVIDER, providerId, nickname);
            newUser.initDefaults();
            userRepository.save(newUser);
            Room systemRoom = roomRepository.findFirstByIsSystemTrue()
                    .orElseGet(() -> roomRepository.save(Room.createSystem("전체 공유방")));
            systemRoom.addMember(newUser.getId(), RoomMemberRole.MEMBER);
            newUser.updateShareRoomIds(List.of(systemRoom.getId()));
            return newUser;
        });

        return new AuthResult(user.getId(), isNew);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> verifyIdToken(String idToken) {
        try {
            Map<String, Object> response = restTemplate.getForObject(
                    GOOGLE_TOKENINFO_URL + idToken, Map.class);
            if (response == null || response.containsKey("error")) {
                throw new IllegalArgumentException("유효하지 않은 Google 토큰입니다");
            }
            return response;
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("Google 토큰 검증 실패: " + e.getMessage());
        }
    }
}
