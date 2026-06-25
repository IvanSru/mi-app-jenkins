import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors, fonts } from '../../theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const submit = async () => {
    if (!email || !password) { setError('Completa todos los campos'); return; }
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const fill = (e, p) => { setEmail(e); setPassword(p); };

  return (
    <KeyboardAvoidingView style={s.bg} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={s.brand}>
          <Text style={s.logo}>✂</Text>
          <Text style={s.title}>BLADE</Text>
          <Text style={s.subtitle}>Barbería profesional</Text>
        </View>

        {/* Form */}
        <View style={s.card}>
          <Text style={s.label}>Email</Text>
          <TextInput
            style={s.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor={colors.sub}
            placeholder="tucorreo@ejemplo.com"
          />

          <Text style={[s.label, { marginTop: 16 }]}>Contraseña</Text>
          <TextInput
            style={s.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor={colors.sub}
            placeholder="••••••••"
          />

          {!!error && <Text style={s.error}>{error}</Text>}

          <TouchableOpacity style={s.btn} onPress={submit} disabled={loading} activeOpacity={0.8}>
            {loading ? <ActivityIndicator color={colors.bg} /> : <Text style={s.btnText}>Ingresar</Text>}
          </TouchableOpacity>
        </View>

        {/* Demo credentials */}
        <View style={s.demo}>
          <Text style={s.demoTitle}>Credenciales demo</Text>
          <TouchableOpacity onPress={() => fill('cliente@blade.com', 'Cliente123!')}>
            <Text style={s.demoRow}>👤  cliente@blade.com / Cliente123!</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => fill('jorge@blade.com', 'Barber123!')}>
            <Text style={s.demoRow}>✂️  jorge@blade.com / Barber123!</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => fill('admin@blade.com', 'Admin123!')}>
            <Text style={s.demoRow}>🔑  admin@blade.com / Admin123!</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  bg:       { flex: 1, backgroundColor: colors.bg },
  scroll:   { flexGrow: 1, justifyContent: 'center', padding: 24 },
  brand:    { alignItems: 'center', marginBottom: 36 },
  logo:     { fontSize: 48, marginBottom: 8 },
  title:    { fontSize: fonts.xxl, fontWeight: '900', color: colors.gold, letterSpacing: 6 },
  subtitle: { fontSize: fonts.sm, color: colors.sub, marginTop: 4, letterSpacing: 2 },
  card:     { backgroundColor: colors.surface, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: colors.border },
  label:    { fontSize: fonts.xs, fontWeight: '700', color: colors.sub, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  input:    { backgroundColor: colors.card, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: colors.text, fontSize: fonts.md, borderWidth: 1, borderColor: colors.border },
  error:    { color: colors.red, fontSize: fonts.xs, marginTop: 12 },
  btn:      { backgroundColor: colors.gold, borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  btnText:  { color: colors.bg, fontWeight: '800', fontSize: fonts.md, letterSpacing: 0.5 },
  demo:     { marginTop: 24, backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderLeftWidth: 2, borderLeftColor: colors.gold },
  demoTitle:{ fontSize: fonts.xs, fontWeight: '700', color: colors.sub, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
  demoRow:  { fontSize: fonts.xs, color: colors.text, marginBottom: 6 },
});
