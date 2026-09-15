package com.skillforge.dto.request;

import com.skillforge.entity.User;
import lombok.Data;

@Data
public class AdminUpdateUserRequest {
    private String firstName;
    private String lastName;
    private User.Role role;
    private Boolean isActive;
    private Boolean isVerified;
}
