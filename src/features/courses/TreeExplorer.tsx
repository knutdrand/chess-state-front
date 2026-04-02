import React, { useState, useEffect, useCallback, useMemo } from "react";
import Tree, { RawNodeDatum } from "react-d3-tree";
import { Chessboard } from "react-chessboard";
import {
  Box,
  CircularProgress,
  Typography,
  IconButton,
  Paper,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { DefaultService } from "../../api";
import { CourseTree, TreeNode } from "../../types/courseTree";

interface TreeExplorerProps {
  courseId: number;
  onExit: () => void;
}

interface D3TreeNode extends RawNodeDatum {
  name: string;
  attributes?: Record<string, string | number | boolean>;
  children?: D3TreeNode[];
}

function getNodeColor(prob: number | null): string {
  if (prob === null) return "#bbb";
  const hue = prob * 120; // 0 = red, 120 = green
  return `hsl(${hue}, 70%, 45%)`;
}

function transformNode(node: TreeNode): D3TreeNode {
  const children: D3TreeNode[] = node.opponent_responses.map((resp) => {
    const childD3 = transformNode(resp.child);
    return {
      ...childD3,
      // Prefix the child's name with the opponent response move
      name: `${resp.move} > ${childD3.name}`,
      attributes: {
        ...childD3.attributes,
        opponentMove: resp.move,
        weight: resp.weight,
      },
    };
  });

  return {
    name: node.correct_move,
    attributes: {
      probability: node.success_probability !== null
        ? Math.round(node.success_probability * 100) / 100
        : -1,
      fen: node.fen,
      ...(node.comment ? { comment: node.comment } : {}),
    },
    children: children.length > 0 ? children : undefined,
  };
}

function transformTree(tree: CourseTree): D3TreeNode {
  if (tree.roots.length === 1) {
    return transformNode(tree.roots[0]);
  }

  // Multiple roots: create a virtual root
  return {
    name: "Start",
    attributes: { probability: 0, fen: "" },
    children: tree.roots.map(transformNode),
  };
}

// Custom node renderer
const renderCustomNode = ({
  nodeDatum,
  onNodeClick,
}: {
  nodeDatum: D3TreeNode;
  onNodeClick: (node: D3TreeNode) => void;
}) => {
  const rawProb = Number(nodeDatum.attributes?.probability ?? -1);
  const isUnvisited = rawProb < 0;
  const prob = isUnvisited ? null : rawProb;
  const color = getNodeColor(prob);
  const textColor = isUnvisited ? "#555" : "white";

  // Extract just the player move (strip opponent move prefix if present)
  const parts = nodeDatum.name.split(" > ");
  const playerMove = parts[parts.length - 1];
  const opponentMove = parts.length > 1 ? parts[0] : null;
  const weight = Number(nodeDatum.attributes?.weight ?? 0);

  // Scale opponent move label by weight: bolder/larger = more common
  const oppFontSize = opponentMove ? Math.max(9, Math.min(14, 9 + weight * 12)) : 11;
  const oppFontWeight = weight > 0.3 ? "bold" : weight > 0.1 ? "500" : "normal";

  const nodeW = 56;
  const nodeH = 34;

  return (
    <g onClick={() => onNodeClick(nodeDatum)} style={{ cursor: "pointer" }}>
      {/* Opponent move label above the node */}
      {opponentMove && (
        <text
          fill="#555"
          fontSize={oppFontSize}
          textAnchor="middle"
          dy="-12"
          fontStyle="italic"
          fontWeight={oppFontWeight}
        >
          {opponentMove}
        </text>
      )}
      {/* Node rectangle with rounded corners */}
      <rect
        x={-nodeW / 2}
        y={-nodeH / 2}
        width={nodeW}
        height={nodeH}
        rx={6}
        ry={6}
        fill={color}
        stroke="#333"
        strokeWidth={1.5}
      />
      {/* Player move label */}
      <text fill={textColor} fontSize="13" textAnchor="middle" dy={isUnvisited ? "5" : "-1"} fontWeight="bold">
        {playerMove}
      </text>
      {/* Probability below move text (only for visited nodes) */}
      {!isUnvisited && (
        <text fill="rgba(255,255,255,0.85)" fontSize="10" textAnchor="middle" dy="12">
          {Math.round(prob! * 100)}%
        </text>
      )}
    </g>
  );
};

const TreeExplorer: React.FC<TreeExplorerProps> = ({
  courseId,
  onExit,
}) => {
  const [treeData, setTreeData] = useState<CourseTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFen, setSelectedFen] = useState<string | null>(null);
  const [selectedComment, setSelectedComment] = useState<string | null>(null);
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white");

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const data = await DefaultService.getCourseTreeApiCoursesCourseIdTreeGet(courseId);
        const tree = data as unknown as CourseTree;
        setTreeData(tree);
        setPlayerColor(tree.player_color || "white");
        // Select the first root's fen by default
        if (tree.roots.length > 0) {
          setSelectedFen(tree.roots[0].fen);
          setSelectedComment(tree.roots[0].comment);
        }
      } catch (err) {
        setError("Failed to load course tree");
        console.error("Error fetching tree:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, [courseId]);

  const handleNodeClick = useCallback((node: D3TreeNode) => {
    const fen = node.attributes?.fen;
    if (fen && typeof fen === "string" && fen.length > 0) {
      setSelectedFen(fen);
      setSelectedComment(
        node.attributes?.comment ? String(node.attributes.comment) : null
      );
    }
  }, []);

  const d3Tree = useMemo(() => {
    if (!treeData) return null;
    return transformTree(treeData);
  }, [treeData]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !d3Tree) {
    return (
      <Box sx={{ p: 2 }}>
        <IconButton onClick={onExit} sx={{ mb: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography color="error">{error || "No tree data"}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        height: "100%",
        width: "100%",
      }}
    >
      {/* Tree panel */}
      <Box
        sx={{
          flex: 1,
          minHeight: { xs: 300, md: "auto" },
          position: "relative",
          border: "1px solid #e0e0e0",
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <Box sx={{ position: "absolute", top: 8, left: 8, zIndex: 1 }}>
          <IconButton onClick={onExit} size="small">
            <ArrowBackIcon />
          </IconButton>
        </Box>
        <Tree
          data={d3Tree}
          orientation="vertical"
          pathFunc="step"
          translate={{ x: 200, y: 50 }}
          nodeSize={{ x: 110, y: 90 }}
          separation={{ siblings: 1.2, nonSiblings: 1.5 }}
          renderCustomNodeElement={(rd3tProps) =>
            renderCustomNode({
              nodeDatum: rd3tProps.nodeDatum as D3TreeNode,
              onNodeClick: handleNodeClick,
            })
          }
          zoomable
          draggable
        />
      </Box>

      {/* Board + comment panel */}
      <Box
        sx={{
          width: { xs: "100%", md: 360 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 2,
          gap: 2,
        }}
      >
        {selectedFen ? (
          <>
            <Box sx={{ width: "100%", maxWidth: 340 }}>
              <Chessboard
                position={selectedFen}
                boardWidth={340}
                boardOrientation={playerColor}
                arePiecesDraggable={false}
              />
            </Box>
            {selectedComment && (
              <Paper sx={{ p: 2, width: "100%", maxWidth: 340 }}>
                <Typography variant="body2">{selectedComment}</Typography>
              </Paper>
            )}
          </>
        ) : (
          <Typography color="text.secondary" sx={{ mt: 4 }}>
            Click a node to view its position
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default TreeExplorer;
