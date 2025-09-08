'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { intelligentItemMatcher, MatchResult } from '@/lib/intelligent-item-matcher';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Loading } from '@/components/ui/Loading';

interface ImageSelectorProps {
  imageFile: File;
  onSelectionComplete: (result: MatchResult) => void;
  onCancel: () => void;
}

interface SelectionArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const ImageSelector: React.FC<ImageSelectorProps> = ({
  imageFile,
  onSelectionComplete,
  onCancel
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionArea, setSelectionArea] = useState<SelectionArea | null>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [imageScale, setImageScale] = useState(1);
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });

  // Carrega a imagem no canvas
  useEffect(() => {
    if (!imageFile || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      // Calcula escala para ajustar a imagem no canvas
      const maxWidth = 800;
      const maxHeight = 600;
      const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
      
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      
      canvas.width = scaledWidth;
      canvas.height = scaledHeight;
      
      // Centraliza a imagem
      const offsetX = 0;
      const offsetY = 0;
      
      setImageScale(scale);
      setImageOffset({ x: offsetX, y: offsetY });
      
      // Desenha a imagem
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
      
      setImageLoaded(true);
    };

    img.src = URL.createObjectURL(imageFile);

    return () => {
      URL.revokeObjectURL(img.src);
    };
  }, [imageFile]);

  // Redesenha o canvas com a seleção
  const redrawCanvas = useCallback(() => {
    if (!canvasRef.current || !imageLoaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      // Limpa e redesenha a imagem
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, imageOffset.x, imageOffset.y, canvas.width, canvas.height);
      
      // Desenha a área de seleção
      if (selectionArea) {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
          selectionArea.x,
          selectionArea.y,
          selectionArea.width,
          selectionArea.height
        );
        
        // Overlay semi-transparente fora da seleção
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        
        // Área acima
        ctx.fillRect(0, 0, canvas.width, selectionArea.y);
        // Área abaixo
        ctx.fillRect(0, selectionArea.y + selectionArea.height, canvas.width, canvas.height - selectionArea.y - selectionArea.height);
        // Área à esquerda
        ctx.fillRect(0, selectionArea.y, selectionArea.x, selectionArea.height);
        // Área à direita
        ctx.fillRect(selectionArea.x + selectionArea.width, selectionArea.y, canvas.width - selectionArea.x - selectionArea.width, selectionArea.height);
      }
    };

    img.src = URL.createObjectURL(imageFile);
  }, [imageFile, imageLoaded, selectionArea, imageOffset]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Obtém coordenadas do mouse relativas ao canvas
  const getCanvasCoordinates = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };

  // Inicia seleção
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageLoaded) return;
    
    const coords = getCanvasCoordinates(event);
    setStartPoint(coords);
    setIsSelecting(true);
    setSelectionArea(null);
  };

  // Atualiza seleção
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSelecting || !startPoint) return;
    
    const coords = getCanvasCoordinates(event);
    const x = Math.min(startPoint.x, coords.x);
    const y = Math.min(startPoint.y, coords.y);
    const width = Math.abs(coords.x - startPoint.x);
    const height = Math.abs(coords.y - startPoint.y);
    
    setSelectionArea({ x, y, width, height });
  };

  // Finaliza seleção
  const handleMouseUp = () => {
    setIsSelecting(false);
    setStartPoint(null);
  };

  // Identifica item na área selecionada
  const identifySelectedItem = async () => {
    if (!selectionArea || !imageFile) return;
    
    setIsIdentifying(true);
    
    try {
      // Converte coordenadas do canvas para coordenadas da imagem original
      const originalSelection = {
        x: Math.round(selectionArea.x / imageScale),
        y: Math.round(selectionArea.y / imageScale),
        width: Math.round(selectionArea.width / imageScale),
        height: Math.round(selectionArea.height / imageScale)
      };
      
      const result = await intelligentItemMatcher.identifySelectedItem(
        imageFile,
        originalSelection
      );
      
      onSelectionComplete(result);
    } catch (error) {
      console.error('Erro ao identificar item selecionado:', error);
      // Se não encontrou nenhum item, não chama onSelectionComplete
      console.log('Nenhum item identificado na área selecionada');
    } finally {
      setIsIdentifying(false);
    }
  };

  // Limpa seleção
  const clearSelection = () => {
    setSelectionArea(null);
    redrawCanvas();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <Card className="bg-tarkov-dark border-tarkov-border max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Selecionar Área para Identificação
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-tarkov-text-secondary hover:text-white"
          >
            <XMarkIcon className="w-5 h-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Instruções */}
          <div className="bg-tarkov-surface p-3 rounded border border-tarkov-border">
            <p className="text-sm text-tarkov-text-secondary">
              <strong>Instruções:</strong> Clique e arraste para selecionar a área do item que deseja identificar. 
              Quanto mais precisa a seleção, melhor será o resultado.
            </p>
          </div>
          
          {/* Canvas */}
          <div className="flex justify-center">
            <div className="relative border border-tarkov-border rounded">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="cursor-crosshair"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-tarkov-surface">
                  <Loading className="w-8 h-8" variant="spinner" />
                  <span className="ml-2 text-tarkov-text-secondary">Carregando imagem...</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Controles */}
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={clearSelection}
              disabled={!selectionArea}
              className="flex items-center gap-2"
            >
              <XMarkIcon className="w-4 h-4" />
              Limpar Seleção
            </Button>
            
            <Button
              onClick={identifySelectedItem}
              disabled={!selectionArea || isIdentifying}
              className="flex items-center gap-2 bg-tarkov-accent hover:bg-tarkov-accent/80"
            >
              {isIdentifying ? (
                <>
                  <Loading className="w-4 h-4" variant="dots" />
                  Identificando...
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon className="w-4 h-4" />
                  Identificar Item
                </>
              )}
            </Button>
          </div>
          
          {/* Informações da seleção */}
          {selectionArea && (
            <div className="text-center text-sm text-tarkov-text-secondary">
              Área selecionada: {Math.round(selectionArea.width)} × {Math.round(selectionArea.height)} pixels
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageSelector;