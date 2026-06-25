import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import client from '../../api/client';
import AppointmentCard from '../../components/AppointmentCard';
import { colors, fonts } from '../../theme';

const TABS = ['all', 'pending', 'accepted', 'rejected'];
const TAB_LABEL = { all: 'Todas', pending: 'Pendientes', accepted: 'Aceptadas', rejected: 'Rechazadas' };

export default function MisCitasScreen() {
  const [appointments, setAppointments] = useState([]);
  const [tab,          setTab]          = useState('all');
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

  const cancel = async (id) => {
    Alert.alert('Cancelar cita', '¿Seguro que deseas cancelar esta cita?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar', style: 'destructive',
        onPress: async () => {
          await client.patch(`/appointments/${id}/respond`, { status: 'cancelled' });
          setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'cancelled' } : a));
        },
      },
    ]);
  };

  const visible = tab === 'all' ? appointments : appointments.filter(a => a.status === tab);

  return (
    <View style={s.bg}>
      <View style={s.header}>
        <Text style={s.title}>Mis citas</Text>
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        {TABS.map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>{TAB_LABEL[t]}</Text>
          </TouchableOpacity>
        ))}
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
                <TouchableOpacity style={s.cancelBtn} onPress={() => cancel(item._id)}>
                  <Text style={s.cancelText}>Cancelar cita</Text>
                </TouchableOpacity>
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
  tabs:         { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4, gap: 6 },
  tab:          { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: colors.card },
  tabActive:    { backgroundColor: colors.goldDim, borderWidth: 1, borderColor: colors.gold },
  tabText:      { fontSize: fonts.xs, fontWeight: '600', color: colors.sub },
  tabTextActive:{ color: colors.gold },
  list:         { padding: 16, paddingBottom: 40 },
  empty:        { color: colors.sub, textAlign: 'center', marginTop: 40, fontSize: fonts.sm },
  cancelBtn:    { borderWidth: 1, borderColor: colors.red, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  cancelText:   { fontSize: fonts.xs, fontWeight: '700', color: colors.red },
});
