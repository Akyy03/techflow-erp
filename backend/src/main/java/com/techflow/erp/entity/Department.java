package com.techflow.erp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "departments")
@Getter
@Setter
@NoArgsConstructor
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    // Managerul departamentului este tot un angajat
    @OneToOne
    @JoinColumn(name = "manager_id")
    private Employee manager;

    // Listă de angajați din acest departament
    @JsonIgnore
    @OneToMany(mappedBy = "department")
    private List<Employee> employees;
}