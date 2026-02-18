package com.techflow.erp.service;

import com.techflow.erp.entity.User;
import com.techflow.erp.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void changeInitialPassword(Long userId, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 1. Criptăm și salvăm noua parolă
        user.setPassword(passwordEncoder.encode(newPassword));

        // 2. Dezactivăm flag-ul de forțare
        user.setNeedsPasswordChange(false);

        // 3. Curățăm parola în clar (Security first!)
        user.setTempPasswordPlain(null);

        userRepository.save(user);
    }
}
