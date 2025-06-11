import { FontAwesome5 } from "@expo/vector-icons";
import {
    Canvas,
    Path,
} from "@shopify/react-native-skia";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useState } from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";

interface IPath {
    segments: string[];
    color?: string;
}

export default function App() {
    const { width, height } = Dimensions.get("window");

    const paletteColors = ["red", "green", "blue", "yellow"];
    const [activePaletteColorIndex, setActivePaletteColorIndex] = useState(0);
    const [paths, setPaths] = useState<IPath[]>([]);
    const [curr, setCurr] = useState<number>(0); // index of last visible path (exclusive)
    const currentPath = useRef<IPath | null>(null);

    // Gesture for drawing lines
    const pan = Gesture.Pan()
        .runOnJS(true)
        .onStart((g) => {
            // If curr is not at the end, remove all redo paths
            if (curr < paths.length) {
                setPaths((prev) => prev.slice(0, curr));
            }
            currentPath.current = {
                segments: [`M ${g.x} ${g.y}`],
                color: paletteColors[activePaletteColorIndex],
            };
            setPaths((prev) => [...prev, currentPath.current!]);
            setCurr((prev) => prev + 1);
        })
        .onUpdate((g) => {
            if (currentPath.current) {
                currentPath.current.segments.push(`L ${g.x} ${g.y}`);
                // Update only the last path in the array
                setPaths((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { ...currentPath.current! };
                    return updated;
                });
            }
        })
        .onEnd(() => {
            currentPath.current = null; // End the current stroke
        })
        .minDistance(1);

    // Undo: move curr left (min 0)
    const undoLast = () => {
        setCurr((prev) => (prev > 0 ? prev - 1 : 0));
    };

    // Redo: move curr right (max paths.length)
    const redoLast = () => {
        setCurr((prev) => (prev < paths.length ? prev + 1 : prev));
    };

    const paletteVisible = useSharedValue(false);
    const animatedPaletteStyle = useAnimatedStyle(() => {
        return {
            top: withSpring(paletteVisible.value ? -275 : -100),
            height: withTiming(paletteVisible.value ? 200 : 50),
            opacity: withTiming(paletteVisible.value ? 100 : 0, { duration: 100 }),
        };
    });

    const animatedSwatchStyle = useAnimatedStyle(() => {
        return {
            top: withSpring(paletteVisible.value ? -50 : 0),
            height: paletteVisible.value ? 0 : 50,
            opacity: withTiming(paletteVisible.value ? 0 : 100, { duration: 100 }),
        };
    });

    return (
        <>
            <GestureHandlerRootView>
                <View style={{ height, width }}>
                    <GestureDetector gesture={pan}>
                        <Canvas style={{ flex: 8 }}>
                            {paths.slice(0, curr).map((p, index) =>
                                Array.isArray(p.segments) && p.segments.length > 0 ? (
                                    <Path
                                        key={index}
                                        path={p.segments.join(" ")}
                                        strokeWidth={5}
                                        style="stroke"
                                        color={p.color}
                                    />
                                ) : null
                            )}
                        </Canvas>
                    </GestureDetector>
                    <View style={{ padding: 10, flex: 1, backgroundColor: "#edede9" }}>
                        <View style={{ flex: 1, flexDirection: "row" }}>
                            <Animated.View
                                style={[
                                    { padding: 10, position: "absolute", width: 60 },
                                    animatedPaletteStyle,
                                ]}
                            >
                                {paletteColors.map((c, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        onPress={() => {
                                            setActivePaletteColorIndex(i);
                                            paletteVisible.value = false;
                                        }}
                                    >
                                        <View
                                            style={[
                                                {
                                                    backgroundColor: c,
                                                },
                                                styles.paletteColor,
                                            ]}
                                        ></View>
                                    </TouchableOpacity>
                                ))}
                            </Animated.View>
                            <View style={styles.swatchContainer}>
                                <TouchableOpacity
                                    onPress={() => {
                                        paletteVisible.value = !paletteVisible.value;
                                    }}
                                >
                                    <Animated.View
                                        style={[
                                            {
                                                backgroundColor: paletteColors[activePaletteColorIndex],
                                            },
                                            styles.swatch,
                                            animatedSwatchStyle,
                                        ]}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={undoLast}>
                                    <FontAwesome5
                                        name="undo"
                                        style={styles.icon}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={redoLast}>
                                    <FontAwesome5
                                        name="redo"
                                        style={styles.icon}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </GestureHandlerRootView>
            <StatusBar style="auto" />
        </>
    );
}

const styles = StyleSheet.create({
    icon: {
        fontSize: 40,
        textAlign: "center",
        marginHorizontal: 5,
    },
    paletteColor: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginVertical: 5,
        zIndex: 2,
    },
    swatch: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderColor: "black",
        marginVertical: 5,
        zIndex: 1,
    },
    swatchContainer: {
        flexDirection: "row",
        flex: 1,
        padding: 10,
        justifyContent: "space-between",
        alignItems: "center",
    },
});