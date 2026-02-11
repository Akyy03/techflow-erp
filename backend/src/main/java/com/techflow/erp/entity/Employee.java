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

    // Relatia 1:1 cu User
    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    private String phone;

    private String position; // Software Developer, Manager, etc.

    private BigDecimal salary;

    private LocalDate hireDate;

    // Soft Delete
    private boolean isDeleted = false;

    // URL pentru poza de profil
    private String profilePictureUrl;

    // private Department department;
}