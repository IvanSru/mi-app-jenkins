import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';

const STATUS_LABEL = { pending: 'Pendiente', accepted: 'Aceptada', rejected: 'Rechazada', cancelled: 'Cancelada', completed: 'Completada' };
const STATUS_COLOR = { pending: colors.gold, accepted: colors.green, rejected: colors.red, cancelled: colors.sub, completed: colors.blue };

export default function AppointmentCard({ appointment: a, children }) {
  const statusColor = STATUS_COLOR[a.status] || colors.sub;
  return (
    <View style={[s.card, { borderLeftColor: statusColor }]}>
      <View style={s.row}>
        <Text style={s.service}>{a.service?.name || '—'}</Text>
        <View style={[s.badge, { backgroundColor: statusColor + '22' }]}>
          <Text style={[s.badgeText, { color: statusColor }]}>{STATUS_LABEL[a.status]}</Text>
        </View>
      </View>
      <Text style={s.barber}>{a.barber?.name || a.client?.name || '—'}</Text>
      <Text style={s.time}>
        {new Date(a.date).toLocaleDateString('es-CO')}  ·  {a.startTime} – {a.endTime}
      </Text>
      {children && <View style={{ marginTop: 10 }}>{children}</View>}
    </View>
  );
}

const s = StyleSheet.create({
  card:      { backgroundColor: colors.card, borderRadius: 14, padding: 16, marginBottom: 10, borderLeftWidth: 3 },
  row:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  service:   { fontSize: fonts.md, fontWeight: '800', color: colors.text, flex: 1 },
  badge:     { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: fonts.xs, fontWeight: '700' },
  barber:    { fontSize: fonts.sm, color: colors.sub, marginBottom: 4 },
  time:      { fontSize: fonts.xs, color: colors.sub, fontVariant: ['tabular-nums'] },
});
