import 'package:flutter/material.dart';
import '../models/usuario_model.dart';
import '../models/incidente_model.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import 'login_screen.dart';
import 'reporte_screen.dart';

class HomeScreen extends StatefulWidget {
  final UsuarioModel usuario;
  const HomeScreen({super.key, required this.usuario});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _api = ApiService();
  List<IncidenteResumen> _incidentes = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _cargarIncidentes();
  }

  Future<void> _cargarIncidentes() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final lista = await _api.getIncidentes();
      setState(() => _incidentes = lista);
    } catch (e) {
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _logout() async {
    await _api.logout();
    if (!mounted) return;
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
    );
  }

  Future<void> _irAReporte() async {
    final creado = await Navigator.of(context).push<bool>(
      MaterialPageRoute(builder: (_) => ReporteScreen(usuario: widget.usuario)),
    );
    if (creado == true) _cargarIncidentes();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ALERI SSOMA'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_outlined),
            onPressed: _cargarIncidentes,
            tooltip: 'Actualizar',
          ),
          IconButton(
            icon: const Icon(Icons.logout_outlined),
            onPressed: _logout,
            tooltip: 'Cerrar sesión',
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _irAReporte,
        backgroundColor: AppColors.accent,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_circle_outline),
        label: const Text('Nuevo Reporte', style: TextStyle(fontWeight: FontWeight.w600)),
      ),
      body: RefreshIndicator(
        onRefresh: _cargarIncidentes,
        color: AppColors.primary,
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(child: _buildHeader()),
            SliverToBoxAdapter(child: _buildStats()),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                child: Row(
                  children: [
                    const Text(
                      'Mis Reportes',
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textDark,
                      ),
                    ),
                    const Spacer(),
                    Text(
                      '${_incidentes.length} registros',
                      style: const TextStyle(fontSize: 13, color: AppColors.textMuted),
                    ),
                  ],
                ),
              ),
            ),
            _buildListaIncidentes(),
            const SliverToBoxAdapter(child: SizedBox(height: 100)),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 16),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.primary, AppColors.secondary],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                backgroundColor: Colors.white.withValues(alpha: 0.25),
                child: Text(
                  widget.usuario.nombre.isNotEmpty
                      ? widget.usuario.nombre[0].toUpperCase()
                      : 'S',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    fontSize: 18,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Bienvenido,',
                      style: TextStyle(color: Colors.white70, fontSize: 13),
                    ),
                    Text(
                      widget.usuario.nombre,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 17,
                        fontWeight: FontWeight.w700,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
          if (widget.usuario.empresaNombre != null) ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.business_outlined, color: Colors.white70, size: 14),
                  const SizedBox(width: 6),
                  Text(
                    widget.usuario.empresaNombre!,
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildStats() {
    if (_loading) {
      return const Padding(
        padding: EdgeInsets.all(32),
        child: Center(child: CircularProgressIndicator(color: AppColors.primary)),
      );
    }

    final total = _incidentes.length;
    final abiertos = _incidentes.where((i) => i.estado != 'CERRADO').length;
    final accidentes = _incidentes
        .where((i) => i.tipo.startsWith('ACCIDENTE'))
        .length;

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Row(
        children: [
          _statCard('Total', total.toString(), Icons.list_alt_outlined, AppColors.info),
          const SizedBox(width: 12),
          _statCard('Abiertos', abiertos.toString(), Icons.pending_outlined, AppColors.warning),
          const SizedBox(width: 12),
          _statCard('Accidentes', accidentes.toString(), Icons.warning_amber_rounded, AppColors.error),
        ],
      ),
    );
  }

  Widget _statCard(String label, String value, IconData icon, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 22),
            const SizedBox(height: 6),
            Text(
              value,
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: color,
              ),
            ),
            Text(
              label,
              style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildListaIncidentes() {
    if (_loading) return const SliverToBoxAdapter(child: SizedBox.shrink());

    if (_error != null) {
      return SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Center(
            child: Column(
              children: [
                const Icon(Icons.cloud_off_outlined, size: 48, color: AppColors.textMuted),
                const SizedBox(height: 12),
                Text(_error!, textAlign: TextAlign.center,
                    style: const TextStyle(color: AppColors.textMuted)),
                const SizedBox(height: 12),
                TextButton(onPressed: _cargarIncidentes, child: const Text('Reintentar')),
              ],
            ),
          ),
        ),
      );
    }

    if (_incidentes.isEmpty) {
      return SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.all(40),
          child: Center(
            child: Column(
              children: [
                Icon(Icons.inbox_outlined, size: 56, color: AppColors.textMuted.withValues(alpha: 0.5)),
                const SizedBox(height: 12),
                const Text(
                  'Sin reportes aún',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textMuted,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Usa el botón + para registrar\nun incidente o accidente.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 13, color: AppColors.textMuted),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      sliver: SliverList(
        delegate: SliverChildBuilderDelegate(
          (context, index) => _IncidenteCard(incidente: _incidentes[index]),
          childCount: _incidentes.length,
        ),
      ),
    );
  }
}

class _IncidenteCard extends StatelessWidget {
  final IncidenteResumen incidente;
  const _IncidenteCard({required this.incidente});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: _tipoColor(incidente.tipo).withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(_tipoIcon(incidente.tipo), color: _tipoColor(incidente.tipo), size: 22),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          incidente.codigo,
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 14,
                            color: AppColors.textDark,
                          ),
                        ),
                      ),
                      _EstadoBadge(estado: incidente.estado),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _tipoLabel(incidente.tipo),
                    style: TextStyle(
                      fontSize: 12,
                      color: _tipoColor(incidente.tipo),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      const Icon(Icons.calendar_today_outlined, size: 11, color: AppColors.textMuted),
                      const SizedBox(width: 4),
                      Text(
                        incidente.fechaOcurrencia,
                        style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                      ),
                      if (incidente.area != null) ...[
                        const Text(' · ', style: TextStyle(color: AppColors.textMuted)),
                        Expanded(
                          child: Text(
                            incidente.area!,
                            style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _tipoColor(String tipo) {
    switch (tipo) {
      case 'ACCIDENTE_MORTAL': return AppColors.error;
      case 'ACCIDENTE_INCAPACITANTE': return const Color(0xFFDC2626);
      case 'ACCIDENTE_LEVE': return AppColors.warning;
      default: return AppColors.info;
    }
  }

  IconData _tipoIcon(String tipo) {
    switch (tipo) {
      case 'ACCIDENTE_MORTAL':
      case 'ACCIDENTE_INCAPACITANTE': return Icons.warning_rounded;
      case 'ACCIDENTE_LEVE': return Icons.warning_amber_rounded;
      default: return Icons.info_outline_rounded;
    }
  }

  String _tipoLabel(String tipo) {
    switch (tipo) {
      case 'ACCIDENTE_MORTAL': return 'Accidente Mortal';
      case 'ACCIDENTE_INCAPACITANTE': return 'Accidente Incapacitante';
      case 'ACCIDENTE_LEVE': return 'Accidente Leve';
      default: return 'Incidente';
    }
  }
}

class _EstadoBadge extends StatelessWidget {
  final String estado;
  const _EstadoBadge({required this.estado});

  @override
  Widget build(BuildContext context) {
    Color color;
    String label;
    switch (estado) {
      case 'EN_INVESTIGACION':
        color = AppColors.warning;
        label = 'En investigación';
        break;
      case 'CERRADO':
        color = AppColors.textMuted;
        label = 'Cerrado';
        break;
      default:
        color = AppColors.success;
        label = 'Registrado';
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: TextStyle(fontSize: 10, color: color, fontWeight: FontWeight.w700),
      ),
    );
  }
}
