package com.aleri.ssoma.repository;

import com.aleri.ssoma.entity.Epp;
import com.aleri.ssoma.entity.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EppRepository extends JpaRepository<Epp, Long> {
    List<Epp> findByEmpresaAndActivoTrue(Empresa empresa);
    long countByEmpresaAndActivoTrue(Empresa empresa);
    long countByEmpresaId(Long empresaId);
    void deleteByEmpresaId(Long empresaId);

    @Query("SELECT COALESCE(SUM(e.stockTotal), 0) FROM Epp e WHERE e.empresa = :empresa AND e.activo = true")
    long sumStockTotalByEmpresa(@Param("empresa") Empresa empresa);

    @Query("SELECT COALESCE(SUM(e.stockDisponible), 0) FROM Epp e WHERE e.empresa = :empresa AND e.activo = true")
    long sumStockDisponibleByEmpresa(@Param("empresa") Empresa empresa);

    @Query("SELECT COALESCE(SUM(e.stockTotal), 0) FROM Epp e WHERE e.activo = true")
    long sumStockTotalGlobal();
}
