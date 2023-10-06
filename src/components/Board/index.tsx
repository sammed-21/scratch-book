"use client";
import { MENU_ITEMS } from "@/constants";
import { actionItemClick } from "@/slice/menuSlice";
import { RootState } from "@/store";
import React, { useEffect, useLayoutEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
const Board = () => {
  const dispatch = useDispatch();

  const canvaseRef = useRef<HTMLCanvasElement | null>(null);
  const shouldDraw = useRef<HTMLCanvasElement | boolean>(false);
  const drawHistory = useRef<ImageData[]>([]);
  const historyPointer = useRef<number>(0);
  const { activeMenuItem, actionMenuItem } = useSelector(
    (state: RootState) => state.menu
  );
  const { color, size } = useSelector(
    (state: RootState) => state.toolbox[activeMenuItem]
  );
  useEffect(() => {
    if (!canvaseRef.current) return;
    const canvas = canvaseRef.current;
    const context = canvas.getContext("2d");
    console.log(actionMenuItem);

    if (actionMenuItem === MENU_ITEMS.DOWNLOAD) {
      const URL = canvas.toDataURL();
      const anchor = document.createElement("a");
      anchor.href = URL;
      anchor.download = "sketch.png";
      anchor.click();
      console.log(URL);
    } else if (
      actionMenuItem === MENU_ITEMS.UNDO ||
      actionMenuItem === MENU_ITEMS.REDO
    ) {
      if (historyPointer.current > 0 && actionMenuItem === MENU_ITEMS.UNDO) {
        historyPointer.current -= 1;
      }
      if (
        historyPointer.current < drawHistory.current.length - 1 &&
        actionMenuItem === MENU_ITEMS.REDO
      ) {
        historyPointer.current += 1;
      }
      const imageData = drawHistory.current[historyPointer.current];
      if (context) {
        context.putImageData(imageData, 0, 0);
      }
    }
    dispatch(actionItemClick(null));
  }, [actionMenuItem]);

  useEffect(() => {
    console.log(typeof size);
    if (!canvaseRef.current) return;
    const canvas = canvaseRef.current;
    const context = canvas.getContext("2d");

    if (!context) return; // Check if context is truthy

    const changeConfig = () => {
      context.lineWidth = Number(size);
      context.strokeStyle = String(color);
    };

    changeConfig();
  }, [color, size]);

  useLayoutEffect(() => {
    if (!canvaseRef.current) return;
    const canvas = canvaseRef.current;
    const context = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const beginPath = (x: number, y: number) => {
      if (context) {
        context.beginPath();
        context.moveTo(x, y);
      }
    };
    const drawLine = (x: number, y: number) => {
      if (context) {
        context.lineTo(x, y);
        context.stroke();
      }
    };
    const handleMouseDown = (e: MouseEvent) => {
      shouldDraw.current = true;
      beginPath(e.clientX, e.clientY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!shouldDraw.current || !context) return;
      drawLine(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      shouldDraw.current = false;
      if (context) {
        const imageData = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );
        drawHistory.current.push(imageData);
        historyPointer.current = drawHistory.current.length - 1;
      }
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);
  console.log(color, size);
  return <canvas ref={canvaseRef}></canvas>;
};

export default Board;
