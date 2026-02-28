// app/(tabs)/search.tsx
import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, FlatList, StyleSheet,
  TouchableOpacity, ActivityIndicator, Keyboard, Image
} from 'react-native';
import { router } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { searchApi, MovieSearchResult } from '../../services/api';

let debounceTimer: ReturnType<typeof setTimeout>;

function SearchIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx="10.5" cy="10.5" r="7" stroke={Colors.textMuted} strokeWidth={1.8} />
      <Path d="M16 16L21 21" stroke={Colors.textMuted} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function ClearIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M18 6L6 18M6 6L18 18" stroke={Colors.textMuted} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function MovieResultItem({ item }: { item: MovieSearchResult }) {
  return (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => {
        Keyboard.dismiss();
        router.push(`/movie/${item.id}`);
      }}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.poster }}
        style={styles.resultPoster}
        resizeMode="cover"
      />
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle} numberOfLines={2}>{item.title}</Text>
        {item.year && <Text style={styles.resultYear}>{item.year}</Text>}
      </View>
      <View style={styles.analyzeHint}>
        <Text style={styles.analyzeHintText}>View →</Text>
      </View>
    </TouchableOpacity>
  );
}

const SUGGESTIONS = [
  'Inception', 'The Lion King', 'Parasite',
  'Interstellar', 'Coco', 'The Pursuit of Happyness',
];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MovieSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const data = await searchApi.search(q);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (text: string) => {
    setQuery(text);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => doSearch(text), 400);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
    inputRef.current?.focus();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search Films</Text>
        <Text style={styles.headerSubtitle}>Find movies to analyze</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <SearchIcon />
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Movie title..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={handleChange}
            autoCapitalize="words"
            returnKeyType="search"
            onSubmitEditing={() => doSearch(query)}
            selectionColor={Colors.primary}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <ClearIcon />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.stateText}>Searching...</Text>
        </View>
      ) : searched && results.length === 0 ? (
        <View style={styles.centerState}>
          <Text style={styles.emptyEmoji}>🎬</Text>
          <Text style={styles.stateTitle}>No results found</Text>
          <Text style={styles.stateText}>Try a different title</Text>
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <MovieResultItem item={item} />}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.resultsCount}>
              {results.length} result{results.length !== 1 ? 's' : ''}
            </Text>
          }
        />
      ) : (
        <View style={styles.suggestions}>
          <Text style={styles.suggestionsLabel}>Popular searches</Text>
          <View style={styles.suggestionChips}>
            {SUGGESTIONS.map((s) => (
              <TouchableOpacity
                key={s}
                style={styles.chip}
                onPress={() => {
                  setQuery(s);
                  doSearch(s);
                }}
              >
                <Text style={styles.chipText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  searchBarContainer: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.base,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: Typography.sizes.base,
    color: Colors.textPrimary,
    padding: 0,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  emptyEmoji: { fontSize: 48 },
  stateTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  stateText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    letterSpacing: 0.3,
  },
  listContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: 100,
  },
  resultsCount: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  resultPoster: {
    width: 44,
    height: 66,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
  },
  resultInfo: { flex: 1 },
  resultTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  resultYear: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 3,
  },
  analyzeHint: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: Colors.glassGreen,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  analyzeHintText: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: '700',
  },

  // Suggestions
  suggestions: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xl,
  },
  suggestionsLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
  },
  suggestionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});