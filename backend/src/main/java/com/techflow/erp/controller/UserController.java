package com.techflow.erp.controller;

import com.techflow.erp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/{id}/change-password")
    public ResponseEntity<Void> changePassword(@PathVariable Long id, @RequestBody String newPassword) {
        // Notă: Într-o aplicație reală, newPassword ar trebui să vină într-un DTO 
        // pentru validare, dar pentru acum, merge și așa.
        userService.changeInitialPassword(id, newPassword);
        return ResponseEntity.ok().build();
    }
}