package com.buddi.api.global.oauth2;

import com.buddi.api.room.entity.Room;
import com.buddi.api.room.entity.RoomMemberRole;
import com.buddi.api.room.repository.RoomRepository;
import com.buddi.api.user.entity.User;
import com.buddi.api.user.repository.UserRepository;
import com.buddi.api.global.oauth2.userinfo.KakaoOAuth2UserInfo;
import com.buddi.api.global.oauth2.userinfo.OAuth2UserInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final RoomRepository roomRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        OAuth2UserInfo userInfo = resolveUserInfo(registrationId, oAuth2User.getAttributes());

        User user = userRepository.findByProviderAndProviderId(registrationId, userInfo.getProviderId())
                .map(existing -> {
                    if (existing.isDeleted()) existing.reactivate();
                    existing.update(userInfo.getNickname());
                    return existing;
                })
                .orElseGet(() -> {
                    User newUser = User.createWithDefaults(registrationId, userInfo.getProviderId(), userInfo.getNickname());
                    newUser.initDefaults();
                    userRepository.save(newUser);
                    roomRepository.findFirstByIsSystemTrue()
                            .ifPresent(room -> room.addMember(newUser.getId(), RoomMemberRole.MEMBER));
                    return newUser;
                });

        return new UserPrincipal(user.getId(), oAuth2User.getAttributes());
    }

    private OAuth2UserInfo resolveUserInfo(String registrationId, java.util.Map<String, Object> attributes) {
        if ("kakao".equals(registrationId)) {
            return new KakaoOAuth2UserInfo(attributes);
        }
        throw new OAuth2AuthenticationException("Unsupported provider: " + registrationId);
    }
}
