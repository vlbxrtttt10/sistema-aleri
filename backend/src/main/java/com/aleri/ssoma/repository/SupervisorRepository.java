package com.aleri.ssoma.repository;

import com.aleri.ssoma.entity.Empresa;
import com.aleri.ssoma.entity.Supervisor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SupervisorRepository extends JpaRepository<Supervisor, Long> {
    List<Supervisor> findByEmpresaAndActivoTrue(Empresa empresa);
    List<Supervisor> findByEmpresaIdOrderByCreatedAtDesc(Long empresaId);
    long countByEmpresaAndActivoTrue(Empresa empresa);
    long countByEmpresaId(Long empresaId);
    long countByEmpresaIdAndActivoTrue(Long empresaId);
    void deleteByEmpresaId(Long empresaId);
}
