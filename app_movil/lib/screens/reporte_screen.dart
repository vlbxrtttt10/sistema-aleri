import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import '../models/usuario_model.dart';
import '../models/colaborador_model.dart';
import '../models/incidente_model.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import '../widgets/section_card.dart';
import '../widgets/campo_dropdown.dart';

class ReporteScreen extends StatefulWidget {
  final UsuarioModel usuario;
  const ReporteScreen({super.key, required this.usuario});

  @override
  State<ReporteScreen> createState() => _ReporteScreenState();
}

class _ReporteScreenState extends State<ReporteScreen> {
  final _formKey = GlobalKey<FormState>();
  final _api = ApiService();
  final _picker = ImagePicker();

  // ─── Estado ───────────────────────────────────────────────────────────────
  bool _loadingColaboradores = true;
  bool _enviando = false;
  List<ColaboradorModel> _colaboradores = [];
  ColaboradorModel? _colaboradorSeleccionado;
  final List<File> _fotos = [];

  // ─── Sección 1: Identificación ────────────────────────────────────────────
  String _tipo = 'INCIDENTE';
  DateTime _fechaOcurrencia = DateTime.now();
  TimeOfDay _horaOcurrencia = TimeOfDay.now();
  final _areaCtrl = TextEditingController();
  final _ubicacionCtrl = TextEditingController();

  // ─── Sección 2: Implicado ─────────────────────────────────────────────────
  final _nombreCtrl = TextEditingController();
  final _dniCtrl = TextEditingController();
  final _puestoCtrl = TextEditingController();
  final _areaImplicadoCtrl = TextEditingController();
  String _vinculacion = 'PLANILLA';
  String _turno = 'MANANA';
  final _antiguedadCtrl = TextEditingController(text: '0');

