
import React from "react";

import DrawingCanvas from "@/app/components/DrawingCanvas";
import { useLocalSearchParams } from 'expo-router';




export default function CanvasScreen() {
    const { id, name } = useLocalSearchParams<{ id: string; name: string }>();

    return (
        <>
            <DrawingCanvas id={id} name={name} />
        </>
    )
}