import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { colors, fonts } from '../theme';

export default function SlotGrid({ slots, selected, onSelect }) {
  const renderSlot = ({ item }) => {
    const isSelected = selected === item.time;
    const disabled   = !item.available;
    return (
      <TouchableOpacity
        style={[s.slot, isSelected && s.slotSelected, disabled && s.slotDisabled]}
        onPress={() => !disabled && onSelect(item.time)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={[s.slotText, isSelected && s.slotTextSelected, disabled && s.slotTextDisabled]}>
          {item.time}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={slots}
      keyExtractor={(item) => item.time}
      renderItem={renderSlot}
      numColumns={3}
      scrollEnabled={false}
      contentContainerStyle={{ gap: 8 }}
      columnWrapperStyle={{ gap: 8 }}
    />
  );
}

const s = StyleSheet.create({
  slot:             { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: colors.card, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  slotSelected:     { backgroundColor: colors.goldDim, borderColor: colors.gold },
  slotDisabled:     { backgroundColor: colors.surface, borderColor: colors.surface, opacity: 0.4 },
  slotText:         { fontSize: fonts.sm, fontWeight: '700', color: colors.text },
  slotTextSelected: { color: colors.gold },
  slotTextDisabled: { color: colors.sub },
});
