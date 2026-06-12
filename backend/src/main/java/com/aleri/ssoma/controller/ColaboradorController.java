package com.aleri.ssoma.controller;

import com.aleri.ssoma.entity.Colaborador;
import com.aleri.ssoma.entity.Supervisor;
import com.aleri.ssoma.entity.Usuario;
import com.aleri.ssoma.repository.ColaboradorRepository;
import com.aleri.ssoma.repository.SupervisorRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/colaboradores")
@PreAuthorize("hasAnyRole('EMPRESA','SUPERVISOR')")
public class ColaboradorController {

    private final ColaboradorRepository colaboradorRepo;
    private final SupervisorRepository  supervisorRepo;

    public ColaboradorController(ColaboradorRepository colaboradorRepo,
                                 SupervisorRepository supervisorRepo) {
        this.colaboradorRepo = colaboradorRepo;
        this.supervisorRepo  = supervisorRepo;
    }

    @GetMapping
    public ResponseEntity<List<Colaborador>> listar(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(colaboradorRepo.findByEmpresaAndActivoTrue(usuario.getEmpresa()));
    }

    @GetMapping("/supervisores")
    public ResponseEntity<List<Supervisor>> supervisores(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(supervisorRepo.findByEmpresaAndActivoTrue(usuario.getEmpresa()));
    }

    @PostMapping
    public ResponseEntity<?> crear(@AuthenticationPrincipal Usuario usuario,
                                   @Valid @RequestBody ColaboradorRequest req) {
        if (colaboradorRepo.existsByDni(req.dni)) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "Ya existe un colaborador con ese DNI"));
        }

        Supervisor supervisor = supervisorRepo.findById(req.supervisorId).orElse(null);
        if (supervisor == null || !supervisor.getEmpresa().getId().equals(usuario.getEmpresa().getId())) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "Supervisor no válido"));
        }

        Colaborador c = new Colaborador();
        c.setNombre(req.nombre);
        c.setDni(req.dni);
        c.setCargo(req.cargo);
        c.setArea(req.area);
        c.setFechaIngreso(req.fechaIngreso != null ? LocalDate.parse(req.fechaIngreso) : LocalDate.now());
        c.setSupervisor(supervisor);
        c.setEmpresa(usuario.getEmpresa());
        c.setActivo(true);

        return ResponseEntity.ok(colaboradorRepo.save(c));
    }

    record ColaboradorRequest(
        @NotBlank String nombre,
        @NotBlank @Size(min = 8, max = 20) String dni,
        String cargo,
        String area,
        String fechaIngreso,
        Long supervisorId
    ) {}
}
