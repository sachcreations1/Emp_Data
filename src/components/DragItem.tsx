"use client";
import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";

export default function DragItem({
  children,
  initialPosition = { x: 50, y: 50 },
}: {
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
}) {
  const [pos, setPos] = useState(initialPosition);

  return (
    <>
      <div
        draggable
        onDragEnd={(e) => {
          const parentRect = e.currentTarget.parentElement?.getBoundingClientRect();
          if (parentRect) {
            // Adjust for parent's position and ensure it doesn't go out of bounds
            const newX = e.clientX - parentRect.left;
            const newY = e.clientY - parentRect.top;
            
            // A basic boundary check
            if (newX > 0 && newY > 0 && newX < parentRect.width && newY < parentRect.height) {
                 setPos({ x: newX, y: newY });
            }
          }
        }}
        style={{
          position: "absolute",
          left: pos.x,
          top: pos.y,
          cursor: "move",
        }}
      >
        {children}
      </div>

      <Card className="absolute bottom-2 right-2 w-48 p-2 bg-white/80 backdrop-blur-sm shadow-xl">
        <CardContent className="p-2 space-y-2">
            <div className="grid gap-1">
                <Label htmlFor="x-slider" className="text-xs">X: {Math.round(pos.x)}px</Label>
                <Slider
                    id="x-slider"
                    min={0}
                    max={322} // 85.6mm in px approx
                    step={1}
                    value={[pos.x]}
                    onValueChange={(val) => setPos({ ...pos, x: val[0] })}
                />
            </div>
             <div className="grid gap-1">
                <Label htmlFor="y-slider" className="text-xs">Y: {Math.round(pos.y)}px</Label>
                <Slider
                    id="y-slider"
                    min={0}
                    max={204} // 54mm in px approx
                    step={1}
                    value={[pos.y]}
                    onValueChange={(val) => setPos({ ...pos, y: val[0] })}
                />
            </div>
        </CardContent>
      </Card>
    </>
  );
}
