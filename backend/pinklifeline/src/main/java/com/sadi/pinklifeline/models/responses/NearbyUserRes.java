package com.sadi.pinklifeline.models.responses;


import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class NearbyUserRes {
    private Long id;
    private String fullName;
    private String location;
    private String profilePicture;
}
