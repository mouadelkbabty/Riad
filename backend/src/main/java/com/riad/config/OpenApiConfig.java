package com.riad.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI riadOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Riad Reservation API")
                        .description("API complète pour la gestion des réservations du Riad. "
                                + "Gestion des chambres, réservations, galeries photo et authentification sécurisée.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Riad Support")
                                .email("contact@riad.ma")
                                .url("https://www.riad.ma"))
                        .license(new License()
                                .name("Privé")
                                .url("https://www.riad.ma/license")))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SECURITY_SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Entrez votre token JWT. Format: Bearer {token}")));
    }
}
