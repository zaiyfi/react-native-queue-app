import React, { useEffect, useCallback } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootState, AppDispatch } from "../store/store";
import { fetchMyActiveQueue, leaveQueue } from "../store/slices/queueSlice";
import { Button, Card, Loading } from "../components";
import { UserStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<UserStackParamList, "MyQueue">;

const MyQueueScreen: React.FC<Props> = ({ navigation }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { activeEntry, loading } = useSelector((state: RootState) => state.queue);

    const loadData = useCallback(() => {
        dispatch(fetchMyActiveQueue());
    }, [dispatch]);

    useFocusEffect(
        useCallback(() => {
            loadData();
            // Poll for updates every 30 seconds
            const interval = setInterval(loadData, 30000);
            return () => clearInterval(interval);
        }, [loadData])
    );

    const handleLeaveQueue = () => {
        Alert.alert(
            "Leave Queue",
            "Are you sure you want to leave this queue?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Leave",
                    style: "destructive",
                    onPress: async () => {
                        if (activeEntry?.queue) {
                            const queueId = typeof activeEntry.queue === 'object'
                                ? activeEntry.queue._id
                                : activeEntry.queue;
                            await dispatch(leaveQueue(queueId));
                            navigation.goBack();
                        }
                    },
                },
            ]
        );
    };

    if (loading && !activeEntry) {
        return <Loading fullScreen message="Loading your queue..." />;
    }

    if (!activeEntry) {
        return (
            <View style={styles.container}>
                <Text style={styles.noQueueText}>You are not in any queue</Text>
                <Button
                    title="Browse Queues"
                    onPress={() => navigation.navigate("Dashboard")}
                />
            </View>
        );
    }

    const queueName = typeof activeEntry.queue === 'object'
        ? activeEntry.queue.name
        : 'Queue';

    const queueStatus = typeof activeEntry.queue === 'object'
        ? activeEntry.queue.status
        : 'active';

    return (
        <View style={styles.container}>
            <Card style={styles.tokenCard}>
                <Text style={styles.tokenLabel}>Your Token Number</Text>
                <Text style={styles.tokenNumber}>#{activeEntry.tokenNumber}</Text>

                <View style={styles.statusContainer}>
                    <View style={[
                        styles.statusBadge,
                        activeEntry.status === 'serving' && styles.servingBadge,
                        activeEntry.status === 'waiting' && styles.waitingBadge,
                    ]}>
                        <Text style={styles.statusText}>
                            {activeEntry.status.toUpperCase()}
                        </Text>
                    </View>
                </View>
            </Card>

            <Card style={styles.infoCard}>
                <Text style={styles.queueName}>{queueName}</Text>

                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Position</Text>
                        <Text style={styles.infoValue}>#{activeEntry.position}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Est. Wait</Text>
                        <Text style={styles.infoValue}>
                            ~{activeEntry.estimatedWait || 0} min
                        </Text>
                    </View>
                </View>

                {activeEntry.averageServiceTime && (
                    <Text style={styles.avgTimeText}>
                        (avg {activeEntry.averageServiceTime} min per user)
                    </Text>
                )}

                {queueStatus === 'paused' && (
                    <View style={styles.warningContainer}>
                        <Text style={styles.warningText}>
                            ⚠️ Queue is currently paused
                        </Text>
                    </View>
                )}
            </Card>

            <View style={styles.actions}>
                <Button
                    title="Leave Queue"
                    variant="danger"
                    onPress={handleLeaveQueue}
                    loading={loading}
                />
            </View>

            <Text style={styles.refreshText}>
                This screen will auto-refresh every 30 seconds
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        padding: 16,
    },
    noQueueText: {
        fontSize: 18,
        color: "#666",
        textAlign: "center",
        marginBottom: 20,
    },
    tokenCard: {
        alignItems: "center",
        paddingVertical: 32,
        backgroundColor: "#007AFF",
    },
    tokenLabel: {
        color: "rgba(255,255,255,0.8)",
        fontSize: 14,
        marginBottom: 8,
    },
    tokenNumber: {
        color: "#fff",
        fontSize: 64,
        fontWeight: "bold",
        marginBottom: 16,
    },
    statusContainer: {
        alignItems: "center",
    },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    waitingBadge: {
        backgroundColor: "rgba(255,255,255,0.2)",
    },
    servingBadge: {
        backgroundColor: "#34C759",
    },
    statusText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
    },
    infoCard: {
        marginTop: 16,
    },
    queueName: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    infoItem: {
        alignItems: "center",
    },
    infoLabel: {
        fontSize: 14,
        color: "#666",
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
    },
    avgTimeText: {
        textAlign: "center",
        color: "#666",
        fontSize: 12,
        marginTop: 8,
    },
    warningContainer: {
        marginTop: 20,
        padding: 12,
        backgroundColor: "#FFF3CD",
        borderRadius: 8,
        alignItems: "center",
    },
    warningText: {
        color: "#856404",
        fontSize: 14,
        fontWeight: "600",
    },
    actions: {
        marginTop: 24,
    },
    refreshText: {
        textAlign: "center",
        color: "#999",
        fontSize: 12,
        marginTop: 20,
    },
});

export default MyQueueScreen;
