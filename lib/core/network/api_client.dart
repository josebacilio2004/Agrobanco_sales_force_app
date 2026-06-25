import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiClient {
  static const _storage = FlutterSecureStorage();
  
  static String get baseUrl {
    if (kIsWeb) return 'http://localhost:8003';
    try {
      if (Platform.isAndroid) {
        return 'http://10.0.2.2:8003'; // Android emulator localhost bridge
      }
    } catch (_) {}
    return 'http://localhost:8003';
  }

  static Future<void> saveToken(String token) async {
    await _storage.write(key: 'jwt_token', value: token);
  }

  static Future<String?> getToken() async {
    return await _storage.read(key: 'jwt_token');
  }

  static Future<void> clearToken() async {
    await _storage.delete(key: 'jwt_token');
  }

  static Future<Map<String, String>> _getHeaders() async {
    final token = await getToken();
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  static Future<http.Response> get(String path) async {
    final url = Uri.parse('$baseUrl$path');
    final headers = await _getHeaders();
    return await http.get(url, headers: headers);
  }

  static Future<http.Response> post(String path, Map<String, dynamic> body) async {
    final url = Uri.parse('$baseUrl$path');
    final headers = await _getHeaders();
    return await http.post(
      url,
      headers: headers,
      body: jsonEncode(body),
    );
  }

  static Future<http.StreamedResponse> postMultipart(
    String path,
    Map<String, String> fields,
    String fileField,
    String filePath,
  ) async {
    final url = Uri.parse('$baseUrl$path');
    final request = http.MultipartRequest('POST', url);
    
    // Add token header
    final token = await getToken();
    if (token != null) {
      request.headers['Authorization'] = 'Bearer $token';
    }
    
    // Add fields
    request.fields.addAll(fields);
    
    // Add file
    if (kIsWeb) {
      request.files.add(
        http.MultipartFile.fromBytes(
          fileField,
          List.generate(100, (i) => i),
          filename: filePath.split('/').last,
        ),
      );
    } else {
      request.files.add(
        await http.MultipartFile.fromPath(fileField, filePath),
      );
    }
    
    return await request.send();
  }
}
