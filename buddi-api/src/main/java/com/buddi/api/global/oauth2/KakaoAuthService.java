package com.buddi.api.global.oauth2;

import com.buddi.api.room.entity.Room;
import com.buddi.api.room.entity.RoomMemberRole;
import com.buddi.api.room.repository.RoomRepository;
import com.buddi.api.user.entity.User;
import com.buddi.api.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class KakaoAuthService {

    private static final String PROVIDER = "kakao";
    private static final String KAKAO_USER_INFO_URL = "https://kapi.kakao.com/v2/user/me";

    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    public record AuthResult(Long userId, boolean isNewUser) {}

    @Transactional
    public AuthResult authenticate(String accessToken) {
        Map<String, Object> userInfo = fetchKakaoUserInfo(accessToken);

        String providerId = String.valueOf(userInfo.get("id"));
        @SuppressWarnings("unchecked")
        Map<String, Object> kakaoAccount = (Map<String, Object>) userInfo.get("kakao_account");
        @SuppressWarnings("unchecked")
        Map<String, Object> profile = kakaoAccount != null ? (Map<String, Object>) kakaoAccount.get("profile") : null;
        String nickname = profile != null ? (String) profile.get("nickname") : "카카오 사용자";

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
    private Map<String, Object> fetchKakaoUserInfo(String accessToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            return restTemplate.exchange(KAKAO_USER_INFO_URL, HttpMethod.GET, entity, Map.class).getBody();
        } catch (Exception e) {
            throw new IllegalArgumentException("카카오 사용자 정보 조회 실패: " + e.getMessage());
        }
    }
}
