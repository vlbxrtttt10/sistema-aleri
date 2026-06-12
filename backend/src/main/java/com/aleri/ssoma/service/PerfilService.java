package com.aleri.ssoma.service;

import com.aleri.ssoma.dto.ActualizarPerfilRequest;
import com.aleri.ssoma.dto.PerfilResponse;
import com.aleri.ssoma.entity.Usuario;
import com.aleri.ssoma.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PerfilService {

    private final UsuarioRepository usuarioRepo;
    private final PasswordEncoder passwordEncoder;

    public PerfilService(UsuarioRepository usuarioRepo, PasswordEncoder passwordEncoder) {
        this.usuarioRepo = usuarioRepo;
        this.passwordEncoder = passwordEncoder;
    }

    public PerfilResponse getPerfil(Usuario usuario) {
        return new PerfilResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getRol().name(),
                usuario.getEmpresa() != null ? usuario.getEmpresa().getNombre() : "ALERI (Admin)",
                usuario.getEmpresa() != null ? usuario.getEmpresa().getPlan().getNombre() : "-"
        );
    }

    public PerfilResponse actualizar(Usuario usuario, ActualizarPerfilRequest req) {
        // Actualizar nombre
        if (req.getNombre() != null && !req.getNombre().isBlank()) {
            usuario.setNombre(req.getNombre().trim());
        }

        // Actualizar email
        if (req.getEmail() != null && !req.getEmail().isBlank()
                && !req.getEmail().equalsIgnoreCase(usuario.getEmail())) {
            boolean existe = usuarioRepo.existsByEmail(req.getEmail());
            if (existe) throw new IllegalArgumentException("El correo ya esta en uso por otro usuario");
            usuario.setEmail(req.getEmail().trim().toLowerCase());
        }

        // Actualizar contraseña
        if (req.getPasswordNuevo() != null && !req.getPasswordNuevo().isBlank()) {
            if (req.getPasswordActual() == null || req.getPasswordActual().isBlank()) {
                throw new IllegalArgumentException("Debes ingresar tu contrasena actual");
            }
            if (!passwordEncoder.matches(req.getPasswordActual(), usuario.getPassword())) {
                throw new IllegalArgumentException("La contrasena actual es incorrecta");
            }
            usuario.setPassword(passwordEncoder.encode(req.getPasswordNuevo()));
        }

        usuarioRepo.save(usuario);
        return getPerfil(usuario);
    }
}
