import React, { useCallback } from "react";
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
import { fetchAllQueues, joinQueue } from "../store/slices/queueSlice";
import { Card, Button, Loading, EmptyState } from "../components";
import { Queue } from "../types/queue";
import { UserStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<UserStackParamList, "Queues">;

const QueuesScreen: React.FC<Props> = ({ navigation }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { queues, activeEntry, loading } = useSelector(
        (state: RootState) => state.queue
    );

    useFocusEffect(
        useCallback(() => {
            dispatch(fetchAllQueues());
        }, [dispatch])
    );

    const handleJoinQueue = async (queueId: string) => {
        await dispatch(joinQueue(queueId));
        navigation.navigate("MyQueue");
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
            <Text style={styles.headerTitle}>All Queues</Text>
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
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={() => dispatch(fetchAllQueues())}
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
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        padding: 16,
        backgroundColor: "#fff",
    },
    list: {
        padding: 16,
    },
    queueCard: {
        marginBottom: 12,
        backgroundColor: "#fff",
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
        fontWeight: "600",
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
        fontSize: 12,
        color: "#666",
    },
    joinButton: {
        marginTop: 4,
    },
});

export default QueuesScreen;
