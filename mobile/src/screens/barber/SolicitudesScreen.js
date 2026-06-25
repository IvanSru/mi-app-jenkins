import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import client from '../../api/client';
import AppointmentCard from '../../components/AppointmentCard';
import { colors, fonts } from '../../theme';

const TABS = ['pending', 'accepted', 'rejected'];
const TAB_LABEL = { pending: 'Pendientes', accepted: 'Aceptadas', rejected: 'Rechazadas' };

export default function SolicitudesScreen() {
  const [appointments, setAppointments] = useState([]);
  const [tab,          setTab]          = useState('pending');
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [acting,       setActing]       = useState(null);

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

  const respond = async (id, status) => {
    setActing(id);
    try {
      await client.patch(`/appointments/${id}/respond`, { status });
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo procesar');
    } finally {
      setActing(null);
    }
  };

  const visible = appointments.filter(a => a.status === tab);

  return (
    <View style={s.bg}>
      <View style={s.header}>
        <Text style={s.title}>Solicitudes</Text>
        <Text style={s.sub}>Acepta o rechaza citas de clientes</Text>
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        {TABS.map(t => {
          const count = appointments.filter(a => a.status === t).length;
          return (
            <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
              <Text style={[s.tabText, tab === t && s.tabTextActive]}>
                {TAB_LABEL[t]} {count > 0 ? `(${count})` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.gold} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(a) => a._id}
          renderItem={({ item }) => (
            <AppointmentCard appointment={item}>
              {item.status === 'pending' && (
                <View style={s.actions}>
                  <TouchableOpacity
                    style={[s.actionBtn, s.acceptBtn, acting === item._id && { opacity: 0.6 }]}
                    onPress={() => respond(item._id, 'accepted')}
                    disabled={!!acting}
                    activeOpacity={0.75}
                  >
                    <Text style={s.acceptText}>{acting === item._id ? '...' : '✓ Aceptar'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.actionBtn, s.rejectBtn, acting === item._id && { opacity: 0.6 }]}
                    onPress={() => respond(item._id, 'rejected')}
                    disabled={!!acting}
                    activeOpacity={0.75}
                  >
                    <Text style={s.rejectText}>{acting === item._id ? '...' : '✗ Rechazar'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </AppointmentCard>
          )}
          contentContainerStyle={s.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.gold} />}
          ListEmptyComponent={<Text style={s.empty}>Sin citas en esta categoría.</Text>}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  bg:           { flex: 1, backgroundColor: colors.bg },
  header:       { padding: 20, paddingTop: 56, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  title:        { fontSize: fonts.xl, fontWeight: '900', color: colors.text },
  sub:          { fontSize: fonts.sm, color: colors.sub, marginTop: 4 },
  tabs:         { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 4, gap: 6 },
  tab:          { flex: 1, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.card, alignItems: 'center' },
  tabActive:    { backgroundColor: colors.goldDim, borderWidth: 1, borderColor: colors.gold },
  tabText:      { fontSize: fonts.xs, fontWeight: '600', color: colors.sub },
  tabTextActive:{ color: colors.gold },
  list:         { padding: 16, paddingBottom: 40 },
  empty:        { color: colors.sub, textAlign: 'center', marginTop: 40, fontSize: fonts.sm },
  actions:      { flexDirection: 'row', gap: 10 },
  actionBtn:    { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
  acceptBtn:    { backgroundColor: 'rgba(34,197,94,0.12)', borderColor: colors.green },
  rejectBtn:    { backgroundColor: 'rgba(239,68,68,0.12)',  borderColor: colors.red },
  acceptText:   { fontSize: fonts.sm, fontWeight: '800', color: colors.green },
  rejectText:   { fontSize: fonts.sm, fontWeight: '800', color: colors.red },
});
