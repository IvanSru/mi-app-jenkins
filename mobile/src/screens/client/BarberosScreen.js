import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import client from '../../api/client';
import BarberCard from '../../components/BarberCard';
import { colors, fonts } from '../../theme';

export default function BarberosScreen({ navigation }) {
  const [barbers,  setBarbers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    client.get('/barbers')
      .then(({ data }) => setBarbers(data.barbers || []))
      .catch(() => setError('No se pudieron cargar los barberos'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={s.bg}>
      <View style={s.header}>
        <Text style={s.title}>Elige tu barbero</Text>
        <Text style={s.sub}>Selecciona quién te atenderá</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.gold} style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={s.error}>{error}</Text>
      ) : (
        <FlatList
          data={barbers}
          keyExtractor={(b) => b._id}
          renderItem={({ item }) => (
            <BarberCard
              barber={item}
              onPress={() => navigation.navigate('Booking', { barber: item })}
            />
          )}
          contentContainerStyle={s.list}
          ListEmptyComponent={<Text style={s.empty}>No hay barberos disponibles.</Text>}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  bg:     { flex: 1, backgroundColor: colors.bg },
  header: { padding: 20, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  title:  { fontSize: fonts.xl, fontWeight: '900', color: colors.text },
  sub:    { fontSize: fonts.sm, color: colors.sub, marginTop: 4 },
  list:   { padding: 16 },
  error:  { color: colors.red, textAlign: 'center', marginTop: 40, fontSize: fonts.sm },
  empty:  { color: colors.sub, textAlign: 'center', marginTop: 40, fontSize: fonts.sm },
});
