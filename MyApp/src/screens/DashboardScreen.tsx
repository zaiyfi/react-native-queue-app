import React, { useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    TouchableOpacity,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootState, AppDispatch } from "../store/store";
import {
    fetchAllQueues,
    fetchMyActiveQueue,
    joinQueue,
} from "../store/slices/queueSlice";
import { logout } from "../store/slices/authSlice";
import { Card, Button, Loading, EmptyState } from "../components";
import { Queue } from "../types/queue";
import { UserStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<UserStackParamList, "Dashboard">;

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { queues, activeEntry, loading } = useSelector(
        (state: RootState) => state.queue
    );
    const { user } = useSelector((state: RootState) => state.auth);

    const loadData = useCallback(() => {
        dispatch(fetchAllQueues());
        dispatch(fetchMyActiveQueue());
    }, [dispatch]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const handleJoinQueue = async (queueId: string) => {
        await dispatch(joinQueue(queueId));
        dispatch(fetchMyActiveQueue());
    };

    const handleLogout = () => {
        dispatch(logout());
    };

    const renderQueueItem = ({ item }: { item: Queue }) => (
        <Card style={styles.queueCard}>
            <View style={styles.queueHeader}>
                <Text style={styles.queueItemName}>{item.name}</Text>
                <View
                    style={[
                        styles.statusBadge,
                        item.status === "active" && styles.activeBadge,
                        item.status === "paused" && styles.pausedBadge,
                        item.status === "closed" && styles.closedBadge,
                    ]}
                >
                    <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
            </View>
            {item.description && (
                <Text style={styles.description}>{item.description}</Text>
            )}
            <View style={styles.queueInfo}>
                <Text style={styles.infoText}>
                    Waiting: {item.waitingCount || 0} people
                </Text>
                <Text style={styles.infoText}>
                    Est. wait: ~{(item.waitingCount || 0) * item.averageServiceTime} min
                </Text>
            </View>
            {item.status === "active" && (
                <Button
                    title="Join Queue"
                    onPress={() => handleJoinQueue(item._id)}
                    disabled={!!activeEntry}
                    style={styles.joinButton}
                />
            )}
        </Card>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Welcome back!</Text>
                    <Text style={styles.email}>{user?.email}</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            {/* Active Queue Banner */}
            {activeEntry && (
                <Card style={styles.activeQueueCard}>
                    <Text style={styles.activeQueueTitle}>Your Active Queue</Text>
                    <Text style={styles.tokenNumber}>
                        Token #{activeEntry.tokenNumber}
                    </Text>
                    <View style={styles.activeQueueInfo}>
                        <Text style={styles.queueName}>
                            {(activeEntry.queue as Queue).name}
                        </Text>
                        <Text style={styles.position}>
                            Position: #{activeEntry.position}
                        </Text>
                        <Text style={styles.waitTime}>
                            Est. wait: {activeEntry.estimatedWait} min
                        </Text>
                    </View>
                    <Button
                        title="View My Queue"
                        onPress={() => navigation.navigate("MyQueue")}
                        variant="secondary"
                        style={styles.viewQueueButton}
                    />
                </Card>
            )}

            {/* Quick Actions */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate("Queues")}
                >
                    <Text style={styles.actionIcon}>📋</Text>
                    <Text style={styles.actionText}>Browse Queues</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate("History")}
                >
                    <Text style={styles.actionIcon}>📜</Text>
                    <Text style={styles.actionText}>History</Text>
                </TouchableOpacity>
            </View>

            {/* Available Queues */}
            <Text style={styles.sectionTitle}>Available Queues</Text>
            {loading && queues.length === 0 ? (
                <Loading />
            ) : queues.length === 0 ? (
                <EmptyState
                    title="No Queues Available"
                    message="There are no active queues at the moment. Check back later!"
                />
            ) : (
                <FlatList
                    data={queues}
                    keyExtractor={(item) => item._id}
                    renderItem={renderQueueItem}
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
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    greeting: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
    },
    email: {
        fontSize: 14,
        color: "#666",
    },
    logoutButton: {
        padding: 8,
    },
    logoutText: {
        color: "#FF3B30",
        fontSize: 16,
    },
    activeQueueCard: {
        margin: 16,
        backgroundColor: "#007AFF",
    },
    activeQueueTitle: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
    },
    tokenNumber: {
        color: "#fff",
        fontSize: 36,
        fontWeight: "bold",
        marginBottom: 12,
    },
    activeQueueInfo: {
        marginBottom: 12,
    },
    queueName: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    position: {
        color: "rgba(255,255,255,0.8)",
        fontSize: 14,
    },
    waitTime: {
        color: "rgba(255,255,255,0.8)",
        fontSize: 14,
    },
    viewQueueButton: {
        backgroundColor: "rgba(255,255,255,0.2)",
    },
    actions: {
        flexDirection: "row",
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    actionButton: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        marginHorizontal: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    actionIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    actionText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#333",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    list: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    queueCard: {
        marginBottom: 12,
    },
    queueHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    queueItemName: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        backgroundColor: "#ccc",
    },
    activeBadge: {
        backgroundColor: "#34C759",
    },
    pausedBadge: {
        backgroundColor: "#FF9500",
    },
    closedBadge: {
        backgroundColor: "#FF3B30",
    },
    statusText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "bold",
    },
    description: {
        fontSize: 14,
        color: "#666",
        marginBottom: 8,
    },
    queueInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    infoText: {
        fontSize: 14,
        color: "#666",
    },
    joinButton: {
        marginTop: 4,
    },
});

export default DashboardScreen;
