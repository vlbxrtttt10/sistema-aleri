package com.aleri.ssoma.config;

import com.aleri.ssoma.entity.*;
import com.aleri.ssoma.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;
import java.time.LocalDate;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private final PlanRepository          planRepo;
    private final EmpresaRepository       empresaRepo;
    private final UsuarioRepository       usuarioRepo;
    private final SupervisorRepository    supervisorRepo;
    private final ColaboradorRepository   colaboradorRepo;
    private final AsignacionEppRepository eppRepo;
    private final PasswordEncoder         passwordEncoder;
    private final DataSource              dataSource;

    public DataInitializer(PlanRepository planRepo, EmpresaRepository empresaRepo,
                           UsuarioRepository usuarioRepo, SupervisorRepository supervisorRepo,
                           ColaboradorRepository colaboradorRepo, AsignacionEppRepository eppRepo,
                           PasswordEncoder passwordEncoder, DataSource dataSource) {
        this.planRepo        = planRepo;
        this.empresaRepo     = empresaRepo;
        this.usuarioRepo     = usuarioRepo;
        this.supervisorRepo  = supervisorRepo;
        this.colaboradorRepo = colaboradorRepo;
        this.eppRepo         = eppRepo;
        this.passwordEncoder = passwordEncoder;
        this.dataSource      = dataSource;
    }

    @Override
    public void run(String... args) throws Exception {

        /* ── Migraciones SQL necesarias ── */
        try (Connection conn = dataSource.getConnection();
             Statement  stmt = conn.createStatement()) {

            // Permitir SUBADMIN en la columna rol
            stmt.execute("ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check");

            // Renombrar plan ELITE → ALERI si existe
            stmt.execute("UPDATE planes SET nombre = 'ALERI' WHERE nombre = 'ELITE'");

            // Migrar tipos de incidente antiguos al nuevo enum
            stmt.execute("ALTER TABLE incidentes DROP CONSTRAINT IF EXISTS incidentes_tipo_check");
            stmt.execute("UPDATE incidentes SET tipo = 'ACCIDENTE_INCAPACITANTE' WHERE tipo = 'ACCIDENTE_GRAVE'");
            stmt.execute("UPDATE incidentes SET tipo = 'ACCIDENTE_MORTAL' WHERE tipo = 'FATALIDAD'");

            System.out.println(">>> Migraciones SQL aplicadas correctamente");
        } catch (Exception e) {
            System.err.println(">>> Error en migraciones SQL: " + e.getMessage());
        }

        /* ── Datos iniciales (solo si la BD está vacía) ── */
        if (planRepo.count() == 0) {
            // Planes (límites: BASICO 3/3, VIP 5/5, ALERI ilimitado)
            Plan basico = new Plan();
            basico.setNombre("BASICO");
            basico.setMaxSupervisores(3);
            basico.setMaxColaboradoresPorSupervisor(3);
            planRepo.save(basico);

            Plan vip = new Plan();
            vip.setNombre("VIP");
            vip.setMaxSupervisores(5);
            vip.setMaxColaboradoresPorSupervisor(5);
            planRepo.save(vip);

            Plan aleri = new Plan();
            aleri.setNombre("ALERI");
            aleri.setMaxSupervisores(null);
            aleri.setMaxColaboradoresPorSupervisor(null);
            planRepo.save(aleri);

            System.out.println(">>> Planes creados: BASICO (3/3), VIP (5/5), ALERI (ilimitado)");

            // Empresa demo
            Empresa empresa = new Empresa();
            empresa.setNombre("Empresa Demo SAC");
            empresa.setRuc("20123456789");
            empresa.setPlan(vip);
            empresaRepo.save(empresa);

            System.out.println(">>> Empresa demo creada: " + empresa.getNombre());

            // Admin global
            if (!usuarioRepo.existsByEmail("admin@aleri.com")) {
                Usuario admin = new Usuario();
                admin.setNombre("Administrador ALERI");
                admin.setEmail("admin@aleri.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRol(Rol.ADMIN);
                usuarioRepo.save(admin);
                System.out.println(">>> ADMIN creado: admin@aleri.com / admin123");
            }

            // Usuario empresa demo
            if (!usuarioRepo.existsByEmail("empresa@demo.com")) {
                Usuario emp = new Usuario();
                emp.setNombre("Demo Empresa");
                emp.setEmail("empresa@demo.com");
                emp.setPassword(passwordEncoder.encode("demo123"));
                emp.setRol(Rol.EMPRESA);
                emp.setEmpresa(empresa);
                usuarioRepo.save(emp);
                System.out.println(">>> EMPRESA creado: empresa@demo.com / demo123");
            }
        }

        /* ── Sincronizar módulos y límites por plan (siempre, idempotente) ── */
        sincronizarPlanes();

        /* ── Seed EPPs de demostración ── */
        if (eppRepo.count() == 0) {
            seedEpps();
        }
    }

    private void seedEpps() {
        List<Empresa> empresas = empresaRepo.findAll();
        if (empresas.isEmpty()) return;

        String[][] datosColabs = {
            {"Juan Mamani",   "12345678", "Operario",        "Producción"},
            {"Carlos Quispe", "23456789", "Técnico",         "Mantenimiento"},
            {"Rosa Flores",   "34567890", "Supervisora",     "Seguridad"},
            {"Luis Paredes",  "45678901", "Electricista",    "Infraestructura"},
            {"Ana Torres",    "56789012", "Almacenera",      "Logística"},
            {"Miguel Salas",  "67890123", "Mecánico",        "Mantenimiento"},
        };

        Object[][] datosEpps = {
            {"Casco de seguridad",     CategoriaEpp.CABEZA,      30},
            {"Guantes de nitrilo",     CategoriaEpp.MANOS,       90},
            {"Botas punta de acero",   CategoriaEpp.PIES,        180},
            {"Lentes de seguridad",    CategoriaEpp.OJOS_CARA,   60},
            {"Protector auditivo",     CategoriaEpp.AUDITIVO,    120},
            {"Chaleco reflectivo",     CategoriaEpp.CUERPO,      365},
            {"Mascarilla N95",         CategoriaEpp.RESPIRATORIO, 7},
            {"Arnés de seguridad",     CategoriaEpp.ALTURA,      365},
            {"Guantes de cuero",       CategoriaEpp.MANOS,       60},
            {"Careta facial",          CategoriaEpp.OJOS_CARA,   90},
        };

        int colabIdx = 0;
        int eppIdx   = 0;

        for (Empresa empresa : empresas) {
            // supervisor para esta empresa
            String supEmail = "supervisor." + empresa.getId() + "@ssoma.com";
            if (!usuarioRepo.existsByEmail(supEmail)) {
                Usuario supUser = new Usuario();
                supUser.setNombre("Supervisor " + empresa.getNombre());
                supUser.setEmail(supEmail);
                supUser.setPassword(passwordEncoder.encode("super123"));
                supUser.setRol(Rol.SUPERVISOR);
                supUser.setEmpresa(empresa);
                supUser = usuarioRepo.save(supUser);

                Supervisor supervisor = new Supervisor();
                supervisor.setUsuario(supUser);
                supervisor.setEmpresa(empresa);
                supervisor.setCargo("Jefe de SSO");
                supervisor.setArea("Seguridad");
                supervisor.setActivo(true);
                supervisor = supervisorRepo.save(supervisor);

                // 1-2 colaboradores por empresa
                for (int c = 0; c < 2 && colabIdx < datosColabs.length; c++, colabIdx++) {
                    String[] dc = datosColabs[colabIdx];
                    if (!colaboradorRepo.existsByDni(dc[1])) {
                        Colaborador colab = new Colaborador();
                        colab.setNombre(dc[0]);
                        colab.setDni(dc[1]);
                        colab.setCargo(dc[2]);
                        colab.setArea(dc[3]);
                        colab.setEmpresa(empresa);
                        colab.setSupervisor(supervisor);
                        colab.setFechaIngreso(LocalDate.now().minusMonths(3));
                        colab.setActivo(true);
                        colab = colaboradorRepo.save(colab);

                        // 2-3 EPPs por colaborador
                        for (int e = 0; e < 3 && eppIdx < datosEpps.length; e++, eppIdx++) {
                            Object[] de = datosEpps[eppIdx];
                            AsignacionEpp epp = new AsignacionEpp();
                            epp.setNombre((String) de[0]);
                            epp.setCategoria((CategoriaEpp) de[1]);
                            epp.setColaborador(colab);
                            epp.setEmpresa(empresa);
                            epp.setFechaEntrega(LocalDate.now().minusDays(10));
                            epp.setFechaVencimiento(LocalDate.now().plusDays((int) de[2]));
                            epp.setActivo(true);
                            eppRepo.save(epp);
                        }
                    }
                }
            }
        }
        System.out.println(">>> Seed EPPs creados correctamente");
    }

    /**
     * Reasigna módulos y límites para cada plan según la configuración fija.
     * Se ejecuta en cada arranque para que cambios en el código se reflejen sin tocar la DB.
     */
    private void sincronizarPlanes() {
        // BÁSICO: Dashboard, Colaboradores, Incidentes · 3 supervisores · 3 col./sup. · 10 EPPs
        Set<Modulo> modulosBasico = EnumSet.of(
                Modulo.DASHBOARD,
                Modulo.COLABORADORES,
                Modulo.INCIDENTES
        );
        aplicarPlan("BASICO", modulosBasico, 3, 3, 10);

        // VIP: BÁSICO + EPPs + Reportes · 5 supervisores · 5 col./sup. · 20 EPPs
        Set<Modulo> modulosVip = EnumSet.of(
                Modulo.DASHBOARD,
                Modulo.COLABORADORES,
                Modulo.INCIDENTES,
                Modulo.EPPS,
                Modulo.REPORTES
        );
        aplicarPlan("VIP", modulosVip, 5, 5, 20);

        // ALERI: todo · ilimitado
        aplicarPlan("ALERI", EnumSet.allOf(Modulo.class), null, null, null);
    }

    private void aplicarPlan(String nombrePlan, Set<Modulo> modulos,
                             Integer maxSupervisores, Integer maxColPorSup, Integer maxEpps) {
        planRepo.findByNombre(nombrePlan).ifPresent(plan -> {
            plan.setModulos(modulos);
            plan.setMaxSupervisores(maxSupervisores);
            plan.setMaxColaboradoresPorSupervisor(maxColPorSup);
            plan.setMaxEpps(maxEpps);
            planRepo.save(plan);
            System.out.println(">>> Plan " + nombrePlan
                    + " → módulos: " + modulos
                    + " · supervisores: " + (maxSupervisores == null ? "∞" : maxSupervisores)
                    + " · col./sup.: " + (maxColPorSup == null ? "∞" : maxColPorSup)
                    + " · EPPs: " + (maxEpps == null ? "∞" : maxEpps));
        });
    }
}
