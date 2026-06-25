import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors, fonts } from '../../theme';

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();

  return (
    <ScrollView style={s.bg} contentContainerStyle={s.content}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Hola, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={s.sub}>¿Qué servicio quieres hoy?</Text>
        </View>
        <TouchableOpacity onPress={logout} style={s.logoutBtn}>
          <Text style={s.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* Promo banner */}
      <View style={s.banner}>
        <Text style={s.bannerTitle}>BLADE Barbería</Text>
        <Text style={s.bannerSub}>Cortes, barba, manicure y más</Text>
      </View>

      {/* Quick actions */}
      <Text style={s.sectionTitle}>Acciones rápidas</Text>
      <View style={s.grid}>
        <TouchableOpacity style={s.action} onPress={() => navigation.navigate('Barberos')} activeOpacity={0.75}>
          <Text style={s.actionIcon}>✂️</Text>
          <Text style={s.actionLabel}>Reservar cita</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.action} onPress={() => navigation.navigate('MisCitas')} activeOpacity={0.75}>
          <Text style={s.actionIcon}>📅</Text>
          <Text style={s.actionLabel}>Mis citas</Text>
        </TouchableOpacity>
      </View>

      {/* Services showcase */}
      <Text style={[s.sectionTitle, { marginTop: 24 }]}>Nuestros servicios</Text>
      {[
        { icon: '✂️', name: 'Corte Caballero', desc: 'Tijera y máquina, lavado incluido' },
        { icon: '💇', name: 'Corte Dama',       desc: 'Corte con estilo, moldeado' },
        { icon: '🪒', name: 'Barba',             desc: 'Perfilado o afeitado clásico' },
        { icon: '💅', name: 'Manicure',          desc: 'Manos perfectas, esmalte incluido' },
        { icon: '🦶', name: 'Pedicure',          desc: 'Cuidado completo de pies' },
        { icon: '🎨', name: 'Tinte / Color',     desc: 'Coloración profesional' },
      ].map(sv => (
        <View key={sv.name} style={s.svcRow}>
          <Text style={s.svcIcon}>{sv.icon}</Text>
          <View>
            <Text style={s.svcName}>{sv.name}</Text>
            <Text style={s.svcDesc}>{sv.desc}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  bg:          { flex: 1, backgroundColor: colors.bg },
  content:     { padding: 20, paddingTop: 56 },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  greeting:    { fontSize: fonts.xl, fontWeight: '900', color: colors.text },
  sub:         { fontSize: fonts.sm, color: colors.sub, marginTop: 4 },
  logoutBtn:   { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  logoutText:  { fontSize: fonts.xs, color: colors.sub },
  banner:      { backgroundColor: colors.goldDim, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.gold, marginBottom: 28 },
  bannerTitle: { fontSize: fonts.xl, fontWeight: '900', color: colors.gold, letterSpacing: 3 },
  bannerSub:   { fontSize: fonts.sm, color: colors.text, marginTop: 4 },
  sectionTitle:{ fontSize: fonts.xs, fontWeight: '700', color: colors.sub, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 },
  grid:        { flexDirection: 'row', gap: 12 },
  action:      { flex: 1, backgroundColor: colors.surface, borderRadius: 14, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  actionIcon:  { fontSize: 28, marginBottom: 8 },
  actionLabel: { fontSize: fonts.sm, fontWeight: '700', color: colors.text },
  svcRow:      { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 8 },
  svcIcon:     { fontSize: 22, marginRight: 14 },
  svcName:     { fontSize: fonts.md, fontWeight: '700', color: colors.text },
  svcDesc:     { fontSize: fonts.xs, color: colors.sub, marginTop: 2 },
});
