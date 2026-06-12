package com.aleri.ssoma.repository;

import com.aleri.ssoma.entity.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmpresaRepository extends JpaRepository<Empresa, Long> {
    List<Empresa> findByActivoTrue();
    boolean existsByRuc(String ruc);
}
