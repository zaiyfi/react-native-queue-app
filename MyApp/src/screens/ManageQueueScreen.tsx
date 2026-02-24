import React, { useEffect, useCallback, useState } from "react";
import { View, Text, StyleSheet, FlatList, Alert, RefreshControl } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootState, AppDispatch } from "../store/store";
import {
    fetchQueueEntries,
    callNextUser,
    markAsServed,
    updateQueueStatus,
    fetchMyQueues,
} from "../store/slices/queueSlice";
import { Button, Card, Loading, EmptyState } from "../components";
import { QueueEntry } from "../types/queue";
import { AdminStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<AdminStackParamList, "ManageQueue">;

const ManageQueueScreen: React.FC<Props> = ({ route, navigation }) => {
    const { queueId } = route.params;
    const dispatch = useDispatch<AppDispatch>();
    const { currentQueueEntries, myQueues, loading } = useSelector(
        (state: RootState) => state.queue
    );
    const [actionLoading, setActionLoading] = useState(false);

    const currentQueue = myQueues.find((q) => q._id === queueId);

    const loadData = useCallback(() => {
        dispatch(fetchQueueEntries(queueId));
        dispatch(fetchMyQueues());
    }, [dispatch, queueId]);

    useFocusEffect(
        useCallback(() => {
            loadData();
            const interval = setInterval(loadData, 10000);
            return () => clearInterval(interval);
        }, [loadData])
    );

    const handleCallNext = async () => {
        setActionLoading(true);
        try {
            await dispatch(callNextUser(queueId)).unwrap();
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to call next user");
        } finally {
            setActionLoading(false);
        }
    };

    const handleMarkServed = async (entryId: string) => {
        setActionLoading(true);
        try {
            await dispatch(markAsServed({ queueId, entryId })).unwrap();
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to mark as served");
        } finally {
            setActionLoading(false);
        }
    };

    const handleStatusChange = (newStatus: string) => {
        Alert.alert(
            "Change Queue Status",
            `Are you sure you want to ${newStatus} this queue?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Confirm",
                    onPress: async () => {
                        setActionLoading(true);
                        try {
                            await dispatch(updateQueueStatus({ queueId, status: newStatus })).unwrap();
                        } catch (error: any) {
                            Alert.alert("Error", error.message || "Failed to update status");
                        } finally {
                            setActionLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const renderEntry = ({ item }: { item: QueueEntry }) => {
        const getStatusColor = (status: string) => {
            switch (status) {
                case "waiting":
                    return "#FF9500";
                case "serving":
                    return "#007AFF";
                case "served":
                    return "#34C759";
                case "cancelled":
                    return "#FF3B30";
                default:
                    return "#ccc";
            }
        };

        const userEmail = typeof item.user === 'object' ? item.user.email : 'User';

        return (
            <Card style={styles.entryCard}>
                <View style={styles.entryHeader}>
                    <Text style={styles.tokenNumber}>#{item.tokenNumber}</Text>
                    <View
                        style={[
                            styles.statusBadge,
                            { backgroundColor: getStatusColor(item.status) },
                        ]}
                    >
                        <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                    </View>
                </View>
                <Text style={styles.userEmail}>{userEmail}</Text>
                {item.status === "serving" && (
                    <Button
                        title="Mark as Served"
                        onPress={() => handleMarkServed(item._id)}
                        loading={actionLoading}
                        style={styles.servedButton}
                    />
                )}
            </Card>
        );
    };

    if (!currentQueue) {
        return <Loading fullScreen message="Loading queue..." />;
    }

    const waitingEntries = currentQueueEntries.filter((e) => e.status === "waiting");
    const servingEntry = currentQueueEntries.find((e) => e.status === "serving");
    const servedToday = currentQueueEntries.filter(
        (e) => e.status === "served"
    ).length;

    return (
        <View style={styles.container}>
            {/* Queue Info Card */}
            <Card style={styles.infoCard}>
                <Text style={styles.queueName}>{currentQueue.name}</Text>

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{waitingEntries.length}</Text>
                        <Text style={styles.statLabel}>Waiting</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{currentQueue.nowServingToken || '-'}</Text>
                        <Text style={styles.statLabel}>Now Serving</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{servedToday}</Text>
                        <Text style={styles.statLabel}>Served Today</Text>
                    </View>
                </View>

                {/* Status Control */}
                <View style={styles.statusControl}>
                    <Text style={styles.statusLabel}>Status:</Text>
                    <View style={styles.statusButtons}>
                        <Button
                            title="Active"
                            variant={currentQueue.status === "active" ? "primary" : "outline"}
                            onPress={() => handleStatusChange("active")}
                            style={styles.statusButton}
                            disabled={currentQueue.status === "active"}
                        />
                        <Button
                            title="Pause"
                            variant={currentQueue.status === "paused" ? "secondary" : "outline"}
                            onPress={() => handleStatusChange("paused")}
                            style={styles.statusButton}
                            disabled={currentQueue.status === "paused"}
                        />
                        <Button
                            title="Close"
                            variant={currentQueue.status === "closed" ? "danger" : "outline"}
                            onPress={() => handleStatusChange("closed")}
                            style={styles.statusButton}
                            disabled={currentQueue.status === "closed"}
                        />
                    </View>
                </View>
            </Card>

            {/* Call Next Button */}
            {currentQueue.status === "active" && (
                <View style={styles.callButtonContainer}>
                    <Button
                        title={servingEntry ? "Call Next (after serving current)" : "Call Next User"}
                        onPress={handleCallNext}
                        loading={actionLoading}
                        disabled={waitingEntries.length === 0}
                    />
                </View>
            )}

            {/* Currently Serving */}
            {servingEntry && (
                <Card style={styles.servingCard}>
                    <Text style={styles.servingLabel}>Now Serving</Text>
                    <Text style={styles.servingToken}>#{servingEntry.tokenNumber}</Text>
                </Card>
            )}

            {/* Queue Entries */}
            <Text style={styles.sectionTitle}>Queue Entries</Text>
            {currentQueueEntries.length === 0 ? (
                <EmptyState
                    title="No Entries"
                    message="No users in queue yet"
                />
            ) : (
                <FlatList
                    data={currentQueueEntries}
                    keyExtractor={(item) => item._id}
                    renderItem={renderEntry}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={loadData} />
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
        padding: 16,
    },
    infoCard: {
        marginBottom: 16,
    },
    queueName: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 20,
    },
    statItem: {
        alignItems: "center",
    },
    statValue: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#333",
    },
    statLabel: {
        fontSize: 12,
        color: "#666",
    },
    statusControl: {
        borderTopWidth: 1,
        borderTopColor: "#eee",
        paddingTop: 16,
    },
    statusLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    statusButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    statusButton: {
        flex: 1,
        marginHorizontal: 4,
    },
    callButtonContainer: {
        marginBottom: 16,
    },
    servingCard: {
        backgroundColor: "#007AFF",
        marginBottom: 16,
        alignItems: "center",
    },
    servingLabel: {
        color: "rgba(255,255,255,0.8)",
        fontSize: 14,
        marginBottom: 4,
    },
    servingToken: {
        color: "#fff",
        fontSize: 36,
        fontWeight: "bold",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginBottom: 12,
    },
    list: {
        paddingBottom: 20,
    },
    entryCard: {
        marginBottom: 8,
    },
    entryHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    tokenNumber: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "bold",
    },
    userEmail: {
        fontSize: 14,
        color: "#666",
    },
    servedButton: {
        marginTop: 8,
    },
});

export default ManageQueueScreen;
