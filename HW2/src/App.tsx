import React, { useState, useCallback, useMemo, useRef } from "react";
import { Circle, Square, Triangle, Upload, Download } from "lucide-react";
import "./App.css";

type ShapeType = "circle" | "square" | "triangle";

interface Shape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
}

interface PaintingData {
  title: string;
  shapes: Shape[];
}

interface ShapeCounts {
  circle: number;
  square: number;
  triangle: number;
}

interface HeaderProps {
  title: string;
  setTitle: (title: string) => void;
  onExport: () => void;
  onImportClick: () => void;
}

interface ToolbarProps {
  selectedShape: ShapeType;
  onSelectShape: (shape: ShapeType) => void;
  onDragStart: (shape: ShapeType) => void;
}

interface CanvasProps {
  shapes: Shape[];
  onClick: (event: React.MouseEvent<SVGSVGElement>) => void;
  onDeleteShape: (id: string) => void;
  onDrop: (event: React.DragEvent<SVGSVGElement>) => void;
  onDragOver: (event: React.DragEvent<SVGSVGElement>) => void;
}

interface ShapeProps {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  onDelete: (id: string) => void;
}

interface FooterProps {
  counts: ShapeCounts;
}

const App: React.FC = () => {
  const [title, setTitle] = useState<string>("Untitled");
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedShape, setSelectedShape] = useState<ShapeType>("circle");
  const [draggedShape, setDraggedShape] = useState<ShapeType | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (!selectedShape) return;

      const svg = event.currentTarget;
      const pt = svg.createSVGPoint();
      pt.x = event.clientX;
      pt.y = event.clientY;
      const { x, y } = pt.matrixTransform(svg.getScreenCTM()?.inverse());

      const newShape: Shape = {
        id: crypto.randomUUID(),
        type: selectedShape,
        x: x,
        y: y,
      };
      setShapes((prevShapes) => [...prevShapes, newShape]);
    },
    [selectedShape]
  );

  const handleExport = useCallback(() => {
    const data: PaintingData = {
      title,
      shapes,
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `${title.replace(/\s+/g, "_") || "painting"}.json`;
    link.click();
  }, [title, shapes]);

  const handleImportClick = (): void => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const result = e.target?.result;
          if (typeof result === "string") {
            const importedData = JSON.parse(result) as PaintingData;
            if (importedData.title && Array.isArray(importedData.shapes)) {
              setTitle(importedData.title);
              setShapes(importedData.shapes);
            } else {
              alert("Invalid JSON format for painting file.");
            }
          }
        } catch (error) {
          console.error("Failed to parse JSON:", error);
          alert(
            "Error: Could not read the file. Please ensure it is a valid painting JSON."
          );
        }
      };
      reader.readAsText(file);

      event.target.value = "";
    } else {
      alert("Please select a valid JSON file.");
    }
  };

  const handleDeleteShape = useCallback((id: string) => {
    setShapes((prevShapes) => prevShapes.filter((shape) => shape.id !== id));
  }, []);

  const handleDragStart = useCallback((shape: ShapeType) => {
    setDraggedShape(shape);
  }, []);

  const handleDragOver = useCallback(
    (event: React.DragEvent<SVGSVGElement>) => {
      event.preventDefault();
    },
    []
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<SVGSVGElement>) => {
      event.preventDefault();

      if (!draggedShape) return;

      const svg = event.currentTarget;
      const pt = svg.createSVGPoint();
      pt.x = event.clientX;
      pt.y = event.clientY;
      const { x, y } = pt.matrixTransform(svg.getScreenCTM()?.inverse());

      const newShape: Shape = {
        id: crypto.randomUUID(),
        type: draggedShape,
        x: x,
        y: y,
      };

      setShapes((prevShapes) => [...prevShapes, newShape]);
      setDraggedShape(null);
    },
    [draggedShape]
  );

  const shapeCounts = useMemo((): ShapeCounts => {
    return shapes.reduce(
      (acc, shape) => {
        acc[shape.type] = (acc[shape.type] || 0) + 1;
        return acc;
      },
      { circle: 0, square: 0, triangle: 0 }
    );
  }, [shapes]);

  return (
    <div className="app-container">
      <div className="main-wrapper">
        <Header
          title={title}
          setTitle={setTitle}
          onExport={handleExport}
          onImportClick={handleImportClick}
        />

        <div className="content-wrapper">
          <main className="main-content">
            <Canvas
              shapes={shapes}
              onClick={handleCanvasClick}
              onDeleteShape={handleDeleteShape}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            />
            <Footer counts={shapeCounts} />
          </main>

          <Toolbar
            selectedShape={selectedShape}
            onSelectShape={setSelectedShape}
            onDragStart={handleDragStart}
          />
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="application/json"
      />
    </div>
  );
};

