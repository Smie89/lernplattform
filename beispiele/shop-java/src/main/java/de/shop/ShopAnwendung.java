package de.shop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.Clock;

@SpringBootApplication
public class ShopAnwendung {

    public static void main(String[] args) {
        SpringApplication.run(ShopAnwendung.class, args);
    }

    /** Die Uhr als Bean – in Tests kann eine feste Uhr übergeben werden. */
    @Bean
    Clock uhr() {
        return Clock.systemUTC();
    }
}
