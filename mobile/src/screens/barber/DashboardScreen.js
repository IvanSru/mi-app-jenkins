import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import AppointmentCard from '../../components/AppointmentCard';
import { colors, fonts } from '../../theme';

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const { data } = await client.get('/appointments/my');
      setAppointments(data.appointments || []);
    } finally {
      if (isRefresh) setRefreshing(false); else setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const today = new Date().toDateString();
  const todayAppts = appointments.filter(a => new Date(a.date).toDateString() === today);
  const pending    = appointments.filter(a => a.status === 'pending').length;
  const accepted   = appointments.filter(a => a.status === 'accepted').length;

  return (
    <ScrollView
      style={s.bg}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.gold} />}
    >
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Hola, {user?.name?.split(' ')[0]} ✂️</Text>
          <Text style={s.sub}>Tu agenda de hoy</Text>
        </View>
        <TouchableOpacity onPress={logout} style={s.logoutBtn}>
          <Text style={s.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        <View style={s.stat}>
          <Text style={s.statNum}>{pending}</Text>
          <Text style={s.statLabel}>Pendientes</Text>
        </View>
        <View style={[s.stat, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.border }]}>
          <Text style={[s.statNum, { color: colors.green }]}>{accepted}</Text>
          <Text style={s.statLabel}>Aceptadas</Text>
        </View>
        <View style={s.stat}>
          <Text style={s.statNum}>{todayAppts.length}</Text>
          <Text style={s.statLabel}>Hoy</Text>
        </View>
      </View>

      {/* Pending attention */}
      {pending > 0 && (
        <>
          <Text style={s.sectionLabel}>Solicitudes pendientes</Text>
          <TouchableOpacity
            style={s.alertBanner}
            onPress={() => navigation.navigate('Solicitudes')}
            activeOpacity={0.8}
          >
            <Text style={s.alertIcon}>🔔</Text>
            <Text style={s.alertText}>Tienes {pending} solicitud{pending > 1 ? 'es' : ''} esperando respuesta</Text>
            <Text style={s.alertArrow}>›</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Today's appointments */}
      <Text style={[s.sectionLabel, { marginTop: 20 }]}>Citas de hoy</Text>
      {loading ? (
        <ActivityIndicator color={colors.gold} />
      ) : todayAppts.length === 0 ? (
        <Text style={s.empty}>Sin citas agendadas para hoy.</Text>
      ) : (
        todayAppts.map(a => <AppointmentCard key={a._id} appointment={a} />)
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  bg:          { flex: 1, backgroundColor: colors.bg },
  content:     { padding: 20, paddingTop: 56, paddingBottom: 40 },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  greeting:    { fontSize: fonts.xl, fontWeight: '900', color: colors.text },
  sub:         { fontSize: fonts.sm, color: colors.sub, marginTop: 4 },
  logoutBtn:   { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  logoutText:  { fontSize: fonts.xs, color: colors.sub },
  statsRow:    { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: colors.border },
  stat:        { flex: 1, alignItems: 'center', paddingVertical: 20 },
  statNum:     { fontSize: fonts.xxl, fontWeight: '900', color: colors.gold },
  statLabel:   { fontSize: fonts.xs, color: colors.sub, marginTop: 4, fontWeight: '600' },
  sectionLabel:{ fontSize: fonts.xs, fontWeight: '700', color: colors.sub, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 },
  alertBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.goldDim, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.gold },
  alertIcon:   { fontSize: 22, marginRight: 12 },
  alertText:   { flex: 1, fontSize: fonts.sm, fontWeight: '700', color: colors.gold },
  alertArrow:  { fontSize: 22, color: colors.gold },
  empty:       { color: colors.sub, fontSize: fonts.sm, textAlign: 'center', marginTop: 20 },
});
