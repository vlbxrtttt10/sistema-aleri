package com.aleri.ssoma.repository;

import com.aleri.ssoma.entity.Empresa;
import com.aleri.ssoma.entity.EstadoIncidente;
import com.aleri.ssoma.entity.Incidente;
import com.aleri.ssoma.entity.TipoIncidente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface IncidenteRepository extends JpaRepository<Incidente, Long> {
    List<Incidente> findByEmpresaOrderByCreatedAtDesc(Empresa empresa);
    List<Incidente> findTop5ByEmpresaOrderByCreatedAtDesc(Empresa empresa);
    long countByEmpresaAndEstado(Empresa empresa, EstadoIncidente estado);
    long countByEmpresaAndTipo(Empresa empresa, TipoIncidente tipo);
    long countByEstado(EstadoIncidente estado);

    @Query("SELECT COUNT(i) FROM Incidente i WHERE i.empresa = :empresa " +
           "AND i.fechaOcurrencia BETWEEN :inicio AND :fin")
    long countByEmpresaAndFechaOcurrenciaBetween(
        @Param("empresa") Empresa empresa,
        @Param("inicio") LocalDate inicio,
        @Param("fin") LocalDate fin
    );

    boolean existsByCodigo(String codigo);

    long countByEmpresaId(Long empresaId);
    void deleteByEmpresaId(Long empresaId);
    long countByTipo(TipoIncidente tipo);

    @Query("SELECT COUNT(i) FROM Incidente i WHERE i.fechaOcurrencia BETWEEN :inicio AND :fin")
    long countByFechaOcurrenciaBetween(@Param("inicio") LocalDate inicio, @Param("fin") LocalDate fin);

    /* Para autogenerar el código secuencial por año (INC-2026-001) */
    @Query("SELECT COUNT(i) FROM Incidente i WHERE i.empresa = :empresa AND i.codigo LIKE :prefijo")
    long countByEmpresaAndCodigoPrefijo(@Param("empresa") Empresa empresa,
                                        @Param("prefijo") String prefijo);
}
