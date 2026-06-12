package com.aleri.ssoma.repository;

import com.aleri.ssoma.entity.ReporteAnalisis;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ReporteAnalisisRepository extends JpaRepository<ReporteAnalisis, Long> {
    Optional<ReporteAnalisis> findTopByIncidenteIdOrderByCreatedAtDesc(Long incidenteId);
    List<ReporteAnalisis> findByIncidenteEmpresaIdOrderByCreatedAtDesc(Long empresaId);
}
