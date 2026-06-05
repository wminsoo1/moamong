package com.buddi.api.global.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;

import java.io.IOException;

@Configuration
public class FirebaseConfig {

    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        if (!FirebaseApp.getApps().isEmpty()) {
            return FirebaseApp.getInstance();
        }
        String credentialsPath = System.getenv("FIREBASE_CREDENTIALS_PATH");
        Resource resource = (credentialsPath != null && !credentialsPath.isBlank())
                ? new FileSystemResource(credentialsPath)
                : new ClassPathResource("firebase-service-account.json");
        GoogleCredentials credentials = GoogleCredentials.fromStream(resource.getInputStream());
        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(credentials)
                .build();
        return FirebaseApp.initializeApp(options);
    }
}
