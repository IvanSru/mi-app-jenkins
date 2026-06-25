import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import client from '../../api/client';
import SlotGrid from '../../components/SlotGrid';
import { colors, fonts } from '../../theme';

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function getNext7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
}

export default function BookingScreen({ route, navigation }) {
  const { barber } = route.params;

  const days              = getNext7Days();
  const [day,     setDay] = useState(days[0]);
  const [services, setSvc] = useState([]);
  const [service,  setService] = useState(null);
  const [slots,   setSlots]   = useState([]);
  const [slot,    setSlot]    = useState(null);
  const [loadSlots, setLoadSlots] = useState(false);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    client.get('/services').then(({ data }) => setSvc(data.services || []));
  }, []);

  useEffect(() => {
    if (!barber) return;
    setSlot(null);
    setLoadSlots(true);
    const dow = day.getDay();
    const dateStr = day.toISOString().split('T')[0];
    client.get(`/barbers/${barber._id}/slots?dayOfWeek=${dow}&date=${dateStr}`)
      .then(({ data }) => setSlots(data.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setLoadSlots(false));
  }, [barber, day]);

  const book = async () => {
    if (!service) { Alert.alert('Servicio requerido', 'Selecciona un servicio'); return; }
    if (!slot)    { Alert.alert('Hora requerida',    'Selecciona un horario');   return; }
    setSaving(true);
    try {
      await client.post('/appointments', {
        barberId:  barber._id,
        serviceId: service._id,
        date:      day.toISOString().split('T')[0],
        startTime: slot,
      });
      Alert.alert('¡Listo!', 'Tu cita fue enviada al barbero. Te confirmará en breve.', [
        { text: 'OK', onPress: () => navigation.navigate('MisCitas') },
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo reservar la cita');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={s.bg} contentContainerStyle={s.content}>
      {/* Barber info */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
          <Text style={s.backText}>‹ Atrás</Text>
        </TouchableOpacity>
        <Text style={s.title}>{barber.name}</Text>
        <Text style={s.sub}>Selecciona fecha, servicio y horario</Text>
      </View>

      {/* Day picker */}
      <Text style={s.sectionLabel}>Fecha</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.dayScroll}>
        {days.map((d, i) => {
          const active = d.toDateString() === day.toDateString();
          return (
            <TouchableOpacity
              key={i}
              style={[s.dayChip, active && s.dayChipActive]}
              onPress={() => setDay(d)}
              activeOpacity={0.75}
            >
              <Text style={[s.dayName, active && s.dayNameActive]}>{DAYS[d.getDay()]}</Text>
              <Text style={[s.dayNum,  active && s.dayNameActive]}>{d.getDate()}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Service picker */}
      <Text style={[s.sectionLabel, { marginTop: 20 }]}>Servicio</Text>
      {services.map(sv => (
        <TouchableOpacity
          key={sv._id}
          style={[s.svcRow, service?._id === sv._id && s.svcRowActive]}
          onPress={() => setService(sv)}
          activeOpacity={0.75}
        >
          <View style={{ flex: 1 }}>
            <Text style={s.svcName}>{sv.name}</Text>
            <Text style={s.svcMeta}>{sv.duration} min  ·  ${sv.price.toLocaleString('es-CO')}</Text>
          </View>
          {service?._id === sv._id && <Text style={s.check}>✓</Text>}
        </TouchableOpacity>
      ))}

      {/* Slot grid */}
      <Text style={[s.sectionLabel, { marginTop: 20 }]}>Horario disponible</Text>
      {loadSlots ? (
        <ActivityIndicator color={colors.gold} style={{ marginVertical: 20 }} />
      ) : slots.length === 0 ? (
        <Text style={s.noSlots}>Sin disponibilidad para este día</Text>
      ) : (
        <SlotGrid slots={slots} selected={slot} onSelect={setSlot} />
      )}

      {/* Confirm */}
      <TouchableOpacity style={[s.confirmBtn, saving && { opacity: 0.6 }]} onPress={book} disabled={saving} activeOpacity={0.8}>
        {saving
          ? <ActivityIndicator color={colors.bg} />
          : <Text style={s.confirmText}>Confirmar reserva</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  bg:           { flex: 1, backgroundColor: colors.bg },
  content:      { padding: 20, paddingTop: 56, paddingBottom: 40 },
  header:       { marginBottom: 24 },
  back:         { marginBottom: 12 },
  backText:     { fontSize: fonts.md, color: colors.gold },
  title:        { fontSize: fonts.xl, fontWeight: '900', color: colors.text },
  sub:          { fontSize: fonts.sm, color: colors.sub, marginTop: 4 },
  sectionLabel: { fontSize: fonts.xs, fontWeight: '700', color: colors.sub, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 },
  dayScroll:    { marginBottom: 4 },
  dayChip:      { width: 52, paddingVertical: 10, borderRadius: 12, alignItems: 'center', backgroundColor: colors.card, marginRight: 8, borderWidth: 1, borderColor: colors.border },
  dayChipActive:{ backgroundColor: colors.goldDim, borderColor: colors.gold },
  dayName:      { fontSize: fonts.xs, color: colors.sub, fontWeight: '600' },
  dayNum:       { fontSize: fonts.lg, color: colors.text, fontWeight: '900' },
  dayNameActive:{ color: colors.gold },
  svcRow:       { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  svcRowActive: { borderColor: colors.gold, backgroundColor: colors.goldDim },
  svcName:      { fontSize: fonts.md, fontWeight: '700', color: colors.text },
  svcMeta:      { fontSize: fonts.xs, color: colors.sub, marginTop: 2 },
  check:        { fontSize: fonts.lg, color: colors.gold, fontWeight: '900' },
  noSlots:      { fontSize: fonts.sm, color: colors.sub, textAlign: 'center', marginVertical: 20 },
  confirmBtn:   { backgroundColor: colors.gold, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 28 },
  confirmText:  { fontSize: fonts.md, fontWeight: '900', color: colors.bg, letterSpacing: 0.5 },
});
