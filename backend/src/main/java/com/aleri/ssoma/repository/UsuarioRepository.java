package com.aleri.ssoma.repository;

import com.aleri.ssoma.entity.Rol;
import com.aleri.ssoma.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    boolean existsByEmail(String email);
    List<Usuario> findByRolInOrderByCreatedAtDesc(List<Rol> roles);

    /* Usuarios de una empresa por rol(es), más recientes primero */
    List<Usuario> findByEmpresaIdAndRolInOrderByCreatedAtDesc(Long empresaId, List<Rol> roles);
    long countByEmpresaIdAndRol(Long empresaId, Rol rol);

    long countByEmpresaId(Long empresaId);
    void deleteByEmpresaId(Long empresaId);
}
