package com.example.backend.controllers;

import com.example.backend.entities.User;
import com.example.backend.repositories.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/painting")
class PaintingController {
    UserRepository userRepository;

    public PaintingController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("")
    public ResponseEntity<?> getPainting() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        if (currentUser == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        byte[] painting = currentUser.getPainting();
        if (painting == null) {
            return ResponseEntity.status(404).body("Painting not found");
        }
        return ResponseEntity.ok(painting);
    }

    @PostMapping("")
    public ResponseEntity<?> savePainting(@RequestBody byte[] painting) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        if (currentUser == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        currentUser.setPainting(painting);
        userRepository.save(currentUser);
        return ResponseEntity.ok("Painting saved successfully");
    }
}
