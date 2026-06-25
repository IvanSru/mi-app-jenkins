import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';

const initials = (name) => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

export default function BarberCard({ barber, onPress }) {
  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.75}>
      <View style={s.avatar}>
        <Text style={s.avatarText}>{initials(barber.name)}</Text>
      </View>
      <View style={s.info}>
        <Text style={s.name}>{barber.name}</Text>
        <Text style={s.email}>{barber.email}</Text>
        {barber.phone ? <Text style={s.phone}>{barber.phone}</Text> : null}
      </View>
      <Text style={s.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card:       { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 14, padding: 14, marginBottom: 10 },
  avatar:     { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.goldDim, borderWidth: 1.5, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  avatarText: { fontSize: fonts.lg, fontWeight: '900', color: colors.gold },
  info:       { flex: 1 },
  name:       { fontSize: fonts.md, fontWeight: '800', color: colors.text },
  email:      { fontSize: fonts.xs, color: colors.sub, marginTop: 2 },
  phone:      { fontSize: fonts.xs, color: colors.sub },
  arrow:      { fontSize: 22, color: colors.sub },
});
