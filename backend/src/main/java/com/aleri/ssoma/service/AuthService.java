package com.aleri.ssoma.service;

import com.aleri.ssoma.auth.JwtUtil;
import com.aleri.ssoma.dto.LoginRequest;
import com.aleri.ssoma.dto.LoginResponse;
import com.aleri.ssoma.entity.Modulo;
import com.aleri.ssoma.entity.Rol;
import com.aleri.ssoma.entity.Usuario;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;

    public AuthService(AuthenticationManager authManager, JwtUtil jwtUtil) {
        this.authManager = authManager;
        this.jwtUtil = jwtUtil;
    }

    public LoginResponse login(LoginRequest req) {
        String email = req.getEmail() == null ? "" : req.getEmail().trim().toLowerCase();
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, req.getPassword())
        );

        Usuario usuario = (Usuario) auth.getPrincipal();
        String token = jwtUtil.generateToken(usuario);

        Long empresaId = usuario.getEmpresa() != null ? usuario.getEmpresa().getId() : null;
        String empresaNombre = usuario.getEmpresa() != null ? usuario.getEmpresa().getNombre() : null;
        String planNombre = usuario.getEmpresa() != null && usuario.getEmpresa().getPlan() != null
                ? usuario.getEmpresa().getPlan().getNombre() : null;

        List<String> modulos = calcularModulos(usuario);

        return new LoginResponse(
                token,
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getRol().name(),
                empresaId,
                empresaNombre,
                planNombre,
                modulos
        );
    }

    public List<String> calcularModulos(Usuario usuario) {
        if (usuario.getRol() == Rol.ADMIN || usuario.getRol() == Rol.SUBADMIN) {
            return EnumSet.allOf(Modulo.class).stream()
                    .map(Enum::name)
                    .collect(Collectors.toList());
        }
        if (usuario.getEmpresa() == null || usuario.getEmpresa().getPlan() == null) {
            return List.of();
        }
        Set<Modulo> modulos = usuario.getEmpresa().getPlan().getModulos();
        if (modulos == null) {
            return List.of();
        }
        return modulos.stream().map(Enum::name).collect(Collectors.toList());
    }
}
