# SSOMA SaaS - Sistema de Seguridad y Salud Ocupacional en el Trabajo

Sistema web SaaS multi-tenant para la gestión integral de Seguridad, Salud Ocupacional y Medio Ambiente (SSOMA).  
Permite a múltiples empresas gestionar sus procesos de seguridad bajo un modelo de planes de suscripción con límites controlados.

---

## Stack Tecnologico

| Capa            | Tecnología                        |
|-----------------|-----------------------------------|
| Backend         | Java 17 + Spring Boot 3.x         |
| Frontend        | React 18 + Vite                   |
| Base de datos   | PostgreSQL 15                     |
| Autenticacion   | JWT + Spring Security             |
| Estilos         | Tailwind CSS                      |
| ORM             | Spring Data JPA / Hibernate       |
| Build           | Maven                             |

---

## Jerarquia de Usuarios

```
ADMIN (propietario del SaaS)
  └── EMPRESA  (ej: Fulanito SAC)  ← tiene un plan asignado
        └── SUPERVISOR              ← limitado por el plan
              └── COLABORADOR       ← limitado por el plan
```

- El **Admin** es el unico con acceso total al sistema. Crea y gestiona las empresas, asigna planes y tiene visibilidad global.
- La **Empresa** puede ver su panel, gestionar sus supervisores y consultar el plan activo.
- El **Supervisor** registra y gestiona a sus colaboradores dentro del límite que permite el plan.
- El **Colaborador** es el trabajador final registrado por el supervisor.

---

## Planes de Suscripcion

| Plan    | Supervisores por empresa | Colaboradores por supervisor |
|---------|--------------------------|------------------------------|
| Basico  | 4                        | 4                            |
| VIP     | 20                       | 20                           |
| Aleri   | Ilimitado                | Ilimitado                    |

### Reglas de negocio
- El Admin asigna el plan a cada empresa.
- Si una empresa intenta agregar mas supervisores de los permitidos, el sistema lo bloquea.
- Si un supervisor intenta registrar mas colaboradores de los permitidos, el sistema lo bloquea.
- El sistema mostrara alertas cuando la empresa esté proxima a alcanzar su límite.
- Para superar el límite, la empresa debe solicitar un cambio de plan al Admin.

---

## Modulos del Sistema

### 1. Panel del Admin (solo Admin)
- Crear, editar y desactivar empresas
- Asignar y cambiar planes a empresas
- Ver metricas globales: total de empresas, supervisores, colaboradores, incidentes
- Gestion de planes (configurar límites)

### 2. Autenticacion
- Login unificado para todos los roles
- Sesiones mediante JWT
- Redireccion automatica segun rol al hacer login
- Recuperacion de contraseña

### 3. Dashboard
- KPIs de seguridad por empresa (para Empresa y Supervisor)
- Graficos de incidentes por periodo
- Resumen de EPPs vencidos o proximos a vencer
- Consumo del plan: supervisores y colaboradores registrados vs. límite
- Alertas y notificaciones activas

### 4. Reporte de Incidentes / Accidentes
- Registro de incidentes y accidentes laborales
- Clasificacion: incidente, accidente leve, accidente grave, fatalidad
- Carga de evidencias fotograficas
- Seguimiento del estado: registrado / en investigacion / cerrado
- Generacion de reportes en PDF
- Historial y auditoria

### 5. Gestion de EPPs (Equipos de Proteccion Personal)
- Catalogo de EPPs por tipo y categoria
- Asignacion de EPPs a colaboradores
- Control de fechas de entrega y vencimiento
- Alertas de reposicion automatica
- Historial de entregas por colaborador
- Registro de conformidad

---

## Estructura del Proyecto

```
ssoma-saas/
├── backend/
│   ├── src/main/java/com/ssoma/
│   │   ├── auth/               # Login, JWT, Spring Security
│   │   ├── admin/              # Gestion de empresas y planes (solo Admin)
│   │   ├── planes/             # Configuracion y validacion de planes
│   │   ├── empresas/           # Modulo de empresa/tenant
│   │   ├── supervisores/       # Gestion de supervisores
│   │   ├── colaboradores/      # Gestion de colaboradores
│   │   ├── dashboard/          # KPIs y estadisticas
│   │   ├── incidentes/         # Modulo de incidentes/accidentes
│   │   ├── epps/               # Modulo de EPPs
│   │   └── config/             # CORS, JWT config, seguridad general
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login/
│   │   │   ├── Admin/          # Panel exclusivo del Admin
│   │   │   ├── Dashboard/
│   │   │   ├── Incidentes/
│   │   │   ├── EPPs/
│   │   │   └── Colaboradores/
│   │   ├── components/         # Componentes reutilizables
│   │   ├── services/           # Llamadas a la API (axios)
│   │   ├── context/            # AuthContext, PlanContext
│   │   └── routes/             # Rutas protegidas por rol
│   └── package.json
│
├── database/
│   └── init.sql                # Script inicial de BD
│
└── README.md
```

