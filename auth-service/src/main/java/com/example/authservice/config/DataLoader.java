package com.example.authservice.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.oidc.OidcScopes;
import org.springframework.security.oauth2.server.authorization.client.JdbcRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class DataLoader implements ApplicationRunner {

    private final JdbcRegisteredClientRepository registeredClientRepository;
    private final PasswordEncoder passwordEncoder;

    public DataLoader(JdbcRegisteredClientRepository registeredClientRepository, PasswordEncoder passwordEncoder) {
        this.registeredClientRepository = registeredClientRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        var webApp = registeredClientRepository.findByClientId("demo-web-app");
        if (webApp == null) {
            registeredClientRepository.save(
                    RegisteredClient.withId(UUID.randomUUID().toString())
                            .clientId("demo-web-app")
                            .clientAuthenticationMethod(ClientAuthenticationMethod.NONE)
                            .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                            .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
                            .redirectUri("http://localhost:3000/callback")
                            .postLogoutRedirectUri("http://localhost:3000")
                            .scope(OidcScopes.OPENID)
                            .scope(OidcScopes.PROFILE)
                            .scope("read")
                            .scope("write")
                            .clientSettings(ClientSettings.builder()
                                    .requireProofKey(true)
                                    .requireAuthorizationConsent(true)
                                    .build())
                            .build()
            );
        } else if (webApp.getPostLogoutRedirectUris().isEmpty()) {
            registeredClientRepository.save(
                    RegisteredClient.from(webApp)
                            .postLogoutRedirectUri("http://localhost:3000")
                            .build()
            );
        }

        if (registeredClientRepository.findByClientId("service-client") == null) {
            registeredClientRepository.save(
                    RegisteredClient.withId(UUID.randomUUID().toString())
                            .clientId("service-client")
                            .clientSecret(passwordEncoder.encode("service-secret"))
                            .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                            .authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
                            .scope("internal")
                            .scope("read")
                            .scope("write")
                            .build()
            );
        }
    }
}