const Header: React.FC<HeaderProps> = ({
  title,
  setTitle,
  onExport,
  onImportClick,
}) => (
  <header className="header">
    <input
      type="text"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      className="title-input"
      placeholder="Painting Title"
    />
    <div className="button-group">
      <button onClick={onExport} className="button export-button">
        <Download size={18} />
        Export
      </button>
      <button onClick={onImportClick} className="button import-button">
        <Upload size={18} />
        Import
      </button>
    </div>
  </header>
);

const Toolbar: React.FC<ToolbarProps> = ({
  selectedShape,
  onSelectShape,
  onDragStart,
}) => {
  const tools: { name: ShapeType; icon: React.ReactNode }[] = [
    { name: "circle", icon: <Circle size={32} /> },
    { name: "square", icon: <Square size={32} /> },
    { name: "triangle", icon: <Triangle size={32} /> },
  ];

  return (
    <aside className="toolbar">
      <h2 className="toolbar-title">Tools</h2>
      <div className="toolbar-buttons">
        {tools.map((tool) => (
          <button
            key={tool.name}
            onClick={() => onSelectShape(tool.name)}
            onDragStart={() => onDragStart(tool.name)}
            draggable
            className={`tool-button ${
              selectedShape === tool.name ? "selected" : "unselected"
            }`}
            aria-label={`Select ${tool.name}`}
          >
            {tool.icon}
          </button>
        ))}
      </div>
    </aside>
  );
};

const Canvas: React.FC<CanvasProps> = ({
  shapes,
  onClick,
  onDeleteShape,
  onDrop,
  onDragOver,
}) => (
  <div className="canvas-container">
    <svg
      width="100%"
      height="100%"
      onClick={onClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
      className="canvas"
    >
      <rect width="100%" height="100%" fill="transparent" />
      {shapes.length === 0 ? (
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="#d1d5db"
          fontSize="24"
          className="canvas-text"
        >
          Canvas
        </text>
      ) : null}
      {shapes.map((shape) => (
        <Shape key={shape.id} {...shape} onDelete={onDeleteShape} />
      ))}
    </svg>
  </div>
);

const Shape: React.FC<ShapeProps> = ({ id, type, x, y, onDelete }) => {
  const commonProps = {
    fill: "rgba(59, 130, 246, 0.7)",
    stroke: "rgba(37, 99, 235, 1)",
    strokeWidth: "2",
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation();
    },
    onDoubleClick: (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(id);
    },
    style: { cursor: "pointer" },
  };

  switch (type) {
    case "circle":
      return <circle cx={x} cy={y} r="20" {...commonProps} />;
    case "square":
      return (
        <rect
          x={x - 20}
          y={y - 20}
          width="40"
          height="40"
          rx="3"
          {...commonProps}
        />
      );
    case "triangle":
      return (
        <polygon
          points={`${x},${y - 23} ${x - 20},${y + 17} ${x + 20},${y + 17}`}
          {...commonProps}
        />
      );
    default:
      return null;
  }
};

const Footer: React.FC<FooterProps> = ({ counts }) => (
  <div className="footer">
    <div className="count-item">
      <Circle size={20} className="count-icon" />
      <span className="count-number">{counts.circle}</span>
    </div>
    <div className="count-item">
      <Square size={20} className="count-icon" />
      <span className="count-number">{counts.square}</span>
    </div>
    <div className="count-item">
      <Triangle size={20} className="count-icon" />
      <span className="count-number">{counts.triangle}</span>
    </div>
  </div>
);

export default App;
