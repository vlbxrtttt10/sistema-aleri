package com.aleri.ssoma.repository;

import com.aleri.ssoma.entity.AsignacionEpp;
import com.aleri.ssoma.entity.Colaborador;
import com.aleri.ssoma.entity.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AsignacionEppRepository extends JpaRepository<AsignacionEpp, Long> {
    List<AsignacionEpp> findByColaboradorAndActivoTrue(Colaborador colaborador);
    List<AsignacionEpp> findByEmpresaAndActivoTrue(Empresa empresa);
    long countByEmpresaAndActivoTrue(Empresa empresa);
    long countByEmpresaId(Long empresaId);
    void deleteByEmpresaId(Long empresaId);

    @Query("SELECT a FROM AsignacionEpp a WHERE a.empresa = :empresa " +
           "AND a.activo = true AND a.fechaVencimiento BETWEEN :hoy AND :limite")
    List<AsignacionEpp> findProximosAVencer(
        @Param("empresa") Empresa empresa,
        @Param("hoy") LocalDate hoy,
        @Param("limite") LocalDate limite
    );
}
