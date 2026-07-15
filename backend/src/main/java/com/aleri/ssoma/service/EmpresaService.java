package com.aleri.ssoma.service;

import com.aleri.ssoma.dto.ColaboradorResumenDto;
import com.aleri.ssoma.dto.CrearEmpresaRequest;
import com.aleri.ssoma.dto.CrearUsuarioEmpresaRequest;
import com.aleri.ssoma.dto.EmpresaContadoresDto;
import com.aleri.ssoma.dto.EmpresaEquipoDto;
import com.aleri.ssoma.dto.EmpresaResumenDto;
import com.aleri.ssoma.dto.PlanDto;
import com.aleri.ssoma.dto.SupervisorDto;
import com.aleri.ssoma.dto.UsuarioResumenDto;
import com.aleri.ssoma.entity.Colaborador;
import com.aleri.ssoma.entity.Empresa;
import com.aleri.ssoma.entity.Plan;
import com.aleri.ssoma.entity.Rol;
import com.aleri.ssoma.entity.Supervisor;
import com.aleri.ssoma.entity.Usuario;
import com.aleri.ssoma.repository.AsignacionEppRepository;
import com.aleri.ssoma.repository.ColaboradorRepository;
import com.aleri.ssoma.repository.EmpresaRepository;
import com.aleri.ssoma.repository.IncidenteRepository;
import com.aleri.ssoma.repository.PlanRepository;
import com.aleri.ssoma.repository.SupervisorRepository;
import com.aleri.ssoma.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmpresaService {

    private final EmpresaRepository       empresaRepo;
    private final PlanRepository          planRepo;
    private final UsuarioRepository       usuarioRepo;
    private final SupervisorRepository    supervisorRepo;
    private final ColaboradorRepository   colaboradorRepo;
    private final IncidenteRepository     incidenteRepo;
    private final AsignacionEppRepository asignacionEppRepo;
    private final PasswordEncoder         passwordEncoder;

    public EmpresaService(EmpresaRepository empresaRepo, PlanRepository planRepo,
                          UsuarioRepository usuarioRepo,
                          SupervisorRepository supervisorRepo,
                          ColaboradorRepository colaboradorRepo,
                          IncidenteRepository incidenteRepo,
                          AsignacionEppRepository asignacionEppRepo,
                          PasswordEncoder passwordEncoder) {
        this.empresaRepo       = empresaRepo;
        this.planRepo          = planRepo;
        this.usuarioRepo       = usuarioRepo;
        this.supervisorRepo    = supervisorRepo;
        this.colaboradorRepo   = colaboradorRepo;
        this.incidenteRepo     = incidenteRepo;
        this.asignacionEppRepo = asignacionEppRepo;
        this.passwordEncoder   = passwordEncoder;
    }

    /* Listar todas las empresas activas */
    public List<EmpresaResumenDto> listar() {
        return empresaRepo.findByActivoTrue()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /* Obtener una empresa por id */
    public EmpresaResumenDto obtener(Long id) {
        Empresa e = empresaRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Empresa no encontrada"));
        return toDto(e);
    }

    /* Listar planes disponibles */
    public List<PlanDto> listarPlanes() {
        return planRepo.findAll()
                .stream()
                .map(p -> new PlanDto(
                        p.getId(),
                        p.getNombre(),
                        p.getMaxSupervisores(),
                        p.getMaxColaboradoresPorSupervisor()
                ))
                .collect(Collectors.toList());
    }

    /* Crear nueva empresa */
    public EmpresaResumenDto crear(CrearEmpresaRequest req) {
        if (empresaRepo.existsByRuc(req.getRuc().trim())) {
            throw new IllegalArgumentException("Ya existe una empresa con ese RUC");
        }

        Plan plan = planRepo.findById(req.getPlanId())
                .orElseThrow(() -> new IllegalArgumentException("Plan no encontrado"));

        Empresa e = new Empresa();
        e.setNombre(req.getNombre().trim());
        e.setRuc(req.getRuc().trim());
        e.setDireccion(req.getDireccion() != null ? req.getDireccion().trim() : null);
        e.setContactoEmail(req.getContactoEmail() != null ? req.getContactoEmail().trim() : null);
        e.setContactoTelefono(req.getContactoTelefono() != null ? req.getContactoTelefono().trim() : null);
        e.setPlan(plan);
        e.setActivo(true);

        empresaRepo.save(e);
        return toDto(e);
    }

    /* Actualizar datos de una empresa existente */
    public EmpresaResumenDto actualizar(Long id, CrearEmpresaRequest req) {
        Empresa e = empresaRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Empresa no encontrada"));

        String nuevoRuc = req.getRuc().trim();
        if (!nuevoRuc.equals(e.getRuc()) && empresaRepo.existsByRuc(nuevoRuc)) {
            throw new IllegalArgumentException("Ya existe otra empresa con ese RUC");
        }

        Plan plan = planRepo.findById(req.getPlanId())
                .orElseThrow(() -> new IllegalArgumentException("Plan no encontrado"));

        e.setNombre(req.getNombre().trim());
        e.setRuc(nuevoRuc);
        e.setDireccion(req.getDireccion() != null ? req.getDireccion().trim() : null);
        e.setContactoEmail(req.getContactoEmail() != null ? req.getContactoEmail().trim() : null);
        e.setContactoTelefono(req.getContactoTelefono() != null ? req.getContactoTelefono().trim() : null);
        e.setPlan(plan);

        empresaRepo.save(e);
        return toDto(e);
    }

    /* Contadores de registros relacionados (para mostrar al admin antes de eliminar) */
    public EmpresaContadoresDto contadores(Long id) {
        empresaRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Empresa no encontrada"));
        return new EmpresaContadoresDto(
                usuarioRepo.countByEmpresaId(id),
                supervisorRepo.countByEmpresaId(id),
                colaboradorRepo.countByEmpresaId(id),
                incidenteRepo.countByEmpresaId(id),
                asignacionEppRepo.countByEmpresaId(id)
        );
    }

    /**
     * Elimina una empresa con borrado en cascada manual: primero hijos, luego la empresa.
     * Orden importa por las foreign keys: AsignacionesEpp → Colaboradores → Incidentes → Supervisores → Usuarios → Empresa.
     */
    @Transactional
    public void eliminar(Long id) {
        Empresa e = empresaRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Empresa no encontrada"));

        // Borrar hijos en orden seguro
        asignacionEppRepo.deleteByEmpresaId(id);
        colaboradorRepo.deleteByEmpresaId(id);
        incidenteRepo.deleteByEmpresaId(id);
        supervisorRepo.deleteByEmpresaId(id);
        usuarioRepo.deleteByEmpresaId(id);

        // Finalmente la empresa
        empresaRepo.delete(e);
    }

    /* ───────── Usuarios EMPRESA (login del dueño de cada empresa) ───────── */

    /**
     * Lista los usuarios de rol EMPRESA asociados a una empresa.
     */
    public List<UsuarioResumenDto> listarUsuarios(Long empresaId) {
        empresaRepo.findById(empresaId)
                .orElseThrow(() -> new IllegalArgumentException("Empresa no encontrada"));
        return usuarioRepo
                .findByEmpresaIdAndRolInOrderByCreatedAtDesc(empresaId, List.of(Rol.EMPRESA))
                .stream()
                .map(this::toUsuarioDto)
                .collect(Collectors.toList());
    }

    /**
     * Crea un usuario rol EMPRESA para esa empresa.
     * Regla: solo se permite 1 usuario EMPRESA por empresa (el dueño).
     */
    public UsuarioResumenDto crearUsuarioEmpresa(Long empresaId, CrearUsuarioEmpresaRequest req) {
        Empresa empresa = empresaRepo.findById(empresaId)
                .orElseThrow(() -> new IllegalArgumentException("Empresa no encontrada"));

        if (!Boolean.TRUE.equals(empresa.getActivo())) {
            throw new IllegalArgumentException("La empresa está inactiva");
        }

        long actuales = usuarioRepo.countByEmpresaIdAndRol(empresaId, Rol.EMPRESA);
        if (actuales >= 1) {
            throw new IllegalArgumentException(
                    "Esta empresa ya tiene un usuario administrador. Resetea su contraseña si la olvidó.");
        }

        String email = req.getEmail().trim().toLowerCase();
        if (usuarioRepo.existsByEmail(email)) {
            throw new IllegalArgumentException("Ese correo ya está en uso");
        }

        Usuario u = new Usuario();
        u.setNombre(req.getNombre().trim());
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode(req.getPassword()));
        u.setRol(Rol.EMPRESA);
        u.setEmpresa(empresa);
        u.setActivo(true);
        usuarioRepo.save(u);

        return toUsuarioDto(u);
    }

    /**
     * Resetea la contraseña de un usuario EMPRESA.
     * Solo aplica a usuarios de rol EMPRESA — no permite cambiar contraseñas de ADMIN/SUBADMIN ni otros.
     */
    public UsuarioResumenDto resetPasswordUsuarioEmpresa(Long usuarioId, String nuevaPassword) {
        if (nuevaPassword == null || nuevaPassword.length() < 6) {
            throw new IllegalArgumentException("La contraseña debe tener al menos 6 caracteres");
        }
        Usuario u = usuarioRepo.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        if (u.getRol() != Rol.EMPRESA) {
            throw new IllegalArgumentException("Solo se puede resetear contraseña de usuarios EMPRESA");
        }

        u.setPassword(passwordEncoder.encode(nuevaPassword));
        usuarioRepo.save(u);
        return toUsuarioDto(u);
    }

    /**
     * Activa / desactiva un usuario EMPRESA.
     */
    public UsuarioResumenDto toggleUsuarioEmpresa(Long usuarioId) {
        Usuario u = usuarioRepo.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        if (u.getRol() != Rol.EMPRESA) {
            throw new IllegalArgumentException("Solo se puede modificar usuarios EMPRESA");
        }
        u.setActivo(!u.getActivo());
        usuarioRepo.save(u);
        return toUsuarioDto(u);
    }

    /* Supervisores + colaboradores activos de una empresa (para el admin) */
    public EmpresaEquipoDto equipo(Long empresaId) {
        Empresa empresa = empresaRepo.findById(empresaId)
                .orElseThrow(() -> new IllegalArgumentException("Empresa no encontrada"));

        List<SupervisorDto> supervisores = supervisorRepo
                .findByEmpresaIdOrderByCreatedAtDesc(empresaId)
                .stream()
                .map(this::toSupervisorDto)
                .collect(Collectors.toList());

        List<ColaboradorResumenDto> colaboradores = colaboradorRepo
                .findByEmpresaAndActivoTrue(empresa)
                .stream()
                .map(this::toColaboradorDto)
                .collect(Collectors.toList());

        return new EmpresaEquipoDto(supervisores, colaboradores);
    }

    private SupervisorDto toSupervisorDto(Supervisor s) {
        Usuario u = s.getUsuario();
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
                s.getCreatedAt()
        );
    }

    private ColaboradorResumenDto toColaboradorDto(Colaborador c) {
        Supervisor s = c.getSupervisor();
        return new ColaboradorResumenDto(
                c.getId(),
                c.getNombre(),
                c.getDni(),
                c.getCargo(),
                c.getArea(),
                c.getFechaIngreso(),
                c.getActivo(),
                c.getCreatedAt(),
                s != null ? s.getId() : null,
                s != null && s.getUsuario() != null ? s.getUsuario().getNombre() : "—"
        );
    }

    private UsuarioResumenDto toUsuarioDto(Usuario u) {
        return new UsuarioResumenDto(
                u.getId(),
                u.getNombre(),
                u.getEmail(),
                u.getRol().name(),
                u.getActivo(),
                u.getCreatedAt()
        );
    }

    private EmpresaResumenDto toDto(Empresa e) {
        Plan plan = e.getPlan();
        return new EmpresaResumenDto(
                e.getId(),
                e.getNombre(),
                e.getRuc(),
                e.getDireccion(),
                e.getContactoEmail(),
                e.getContactoTelefono(),
                plan.getId(),
                plan.getNombre(),
                plan.getMaxSupervisores(),
                plan.getMaxColaboradoresPorSupervisor(),
                e.getActivo(),
                e.getCreatedAt()
        );
    }
}
