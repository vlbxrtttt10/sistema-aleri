package com.aleri.ssoma.service;

import com.aleri.ssoma.auth.JwtUtil;
import com.aleri.ssoma.dto.LoginRequest;
import com.aleri.ssoma.dto.LoginResponse;
import com.aleri.ssoma.entity.Modulo;
import com.aleri.ssoma.entity.Rol;
import com.aleri.ssoma.entity.Supervisor;
import com.aleri.ssoma.entity.Usuario;
import com.aleri.ssoma.repository.SupervisorRepository;
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
    private final SupervisorRepository supervisorRepo;

    public AuthService(AuthenticationManager authManager, JwtUtil jwtUtil, SupervisorRepository supervisorRepo) {
        this.authManager = authManager;
        this.jwtUtil = jwtUtil;
        this.supervisorRepo = supervisorRepo;
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

        Set<Modulo> todos = EnumSet.of(
                Modulo.DASHBOARD, Modulo.INCIDENTES, Modulo.EPPS,
                Modulo.COLABORADORES, Modulo.REPORTES
        );

        if (usuario.getRol() == Rol.SUPERVISOR) {
            Supervisor sup = supervisorRepo.findByUsuario(usuario).orElse(null);
            if (sup != null) {
                Set<Modulo> visibles = sup.getModulosVisibles();
                return todos.stream()
                        .filter(m -> m == Modulo.DASHBOARD || visibles.contains(m))
                        .map(Enum::name)
                        .collect(Collectors.toList());
            }
        }

        return todos.stream().map(Enum::name).collect(Collectors.toList());
    }
}
