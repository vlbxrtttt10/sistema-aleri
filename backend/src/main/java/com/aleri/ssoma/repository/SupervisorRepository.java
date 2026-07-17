package com.aleri.ssoma.repository;

import com.aleri.ssoma.entity.Empresa;
import com.aleri.ssoma.entity.Supervisor;
import com.aleri.ssoma.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SupervisorRepository extends JpaRepository<Supervisor, Long> {
    List<Supervisor> findByEmpresaAndActivoTrue(Empresa empresa);
    List<Supervisor> findByEmpresaIdOrderByCreatedAtDesc(Long empresaId);
    long countByEmpresaAndActivoTrue(Empresa empresa);
    long countByEmpresaId(Long empresaId);
    long countByEmpresaIdAndActivoTrue(Long empresaId);
    void deleteByEmpresaId(Long empresaId);
    long countByActivoTrue();
    Optional<Supervisor> findByUsuario(Usuario usuario);
}
