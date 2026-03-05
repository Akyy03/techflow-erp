package com.techflow.erp.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveCalculationService {

    private final PublicHolidayService publicHolidayService;

    public int calculateWorkDays(LocalDate startDate, LocalDate endDate) {
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Data de început nu poate fi după data de sfârșit.");
        }

        // 1. Obținem sărbătorile legale pentru anul/anii respectivi
        // (Luăm pentru anul de start; dacă perioada sare în alt an, e mai complex, dar momentan rămânem la unul)
        List<LocalDate> holidays = publicHolidayService.getRomanianHolidays(startDate.getYear());

        int workDays = 0;
        LocalDate current = startDate;

        // 2. Iterăm prin fiecare zi din interval
        while (!current.isAfter(endDate)) {

            // Verificăm dacă NU este weekend (Sâmbătă sau Duminică)
            boolean isWeekend = (current.getDayOfWeek() == DayOfWeek.SATURDAY ||
                    current.getDayOfWeek() == DayOfWeek.SUNDAY);

            // Verificăm dacă NU este sărbătoare legală
            boolean isHoliday = holidays.contains(current);

            // Doar dacă e zi de săptămână și nu e sărbătoare, o numărăm
            if (!isWeekend && !isHoliday) {
                workDays++;
            }

            current = current.plusDays(1); // Mergem la următoarea zi
        }

        return workDays;
    }
}