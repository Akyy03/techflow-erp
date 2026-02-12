package com.techflow.erp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "employees")
@Getter
@Setter
@NoArgsConstructor
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relatia 1:1 cu User (pentru login/security mai târziu)
    @OneToOne(cascade = CascadeType.ALL, optional = true)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = true)
    private User user;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "email", unique = true)
    private String email;

    @Column(name = "phone", unique = true)
    private String phone;

    private String position;

    private BigDecimal salary;

    private LocalDate hireDate;

    // Soft Delete - în loc să ștergem fizic, marcăm ca "deleted"
    @Column(name = "is_deleted")
    private boolean isDeleted = false;

    private String profilePictureUrl;

    // Setăm automat data angajării la data curentă dacă nu este specificată
    @PrePersist
    protected void onCreate() {
        if (this.hireDate == null) {
            this.hireDate = LocalDate.now();
        }
    }
}