package com.aleri.ssoma.service;

import com.aleri.ssoma.dto.ActualizarSupervisorRequest;
import com.aleri.ssoma.dto.CrearSupervisorRequest;
import com.aleri.ssoma.dto.SupervisorDto;
import com.aleri.ssoma.entity.Empresa;
import com.aleri.ssoma.entity.Modulo;
import com.aleri.ssoma.entity.Plan;
import com.aleri.ssoma.entity.Rol;
import com.aleri.ssoma.entity.Supervisor;
import com.aleri.ssoma.entity.Usuario;
import com.aleri.ssoma.repository.ColaboradorRepository;
import com.aleri.ssoma.repository.SupervisorRepository;
import com.aleri.ssoma.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SupervisorService {

    private final SupervisorRepository  supervisorRepo;
    private final UsuarioRepository     usuarioRepo;
    private final ColaboradorRepository colaboradorRepo;
    private final PasswordEncoder       passwordEncoder;

    public SupervisorService(SupervisorRepository supervisorRepo,
                             UsuarioRepository usuarioRepo,
                             ColaboradorRepository colaboradorRepo,
                             PasswordEncoder passwordEncoder) {
        this.supervisorRepo  = supervisorRepo;
        this.usuarioRepo     = usuarioRepo;
        this.colaboradorRepo = colaboradorRepo;
        this.passwordEncoder = passwordEncoder;
    }

    /** Módulos que una Empresa puede otorgar/quitar a sus supervisores. */
    private static final Set<Modulo> MODULOS_ASIGNABLES =
            EnumSet.of(Modulo.INCIDENTES, Modulo.EPPS, Modulo.REPORTES, Modulo.COLABORADORES);

    /* ─────────── Helpers ─────────── */

    private Set<Modulo> parsearModulos(Set<String> valores) {
        if (valores == null) return new HashSet<>(MODULOS_ASIGNABLES);
        Set<Modulo> resultado = new HashSet<>();
        for (String v : valores) {
            try {
                Modulo m = Modulo.valueOf(v.trim().toUpperCase());
                if (MODULOS_ASIGNABLES.contains(m)) resultado.add(m);
            } catch (IllegalArgumentException ignored) { /* valor inválido, se ignora */ }
        }
        return resultado;
    }

    /**
     * Devuelve la empresa a la que el solicitante puede gestionar supervisores.
     * - Solo el usuario rol EMPRESA puede gestionar supervisores de su propia empresa.
     * - ADMIN/SUBADMIN no pasan por este servicio (tienen su propio flujo si lo agregamos).
     */
    private Empresa empresaDelSolicitante(Usuario solicitante) {
        if (solicitante.getRol() != Rol.EMPRESA) {
            throw new IllegalArgumentException("Solo el usuario EMPRESA puede gestionar supervisores");
        }
        if (solicitante.getEmpresa() == null) {
            throw new IllegalArgumentException("Tu cuenta no está asociada a una empresa");
        }
        if (!Boolean.TRUE.equals(solicitante.getEmpresa().getActivo())) {
            throw new IllegalArgumentException("Tu empresa está inactiva");
        }
        return solicitante.getEmpresa();
    }

    /* ─────────── Listar ─────────── */

    public List<SupervisorDto> listar(Usuario solicitante) {
        Empresa empresa = empresaDelSolicitante(solicitante);
        return supervisorRepo.findByEmpresaIdOrderByCreatedAtDesc(empresa.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /* ─────────── Crear ─────────── */

    @Transactional
    public SupervisorDto crear(Usuario solicitante, CrearSupervisorRequest req) {
        Empresa empresa = empresaDelSolicitante(solicitante);
        Plan    plan    = empresa.getPlan();

        // Validar límite del plan (null = ilimitado, plan ALERI)
        if (plan != null && plan.getMaxSupervisores() != null) {
            long actuales = supervisorRepo.countByEmpresaIdAndActivoTrue(empresa.getId());
            if (actuales >= plan.getMaxSupervisores()) {
                throw new IllegalArgumentException(
                        "Has alcanzado el límite de supervisores de tu plan ("
                        + plan.getMaxSupervisores() + ")");
            }
        }

        String email = req.getEmail().trim().toLowerCase();
        if (usuarioRepo.existsByEmail(email)) {
            throw new IllegalArgumentException("Ese correo ya está en uso");
        }

        // Crear usuario asociado (login)
        Usuario u = new Usuario();
        u.setNombre(req.getNombre().trim());
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode(req.getPassword()));
        u.setRol(Rol.SUPERVISOR);
        u.setEmpresa(empresa);
        u.setActivo(true);
        usuarioRepo.save(u);

        // Crear el supervisor
        Supervisor s = new Supervisor();
        s.setUsuario(u);
        s.setEmpresa(empresa);
        s.setDni(trimOrNull(req.getDni()));
        s.setTelefono(trimOrNull(req.getTelefono()));
        s.setCargo(trimOrNull(req.getCargo()));
        s.setArea(trimOrNull(req.getArea()));
        s.setActivo(true);
        s.setModulosVisibles(parsearModulos(req.getModulosVisibles()));
        supervisorRepo.save(s);

        return toDto(s);
    }

    /* ─────────── Actualizar ─────────── */

    @Transactional
    public SupervisorDto actualizar(Usuario solicitante, Long supervisorId, ActualizarSupervisorRequest req) {
        Empresa empresa = empresaDelSolicitante(solicitante);

        Supervisor s = supervisorRepo.findById(supervisorId)
                .orElseThrow(() -> new IllegalArgumentException("Supervisor no encontrado"));

        if (!s.getEmpresa().getId().equals(empresa.getId())) {
            throw new IllegalArgumentException("Este supervisor no pertenece a tu empresa");
        }

        Usuario u = s.getUsuario();
        String  email = req.getEmail().trim().toLowerCase();
        if (!email.equals(u.getEmail()) && usuarioRepo.existsByEmail(email)) {
            throw new IllegalArgumentException("Ese correo ya está en uso");
        }

        u.setNombre(req.getNombre().trim());
        u.setEmail(email);
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            u.setPassword(passwordEncoder.encode(req.getPassword()));
        }
        usuarioRepo.save(u);

        s.setDni(trimOrNull(req.getDni()));
        s.setTelefono(trimOrNull(req.getTelefono()));
        s.setCargo(trimOrNull(req.getCargo()));
        s.setArea(trimOrNull(req.getArea()));
        s.setModulosVisibles(parsearModulos(req.getModulosVisibles()));
        supervisorRepo.save(s);

        return toDto(s);
    }

    /* ─────────── Eliminar ─────────── */

    /**
     * Elimina un supervisor: borra sus colaboradores, su registro de supervisor y su usuario.
     * Es irreversible.
     */
    @Transactional
    public void eliminar(Usuario solicitante, Long supervisorId) {
        Empresa empresa = empresaDelSolicitante(solicitante);

        Supervisor s = supervisorRepo.findById(supervisorId)
                .orElseThrow(() -> new IllegalArgumentException("Supervisor no encontrado"));

        if (!s.getEmpresa().getId().equals(empresa.getId())) {
            throw new IllegalArgumentException("Este supervisor no pertenece a tu empresa");
        }

        // Borrar colaboradores asociados a este supervisor
        // (los colaboradores referencian Supervisor por FK, así que hay que limpiarlos)
        colaboradorRepo.findBySupervisorAndActivoTrue(s)
                .forEach(c -> colaboradorRepo.delete(c));

        Usuario u = s.getUsuario();
        supervisorRepo.delete(s);
        if (u != null) usuarioRepo.delete(u);
    }

    /* ─────────── Mapper ─────────── */

    private SupervisorDto toDto(Supervisor s) {
        Usuario u = s.getUsuario();
        Set<String> modulos = s.getModulosVisibles().stream()
                .map(Enum::name)
                .collect(Collectors.toSet());
        return new SupervisorDto(
                s.getId(),
                u != null ? u.getId() : null,
                u != null ? u.getNombre() : "—",
                u != null ? u.getEmail()  : "—",
                s.getDni(),
                s.getTelefono(),
                s.getCargo(),
                s.getArea(),
                s.getActivo(),
                s.getCreatedAt(),
                modulos
        );
    }

    private static String trimOrNull(String v) {
        if (v == null) return null;
        String t = v.trim();
        return t.isEmpty() ? null : t;
    }
}