---

## Base de Datos - Tablas Principales

| Tabla               | Descripcion                                              |
|---------------------|----------------------------------------------------------|
| `planes`            | Configuracion de planes (basico, vip, elite y sus limites) |
| `empresas`          | Empresas registradas, cada una con un plan asignado      |
| `usuarios`          | Todos los usuarios del sistema con su rol                |
| `supervisores`      | Supervisores vinculados a una empresa                    |
| `colaboradores`     | Colaboradores vinculados a un supervisor                 |
| `incidentes`        | Registro de incidentes y accidentes                      |
| `epps`              | Catalogo de equipos de proteccion                        |
| `asignacion_epps`   | Asignaciones de EPPs a colaboradores                     |

### Relaciones clave
```
planes      1 ──< empresas
empresas    1 ──< supervisores
supervisores 1 ──< colaboradores
colaboradores 1 ──< incidentes
colaboradores 1 ──< asignacion_epps
```

---

## Permisos por Rol

| Accion                          | Admin | Empresa | Supervisor | Colaborador |
|---------------------------------|-------|---------|------------|-------------|
| Gestionar empresas              | Si    | -       | -          | -           |
| Asignar planes                  | Si    | -       | -          | -           |
| Ver metricas globales           | Si    | -       | -          | -           |
| Ver dashboard propio            | Si    | Si      | Si         | -           |
| Registrar supervisores          | -     | Si      | -          | -           |
| Registrar colaboradores         | -     | -       | Si         | -           |
| Registrar incidentes            | -     | -       | Si         | Si          |
| Gestionar EPPs                  | -     | Si      | Si         | -           |
| Ver reportes                    | Si    | Si      | Si         | -           |

---

## Endpoints Principales de la API

| Metodo | Endpoint                              | Rol requerido      | Descripcion                        |
|--------|---------------------------------------|--------------------|------------------------------------|
| POST   | `/api/auth/login`                     | Todos              | Inicio de sesion                   |
| GET    | `/api/admin/empresas`                 | Admin              | Listar todas las empresas          |
| POST   | `/api/admin/empresas`                 | Admin              | Crear empresa                      |
| PUT    | `/api/admin/empresas/{id}/plan`       | Admin              | Cambiar plan de una empresa        |
| GET    | `/api/dashboard/resumen`              | Empresa/Supervisor | KPIs del dashboard                 |
| GET    | `/api/supervisores`                   | Empresa            | Listar supervisores de la empresa  |
| POST   | `/api/supervisores`                   | Empresa            | Registrar supervisor               |
| GET    | `/api/colaboradores`                  | Supervisor         | Listar colaboradores del supervisor|
| POST   | `/api/colaboradores`                  | Supervisor         | Registrar colaborador              |
| GET    | `/api/incidentes`                     | Supervisor/Empresa | Listar incidentes                  |
| POST   | `/api/incidentes`                     | Supervisor/Colab.  | Registrar incidente                |
| GET    | `/api/epps`                           | Supervisor/Empresa | Listar EPPs                        |
| POST   | `/api/epps/asignacion`                | Supervisor         | Asignar EPP a colaborador          |

---

## Requisitos Previos

- Java 17+
- Node.js 18+
- PostgreSQL 15+
- Maven 3.8+

---

## Instalacion y Ejecucion

### Base de Datos

```bash
psql -U postgres -c "CREATE DATABASE ssoma_db;"
psql -U postgres -d ssoma_db -f database/init.sql
```

### Backend

```bash
cd backend
# Configurar credenciales en src/main/resources/application.yml
mvn spring-boot:run
```

Disponible en: `http://localhost:8080`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Disponible en: `http://localhost:5173`

---

## Configuracion del Backend (application.yml)

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/ssoma_db
    username: postgres
    password: tu_password
  jpa:
    hibernate:
      ddl-auto: update

app:
  jwt:
    secret: tu_clave_secreta_jwt
    expiration: 86400000  # 24 horas en ms
```

---

## Roadmap

- [ ] Modulo de capacitaciones y evaluaciones
- [ ] Modulo de inspecciones y auditorias
- [ ] Exportacion de reportes a Excel y PDF
- [ ] Notificaciones por correo electronico
- [ ] Facturacion y pagos de planes (Stripe / Culqi)
- [ ] Aplicacion movil (React Native)

---

## Licencia

Este proyecto es de uso privado. Todos los derechos reservados.