  // ─── Sección 3: Descripción ───────────────────────────────────────────────
  final _descripcionCtrl = TextEditingController();
  final _tareaCtrl = TextEditingController();
  bool _tareaRutinaria = true;
  final _agenteCtrl = TextEditingController();
  final _parteCtrl = TextEditingController();
  final _naturalezaCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _cargarColaboradores();
  }

  @override
  void dispose() {
    for (final ctrl in [
      _areaCtrl, _ubicacionCtrl, _nombreCtrl, _dniCtrl, _puestoCtrl,
      _areaImplicadoCtrl, _antiguedadCtrl, _descripcionCtrl, _tareaCtrl,
      _agenteCtrl, _parteCtrl, _naturalezaCtrl,
    ]) {
      ctrl.dispose();
    }
    super.dispose();
  }

  Future<void> _cargarColaboradores() async {
    try {
      final lista = await _api.getColaboradores();
      setState(() => _colaboradores = lista);
    } catch (_) {
      // Si falla, el supervisor puede igualmente ingresar datos manual
    } finally {
      if (mounted) setState(() => _loadingColaboradores = false);
    }
  }

  void _onColaboradorSeleccionado(ColaboradorModel? col) {
    setState(() {
      _colaboradorSeleccionado = col;
      if (col != null) {
        _nombreCtrl.text = col.nombre;
        _dniCtrl.text = col.dni;
        _puestoCtrl.text = col.cargo;
        _areaImplicadoCtrl.text = col.area;
      }
    });
  }

  Future<void> _seleccionarFecha() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _fechaOcurrencia,
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(
          colorScheme: const ColorScheme.light(primary: AppColors.primary),
        ),
        child: child!,
      ),
    );
    if (picked != null) setState(() => _fechaOcurrencia = picked);
  }

  Future<void> _seleccionarHora() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _horaOcurrencia,
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(
          colorScheme: const ColorScheme.light(primary: AppColors.primary),
        ),
        child: child!,
      ),
    );
    if (picked != null) setState(() => _horaOcurrencia = picked);
  }

  Future<void> _agregarFoto(ImageSource source) async {
    final xfile = await _picker.pickImage(
      source: source,
      imageQuality: 70,
      maxWidth: 1280,
    );
    if (xfile != null) setState(() => _fotos.add(File(xfile.path)));
  }

  Future<void> _enviar() async {
    if (!_formKey.currentState!.validate()) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Por favor completa todos los campos obligatorios.'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    setState(() => _enviando = true);

    try {
      final fotosBase64 = await Future.wait(
        _fotos.map((f) => _api.fotoToBase64(f)),
      );

      final fecha = DateFormat('yyyy-MM-dd').format(_fechaOcurrencia);
      final hora =
          '${_horaOcurrencia.hour.toString().padLeft(2, '0')}:${_horaOcurrencia.minute.toString().padLeft(2, '0')}:00';

      final req = NuevoIncidenteRequest(
        tipo: _tipo,
        fechaOcurrencia: fecha,
        horaOcurrencia: hora,
        area: _areaCtrl.text.trim(),
        ubicacionDetalle: _ubicacionCtrl.text.trim(),
        descripcion: _descripcionCtrl.text.trim(),
        tareaRealizada: _tareaCtrl.text.trim(),
        tareaRutinaria: _tareaRutinaria,
        colaboradorId: _colaboradorSeleccionado?.id,
        implicadoNombre: _nombreCtrl.text.trim(),
        implicadoDni: _dniCtrl.text.trim(),
        implicadoPuesto: _puestoCtrl.text.trim(),
        implicadoArea: _areaImplicadoCtrl.text.trim(),
        implicadoVinculacion: _vinculacion,
        implicadoTurno: _turno,
        implicadoAntiguedadMeses: int.tryParse(_antiguedadCtrl.text) ?? 0,
        agenteCausante: _agenteCtrl.text.trim().isEmpty ? null : _agenteCtrl.text.trim(),
        parteCuerpoAfectada: _parteCtrl.text.trim().isEmpty ? null : _parteCtrl.text.trim(),
        naturalezaLesion: _naturalezaCtrl.text.trim().isEmpty ? null : _naturalezaCtrl.text.trim(),
        fotos: fotosBase64,
      );

      await _api.crearIncidente(req);

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Reporte creado exitosamente.'),
          backgroundColor: AppColors.success,
        ),
      );
      Navigator.of(context).pop(true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString().replaceFirst('Exception: ', '')),
          backgroundColor: AppColors.error,
        ),
      );
    } finally {
      if (mounted) setState(() => _enviando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Nuevo Reporte'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
          children: [
            _buildTipoSelector(),
            const SizedBox(height: 16),
            _seccion1Identificacion(),
            const SizedBox(height: 16),
            _seccion2Implicado(),
            const SizedBox(height: 16),
            _seccion3Descripcion(),
            const SizedBox(height: 16),
            _seccionFotos(),
            const SizedBox(height: 24),
            _buildBotonEnviar(),
          ],
        ),
      ),
    );
  }

  // ─── Selector de Tipo ─────────────────────────────────────────────────────

  Widget _buildTipoSelector() {
    final tipos = [
      ('INCIDENTE', 'Incidente', AppColors.info, Icons.info_outline_rounded),
      ('ACCIDENTE_LEVE', 'Accidente Leve', AppColors.warning, Icons.warning_amber_rounded),
      ('ACCIDENTE_INCAPACITANTE', 'Incapacitante', AppColors.error, Icons.warning_rounded),
      ('ACCIDENTE_MORTAL', 'Mortal', const Color(0xFF7C3AED), Icons.dangerous_outlined),
    ];

    return SectionCard(
      titulo: '¿Qué vas a reportar?',
      icono: Icons.category_outlined,
      child: GridView.count(
        crossAxisCount: 2,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        childAspectRatio: 2.6,
        children: tipos.map((t) {
          final seleccionado = _tipo == t.$1;
          return GestureDetector(
            onTap: () => setState(() => _tipo = t.$1),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              decoration: BoxDecoration(
                color: seleccionado ? t.$3.withValues(alpha: 0.12) : Colors.grey.shade100,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: seleccionado ? t.$3 : Colors.transparent,
                  width: 2,
                ),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              child: Row(
                children: [
                  Icon(t.$4, color: seleccionado ? t.$3 : AppColors.textMuted, size: 18),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      t.$2,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: seleccionado ? FontWeight.w700 : FontWeight.w500,
                        color: seleccionado ? t.$3 : AppColors.textMuted,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  // ─── Sección 1 ────────────────────────────────────────────────────────────

  Widget _seccion1Identificacion() {
    return SectionCard(
      titulo: 'Identificación',
      icono: Icons.location_on_outlined,
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: _DateField(
                  label: 'Fecha',
                  value: DateFormat('dd/MM/yyyy').format(_fechaOcurrencia),
                  onTap: _seleccionarFecha,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _DateField(
                  label: 'Hora',
                  value: _horaOcurrencia.format(context),
                  onTap: _seleccionarHora,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          TextFormField(
            controller: _areaCtrl,
            decoration: const InputDecoration(
              labelText: 'Área / Planta *',
              prefixIcon: Icon(Icons.factory_outlined),
            ),
            validator: (v) => (v == null || v.trim().isEmpty) ? 'Campo requerido' : null,
          ),
          const SizedBox(height: 14),
          TextFormField(
            controller: _ubicacionCtrl,
            decoration: const InputDecoration(
              labelText: 'Ubicación detallada *',
              prefixIcon: Icon(Icons.pin_drop_outlined),
              hintText: 'Ej: Piso 2, almacén norte',
            ),
            maxLines: 2,
            validator: (v) => (v == null || v.trim().isEmpty) ? 'Campo requerido' : null,
          ),
        ],
      ),
    );
  }

  // ─── Sección 2 ────────────────────────────────────────────────────────────

  Widget _seccion2Implicado() {
    return SectionCard(
      titulo: 'Persona Implicada',
      icono: Icons.person_outline,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (_loadingColaboradores)
            const Center(child: CircularProgressIndicator(color: AppColors.primary))
          else if (_colaboradores.isNotEmpty) ...[
            const Text(
              'Buscar colaborador registrado',
              style: TextStyle(fontSize: 13, color: AppColors.textMuted),
            ),
            const SizedBox(height: 8),
            DropdownButtonFormField<ColaboradorModel>(
              initialValue: _colaboradorSeleccionado,
              isExpanded: true,
              decoration: const InputDecoration(
                labelText: 'Colaborador (opcional)',
                prefixIcon: Icon(Icons.search),
              ),
              items: [
                const DropdownMenuItem(value: null, child: Text('— Ingreso manual —')),
                ..._colaboradores.map(
                  (c) => DropdownMenuItem(value: c, child: Text(c.displayName, overflow: TextOverflow.ellipsis)),
                ),
              ],
              onChanged: _onColaboradorSeleccionado,
            ),
            const SizedBox(height: 14),
            const Divider(),
            const SizedBox(height: 8),
          ],
          TextFormField(
            controller: _nombreCtrl,
            decoration: const InputDecoration(
              labelText: 'Nombre completo *',
              prefixIcon: Icon(Icons.badge_outlined),
            ),
            validator: (v) => (v == null || v.trim().isEmpty) ? 'Campo requerido' : null,
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: _dniCtrl,
                  keyboardType: TextInputType.number,
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                  decoration: const InputDecoration(labelText: 'DNI *', prefixIcon: Icon(Icons.fingerprint)),
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Requerido' : null,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextFormField(
                  controller: _antiguedadCtrl,
                  keyboardType: TextInputType.number,
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                  decoration: const InputDecoration(labelText: 'Antigüedad (meses)', prefixIcon: Icon(Icons.timelapse)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          TextFormField(
            controller: _puestoCtrl,
            decoration: const InputDecoration(
              labelText: 'Puesto / Cargo *',
              prefixIcon: Icon(Icons.work_outline),
            ),
            validator: (v) => (v == null || v.trim().isEmpty) ? 'Campo requerido' : null,
          ),
          const SizedBox(height: 14),
          TextFormField(
            controller: _areaImplicadoCtrl,
            decoration: const InputDecoration(
              labelText: 'Área del implicado *',
              prefixIcon: Icon(Icons.domain_outlined),
            ),
            validator: (v) => (v == null || v.trim().isEmpty) ? 'Campo requerido' : null,
          ),
          const SizedBox(height: 14),
          CampoDropdown(
            label: 'Vinculación',
            value: _vinculacion,
            items: const {
              'PLANILLA': 'Planilla',
              'CONTRATISTA': 'Contratista',
              'VISITANTE': 'Visitante',
            },
            onChanged: (v) => setState(() => _vinculacion = v!),
          ),
          const SizedBox(height: 14),
          CampoDropdown(
            label: 'Turno',
            value: _turno,
            items: const {
              'MANANA': 'Mañana',
              'TARDE': 'Tarde',
              'NOCHE': 'Noche',
              'ROTATIVO': 'Rotativo',
            },
            onChanged: (v) => setState(() => _turno = v!),
          ),
        ],
      ),
    );
  }

  // ─── Sección 3 ────────────────────────────────────────────────────────────

  Widget _seccion3Descripcion() {
    return SectionCard(
      titulo: 'Descripción del Evento',
      icono: Icons.description_outlined,
      child: Column(
        children: [
          TextFormField(
            controller: _descripcionCtrl,
            maxLines: 4,
            decoration: const InputDecoration(
              labelText: 'Descripción del evento *',
              alignLabelWithHint: true,
              prefixIcon: Padding(
                padding: EdgeInsets.only(bottom: 60),
                child: Icon(Icons.edit_note_outlined),
              ),
            ),
            validator: (v) => (v == null || v.trim().isEmpty) ? 'Campo requerido' : null,
          ),
          const SizedBox(height: 14),
          TextFormField(
            controller: _tareaCtrl,
            maxLines: 2,
            decoration: const InputDecoration(
              labelText: 'Tarea que realizaba *',
              alignLabelWithHint: true,
              prefixIcon: Padding(
                padding: EdgeInsets.only(bottom: 24),
                child: Icon(Icons.construction_outlined),
              ),
            ),
            validator: (v) => (v == null || v.trim().isEmpty) ? 'Campo requerido' : null,
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              const Text('¿Era tarea rutinaria?', style: TextStyle(fontSize: 14)),
              const Spacer(),
              Switch.adaptive(
                value: _tareaRutinaria,
                activeThumbColor: AppColors.primary,
                onChanged: (v) => setState(() => _tareaRutinaria = v),
              ),
            ],
          ),
          const SizedBox(height: 8),
          TextFormField(
            controller: _agenteCtrl,
            decoration: const InputDecoration(
              labelText: 'Agente causante',
              prefixIcon: Icon(Icons.link_outlined),
              hintText: 'Ej: Maquinaria, sustancia química',
            ),
          ),
          const SizedBox(height: 14),
          TextFormField(
            controller: _parteCtrl,
            decoration: const InputDecoration(
              labelText: 'Parte del cuerpo afectada',
              prefixIcon: Icon(Icons.accessibility_new_outlined),
            ),
          ),
          const SizedBox(height: 14),
          TextFormField(
            controller: _naturalezaCtrl,
            decoration: const InputDecoration(
              labelText: 'Naturaleza de la lesión',
              prefixIcon: Icon(Icons.healing_outlined),
              hintText: 'Ej: Contusión, fractura, quemadura',
            ),
          ),
        ],
      ),
    );
  }

  // ─── Fotos ────────────────────────────────────────────────────────────────

  Widget _seccionFotos() {
    return SectionCard(
      titulo: 'Evidencia Fotográfica',
      icono: Icons.camera_alt_outlined,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => _agregarFoto(ImageSource.camera),
                  icon: const Icon(Icons.camera_alt_outlined, size: 18),
                  label: const Text('Cámara'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    side: const BorderSide(color: AppColors.primary),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => _agregarFoto(ImageSource.gallery),
                  icon: const Icon(Icons.photo_library_outlined, size: 18),
                  label: const Text('Galería'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.secondary,
                    side: const BorderSide(color: AppColors.secondary),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ),
            ],
          ),
          if (_fotos.isNotEmpty) ...[
            const SizedBox(height: 14),
            SizedBox(
              height: 90,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: _fotos.length,
                separatorBuilder: (_, _) => const SizedBox(width: 8),
                itemBuilder: (_, i) => Stack(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Image.file(
                        _fotos[i],
                        width: 90,
                        height: 90,
                        fit: BoxFit.cover,
                      ),
                    ),
                    Positioned(
                      top: 2,
                      right: 2,
                      child: GestureDetector(
                        onTap: () => setState(() => _fotos.removeAt(i)),
                        child: Container(
                          decoration: const BoxDecoration(
                            color: AppColors.error,
                            shape: BoxShape.circle,
                          ),
                          padding: const EdgeInsets.all(2),
                          child: const Icon(Icons.close, color: Colors.white, size: 14),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ] else ...[
            const SizedBox(height: 10),
            const Text(
              'Sin fotos adjuntas (opcional)',
              style: TextStyle(fontSize: 12, color: AppColors.textMuted),
            ),
          ],
        ],
      ),
    );
  }

  // ─── Botón enviar ─────────────────────────────────────────────────────────

  Widget _buildBotonEnviar() {
    return ElevatedButton.icon(
      onPressed: _enviando ? null : _enviar,
      icon: _enviando
          ? const SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
            )
          : const Icon(Icons.send_outlined),
      label: Text(_enviando ? 'Enviando...' : 'Enviar Reporte'),
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        minimumSize: const Size(double.infinity, 56),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        textStyle: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700),
      ),
    );
  }
}

// ─── Widget helper: campo de fecha/hora ───────────────────────────────────────

class _DateField extends StatelessWidget {
  final String label;
  final String value;
  final VoidCallback onTap;

  const _DateField({required this.label, required this.value, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFE5E7EB)),
        ),
        child: Row(
          children: [
            const Icon(Icons.calendar_today_outlined, size: 16, color: AppColors.textMuted),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                  Text(
                    value,
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textDark),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
