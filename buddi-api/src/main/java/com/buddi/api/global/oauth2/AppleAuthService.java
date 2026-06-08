package com.buddi.api.global.oauth2;

import com.buddi.api.room.entity.Room;
import com.buddi.api.room.entity.RoomMemberRole;
import com.buddi.api.room.repository.RoomRepository;
import com.buddi.api.user.entity.User;
import com.buddi.api.user.repository.UserRepository;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.RSASSAVerifier;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URL;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AppleAuthService {

    private static final String PROVIDER = "apple";
    private static final String APPLE_KEYS_URL = "https://appleid.apple.com/auth/keys";
    private static final String APPLE_ISSUER = "https://appleid.apple.com";

    private final UserRepository userRepository;
    private final RoomRepository roomRepository;

    public record AuthResult(Long userId, boolean isNewUser) {}

    @Transactional
    public AuthResult authenticate(String identityToken, String fullName) {
        String sub = verifyAndExtractSub(identityToken);

        Optional<User> existing = userRepository.findByProviderAndProviderId(PROVIDER, sub);
        boolean isNew = existing.isEmpty();

        User user = existing.map(u -> {
            if (u.isDeleted()) u.reactivate();
            return u;
        }).orElseGet(() -> {
            String nickname = (fullName != null && !fullName.isBlank()) ? fullName : "Apple 사용자";
            User newUser = User.createWithDefaults(PROVIDER, sub, nickname);
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

    private String verifyAndExtractSub(String identityToken) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(identityToken);
            String kid = signedJWT.getHeader().getKeyID();

            JWKSet jwkSet = JWKSet.load(new URL(APPLE_KEYS_URL));
            RSAKey rsaKey = (RSAKey) jwkSet.getKeyByKeyId(kid);
            if (rsaKey == null) throw new IllegalArgumentException("Apple 공개키를 찾을 수 없습니다");

            JWSVerifier verifier = new RSASSAVerifier(rsaKey.toRSAPublicKey());
            if (!signedJWT.verify(verifier)) throw new IllegalArgumentException("Apple 토큰 서명 검증 실패");

            JWTClaimsSet claims = signedJWT.getJWTClaimsSet();
            if (!APPLE_ISSUER.equals(claims.getIssuer())) throw new IllegalArgumentException("Apple 토큰 발급자 불일치");
            if (claims.getExpirationTime().before(new Date())) throw new IllegalArgumentException("Apple 토큰이 만료됐습니다");

            return claims.getSubject();
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("Apple 토큰 검증 실패: " + e.getMessage());
        }
    }
}
