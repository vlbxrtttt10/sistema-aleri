package com.aleri.ssoma.repository;

import com.aleri.ssoma.entity.Colaborador;
import com.aleri.ssoma.entity.Empresa;
import com.aleri.ssoma.entity.Supervisor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ColaboradorRepository extends JpaRepository<Colaborador, Long> {
    List<Colaborador> findBySupervisorAndActivoTrue(Supervisor supervisor);
    List<Colaborador> findByEmpresaAndActivoTrue(Empresa empresa);
    long countBySupervisorAndActivoTrue(Supervisor supervisor);
    long countByEmpresaAndActivoTrue(Empresa empresa);
    long countByEmpresaId(Long empresaId);
    void deleteByEmpresaId(Long empresaId);
    boolean existsByDni(String dni);
}
