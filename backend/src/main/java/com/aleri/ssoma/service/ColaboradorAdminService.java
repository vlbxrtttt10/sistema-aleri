package com.aleri.ssoma.service;

import com.aleri.ssoma.dto.ActualizarUsuarioAdminRequest;
import com.aleri.ssoma.dto.CrearUsuarioRequest;
import com.aleri.ssoma.dto.UsuarioResumenDto;
import com.aleri.ssoma.entity.Rol;
import com.aleri.ssoma.entity.Usuario;
import com.aleri.ssoma.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ColaboradorAdminService {

    private final UsuarioRepository usuarioRepo;
    private final PasswordEncoder   passwordEncoder;

    public ColaboradorAdminService(UsuarioRepository usuarioRepo, PasswordEncoder passwordEncoder) {
        this.usuarioRepo     = usuarioRepo;
        this.passwordEncoder = passwordEncoder;
    }

    /* Listar solo ADMIN y SUBADMIN */
    public List<UsuarioResumenDto> listar() {
        return usuarioRepo
                .findByRolInOrderByCreatedAtDesc(List.of(Rol.ADMIN, Rol.SUBADMIN))
                .stream()
                .map(u -> new UsuarioResumenDto(
                        u.getId(),
                        u.getNombre(),
                        u.getEmail(),
                        u.getRol().name(),
                        u.getActivo(),
                        u.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    /* Crear nuevo ADMIN o SUBADMIN */
    public UsuarioResumenDto crear(CrearUsuarioRequest req) {
        if (usuarioRepo.existsByEmail(req.getEmail().trim().toLowerCase())) {
            throw new IllegalArgumentException("El correo ya está en uso");
        }

        Rol rol;
        try {
            rol = Rol.valueOf(req.getTipo().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Tipo inválido. Use ADMIN o SUBADMIN");
        }

        if (rol != Rol.ADMIN && rol != Rol.SUBADMIN) {
            throw new IllegalArgumentException("Solo se puede crear ADMIN o SUBADMIN");
        }

        Usuario u = new Usuario();
        u.setNombre(req.getNombre().trim());
        u.setEmail(req.getEmail().trim().toLowerCase());
        u.setPassword(passwordEncoder.encode(req.getPassword()));
        u.setRol(rol);
        u.setActivo(true);

        usuarioRepo.save(u);

        return new UsuarioResumenDto(
                u.getId(),
                u.getNombre(),
                u.getEmail(),
                u.getRol().name(),
                u.getActivo(),
                u.getCreatedAt()
        );
    }

    /* Actualizar ADMIN o SUBADMIN existente. Password opcional. */
    public UsuarioResumenDto actualizar(Long id, ActualizarUsuarioAdminRequest req) {
        Usuario u = usuarioRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        if (u.getRol() != Rol.ADMIN && u.getRol() != Rol.SUBADMIN) {
            throw new IllegalArgumentException("Solo se puede modificar ADMIN o SUBADMIN");
        }

        Rol nuevoRol;
        try {
            nuevoRol = Rol.valueOf(req.getTipo().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Tipo inválido. Use ADMIN o SUBADMIN");
        }
        if (nuevoRol != Rol.ADMIN && nuevoRol != Rol.SUBADMIN) {
            throw new IllegalArgumentException("Solo se puede asignar ADMIN o SUBADMIN");
        }

        String nuevoEmail = req.getEmail().trim().toLowerCase();
        if (!nuevoEmail.equals(u.getEmail()) && usuarioRepo.existsByEmail(nuevoEmail)) {
            throw new IllegalArgumentException("Ese correo ya está en uso");
        }

        u.setNombre(req.getNombre().trim());
        u.setEmail(nuevoEmail);
        u.setRol(nuevoRol);

        // Solo cambiar password si vino algo (string no vacío)
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            u.setPassword(passwordEncoder.encode(req.getPassword()));
        }

        usuarioRepo.save(u);

        return new UsuarioResumenDto(
                u.getId(),
                u.getNombre(),
                u.getEmail(),
                u.getRol().name(),
                u.getActivo(),
                u.getCreatedAt()
        );
    }

    /* Activar / desactivar usuario */
    public UsuarioResumenDto toggleActivo(Long id) {
        Usuario u = usuarioRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        if (u.getRol() != Rol.ADMIN && u.getRol() != Rol.SUBADMIN) {
            throw new IllegalArgumentException("Solo se puede modificar ADMIN o SUBADMIN");
        }

        u.setActivo(!u.getActivo());
        usuarioRepo.save(u);

        return new UsuarioResumenDto(
                u.getId(),
                u.getNombre(),
                u.getEmail(),
                u.getRol().name(),
                u.getActivo(),
                u.getCreatedAt()
        );
    }
}
