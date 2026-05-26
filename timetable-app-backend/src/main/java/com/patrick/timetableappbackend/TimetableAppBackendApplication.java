package com.patrick.timetableappbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;


@SpringBootApplication
@EnableScheduling
public class TimetableAppBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(TimetableAppBackendApplication.class, args);
	}

}
