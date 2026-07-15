import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/usuario_model.dart';
import '../models/colaborador_model.dart';
import '../models/incidente_model.dart';

class ApiService {
  // Backend en la nube (Render). Para desarrollo local con el backend en tu PC,
  // usa 'http://10.0.2.2:8080/api' (emulador Android) en su lugar.
  static const String _baseUrl = 'https://sistema-aleri.onrender.com/api';

  static const _storage = FlutterSecureStorage();
  static const _tokenKey = 'aleri-token';

  // ─── Auth ────────────────────────────────────────────────────────────────

  Future<UsuarioModel> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    ).timeout(const Duration(seconds: 15));

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      final token = data['token'] as String;
      final user = UsuarioModel.fromLoginJson(data);

      if (user.rol != 'SUPERVISOR') {
        throw Exception('Solo supervisores pueden acceder a la app móvil.');
      }

      await _storage.write(key: _tokenKey, value: token);
      return user;
    } else if (response.statusCode == 401) {
      throw Exception('Credenciales incorrectas.');
    } else {
      throw Exception('Error del servidor (${response.statusCode}).');
    }
  }

  Future<UsuarioModel?> getMe() async {
    final token = await _storage.read(key: _tokenKey);
    if (token == null) return null;

    final response = await http.get(
      Uri.parse('$_baseUrl/auth/me'),
      headers: _authHeaders(token),
    ).timeout(const Duration(seconds: 10));

    if (response.statusCode == 200) {
      return UsuarioModel.fromJson(jsonDecode(response.body));
    }
    return null;
  }

  Future<void> logout() async {
    await _storage.delete(key: _tokenKey);
  }

  // ─── Colaboradores ───────────────────────────────────────────────────────

  Future<List<ColaboradorModel>> getColaboradores() async {
    final token = await _storage.read(key: _tokenKey);
    final response = await http.get(
      Uri.parse('$_baseUrl/colaboradores'),
      headers: _authHeaders(token),
    ).timeout(const Duration(seconds: 10));

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((e) => ColaboradorModel.fromJson(e)).toList();
    }
    throw Exception('No se pudieron cargar los colaboradores.');
  }

  // ─── Incidentes ──────────────────────────────────────────────────────────

  Future<List<IncidenteResumen>> getIncidentes() async {
    final token = await _storage.read(key: _tokenKey);
    final response = await http.get(
      Uri.parse('$_baseUrl/incidentes'),
      headers: _authHeaders(token),
    ).timeout(const Duration(seconds: 10));

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((e) => IncidenteResumen.fromJson(e)).toList();
    }
    throw Exception('No se pudieron cargar los incidentes.');
  }

  Future<void> crearIncidente(NuevoIncidenteRequest req) async {
    final token = await _storage.read(key: _tokenKey);
    final response = await http.post(
      Uri.parse('$_baseUrl/incidentes'),
      headers: _authHeaders(token),
      body: jsonEncode(req.toJson()),
    ).timeout(const Duration(seconds: 20));

    if (response.statusCode != 200 && response.statusCode != 201) {
      final body = jsonDecode(response.body);
      throw Exception(body['message'] ?? 'Error al crear el reporte.');
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  Map<String, String> _authHeaders(String? token) => {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };

  Future<String> fotoToBase64(File file) async {
    final bytes = await file.readAsBytes();
    return base64Encode(bytes);
  }
}
