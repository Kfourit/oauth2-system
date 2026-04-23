package com.example.authservice.service;

import com.example.authservice.entity.Role;
import com.example.authservice.entity.User;
import com.example.authservice.repository.RoleRepository;
import com.example.authservice.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @InjectMocks private UserService userService;

    private Role stubRole() {
        var role = new Role();
        role.setName("ROLE_USER");
        return role;
    }

    @Test
    void register_success_returnsUserWithCorrectFields() {
        var role = stubRole();
        when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(roleRepository.findByName("ROLE_USER")).thenReturn(Optional.of(role));
        when(passwordEncoder.encode("secret")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User result = userService.register("Alice", "alice@example.com", "secret");

        assertThat(result.getName()).isEqualTo("Alice");
        assertThat(result.getEmail()).isEqualTo("alice@example.com");
        assertThat(result.getPassword()).isEqualTo("hashed");
        assertThat(result.getRole()).isEqualTo(role);
    }

    @Test
    void register_duplicateEmail_throwsIllegalArgumentException() {
        when(userRepository.existsByEmail("dup@example.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.register("Bob", "dup@example.com", "pass"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Email already taken");

        verifyNoInteractions(roleRepository, passwordEncoder);
    }

    @Test
    void register_roleNotFound_throwsIllegalStateException() {
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(roleRepository.findByName("ROLE_USER")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.register("Carol", "new@example.com", "pass"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("ROLE_USER not found");

        verify(userRepository, never()).save(any());
    }

    @Test
    void register_encodesPasswordBeforeSaving() {
        var role = stubRole();
        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(roleRepository.findByName("ROLE_USER")).thenReturn(Optional.of(role));
        when(passwordEncoder.encode("plaintext")).thenReturn("$2a$encoded");
        when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        User result = userService.register("Dave", "dave@example.com", "plaintext");

        verify(passwordEncoder).encode("plaintext");
        assertThat(result.getPassword()).isEqualTo("$2a$encoded");
        assertThat(result.getPassword()).isNotEqualTo("plaintext");
    }

    @Test
    void register_persistsUserWithAllFieldsToRepository() {
        var role = stubRole();
        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(roleRepository.findByName("ROLE_USER")).thenReturn(Optional.of(role));
        when(passwordEncoder.encode(any())).thenReturn("hashed");
        when(userRepository.save(captor.capture())).thenAnswer(inv -> inv.getArgument(0));

        userService.register("Eve", "eve@example.com", "pass");

        User saved = captor.getValue();
        assertThat(saved.getName()).isEqualTo("Eve");
        assertThat(saved.getEmail()).isEqualTo("eve@example.com");
        assertThat(saved.getRole()).isEqualTo(role);
        assertThat(saved.isEnabled()).isTrue();
    }
}
