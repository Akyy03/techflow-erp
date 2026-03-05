package com.techflow.erp.dto.external;

import lombok.Data;

@Data
public class PublicHolidayDTO {
    private String date;      // Vine sub forma "2026-01-01"
    private String localName; // Numele în română (ex: "Anul Nou")
    private String name;      // Numele în engleză
}