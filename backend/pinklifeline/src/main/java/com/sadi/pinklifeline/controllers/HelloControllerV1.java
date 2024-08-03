package com.sadi.pinklifeline.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/v1/hello")
public class HelloControllerV1 {
    @GetMapping
    public ResponseEntity<String> auth(){
        return ResponseEntity.ok("Hello World");
    }

    @GetMapping("/healthy")
    public ResponseEntity<String> healthCheck(){
        return ResponseEntity.ok("Hello World");
    }
}
