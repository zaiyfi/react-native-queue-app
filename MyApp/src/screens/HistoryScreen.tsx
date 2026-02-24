import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootState, AppDispatch } from "../store/store";
import { fetchQueueHistory } from "../store/slices/queueSlice";
import { Card, Loading, EmptyState } from "../components";
import { QueueEntry } from "../types/queue";
import { UserStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<UserStackParamList, "History">;

const HistoryScreen: React.FC<Props> = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { history, loading, error } = useSelector((state: RootState) => state.queue);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            console.log('HistoryScreen: Fetching queue history...');
            dispatch(fetchQueueHistory())
                .then((result) => {
                    console.log('HistoryScreen: Fetch result:', result);
                    if (fetchQueueHistory.rejected.match(result)) {
                        console.log('HistoryScreen: Fetch failed with error:', result.payload);
                    } else if (fetchQueueHistory.fulfilled.match(result)) {
                        console.log('HistoryScreen: Fetch succeeded with', result.payload.length, 'items');
                    }
                });
        }, [dispatch])
    );

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const renderHistoryItem = ({ item }: { item: QueueEntry }) => {
        const queueName = typeof item.queue === 'object'
            ? item.queue.name
            : 'Queue';

        return (
            <Card style={styles.historyCard}>
                <View style={styles.historyHeader}>
                    <Text style={styles.queueName}>{queueName}</Text>
                    <View
                        style={[
                            styles.statusBadge,
                            item.status === "served" && styles.servedBadge,
                            item.status === "cancelled" && styles.cancelledBadge,
                        ]}
                    >
                        <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                    </View>
                </View>
                <View style={styles.historyDetails}>
                    <Text style={styles.tokenText}>Token #{item.tokenNumber}</Text>
                    <Text style={styles.dateText}>
                        {formatDate(item.status === "served" ? (item.servedAt || item.updatedAt || item.joinedAt) : (item.updatedAt || item.joinedAt))}
                    </Text>
                </View>
            </Card>
        );
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await dispatch(fetchQueueHistory());
        setRefreshing(false);
    }, [dispatch]);

    if (loading && history.length === 0 && !error) {
        return <Loading fullScreen message="Loading history..." />;
    }

    if (error) {
        return (
            <View style={styles.container}>
                <EmptyState
                    title="Error"
                    message={error || 'Failed to load history. Please try again.'}
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {history.length === 0 ? (
                <EmptyState
                    title="No History"
                    message="You haven't been in any queues yet. Join a queue to get started!"
                />
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={(item) => item._id}
                    renderItem={renderHistoryItem}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#007AFF"]}
                        />
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    list: {
        padding: 16,
    },
    historyCard: {
        marginBottom: 12,
    },
    historyHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    queueName: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    servedBadge: {
        backgroundColor: "#34C759",
    },
    cancelledBadge: {
        backgroundColor: "#FF3B30",
    },
    statusText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "bold",
    },
    historyDetails: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    tokenText: {
        fontSize: 14,
        color: "#666",
    },
    dateText: {
        fontSize: 14,
        color: "#999",
    },
});

export default HistoryScreen;
