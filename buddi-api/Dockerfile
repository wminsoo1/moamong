FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY build/libs/*.jar app.jar

ENTRYPOINT ["java", "-jar", "-Xmx192m", "-Dspring.profiles.active=prod", "-Duser.timezone=Asia/Seoul", "app.jar"]
