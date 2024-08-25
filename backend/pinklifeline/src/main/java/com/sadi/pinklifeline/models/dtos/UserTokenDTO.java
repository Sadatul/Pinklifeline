package com.sadi.pinklifeline.models.dtos;

import com.sadi.pinklifeline.enums.Roles;
import com.sadi.pinklifeline.enums.SubscriptionType;
import com.sadi.pinklifeline.enums.YesNo;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class UserTokenDTO {
    public Long id;
    public String username;
    public List<Roles> roles;
    public YesNo isRegistered;
    public SubscriptionType subscriptionType;
    public LocalDateTime expiryDate;

    public UserTokenDTO(Long id, String username, YesNo isRegistered, SubscriptionType subscriptionType, LocalDateTime expiryDate) {
        this.id = id;
        this.username = username;
        this.isRegistered = isRegistered;
        this.subscriptionType = subscriptionType;
        this.expiryDate = expiryDate;
    }
}
